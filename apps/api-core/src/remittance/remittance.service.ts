import { TenantRole } from '@mobility-os/authz-model';
import {
  computeNextRemittanceDueDate,
  getCountryConfig,
  isCountrySupported,
} from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type OperationalWalletEntry, type Remittance } from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { buildCsv } from '../common/csv-utils';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import { canRecordRemittanceAgainstAssignment } from '../assignments/assignment-lifecycle';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { OperationalWalletsService } from '../operational-wallets/operational-wallets.service';
import { PolicyService } from '../policy/policy.service';
import { RecordsService } from '../records/records.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import {
  summarizeFinancialContract,
  buildRemittanceReconciliation,
  parseFinancialContractSnapshot,
} from '../assignments/financial-contract';
import type { RecordRemittanceDto } from './dto/record-remittance.dto';

type RemittanceWithWalletEntry = Remittance & { walletEntry?: OperationalWalletEntry };
type EnrichedRemittance = RemittanceWithWalletEntry & { reconciliation?: unknown | null };

@Injectable()
export class RemittanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly operationalWalletsService: OperationalWalletsService,
    private readonly policyService: PolicyService,
    private readonly recordsService: RecordsService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  private async enrichRemittances<T extends RemittanceWithWalletEntry>(
    remittances: T[],
  ): Promise<Array<T & { reconciliation: unknown | null }>> {
    if (remittances.length === 0) {
      return [];
    }

    const assignments = await this.prisma.assignment.findMany({
      where: { id: { in: remittances.map((remittance) => remittance.assignmentId) } },
      select: {
        id: true,
        status: true,
        contractSnapshot: true,
        remittanceModel: true,
        remittanceFrequency: true,
        remittanceAmountMinorUnits: true,
        remittanceCurrency: true,
        remittanceStartDate: true,
        remittanceCollectionDay: true,
      },
    });
    const assignmentById = new Map(assignments.map((assignment) => [assignment.id, assignment]));

    const relatedRemittances = await this.prisma.remittance.findMany({
      where: { assignmentId: { in: assignments.map((assignment) => assignment.id) } },
      select: {
        assignmentId: true,
        dueDate: true,
        amountMinorUnits: true,
        status: true,
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });
    const remittancesByAssignmentId = new Map<
      string,
      Array<{ assignmentId: string; dueDate: string; amountMinorUnits: number; status: string }>
    >();
    for (const remittance of relatedRemittances) {
      const bucket = remittancesByAssignmentId.get(remittance.assignmentId) ?? [];
      bucket.push(remittance);
      remittancesByAssignmentId.set(remittance.assignmentId, bucket);
    }

    return remittances.map((remittance) => {
      const assignment = assignmentById.get(remittance.assignmentId);
      const reconciliation = assignment
        ? buildRemittanceReconciliation({
            remittance,
            snapshot: parseFinancialContractSnapshot(assignment.contractSnapshot, assignment),
            remittances: remittancesByAssignmentId.get(remittance.assignmentId) ?? [],
            assignmentStatus: assignment.status,
          })
        : null;
      return { ...remittance, reconciliation };
    });
  }

  private async enrichRemittance<T extends RemittanceWithWalletEntry>(
    remittance: T,
  ): Promise<T & { reconciliation: unknown | null }> {
    const [enriched] = await this.enrichRemittances([remittance]);
    if (!enriched) {
      throw new NotFoundException(`Remittance '${remittance.id}' could not be enriched.`);
    }
    return enriched;
  }

  async list(
    tenantId: string,
    filters: {
      assignmentId?: string;
      driverId?: string;
      vehicleId?: string;
      vehicleIds?: string[];
      fleetId?: string;
      fleetIds?: string[];
      status?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedResponse<EnrichedRemittance>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const where = {
      tenantId,
      ...(filters.assignmentId ? { assignmentId: filters.assignmentId } : {}),
      ...(filters.driverId ? { driverId: filters.driverId } : {}),
      ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
      ...(!filters.vehicleId && filters.vehicleIds?.length
        ? { vehicleId: { in: filters.vehicleIds } }
        : {}),
      ...(filters.fleetId
        ? { fleetId: filters.fleetId }
        : filters.fleetIds?.length
          ? { fleetId: { in: filters.fleetIds } }
          : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.remittance.findMany({
        where,
        orderBy: { dueDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.remittance.count({ where }),
    ]);

    return {
      data: await this.enrichRemittances(data),
      total,
      page,
      limit,
    };
  }

  async findOne(tenantId: string, id: string): Promise<EnrichedRemittance> {
    const record = await this.prisma.remittance.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Remittance '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(record.tenantId), asTenantId(tenantId));

    return this.enrichRemittance(record);
  }

  async exportCsv(
    tenantId: string,
    filters: {
      vehicleIds?: string[];
      fleetIds?: string[];
    } = {},
  ): Promise<string> {
    const records = await this.prisma.remittance.findMany({
      where: {
        tenantId,
        ...(filters.vehicleIds?.length ? { vehicleId: { in: filters.vehicleIds } } : {}),
        ...(filters.fleetIds?.length ? { fleetId: { in: filters.fleetIds } } : {}),
      },
      orderBy: [{ dueDate: 'desc' }],
    });

    const enrichedRecords = await this.enrichRemittances(records);

    return buildCsv(
      [
        'remittanceId',
        'assignmentId',
        'driverId',
        'vehicleId',
        'fleetId',
        'contractType',
        'amountMinorUnits',
        'expectedAmountMinorUnits',
        'varianceMinorUnits',
        'cumulativePaidAmountMinorUnits',
        'outstandingBalanceMinorUnits',
        'currency',
        'status',
        'dueDate',
        'paidDate',
        'notes',
        'createdAt',
      ],
      enrichedRecords.map((record) => [
        record.id,
        record.assignmentId,
        record.driverId,
        record.vehicleId,
        record.fleetId,
        record.reconciliation && typeof record.reconciliation === 'object' && 'contractType' in record.reconciliation
          ? String(record.reconciliation.contractType)
          : '',
        record.amountMinorUnits,
        record.reconciliation && typeof record.reconciliation === 'object' && 'expectedAmountMinorUnits' in record.reconciliation
          ? String(record.reconciliation.expectedAmountMinorUnits)
          : '',
        record.reconciliation && typeof record.reconciliation === 'object' && 'varianceMinorUnits' in record.reconciliation
          ? String(record.reconciliation.varianceMinorUnits)
          : '',
        record.reconciliation && typeof record.reconciliation === 'object' && 'cumulativePaidAmountMinorUnits' in record.reconciliation
          ? String(record.reconciliation.cumulativePaidAmountMinorUnits)
          : '',
        record.reconciliation && typeof record.reconciliation === 'object' && 'outstandingBalanceMinorUnits' in record.reconciliation
          ? String(record.reconciliation.outstandingBalanceMinorUnits ?? '')
          : '',
        record.currency,
        record.status,
        record.dueDate,
        record.paidDate ?? '',
        record.notes ?? '',
        record.createdAt.toISOString(),
      ]),
    );
  }

  private ensurePendingTransition(record: Remittance, action: string): void {
    if (record.status !== 'pending') {
      throw new BadRequestException(
        `Remittance '${record.id}' must be in status 'pending' before it can be ${action} (current: '${record.status}')`,
      );
    }
  }

  private resolveContractualRemittancePeriod(input: {
    assignment: {
      status: string;
      contractSnapshot: unknown;
      paymentModel?: string | null;
      remittanceModel?: string | null;
      remittanceFrequency?: string | null;
      remittanceAmountMinorUnits?: number | null;
      remittanceCurrency?: string | null;
      remittanceStartDate?: string | null;
      remittanceCollectionDay?: number | null;
    };
    remittances: Array<{ dueDate: string; amountMinorUnits: number; status: string }>;
  }): { dueDate: string | null; expectedAmountMinorUnits: number | null } {
    const snapshot = parseFinancialContractSnapshot(
      input.assignment.contractSnapshot,
      input.assignment,
    );
    const summary = summarizeFinancialContract({
      assignmentStatus: input.assignment.status,
      snapshot,
      remittances: input.remittances,
    });

    if (!summary) {
      return { dueDate: null, expectedAmountMinorUnits: null };
    }

    if (
      summary.summary.currentPeriodDueDate &&
      summary.summary.currentPeriodStatus !== 'complete'
    ) {
      return {
        dueDate: summary.summary.currentPeriodDueDate,
        expectedAmountMinorUnits: summary.summary.expectedPerPeriodAmountMinorUnits,
      };
    }

    if (summary.summary.nextDueDate) {
      return {
        dueDate: summary.summary.nextDueDate,
        expectedAmountMinorUnits:
          summary.summary.nextDueAmountMinorUnits ??
          summary.summary.expectedPerPeriodAmountMinorUnits,
      };
    }

    return {
      dueDate: summary.summary.currentPeriodDueDate ?? null,
      expectedAmountMinorUnits: summary.summary.expectedPerPeriodAmountMinorUnits,
    };
  }

  async record(tenantId: string, dto: RecordRemittanceDto): Promise<EnrichedRemittance> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant '${tenantId}' not found`);
    }

    const expectedCurrency = isCountrySupported(tenant.country)
      ? getCountryConfig(tenant.country).currency
      : null;

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: dto.assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment '${dto.assignmentId}' not found`);
    }

    assertTenantOwnership(asTenantId(assignment.tenantId), asTenantId(tenantId));

    if (!assignment.driverConfirmedAt) {
      throw new BadRequestException(
        `Cannot record remittance against assignment '${dto.assignmentId}' because the driver never acknowledged it.`,
      );
    }

    if (
      !canRecordRemittanceAgainstAssignment({
        status: assignment.status,
        endedAt: assignment.endedAt,
        returnedAt: assignment.returnedAt,
        dueDate: dto.dueDate ?? null,
      })
    ) {
      throw new BadRequestException(
        `Cannot record remittance against assignment '${dto.assignmentId}' ` +
          `with status '${assignment.status}'`,
      );
    }

    const existingRemittance = await this.prisma.remittance.findFirst({
      where: dto.clientReferenceId
        ? {
            tenantId,
            clientReferenceId: dto.clientReferenceId,
          }
        : {
            tenantId,
            assignmentId: assignment.id,
            ...(dto.dueDate ? { dueDate: dto.dueDate } : {}),
          },
    });

    if (existingRemittance) {
      return this.enrichRemittance(existingRemittance);
    }

    if (dto.fleetId && dto.fleetId !== assignment.fleetId) {
      throw new BadRequestException(
        `Selected fleet '${dto.fleetId}' does not match assignment fleet '${assignment.fleetId}'`,
      );
    }

    const plannedCurrency =
      dto.currency?.trim().toUpperCase() ??
      assignment.remittanceCurrency?.trim().toUpperCase() ??
      expectedCurrency;

    if (!plannedCurrency) {
      throw new BadRequestException('A remittance currency could not be resolved for this record.');
    }

    if (expectedCurrency && plannedCurrency !== expectedCurrency.toUpperCase()) {
      throw new BadRequestException(
        `Remittance currency must be '${expectedCurrency}' for this organisation.`,
      );
    }

    const amountMinorUnits = dto.amountMinorUnits ?? assignment.remittanceAmountMinorUnits;
    if (!amountMinorUnits || amountMinorUnits < 1) {
      throw new BadRequestException(
        'This assignment does not have a usable remittance amount yet. Update the assignment remittance plan first.',
      );
    }

    const historicalRemittances = await this.prisma.remittance.findMany({
      where: {
        tenantId,
        assignmentId: assignment.id,
      },
      select: {
        dueDate: true,
        amountMinorUnits: true,
        status: true,
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });
    const contractualPeriod = this.resolveContractualRemittancePeriod({
      assignment,
      remittances: historicalRemittances,
    });

    const dueDate =
      dto.dueDate ??
      contractualPeriod.dueDate ??
      computeNextRemittanceDueDate({
        remittanceFrequency: assignment.remittanceFrequency,
        remittanceAmountMinorUnits: assignment.remittanceAmountMinorUnits,
        remittanceCurrency: assignment.remittanceCurrency,
        remittanceStartDate: assignment.remittanceStartDate,
        remittanceCollectionDay: assignment.remittanceCollectionDay,
      });

    if (!dueDate) {
      throw new BadRequestException(
        'This assignment does not have a complete remittance schedule yet. Update the assignment remittance plan first.',
      );
    }

    const expectedAmountMinorUnits =
      contractualPeriod.dueDate === dueDate && contractualPeriod.expectedAmountMinorUnits
        ? contractualPeriod.expectedAmountMinorUnits
        : assignment.remittanceAmountMinorUnits ?? amountMinorUnits;
    const shortfallAmountMinorUnits = Math.max(
      0,
      expectedAmountMinorUnits - amountMinorUnits,
    );

    const created = await this.prisma.remittance.create({
      data: {
        tenantId,
        assignmentId: dto.assignmentId,
        driverId: assignment.driverId,
        vehicleId: assignment.vehicleId,
        fleetId: assignment.fleetId,
        operatingUnitId: assignment.operatingUnitId,
        businessEntityId: assignment.businessEntityId,
        amountMinorUnits,
        currency: plannedCurrency,
        dueDate,
        notes: dto.notes ?? null,
        status: 'pending',
        ...(dto.clientReferenceId ? { clientReferenceId: dto.clientReferenceId } : {}),
        submissionSource: dto.submissionSource ?? 'online',
        syncStatus: dto.syncStatus ?? 'synced',
        originalCapturedAt: dto.originalCapturedAt ? new Date(dto.originalCapturedAt) : new Date(),
        syncedAt: dto.syncStatus === 'offline_submitted' ? null : new Date(),
        ...(dto.evidence ? { evidence: dto.evidence as Prisma.InputJsonValue } : {}),
        ...(dto.shiftCode ? { shiftCode: dto.shiftCode } : {}),
        ...(dto.checkpointLabel ? { checkpointLabel: dto.checkpointLabel } : {}),
        shortfallAmountMinorUnits,
      },
    });
    await this.policyService.evaluateDriverPolicies(tenantId, assignment.driverId);
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: assignment.vehicleId },
      select: {
        id: true,
        make: true,
        model: true,
        plate: true,
        tenantVehicleCode: true,
        systemVehicleCode: true,
      },
    });
    const vehicleLabel =
      vehicle?.plate?.trim() ||
      vehicle?.tenantVehicleCode?.trim() ||
      vehicle?.systemVehicleCode?.trim() ||
      `${vehicle?.make ?? ''} ${vehicle?.model ?? ''}`.trim() ||
      assignment.vehicleId;
    await this.notificationsService.notifyRemittanceRecorded({
      tenantId,
      assignmentId: assignment.id,
      driverId: assignment.driverId,
      fleetId: assignment.fleetId,
      vehicleId: assignment.vehicleId,
      vehicleLabel,
      amountMinorUnits,
      currency: plannedCurrency,
      dueDate,
    }).catch(() => {
      // Recording the remittance is the primary operation; notification failure should not roll it back.
    });
    await this.auditService.recordTenantAction({
      tenantId,
      entityType: 'remittance',
      entityId: created.id,
      action: 'remittance.recorded',
      afterState: created as unknown as Prisma.InputJsonValue,
      metadata: {
        assignmentId: assignment.id,
        driverId: assignment.driverId,
        vehicleId: assignment.vehicleId,
        fleetId: assignment.fleetId,
        dueDate,
        amountMinorUnits,
        currency: plannedCurrency,
        status: created.status,
      },
    });
    return this.enrichRemittance(created);
  }

  async confirm(
    tenantId: string,
    id: string,
    paidDate: string,
  ): Promise<EnrichedRemittance> {
    const record = await this.findOne(tenantId, id);

    if (record.status === 'completed') {
      throw new ConflictException(`Remittance '${record.id}' has already been completed.`);
    }

    this.ensurePendingTransition(record, 'completed');

    if (!paidDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new BadRequestException('paidDate must be YYYY-MM-DD');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant '${tenantId}' not found`);
    }

    const walletCurrency = isCountrySupported(tenant.country)
      ? getCountryConfig(tenant.country).currency
      : record.currency;
    const nextStatus =
      record.reconciliation &&
      typeof record.reconciliation === 'object' &&
      'periodStatus' in record.reconciliation &&
      record.reconciliation.periodStatus === 'partial'
        ? 'partially_settled'
        : 'completed';

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedRemittance = await tx.remittance.update({
        where: { id },
        data: { status: nextStatus, paidDate },
      });

      const walletEntry = await this.operationalWalletsService.addEntryInTransaction(
        tx,
        tenantId,
        record.businessEntityId,
        {
          type: 'credit',
          amountMinorUnits: record.amountMinorUnits,
          currency: walletCurrency,
          referenceId: record.id,
          referenceType: 'remittance',
          description:
            nextStatus === 'partially_settled'
              ? `Remittance partially settled for assignment ${record.assignmentId}`
              : `Remittance completed for assignment ${record.assignmentId}`,
          },
        );

      return {
        ...updatedRemittance,
        walletEntry,
      };
    });
    await this.recordsService.issueRemittanceReceipt(tenantId, result.id);
    await this.policyService.evaluateDriverPolicies(tenantId, record.driverId);
    await this.auditService.recordTenantAction({
      tenantId,
      entityType: 'remittance',
      entityId: result.id,
      action: 'remittance.confirmed',
      afterState: result as unknown as Prisma.InputJsonValue,
      metadata: {
        assignmentId: record.assignmentId,
        driverId: record.driverId,
        vehicleId: record.vehicleId,
        fleetId: record.fleetId,
        paidDate,
        status: nextStatus,
      },
    });
    return this.enrichRemittance(result);
  }

  async dispute(tenantId: string, id: string, notes: string): Promise<EnrichedRemittance> {
    const record = await this.findOne(tenantId, id);

    this.ensurePendingTransition(record, 'disputed');

    if (!notes.trim()) {
      throw new BadRequestException('notes are required to dispute a remittance');
    }

    const updated = await this.prisma.remittance.update({
      where: { id },
      data: { status: 'disputed', notes: notes.trim() },
    });
    await this.policyService.evaluateDriverPolicies(tenantId, record.driverId);
    await this.auditService.recordTenantAction({
      tenantId,
      entityType: 'remittance',
      entityId: updated.id,
      action: 'remittance.disputed',
      beforeState: record as unknown as Prisma.InputJsonValue,
      afterState: updated as unknown as Prisma.InputJsonValue,
      metadata: {
        assignmentId: record.assignmentId,
        driverId: record.driverId,
        vehicleId: record.vehicleId,
        fleetId: record.fleetId,
        status: updated.status,
      },
    });
    return this.enrichRemittance(updated);
  }

  async waive(tenantId: string, id: string, notes: string, actorRole: string): Promise<EnrichedRemittance> {
    if (actorRole !== TenantRole.TenantOwner) {
      throw new ForbiddenException('Only tenant owners can waive remittance records.');
    }

    const record = await this.findOne(tenantId, id);

    this.ensurePendingTransition(record, 'waived');

    if (!notes.trim()) {
      throw new BadRequestException('notes are required to waive a remittance');
    }

    const updated = await this.prisma.remittance.update({
      where: { id },
      data: { status: 'waived', notes: notes.trim() },
    });
    await this.policyService.evaluateDriverPolicies(tenantId, record.driverId);
    await this.auditService.recordTenantAction({
      tenantId,
      entityType: 'remittance',
      entityId: updated.id,
      action: 'remittance.waived',
      beforeState: record as unknown as Prisma.InputJsonValue,
      afterState: updated as unknown as Prisma.InputJsonValue,
      metadata: {
        assignmentId: record.assignmentId,
        driverId: record.driverId,
        vehicleId: record.vehicleId,
        fleetId: record.fleetId,
        status: updated.status,
      },
    });
    return this.enrichRemittance(updated);
  }

  async confirmMany(tenantId: string, ids: string[], paidDate: string) {
    const results: EnrichedRemittance[] = [];
    for (const id of ids) {
      results.push(await this.confirm(tenantId, id, paidDate));
    }
    return results;
  }

  async resolveDisputesMany(tenantId: string, ids: string[], paidDate: string) {
    const disputedRecords = await this.prisma.remittance.findMany({
      where: { tenantId, id: { in: ids }, status: 'disputed' },
    });
    const enrichedRecords = await this.enrichRemittances(disputedRecords);
    const disputedRecordById = new Map(enrichedRecords.map((record) => [record.id, record]));
    const results: EnrichedRemittance[] = [];

    for (const record of disputedRecords) {
      const enrichedRecord = disputedRecordById.get(record.id) ?? null;
      const nextStatus =
        enrichedRecord?.reconciliation &&
        typeof enrichedRecord.reconciliation === 'object' &&
        'periodStatus' in enrichedRecord.reconciliation &&
        enrichedRecord.reconciliation.periodStatus === 'partial'
          ? 'partially_settled'
          : 'completed';
      const updated = await this.prisma.$transaction(async (tx) => {
        const remittance = await tx.remittance.update({
          where: { id: record.id },
          data: {
            status: nextStatus,
            paidDate,
            notes: [record.notes, `Dispute resolved on ${paidDate}`].filter(Boolean).join('\n'),
          },
        });
        const walletEntry = await this.operationalWalletsService.addEntryInTransaction(
          tx,
          tenantId,
          record.businessEntityId,
          {
            type: 'credit',
            amountMinorUnits: record.amountMinorUnits,
            currency: record.currency,
            referenceId: record.id,
            referenceType: 'remittance',
            description:
              nextStatus === 'partially_settled'
                ? `Disputed remittance partially settled for assignment ${record.assignmentId}`
                : `Disputed remittance completed for assignment ${record.assignmentId}`,
          },
        );
        return { ...remittance, walletEntry };
      });

      await this.policyService.evaluateDriverPolicies(tenantId, record.driverId);
      await this.auditService.recordTenantAction({
        tenantId,
        entityType: 'remittance',
        entityId: updated.id,
        action: 'remittance.dispute_resolved',
        afterState: updated as unknown as Prisma.InputJsonValue,
        metadata: {
          assignmentId: record.assignmentId,
          driverId: record.driverId,
          vehicleId: record.vehicleId,
          fleetId: record.fleetId,
          paidDate,
          status: nextStatus,
        },
      });
      results.push(await this.enrichRemittance(updated));
    }

    return results;
  }
}
