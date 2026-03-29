import { createHash } from 'node:crypto';
import {
  ASSIGNMENT_STATUS_CODES,
  LEGAL_DOCUMENT_VERSIONS,
  isCountrySupported,
  getCountryConfig,
  toIsoDate,
} from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, type Assignment } from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { buildCsv, parseCsv } from '../common/csv-utils';
import { AuditService } from '../audit/audit.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DriversService } from '../drivers/drivers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VehicleRiskService } from '../vehicle-risk/services/vehicle-risk.service';
import { PolicyService } from '../policy/policy.service';
import type { CreateAssignmentDto } from './dto/create-assignment.dto';
import type { UpdateAssignmentRemittancePlanDto } from './dto/update-assignment-remittance-plan.dto';
import {
  assignmentSupportsRemittance,
  normalizeFinancialContract,
  parseFinancialContractSnapshot,
  resolveAssignmentPaymentModel,
  summarizeFinancialContract,
} from './financial-contract';

const OPEN_ASSIGNMENT_STATUSES = ['created', 'pending_driver_confirmation', 'active'] as const;
const PLATFORM_ISSUER = {
  productName: 'Mobiris',
  legalName: 'Growth Figures Limited',
  jurisdiction: 'Nigeria',
  website: 'growthfigures.com',
} as const;

type AssignmentResourceInput = {
  driverId: string;
  vehicleId: string;
  fleetId?: string;
};

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly driversService: DriversService,
    private readonly vehicleRiskService: VehicleRiskService,
    private readonly policyService: PolicyService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async resolveTenantCurrency(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant '${tenantId}' not found`);
    }

    if (isCountrySupported(tenant.country)) {
      return getCountryConfig(tenant.country).currency;
    }

    return 'NGN';
  }

  private async enrichAssignments<T extends Assignment>(
    assignments: T[],
  ): Promise<Array<T & { financialContract: unknown | null; paymentModel: string }>> {
    if (assignments.length === 0) {
      return [];
    }

    const remittances = await this.prisma.remittance.findMany({
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
      Array<{ dueDate: string; amountMinorUnits: number; status: string }>
    >();
    for (const remittance of remittances) {
      const bucket = remittancesByAssignmentId.get(remittance.assignmentId) ?? [];
      bucket.push(remittance);
      remittancesByAssignmentId.set(remittance.assignmentId, bucket);
    }

    return assignments.map((assignment) => {
      const snapshot = parseFinancialContractSnapshot(assignment.contractSnapshot, assignment);
      const financialContract = summarizeFinancialContract({
        assignmentStatus: assignment.status,
        snapshot,
        remittances: remittancesByAssignmentId.get(assignment.id) ?? [],
      });
      return {
        ...assignment,
        financialContract,
        paymentModel: resolveAssignmentPaymentModel(assignment),
      };
    });
  }

  private async enrichAssignment<T extends Assignment>(
    assignment: T,
  ): Promise<T & { financialContract: unknown | null; paymentModel: string }> {
    const [enriched] = await this.enrichAssignments([assignment]);
    if (!enriched) {
      throw new NotFoundException(`Assignment '${assignment.id}' could not be enriched.`);
    }
    return enriched;
  }

  private buildAcceptanceSnapshotHash(input: {
    assignmentId: string;
    driverId: string;
    vehicleId: string;
    contractVersion?: string | null;
    contractSnapshot?: Prisma.JsonValue;
  }) {
    return createHash('sha256')
      .update(
        JSON.stringify({
          assignmentId: input.assignmentId,
          driverId: input.driverId,
          vehicleId: input.vehicleId,
          contractVersion: input.contractVersion ?? null,
          contractSnapshot: input.contractSnapshot ?? null,
        }),
      )
      .digest('hex');
  }

  private async recordAssignmentAudit(
    tenantId: string,
    assignmentId: string,
    action: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    await this.auditService.recordTenantAction({
      tenantId,
      entityType: 'assignment',
      entityId: assignmentId,
      action,
      ...(metadata !== undefined ? { metadata } : {}),
    });
  }

  private buildVehicleLabel(input: {
    vehicleId: string;
    make?: string | null | undefined;
    model?: string | null | undefined;
    plate?: string | null | undefined;
    tenantVehicleCode?: string | null | undefined;
    systemVehicleCode?: string | null | undefined;
  }) {
    return (
      input.plate?.trim() ||
      input.tenantVehicleCode?.trim() ||
      input.systemVehicleCode?.trim() ||
      `${input.make ?? ''} ${input.model ?? ''}`.trim() ||
      input.vehicleId
    );
  }

  private async sendAssignmentIssuedNotification(input: {
    tenantId: string;
    assignmentId: string;
    driverId: string;
    fleetId: string;
    vehicleId: string;
    vehicleLabel: string;
    requiresAcceptance: boolean;
  }) {
    try {
      await this.notificationsService.notifyAssignmentIssued(input);
    } catch (error) {
      this.logger.warn(
        `Assignment issued notification failed for '${input.assignmentId}': ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  private async sendAssignmentAcceptedNotification(input: {
    tenantId: string;
    assignmentId: string;
    driverId: string;
    fleetId: string;
    vehicleId: string;
    vehicleLabel: string;
  }) {
    try {
      await this.notificationsService.notifyAssignmentAccepted(input);
    } catch (error) {
      this.logger.warn(
        `Assignment accepted notification failed for '${input.assignmentId}': ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  private async sendAssignmentEndedNotification(input: {
    tenantId: string;
    assignmentId: string;
    driverId: string;
    fleetId: string;
    vehicleId: string;
    vehicleLabel: string;
    status: 'ended' | 'cancelled';
  }) {
    try {
      await this.notificationsService.notifyAssignmentEnded(input);
    } catch (error) {
      this.logger.warn(
        `Assignment end notification failed for '${input.assignmentId}': ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  async list(
    tenantId: string,
    filters: {
      driverId?: string;
      vehicleId?: string;
      vehicleIds?: string[];
      fleetId?: string;
      fleetIds?: string[];
      page?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedResponse<Assignment & { financialContract: unknown | null }>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const where = {
      tenantId,
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
    };
    const [data, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.assignment.count({ where }),
    ]);

    return {
      data: await this.enrichAssignments(data),
      total,
      page,
      limit,
    };
  }

  async findOne(
    tenantId: string,
    id: string,
  ): Promise<Assignment & { financialContract: unknown | null }> {
    const assignment = await this.prisma.assignment.findUnique({ where: { id } });

    if (!assignment) {
      throw new NotFoundException(`Assignment '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(assignment.tenantId), asTenantId(tenantId));

    return this.enrichAssignment(assignment);
  }

  private async loadAssignmentResources(
    tenantId: string,
    dto: AssignmentResourceInput,
    allowedVehicleStatuses: string[] = ['available'],
  ) {
    const [driver, vehicle] = await Promise.all([
      this.driversService.findOne(tenantId, dto.driverId),
      this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } }),
    ]);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle '${dto.vehicleId}' not found`);
    }

    assertTenantOwnership(asTenantId(driver.tenantId), asTenantId(tenantId));
    assertTenantOwnership(asTenantId(vehicle.tenantId), asTenantId(tenantId));

    if (
      driver.businessEntityId !== vehicle.businessEntityId ||
      driver.operatingUnitId !== vehicle.operatingUnitId
    ) {
      throw new BadRequestException(
        'Driver and vehicle must belong to the same tenant hierarchy before assignment can be created.',
      );
    }

    if (driver.fleetId !== vehicle.fleetId) {
      throw new BadRequestException(
        `Driver '${dto.driverId}' (fleet: ${driver.fleetId}) and ` +
          `vehicle '${dto.vehicleId}' (fleet: ${vehicle.fleetId}) are in different fleets`,
      );
    }

    if (dto.fleetId && dto.fleetId !== driver.fleetId) {
      throw new BadRequestException(
        `Selected fleet '${dto.fleetId}' does not match driver and vehicle fleet '${driver.fleetId}'`,
      );
    }

    if (driver.assignmentReadiness !== 'ready') {
      throw new BadRequestException(
        driver.assignmentReadinessReasons[0] ??
          'This driver is not ready for assignment yet.',
      );
    }

    try {
      await this.policyService.assertAssignmentEligible(tenantId, driver.id);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'This driver is currently restricted by policy.',
      );
    }

    const fleet = await this.prisma.fleet.findUnique({
      where: { id: driver.fleetId },
      include: {
        operatingUnit: {
          select: {
            id: true,
            businessEntityId: true,
          },
        },
      },
    });

    if (!fleet) {
      throw new NotFoundException(`Fleet '${driver.fleetId}' not found`);
    }

    assertTenantOwnership(asTenantId(fleet.tenantId), asTenantId(tenantId));

    if (
      driver.operatingUnitId !== fleet.operatingUnit.id ||
      driver.businessEntityId !== fleet.operatingUnit.businessEntityId
    ) {
      throw new BadRequestException(
        `Driver '${dto.driverId}' has hierarchy data that no longer matches fleet '${driver.fleetId}'. Repair the driver hierarchy before assignment.`,
      );
    }

    if (
      vehicle.operatingUnitId !== fleet.operatingUnit.id ||
      vehicle.businessEntityId !== fleet.operatingUnit.businessEntityId
    ) {
      throw new BadRequestException(
        `Vehicle '${dto.vehicleId}' has hierarchy data that no longer matches fleet '${driver.fleetId}'. Repair the vehicle hierarchy before assignment.`,
      );
    }

    if (!allowedVehicleStatuses.includes(vehicle.status)) {
      throw new BadRequestException(
        `Vehicle '${dto.vehicleId}' must be one of [${allowedVehicleStatuses.join(', ')}] ` +
          `for this assignment transition (current: '${vehicle.status}')`,
      );
    }

    const risk = await this.vehicleRiskService.getVehicleRisk(tenantId, vehicle.id);
    if (risk.isAssignmentLocked) {
      throw new BadRequestException(
        `Vehicle '${dto.vehicleId}' is locked for assignment until inspection and maintenance issues are resolved.`,
      );
    }

    return { driver, vehicle };
  }

  private async ensureNoOverlappingAssignments(
    dto: AssignmentResourceInput,
    excludeAssignmentId?: string,
  ): Promise<void> {
    const [driverAssignment, vehicleAssignment] = await Promise.all([
      this.prisma.assignment.findFirst({
        where: {
          driverId: dto.driverId,
          status: { in: [...OPEN_ASSIGNMENT_STATUSES] },
          ...(excludeAssignmentId ? { id: { not: excludeAssignmentId } } : {}),
        },
      }),
      this.prisma.assignment.findFirst({
        where: {
          vehicleId: dto.vehicleId,
          status: { in: [...OPEN_ASSIGNMENT_STATUSES] },
          ...(excludeAssignmentId ? { id: { not: excludeAssignmentId } } : {}),
        },
      }),
    ]);

    if (driverAssignment) {
      throw new BadRequestException(
        `Driver '${dto.driverId}' already has an open assignment ('${driverAssignment.id}')`,
      );
    }

    if (vehicleAssignment) {
      throw new BadRequestException(
        `Vehicle '${dto.vehicleId}' already has an open assignment ('${vehicleAssignment.id}')`,
      );
    }
  }

  async create(tenantId: string, dto: CreateAssignmentDto): Promise<Assignment & { financialContract: unknown | null; paymentModel: string }> {
    const tenantCurrency = await this.resolveTenantCurrency(tenantId);
    const { driver, vehicle } = await this.loadAssignmentResources(tenantId, dto, ['available']);
    await this.ensureNoOverlappingAssignments(dto);
    const { paymentModel, topLevelPlan, snapshot } = normalizeFinancialContract(tenantCurrency, dto);
    const contractSnapshot = snapshot
      ? ({
          ...snapshot,
          platformIssuer: {
            productName: PLATFORM_ISSUER.productName,
            legalName: PLATFORM_ISSUER.legalName,
            jurisdiction: PLATFORM_ISSUER.jurisdiction,
            website: PLATFORM_ISSUER.website,
          },
        } as unknown as Prisma.InputJsonValue)
      : Prisma.JsonNull;

    const [assignment] = await this.prisma.$transaction([
      this.prisma.assignment.create({
        data: {
          tenantId,
          fleetId: driver.fleetId,
          operatingUnitId: driver.operatingUnitId,
          businessEntityId: driver.businessEntityId,
          driverId: dto.driverId,
          vehicleId: dto.vehicleId,
          status: 'pending_driver_confirmation',
          notes: dto.notes ?? null,
          ...topLevelPlan,
          contractVersion: LEGAL_DOCUMENT_VERSIONS.terms,
          contractSnapshot,
          contractStatus: 'pending_acceptance',
        },
      }),
      this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: 'assigned' },
      }),
    ]);

    await this.recordAssignmentAudit(tenantId, assignment.id, 'assignment_created', {
      driverId: assignment.driverId,
      vehicleId: assignment.vehicleId,
      status: assignment.status,
      contractVersion: assignment.contractVersion,
      paymentModel,
    });
    await this.sendAssignmentIssuedNotification({
      tenantId,
      assignmentId: assignment.id,
      driverId: assignment.driverId,
      fleetId: assignment.fleetId,
      vehicleId: assignment.vehicleId,
      vehicleLabel: this.buildVehicleLabel({
        vehicleId: assignment.vehicleId,
        make: vehicle.make,
        model: vehicle.model,
        plate: vehicle.plate,
        tenantVehicleCode: vehicle.tenantVehicleCode,
        systemVehicleCode: vehicle.systemVehicleCode,
      }),
      requiresAcceptance: assignment.status === 'pending_driver_confirmation',
    });

    return this.enrichAssignment(assignment);
  }

  async updateRemittancePlan(
    tenantId: string,
    id: string,
    dto: UpdateAssignmentRemittancePlanDto,
  ): Promise<Assignment & { financialContract: unknown | null; paymentModel: string }> {
    const assignment = await this.findOne(tenantId, id);
    if (!assignmentSupportsRemittance(assignment)) {
      throw new BadRequestException(
        `Assignment '${id}' does not use a remittance-based payment model.`,
      );
    }
    const tenantCurrency = await this.resolveTenantCurrency(tenantId);

    const { topLevelPlan, snapshot } = normalizeFinancialContract(tenantCurrency, {
      paymentModel: resolveAssignmentPaymentModel(assignment),
      contractType: dto.contractType ?? null,
      totalTargetAmountMinorUnits: dto.totalTargetAmountMinorUnits ?? null,
      principalAmountMinorUnits: dto.principalAmountMinorUnits ?? null,
      depositAmountMinorUnits: dto.depositAmountMinorUnits ?? null,
      contractDurationPeriods: dto.contractDurationPeriods ?? null,
      contractEndDate: dto.contractEndDate ?? null,
      remittanceAmountMinorUnits:
        dto.remittanceAmountMinorUnits ?? assignment.remittanceAmountMinorUnits,
      remittanceModel:
        assignment.remittanceModel === 'hire_purchase' ? 'hire_purchase' : 'fixed',
      remittanceFrequency: dto.remittanceFrequency ?? assignment.remittanceFrequency,
      remittanceCurrency: dto.remittanceCurrency ?? assignment.remittanceCurrency,
      remittanceStartDate: dto.remittanceStartDate ?? assignment.remittanceStartDate,
      remittanceCollectionDay:
        dto.remittanceCollectionDay ?? assignment.remittanceCollectionDay,
    });

    const updated = await this.prisma.assignment.update({
      where: { id },
      data: {
        ...topLevelPlan,
        contractSnapshot: snapshot
          ? ({
              ...snapshot,
              platformIssuer: {
                productName: PLATFORM_ISSUER.productName,
                legalName: PLATFORM_ISSUER.legalName,
                jurisdiction: PLATFORM_ISSUER.jurisdiction,
                website: PLATFORM_ISSUER.website,
              },
            } as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
    return this.enrichAssignment(updated);
  }

  async acceptDriverTerms(
    tenantId: string,
    id: string,
    input: {
      acceptedFrom: string;
      note?: string;
      confirmationMethod?: string;
      deviceInfo?: Record<string, unknown>;
      signatureHash?: string;
    },
  ): Promise<Assignment & { financialContract: unknown | null }> {
    const assignment = await this.findOne(tenantId, id);
    if (!['created', 'pending_driver_confirmation'].includes(assignment.status)) {
      throw new BadRequestException(
        `Assignment '${id}' cannot be accepted from status '${assignment.status}'.`,
      );
    }

    const acceptedAt = new Date();
    const acceptanceSnapshotHash = this.buildAcceptanceSnapshotHash({
      assignmentId: assignment.id,
      driverId: assignment.driverId,
      vehicleId: assignment.vehicleId,
      contractVersion: assignment.contractVersion,
      ...(assignment.contractSnapshot ? { contractSnapshot: assignment.contractSnapshot } : {}),
    });
    const acceptanceEvidence = {
      acceptedFrom: input.acceptedFrom,
      acceptedAt: acceptedAt.toISOString(),
      confirmationMethod: input.confirmationMethod ?? input.acceptedFrom,
      ...(input.note ? { note: input.note } : {}),
    } satisfies Prisma.InputJsonValue;
    const confirmationEvidence = {
      timestamp: acceptedAt.toISOString(),
      acceptedFrom: input.acceptedFrom,
      confirmationMethod: input.confirmationMethod ?? input.acceptedFrom,
      assignmentSnapshotHash: acceptanceSnapshotHash,
      ...(input.deviceInfo ? { deviceInfo: input.deviceInfo as Prisma.InputJsonValue } : {}),
      ...(input.signatureHash ? { signatureHash: input.signatureHash } : {}),
    } satisfies Prisma.InputJsonValue;

    const updated = await this.prisma.assignment.update({
      where: { id },
      data: {
        status: 'active',
        startedAt: acceptedAt,
        contractStatus: 'accepted',
        driverAcceptedTermsAt: acceptedAt,
        driverConfirmedAt: acceptedAt,
        driverConfirmationMethod: input.confirmationMethod ?? input.acceptedFrom,
        acceptanceSnapshotHash,
        driverAcceptanceEvidence: acceptanceEvidence,
        driverConfirmationEvidence: confirmationEvidence,
      },
    });
    await this.recordAssignmentAudit(tenantId, updated.id, 'assignment_accepted', {
      acceptedAt: acceptedAt.toISOString(),
      confirmationMethod: updated.driverConfirmationMethod,
      assignmentSnapshotHash: acceptanceSnapshotHash,
    });
    await this.recordAssignmentAudit(tenantId, updated.id, 'assignment_activated', {
      activatedAt: acceptedAt.toISOString(),
    });
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: updated.vehicleId },
      select: {
        id: true,
        make: true,
        model: true,
        plate: true,
        tenantVehicleCode: true,
        systemVehicleCode: true,
      },
    });
    await this.sendAssignmentAcceptedNotification({
      tenantId,
      assignmentId: updated.id,
      driverId: updated.driverId,
      fleetId: updated.fleetId,
      vehicleId: updated.vehicleId,
      vehicleLabel: this.buildVehicleLabel({
        vehicleId: updated.vehicleId,
        make: vehicle?.make,
        model: vehicle?.model,
        plate: vehicle?.plate,
        tenantVehicleCode: vehicle?.tenantVehicleCode,
        systemVehicleCode: vehicle?.systemVehicleCode,
      }),
    });
    return this.enrichAssignment(updated);
  }

  async decline(
    tenantId: string,
    id: string,
    input: { declinedFrom: string; note?: string },
  ): Promise<Assignment & { financialContract: unknown | null }> {
    const assignment = await this.findOne(tenantId, id);
    if (!['created', 'pending_driver_confirmation'].includes(assignment.status)) {
      throw new BadRequestException(
        `Assignment '${id}' cannot be declined from status '${assignment.status}'.`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.assignment.update({
        where: { id },
        data: {
          status: 'declined',
          endedAt: new Date(),
          notes: input.note ?? assignment.notes,
        },
      }),
      this.prisma.vehicle.update({
        where: { id: assignment.vehicleId },
        data: { status: 'available' },
      }),
    ]);
    await this.recordAssignmentAudit(tenantId, (updated as Assignment).id, 'assignment_declined', {
      declinedFrom: input.declinedFrom,
      ...(input.note ? { note: input.note } : {}),
    });
    return this.enrichAssignment(updated as Assignment);
  }

  async start(tenantId: string, id: string): Promise<Assignment & { financialContract: unknown | null }> {
    const assignment = await this.findOne(tenantId, id);

    if (assignment.status === 'active') {
      return assignment;
    }

    if (!['created', 'pending_driver_confirmation'].includes(assignment.status)) {
      throw new BadRequestException(
        `Assignment '${id}' cannot be started from status '${assignment.status}'`,
      );
    }

    const assignmentRef: AssignmentResourceInput = {
      driverId: assignment.driverId,
      vehicleId: assignment.vehicleId,
    };

    if (assignment.contractStatus !== 'accepted' || !assignment.driverConfirmedAt) {
      throw new BadRequestException(
        'The driver must accept the assignment terms before the assignment can start.',
      );
    }

    const { vehicle } = await this.loadAssignmentResources(
      tenantId,
      assignmentRef,
      assignment.status === 'created' ? ['available'] : ['available', 'assigned'],
    );

    await this.ensureNoOverlappingAssignments(assignmentRef, assignment.id);

    const shouldAssignVehicle = assignment.status === 'created';
    const operations: Prisma.PrismaPromise<unknown>[] = [
      this.prisma.assignment.update({
        where: { id },
        data: {
          status: 'active',
          startedAt: assignment.driverConfirmedAt,
        },
      }),
    ];

    if (shouldAssignVehicle || vehicle.status === 'available') {
      operations.push(
        this.prisma.vehicle.update({
          where: { id: assignment.vehicleId },
          data: { status: 'assigned' },
        }),
      );
    }

    const [updated] = await this.prisma.$transaction(operations);
    await this.recordAssignmentAudit(tenantId, (updated as Assignment).id, 'assignment_activated', {
      source: 'start_endpoint',
      activatedAt: assignment.driverConfirmedAt.toISOString(),
    });
    return this.enrichAssignment(updated as Assignment);
  }

  async end(
    tenantId: string,
    id: string,
    resolution: 'ended' | 'cancelled',
    input?: {
      notes?: string;
      returnedBy?: string;
      returnEvidence?: Record<string, unknown>;
      closeCurrentRemittanceAs?: 'partially_settled' | 'cancelled_due_to_assignment_end';
    },
  ): Promise<Assignment & { financialContract: unknown | null }> {
    const assignment = await this.findOne(tenantId, id);

    const currentConfig =
      ASSIGNMENT_STATUS_CODES[assignment.status as keyof typeof ASSIGNMENT_STATUS_CODES];
    if (currentConfig?.terminal) {
      throw new BadRequestException(
        `Assignment '${id}' is already in terminal status '${assignment.status}'`,
      );
    }

    if (resolution === 'ended' && assignment.status !== 'active') {
      throw new BadRequestException(
        `Assignment '${id}' must be active before the vehicle can be returned`,
      );
    }

    const returnedAt = new Date();
    const returnIso = toIsoDate(returnedAt);
    const returnEvidence = input?.returnEvidence
      ? (input.returnEvidence as Prisma.InputJsonValue)
      : undefined;
    const [updated] = await this.prisma.$transaction([
      this.prisma.assignment.update({
        where: { id },
        data: {
          status: resolution,
          endedAt: returnedAt,
          returnedAt,
          returnedBy: input?.returnedBy ?? null,
          ...(returnEvidence ? { returnEvidence } : {}),
          notes: input?.notes ?? assignment.notes,
        },
      }),
      this.prisma.vehicle.update({
        where: { id: assignment.vehicleId },
        data: { status: 'available' },
      }),
      this.prisma.remittance.updateMany({
        where: {
          tenantId,
          assignmentId: assignment.id,
          status: 'pending',
          dueDate: { gt: returnIso },
        },
        data: { status: 'cancelled_due_to_assignment_end', syncedAt: new Date() },
      }),
      ...(input?.closeCurrentRemittanceAs
        ? [
            this.prisma.remittance.updateMany({
              where: {
                tenantId,
                assignmentId: assignment.id,
                status: 'pending',
                dueDate: returnIso,
              },
              data: { status: input.closeCurrentRemittanceAs, syncedAt: new Date() },
            }),
          ]
        : []),
    ]);

    await this.recordAssignmentAudit(
      tenantId,
      (updated as Assignment).id,
      'vehicle_returned',
      {
        returnedAt: returnedAt.toISOString(),
        ...(input?.returnedBy ? { returnedBy: input.returnedBy } : {}),
        ...(returnEvidence ? { returnEvidence } : {}),
      } satisfies Prisma.InputJsonValue,
    );
    await this.recordAssignmentAudit(tenantId, (updated as Assignment).id, 'assignment_ended', {
      status: resolution,
      returnedAt: returnedAt.toISOString(),
    });
    await this.auditService.recordTenantAction({
      tenantId,
      entityType: 'remittance',
      entityId: assignment.id,
      action: 'remittance_stopped',
      metadata: {
        assignmentId: assignment.id,
        stoppedAt: returnedAt.toISOString(),
        reason: resolution,
      },
    });
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
    await this.sendAssignmentEndedNotification({
      tenantId,
      assignmentId: assignment.id,
      driverId: assignment.driverId,
      fleetId: assignment.fleetId,
      vehicleId: assignment.vehicleId,
      vehicleLabel: this.buildVehicleLabel({
        vehicleId: assignment.vehicleId,
        make: vehicle?.make,
        model: vehicle?.model,
        plate: vehicle?.plate,
        tenantVehicleCode: vehicle?.tenantVehicleCode,
        systemVehicleCode: vehicle?.systemVehicleCode,
      }),
      status: resolution,
    });
    return this.enrichAssignment(updated as Assignment);
  }

  async importAssignmentsFromCsv(
    tenantId: string,
    csvContent: string,
  ): Promise<{ createdCount: number; failedCount: number; errors: string[] }> {
    const rows = parseCsv(csvContent);
    if (rows.length === 0) {
      throw new BadRequestException('The uploaded assignment import file is empty.');
    }

    const [fleets, drivers, vehicles] = await Promise.all([
      this.prisma.fleet.findMany({
        where: { tenantId },
        select: { id: true, name: true },
      }),
      this.prisma.driver.findMany({
        where: { tenantId },
        select: { id: true, phone: true },
      }),
      this.prisma.vehicle.findMany({
        where: { tenantId },
        select: { id: true, tenantVehicleCode: true, plate: true },
      }),
    ]);

    const fleetByName = new Map(fleets.map((fleet) => [fleet.name.trim().toLowerCase(), fleet.id]));
    const driverByPhone = new Map(
      drivers.flatMap((driver) =>
        driver.phone ? [[driver.phone.trim(), driver.id] as const] : [],
      ),
    );
    const vehicleByCode = new Map(
      vehicles.flatMap((vehicle) => {
        const entries: Array<[string, string]> = [];
        if (vehicle.tenantVehicleCode) {
          entries.push([vehicle.tenantVehicleCode.trim().toLowerCase(), vehicle.id]);
        }
        if (vehicle.plate) {
          entries.push([vehicle.plate.trim().toLowerCase(), vehicle.id]);
        }
        return entries;
      }),
    );

    let createdCount = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      const fleetId = row.fleetName?.trim()
        ? fleetByName.get(row.fleetName.trim().toLowerCase())
        : undefined;
      const driverId = row.driverPhone?.trim()
        ? driverByPhone.get(row.driverPhone.trim())
        : undefined;
      const vehicleId = row.vehicleCode?.trim()
        ? vehicleByCode.get(row.vehicleCode.trim().toLowerCase())
        : undefined;

      if (!driverId || !vehicleId) {
        errors.push(
          `Row ${index + 2}: driverPhone and vehicleCode must match existing records.`,
        );
        continue;
      }

      try {
        const payload = {
          ...(fleetId ? { fleetId } : {}),
          driverId,
          vehicleId,
          ...(row.notes?.trim() ? { notes: row.notes.trim() } : {}),
          ...(row.paymentModel?.trim()
            ? { paymentModel: row.paymentModel.trim() }
            : {}),
          ...(row.contractType?.trim()
            ? { contractType: row.contractType.trim() }
            : {}),
          ...(row.remittanceModel?.trim()
            ? { remittanceModel: row.remittanceModel.trim() }
            : {}),
          ...(row.remittanceAmountMinorUnits?.trim()
            ? {
                remittanceAmountMinorUnits: Number.parseInt(
                  row.remittanceAmountMinorUnits.trim(),
                  10,
                ),
              }
            : {}),
          ...(row.remittanceCurrency?.trim()
            ? { remittanceCurrency: row.remittanceCurrency.trim() }
            : {}),
          ...(row.remittanceFrequency?.trim()
            ? { remittanceFrequency: row.remittanceFrequency.trim() }
            : {}),
          ...(row.remittanceStartDate?.trim()
            ? { remittanceStartDate: row.remittanceStartDate.trim() }
            : {}),
          ...(row.remittanceCollectionDay
            ? { remittanceCollectionDay: Number.parseInt(row.remittanceCollectionDay, 10) }
            : {}),
          ...(row.totalTargetAmountMinorUnits
            ? { totalTargetAmountMinorUnits: Number.parseInt(row.totalTargetAmountMinorUnits, 10) }
            : {}),
          ...(row.principalAmountMinorUnits
            ? { principalAmountMinorUnits: Number.parseInt(row.principalAmountMinorUnits, 10) }
            : {}),
          ...(row.depositAmountMinorUnits
            ? { depositAmountMinorUnits: Number.parseInt(row.depositAmountMinorUnits, 10) }
            : {}),
          ...(row.contractDurationPeriods
            ? { contractDurationPeriods: Number.parseInt(row.contractDurationPeriods, 10) }
            : {}),
          ...(row.contractEndDate?.trim()
            ? { contractEndDate: row.contractEndDate.trim() }
            : {}),
        };
        await this.create(tenantId, payload);
        createdCount += 1;
      } catch (error) {
        errors.push(
          `Row ${index + 2}: ${error instanceof Error ? error.message : 'Assignment import failed.'}`,
        );
      }
    }

    return {
      createdCount,
      failedCount: errors.length,
      errors,
    };
  }

  async exportAssignmentsCsv(
    tenantId: string,
    input: { fleetIds?: string[]; vehicleIds?: string[] } = {},
  ): Promise<string> {
    const assignments = (await this.prisma.assignment.findMany({
      where: {
        tenantId,
        ...(input.fleetIds?.length ? { fleetId: { in: input.fleetIds } } : {}),
        ...(input.vehicleIds?.length ? { vehicleId: { in: input.vehicleIds } } : {}),
      },
      include: {
        driver: { select: { phone: true, firstName: true, lastName: true } },
        vehicle: { select: { tenantVehicleCode: true, plate: true } },
        fleet: { select: { name: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    } as never)) as Array<
      Prisma.AssignmentGetPayload<{}>
      & {
        driver: { phone: string; firstName: string; lastName: string };
        vehicle: { tenantVehicleCode: string; plate: string | null };
        fleet: { name: string };
      }
    >;

    return buildCsv(
      [
        'assignmentId',
        'fleetName',
        'driverName',
        'driverPhone',
        'vehicleCode',
        'vehiclePlate',
        'status',
        'paymentModel',
        'contractType',
        'remittanceModel',
        'remittanceAmountMinorUnits',
        'remittanceCurrency',
        'remittanceFrequency',
        'remittanceStartDate',
        'remittanceCollectionDay',
        'totalTargetAmountMinorUnits',
        'principalAmountMinorUnits',
        'depositAmountMinorUnits',
        'contractDurationPeriods',
        'contractEndDate',
        'createdAt',
      ],
      assignments.map((assignment) => [
        assignment.id,
        assignment.fleet.name,
        `${assignment.driver.firstName} ${assignment.driver.lastName}`.trim(),
        assignment.driver.phone,
        assignment.vehicle.tenantVehicleCode,
        assignment.vehicle.plate ?? '',
        assignment.status,
        resolveAssignmentPaymentModel(assignment),
        assignment.remittanceModel === 'hire_purchase' ? 'hire_purchase' : 'regular_hire',
        assignment.remittanceModel ?? '',
        assignment.remittanceAmountMinorUnits ?? '',
        assignment.remittanceCurrency ?? '',
        assignment.remittanceFrequency ?? '',
        assignment.remittanceStartDate ?? '',
        assignment.remittanceCollectionDay ?? '',
        (
          (assignment.contractSnapshot as { hirePurchase?: { totalTargetAmountMinorUnits?: number } } | null)
            ?.hirePurchase?.totalTargetAmountMinorUnits ?? ''
        ),
        (
          (assignment.contractSnapshot as { hirePurchase?: { principalAmountMinorUnits?: number } } | null)
            ?.hirePurchase?.principalAmountMinorUnits ?? ''
        ),
        (
          (assignment.contractSnapshot as { hirePurchase?: { depositAmountMinorUnits?: number } } | null)
            ?.hirePurchase?.depositAmountMinorUnits ?? ''
        ),
        (
          (assignment.contractSnapshot as {
            hirePurchase?: { installmentPlan?: { periodCount?: number } };
          } | null)?.hirePurchase?.installmentPlan?.periodCount ?? ''
        ),
        (
          (assignment.contractSnapshot as {
            hirePurchase?: { installmentPlan?: { contractEndDate?: string } };
          } | null)?.hirePurchase?.installmentPlan?.contractEndDate ?? ''
        ),
        assignment.createdAt.toISOString(),
      ]),
    );
  }
}
