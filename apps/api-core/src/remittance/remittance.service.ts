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
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { OperationalWalletsService } from '../operational-wallets/operational-wallets.service';
import { PolicyService } from '../policy/policy.service';
import { RecordsService } from '../records/records.service';
import type { RecordRemittanceDto } from './dto/record-remittance.dto';

type RemittanceWithWalletEntry = Remittance & { walletEntry?: OperationalWalletEntry };

@Injectable()
export class RemittanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly operationalWalletsService: OperationalWalletsService,
    private readonly policyService: PolicyService,
    private readonly recordsService: RecordsService,
  ) {}

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
  ): Promise<PaginatedResponse<Remittance>> {
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
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(tenantId: string, id: string): Promise<Remittance> {
    const record = await this.prisma.remittance.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Remittance '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(record.tenantId), asTenantId(tenantId));

    return record;
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

    return buildCsv(
      [
        'remittanceId',
        'assignmentId',
        'driverId',
        'vehicleId',
        'fleetId',
        'amountMinorUnits',
        'currency',
        'status',
        'dueDate',
        'paidDate',
        'notes',
        'createdAt',
      ],
      records.map((record) => [
        record.id,
        record.assignmentId,
        record.driverId,
        record.vehicleId,
        record.fleetId,
        record.amountMinorUnits,
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

  async record(tenantId: string, dto: RecordRemittanceDto): Promise<Remittance> {
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

    const assignmentEndedOn =
      assignment.returnedAt?.toISOString().slice(0, 10) ?? assignment.endedAt?.toISOString().slice(0, 10);
    const isSameDayFinalSubmission =
      assignment.status === 'ended' &&
      Boolean(assignmentEndedOn) &&
      (dto.dueDate ? dto.dueDate === assignmentEndedOn : true);

    if (!(assignment.status === 'active' || isSameDayFinalSubmission)) {
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
      return existingRemittance;
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

    const dueDate =
      dto.dueDate ??
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

    const shortfallAmountMinorUnits = Math.max(
      0,
      (assignment.remittanceAmountMinorUnits ?? amountMinorUnits) - amountMinorUnits,
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
    return created;
  }

  async confirm(
    tenantId: string,
    id: string,
    paidDate: string,
  ): Promise<RemittanceWithWalletEntry> {
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

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedRemittance = await tx.remittance.update({
        where: { id },
        data: { status: 'completed', paidDate },
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
            description: `Remittance completed for assignment ${record.assignmentId}`,
          },
        );

      return {
        ...updatedRemittance,
        walletEntry,
      };
    });
    await this.recordsService.issueRemittanceReceipt(tenantId, result.id);
    await this.policyService.evaluateDriverPolicies(tenantId, record.driverId);
    return result;
  }

  async dispute(tenantId: string, id: string, notes: string): Promise<Remittance> {
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
    return updated;
  }

  async waive(tenantId: string, id: string, notes: string, actorRole: string): Promise<Remittance> {
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
    return updated;
  }

  async confirmMany(tenantId: string, ids: string[], paidDate: string) {
    const results: RemittanceWithWalletEntry[] = [];
    for (const id of ids) {
      results.push(await this.confirm(tenantId, id, paidDate));
    }
    return results;
  }

  async resolveDisputesMany(tenantId: string, ids: string[], paidDate: string) {
    const disputedRecords = await this.prisma.remittance.findMany({
      where: { tenantId, id: { in: ids }, status: 'disputed' },
    });
    const results: RemittanceWithWalletEntry[] = [];

    for (const record of disputedRecords) {
      const updated = await this.prisma.$transaction(async (tx) => {
        const remittance = await tx.remittance.update({
          where: { id: record.id },
          data: {
            status: 'completed',
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
            description: `Disputed remittance completed for assignment ${record.assignmentId}`,
          },
        );
        return { ...remittance, walletEntry };
      });

      await this.policyService.evaluateDriverPolicies(tenantId, record.driverId);
      results.push(updated);
    }

    return results;
  }
}
