import { VEHICLE_STATUS_CODES, getCountryConfig, getVehicleType } from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  type Vehicle,
  type VehicleIncident,
  type VehicleInspection,
  type VehicleMaintenanceEvent,
  type VehicleMaintenanceSchedule,
  type VehicleValuation,
} from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { buildCsv, parseCsv } from '../common/csv-utils';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneMeteringClient } from '../tenant-billing/control-plane-metering.client';
import { SubscriptionEntitlementsService } from '../tenant-billing/subscription-entitlements.service';
import type { CreateVehicleDto } from './dto/create-vehicle.dto';
import type { UpdateVehicleDto } from './dto/update-vehicle.dto';

const VEHICLE_CODE_RETRY_LIMIT = 5;

type VehicleDetail = Vehicle & {
  fleetName: string;
  operatingUnitName: string;
  businessEntityName: string;
  valuations: VehicleValuation[];
  assignmentSummary: {
    totalAssignments: number;
    activeAssignments: number;
    latestAssignmentId?: string | null;
    latestAssignmentStatus?: string | null;
    latestAssignmentStartedAt?: Date | null;
  };
  maintenanceSummary: string;
  maintenanceDue: {
    dueCount: number;
    overdueCount: number;
    nextDueAt?: string | null;
    nextDueOdometerKm?: number | null;
  };
  economics: {
    acquisitionValueMinorUnits?: number | null;
    currentEstimatedValueMinorUnits?: number | null;
    valuationCurrency?: string | null;
    confirmedRevenueMinorUnits: number;
    trackedExpenseMinorUnits: number;
    profitMinorUnits: number;
    recommendation: string;
  };
  inspections: Array<
    Omit<VehicleInspection, 'inspectionDate' | 'nextInspectionDueAt'> & {
      inspectionDate: string;
      nextInspectionDueAt?: string | null;
    }
  >;
  maintenanceSchedules: Array<
    Omit<VehicleMaintenanceSchedule, 'nextDueAt'> & { nextDueAt?: string | null }
  >;
  maintenanceEvents: Array<
    Omit<VehicleMaintenanceEvent, 'scheduledFor' | 'completedAt'> & {
      scheduledFor?: string | null;
      completedAt?: string | null;
    }
  >;
  incidents: Array<Omit<VehicleIncident, 'occurredAt'> & { occurredAt: string }>;
  latestVinDecode?: {
    id: string;
    decodedMake?: string | null;
    decodedModel?: string | null;
    decodedModelYear?: number | null;
    vehicleType?: string | null;
    bodyClass?: string | null;
    createdAt: Date;
  } | null;
};

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionEntitlementsService: SubscriptionEntitlementsService,
    private readonly meteringClient: ControlPlaneMeteringClient,
  ) {}

  async list(
    tenantId: string,
    input: {
      fleetId?: string;
      fleetIds?: string[];
      vehicleId?: string;
      vehicleIds?: string[];
      page?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedResponse<Vehicle>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const where = {
      tenantId,
      ...(input.vehicleId ? { id: input.vehicleId } : input.vehicleIds?.length ? { id: { in: input.vehicleIds } } : {}),
      ...(input.fleetId
        ? { fleetId: input.fleetId }
        : input.fleetIds?.length
          ? { fleetId: { in: input.fleetIds } }
          : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    // Compute subscription lock: vehicles created beyond the plan cap are locked.
    const { vehicleCap } = await this.subscriptionEntitlementsService.getCapInfo(tenantId);
    let lockedVehicleIds: Set<string> | null = null;
    if (vehicleCap !== null) {
      const totalCount = await this.prisma.vehicle.count({ where: { tenantId } });
      if (totalCount > vehicleCap) {
        const unlockedRows = await this.prisma.vehicle.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'asc' },
          take: vehicleCap,
          select: { id: true },
        });
        const unlockedIds = new Set(unlockedRows.map((r) => r.id));
        lockedVehicleIds = new Set(
          data.filter((v) => !unlockedIds.has(v.id)).map((v) => v.id),
        );
      }
    }

    return {
      data: data.map((v) => ({
        ...v,
        locked: lockedVehicleIds !== null ? lockedVehicleIds.has(v.id) : false,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(tenantId: string, id: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(vehicle.tenantId), asTenantId(tenantId));

    return vehicle;
  }

  async findOneDetailed(tenantId: string, id: string): Promise<VehicleDetail> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        fleet: {
          include: {
            operatingUnit: {
              include: {
                businessEntity: true,
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(vehicle.tenantId), asTenantId(tenantId));

    const [
      valuations,
      latestAssignment,
      totalAssignments,
      activeAssignments,
      latestVinDecode,
      inspections,
      maintenanceSchedules,
      maintenanceEvents,
      incidents,
      confirmedRemittanceAggregate,
    ] =
      await Promise.all([
        this.prisma.vehicleValuation.findMany({
          where: { vehicleId: vehicle.id },
          orderBy: [{ valuationDate: 'desc' }, { createdAt: 'desc' }],
        }),
        this.prisma.assignment.findFirst({
          where: { tenantId, vehicleId: vehicle.id },
          orderBy: { startedAt: 'desc' },
          select: { id: true, status: true, startedAt: true },
        }),
        this.prisma.assignment.count({
          where: { tenantId, vehicleId: vehicle.id },
        }),
        this.prisma.assignment.count({
          where: {
            tenantId,
            vehicleId: vehicle.id,
            status: { in: ['assigned', 'active'] },
          },
        }),
        vehicle.vin
          ? this.prisma.vehicleVinDecode.findFirst({
              where: {
                normalizedVin: this.normalizeVin(vehicle.vin),
              },
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                decodedMake: true,
                decodedModel: true,
                decodedModelYear: true,
                vehicleType: true,
                bodyClass: true,
                createdAt: true,
              },
            })
          : Promise.resolve(null),
        this.prisma.vehicleInspection.findMany({
          where: { tenantId, vehicleId: vehicle.id },
          orderBy: { inspectionDate: 'desc' },
        }),
        this.prisma.vehicleMaintenanceSchedule.findMany({
          where: { tenantId, vehicleId: vehicle.id },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.vehicleMaintenanceEvent.findMany({
          where: { tenantId, vehicleId: vehicle.id },
          orderBy: [{ scheduledFor: 'desc' }, { createdAt: 'desc' }],
        }),
        this.prisma.vehicleIncident.findMany({
          where: { tenantId, vehicleId: vehicle.id },
          orderBy: { occurredAt: 'desc' },
        }),
        this.prisma.remittance.aggregate({
          where: { tenantId, vehicleId: vehicle.id, status: 'confirmed' },
          _sum: { amountMinorUnits: true },
        }),
      ]);

    const acquisition = valuations.find(
      (valuation) => valuation.valuationKind === 'acquisition' && valuation.isCurrent,
    );
    const estimate = valuations.find(
      (valuation) => valuation.valuationKind === 'estimate' && valuation.isCurrent,
    );
    const trackedMaintenanceExpenseMinorUnits = maintenanceEvents.reduce(
      (sum, event) => sum + (event.costMinorUnits ?? 0),
      0,
    );
    const trackedIncidentExpenseMinorUnits = incidents.reduce(
      (sum, incident) => sum + (incident.estimatedCostMinorUnits ?? 0),
      0,
    );
    const trackedExpenseMinorUnits =
      trackedMaintenanceExpenseMinorUnits + trackedIncidentExpenseMinorUnits;
    const confirmedRevenueMinorUnits = confirmedRemittanceAggregate._sum.amountMinorUnits ?? 0;
    const profitMinorUnits = confirmedRevenueMinorUnits - trackedExpenseMinorUnits;

    const now = new Date();
    const activeSchedules = maintenanceSchedules.filter((schedule) => schedule.isActive);
    const dueSchedules = activeSchedules.filter((schedule) => {
      if (schedule.nextDueAt && schedule.nextDueAt <= now) {
        return true;
      }
      if (
        schedule.nextDueOdometerKm !== null &&
        schedule.nextDueOdometerKm !== undefined &&
        vehicle.odometerKm !== null &&
        vehicle.odometerKm !== undefined
      ) {
        return vehicle.odometerKm >= schedule.nextDueOdometerKm;
      }
      return false;
    });
    const overdueSchedules = activeSchedules.filter(
      (schedule) => schedule.nextDueAt && schedule.nextDueAt < now,
    );
    const nextDueSchedule = activeSchedules
      .filter((schedule) => schedule.nextDueAt)
      .sort((left, right) => left.nextDueAt!.getTime() - right.nextDueAt!.getTime())[0];

    const maintenanceSummary =
      dueSchedules.length > 0
        ? `${dueSchedules.length} preventive maintenance item${dueSchedules.length === 1 ? '' : 's'} due, ${overdueSchedules.length} overdue.`
        : maintenanceEvents.find((event) => event.status === 'in_progress')
          ? 'Vehicle currently has maintenance in progress.'
          : inspections[0]?.status === 'failed'
            ? 'Latest inspection reported unresolved issues.'
            : 'No preventive maintenance is currently due.';

    const recommendation =
      vehicle.status === 'retired'
        ? 'retired'
        : trackedExpenseMinorUnits > confirmedRevenueMinorUnits && maintenanceEvents.length >= 3
          ? 'review_for_sale'
          : dueSchedules.length > 0 || incidents.length > 0
            ? 'maintain_close_watch'
            : 'hold';

    return {
      ...vehicle,
      fleetName: vehicle.fleet.name,
      operatingUnitName: vehicle.fleet.operatingUnit.name,
      businessEntityName: vehicle.fleet.operatingUnit.businessEntity.name,
      valuations,
      assignmentSummary: {
        totalAssignments,
        activeAssignments,
        latestAssignmentId: latestAssignment?.id ?? null,
        latestAssignmentStatus: latestAssignment?.status ?? null,
        latestAssignmentStartedAt: latestAssignment?.startedAt ?? null,
      },
      maintenanceSummary,
      maintenanceDue: {
        dueCount: dueSchedules.length,
        overdueCount: overdueSchedules.length,
        nextDueAt: nextDueSchedule?.nextDueAt?.toISOString() ?? null,
        nextDueOdometerKm: nextDueSchedule?.nextDueOdometerKm ?? null,
      },
      economics: {
        acquisitionValueMinorUnits: acquisition?.amountMinorUnits ?? null,
        currentEstimatedValueMinorUnits: estimate?.amountMinorUnits ?? null,
        valuationCurrency: estimate?.currency ?? acquisition?.currency ?? null,
        confirmedRevenueMinorUnits,
        trackedExpenseMinorUnits,
        profitMinorUnits,
        recommendation,
      },
      inspections: inspections.map((inspection) => ({
        ...inspection,
        inspectionDate: inspection.inspectionDate.toISOString(),
        nextInspectionDueAt: inspection.nextInspectionDueAt?.toISOString() ?? null,
      })),
      maintenanceSchedules: maintenanceSchedules.map((schedule) => ({
        ...schedule,
        nextDueAt: schedule.nextDueAt?.toISOString() ?? null,
      })),
      maintenanceEvents: maintenanceEvents.map((event) => ({
        ...event,
        scheduledFor: event.scheduledFor?.toISOString() ?? null,
        completedAt: event.completedAt?.toISOString() ?? null,
      })),
      incidents: incidents.map((incident) => ({
        ...incident,
        occurredAt: incident.occurredAt.toISOString(),
      })),
      latestVinDecode,
    };
  }

  async listInspections(tenantId: string, vehicleId: string): Promise<VehicleInspection[]> {
    await this.findOne(tenantId, vehicleId);
    return this.prisma.vehicleInspection.findMany({
      where: { tenantId, vehicleId },
      orderBy: { inspectionDate: 'desc' },
    });
  }

  async createInspection(
    tenantId: string,
    vehicleId: string,
    createdByUserId: string,
    dto: {
      inspectionType: string;
      status?: string;
      inspectionDate?: string;
      odometerKm?: number;
      issuesFoundCount?: number;
      reportSource?: string;
      summary: string;
      reportUrl?: string;
      nextInspectionDueAt?: string;
    },
  ): Promise<VehicleInspection> {
    const vehicle = await this.findOne(tenantId, vehicleId);
    return this.prisma.$transaction(async (tx) => {
      if (
        dto.odometerKm !== undefined &&
        (vehicle.odometerKm === null || dto.odometerKm > vehicle.odometerKm)
      ) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { odometerKm: dto.odometerKm },
        });
      }

      return tx.vehicleInspection.create({
        data: {
          tenantId,
          vehicleId,
          createdByUserId,
          inspectionType: dto.inspectionType.trim(),
          status: dto.status?.trim() || 'passed',
          inspectionDate: dto.inspectionDate ? new Date(dto.inspectionDate) : new Date(),
          odometerKm: dto.odometerKm ?? null,
          issuesFoundCount: dto.issuesFoundCount ?? 0,
          reportSource: dto.reportSource?.trim() || 'in_app',
          summary: dto.summary.trim(),
          reportUrl: dto.reportUrl?.trim() || null,
          nextInspectionDueAt: dto.nextInspectionDueAt ? new Date(dto.nextInspectionDueAt) : null,
        },
      });
    });
  }

  async listMaintenanceSchedules(
    tenantId: string,
    vehicleId: string,
  ): Promise<VehicleMaintenanceSchedule[]> {
    await this.findOne(tenantId, vehicleId);
    return this.prisma.vehicleMaintenanceSchedule.findMany({
      where: { tenantId, vehicleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertMaintenanceSchedule(
    tenantId: string,
    vehicleId: string,
    createdByUserId: string,
    dto: {
      scheduleType: string;
      intervalDays?: number;
      intervalKm?: number;
      nextDueAt?: string;
      nextDueOdometerKm?: number;
      source?: string;
      notes?: string;
      isActive?: boolean;
    },
  ): Promise<VehicleMaintenanceSchedule> {
    await this.findOne(tenantId, vehicleId);
    const existing = await this.prisma.vehicleMaintenanceSchedule.findFirst({
      where: { tenantId, vehicleId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return this.prisma.vehicleMaintenanceSchedule.update({
        where: { id: existing.id },
        data: {
          createdByUserId,
          scheduleType: dto.scheduleType.trim(),
          intervalDays: dto.intervalDays ?? null,
          intervalKm: dto.intervalKm ?? null,
          nextDueAt: dto.nextDueAt ? new Date(dto.nextDueAt) : null,
          nextDueOdometerKm: dto.nextDueOdometerKm ?? null,
          source: dto.source?.trim() || 'custom',
          notes: dto.notes?.trim() || null,
          isActive: dto.isActive ?? true,
        },
      });
    }

    return this.prisma.vehicleMaintenanceSchedule.create({
      data: {
        tenantId,
        vehicleId,
        createdByUserId,
        scheduleType: dto.scheduleType.trim(),
        intervalDays: dto.intervalDays ?? null,
        intervalKm: dto.intervalKm ?? null,
        nextDueAt: dto.nextDueAt ? new Date(dto.nextDueAt) : null,
        nextDueOdometerKm: dto.nextDueOdometerKm ?? null,
        source: dto.source?.trim() || 'custom',
        notes: dto.notes?.trim() || null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listMaintenanceEvents(
    tenantId: string,
    vehicleId: string,
  ): Promise<VehicleMaintenanceEvent[]> {
    await this.findOne(tenantId, vehicleId);
    return this.prisma.vehicleMaintenanceEvent.findMany({
      where: { tenantId, vehicleId },
      orderBy: [{ scheduledFor: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createMaintenanceEvent(
    tenantId: string,
    vehicleId: string,
    createdByUserId: string,
    dto: {
      category: string;
      title: string;
      description?: string;
      status?: string;
      scheduledFor?: string;
      completedAt?: string;
      odometerKm?: number;
      costMinorUnits?: number;
      currency?: string;
      vendor?: string;
    },
  ): Promise<VehicleMaintenanceEvent> {
    const vehicle = await this.findOne(tenantId, vehicleId);
    return this.prisma.$transaction(async (tx) => {
      if (
        dto.odometerKm !== undefined &&
        (vehicle.odometerKm === null || dto.odometerKm > vehicle.odometerKm)
      ) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { odometerKm: dto.odometerKm },
        });
      }

      return tx.vehicleMaintenanceEvent.create({
        data: {
          tenantId,
          vehicleId,
          createdByUserId,
          category: dto.category.trim(),
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          status: dto.status?.trim() || 'scheduled',
          scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
          completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
          odometerKm: dto.odometerKm ?? null,
          costMinorUnits: dto.costMinorUnits ?? null,
          currency: dto.currency?.trim() || null,
          vendor: dto.vendor?.trim() || null,
        },
      });
    });
  }

  async listIncidents(tenantId: string, vehicleId: string): Promise<VehicleIncident[]> {
    await this.findOne(tenantId, vehicleId);
    return this.prisma.vehicleIncident.findMany({
      where: { tenantId, vehicleId },
      orderBy: { occurredAt: 'desc' },
    });
  }

  async createIncident(
    tenantId: string,
    vehicleId: string,
    reportedByUserId: string,
    dto: {
      driverId?: string;
      occurredAt: string;
      category: string;
      severity: string;
      title: string;
      description?: string;
      estimatedCostMinorUnits?: number;
      currency?: string;
    },
  ): Promise<VehicleIncident> {
    await this.findOne(tenantId, vehicleId);
    return this.prisma.vehicleIncident.create({
      data: {
        tenantId,
        vehicleId,
        reportedByUserId,
        driverId: dto.driverId ?? null,
        occurredAt: new Date(dto.occurredAt),
        category: dto.category.trim(),
        severity: dto.severity.trim(),
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        estimatedCostMinorUnits: dto.estimatedCostMinorUnits ?? null,
        currency: dto.currency?.trim() || null,
      },
    });
  }

  async suggestTenantVehicleCode(
    tenantId: string,
    fleetId: string,
  ): Promise<{ suggestedTenantVehicleCode: string; prefix: string }> {
    const context = await this.getVehicleCodeContext(tenantId, fleetId);
    const prefix = this.buildVehicleCodePrefix(context.fleet.name || context.businessEntity.name);
    const nextSerial = await this.getNextVehicleCodeSerial(tenantId, prefix, 'tenant');

    return {
      suggestedTenantVehicleCode: this.formatVehicleCode(prefix, nextSerial),
      prefix,
    };
  }

  async create(tenantId: string, dto: CreateVehicleDto): Promise<Vehicle> {
    getVehicleType(dto.vehicleType);
    const currentVehicleCount = await this.prisma.vehicle.count({
      where: { tenantId },
    });
    await this.subscriptionEntitlementsService.enforceVehicleCapacity(
      tenantId,
      currentVehicleCount,
    );

    this.assertValuationInputConsistency(dto);

    const fleetContext = await this.getVehicleCodeContext(tenantId, dto.fleetId);
    const normalizedPlate = this.normalizeOptionalPlate(dto.plate);
    const normalizedVin = this.normalizeOptionalVin(dto.vin);
    const normalizedTenantVehicleCode = this.normalizeTenantVehicleCode(dto.tenantVehicleCode);

    await this.assertVehicleUniqueness({
      tenantId,
      ...(normalizedTenantVehicleCode ? { tenantVehicleCode: normalizedTenantVehicleCode } : {}),
      ...(normalizedPlate !== undefined ? { plate: normalizedPlate } : {}),
      ...(normalizedVin !== undefined ? { vin: normalizedVin } : {}),
    });

    const systemPrefix = this.buildSystemVehicleCodePrefix(fleetContext.businessEntity.name);
    const tenantPrefix = this.buildVehicleCodePrefix(fleetContext.fleet.name);

    for (let attempt = 0; attempt < VEHICLE_CODE_RETRY_LIMIT; attempt += 1) {
      const generatedTenantVehicleCode =
        normalizedTenantVehicleCode ??
        this.formatVehicleCode(
          tenantPrefix,
          await this.getNextVehicleCodeSerial(tenantId, tenantPrefix, 'tenant'),
        );
      const generatedSystemVehicleCode = this.formatVehicleCode(
        systemPrefix,
        await this.getNextVehicleCodeSerial(tenantId, systemPrefix, 'system'),
      );

      try {
        const vehicle = await this.prisma.$transaction(async (tx) => {
          const tenant = await tx.tenant.findUnique({
            where: { id: tenantId },
            select: { country: true },
          });
          const tenantCurrency = tenant ? getCountryConfig(tenant.country).currency : null;

          const vehicle = await tx.vehicle.create({
            data: {
              tenantId,
              fleetId: dto.fleetId,
              operatingUnitId: fleetContext.operatingUnit.id,
              businessEntityId: fleetContext.businessEntity.id,
              systemVehicleCode: generatedSystemVehicleCode,
              tenantVehicleCode: generatedTenantVehicleCode,
              vehicleType: dto.vehicleType,
              make: dto.make.trim(),
              model: dto.model.trim(),
              trim: this.normalizeOptionalText(dto.trim),
              year: dto.year,
              plate: normalizedPlate ?? null,
              color: this.normalizeOptionalText(dto.color),
              vin: normalizedVin ?? null,
              odometerKm: dto.odometerKm ?? null,
              status: 'available',
            },
          });

          await this.createVehicleValuations(tx, {
            tenantId,
            vehicleId: vehicle.id,
            businessEntityCurrency: tenantCurrency,
            ...(dto.acquisitionCostMinorUnits !== undefined
              ? { acquisitionCostMinorUnits: dto.acquisitionCostMinorUnits }
              : {}),
            ...(dto.acquisitionDate !== undefined ? { acquisitionDate: dto.acquisitionDate } : {}),
            ...(dto.currentEstimatedValueMinorUnits !== undefined
              ? {
                  currentEstimatedValueMinorUnits: dto.currentEstimatedValueMinorUnits,
                }
              : {}),
            ...(dto.valuationSource !== undefined ? { valuationSource: dto.valuationSource } : {}),
          });

          return vehicle;
        });
        this.meteringClient.fireEvent(tenantId, 'active_vehicle');
        return vehicle;
      } catch (error) {
        if (this.isPrismaUniqueError(error)) {
          const target = this.getPrismaErrorTarget(error);
          if (target.includes('tenantVehicleCode') && normalizedTenantVehicleCode) {
            throw new ConflictException(
              `Vehicle code '${generatedTenantVehicleCode}' is already in use in this organisation.`,
            );
          }

          if (target.includes('plate') && normalizedPlate) {
            throw new ConflictException(
              `Plate number '${normalizedPlate}' is already linked to another vehicle in this organisation.`,
            );
          }

          if (target.includes('vin') && normalizedVin) {
            throw new ConflictException(
              `VIN '${normalizedVin}' is already linked to another vehicle in this organisation.`,
            );
          }

          if (target.includes('systemVehicleCode') || target.includes('tenantVehicleCode')) {
            continue;
          }
        }

        throw error;
      }
    }

    throw new ConflictException(
      'Unable to allocate a unique vehicle code after multiple attempts. Retry the request.',
    );
  }

  async importVehiclesFromCsv(
    tenantId: string,
    csvContent: string,
  ): Promise<{ createdCount: number; failedCount: number; errors: string[] }> {
    const rows = parseCsv(csvContent);
    if (rows.length === 0) {
      throw new BadRequestException('The uploaded vehicle import file is empty.');
    }

    const fleets = await this.prisma.fleet.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });
    const fleetByName = new Map(
      fleets.map((fleet) => [fleet.name.trim().toLowerCase(), fleet.id]),
    );

    let createdCount = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      const fleetName = row.fleetName?.trim() ?? '';
      const fleetId = fleetByName.get(fleetName.toLowerCase());
      if (!fleetId) {
        errors.push(`Row ${index + 2}: fleet '${fleetName || 'missing'}' was not found.`);
        continue;
      }

      try {
        const payload = {
          fleetId,
          ...(row.tenantVehicleCode?.trim()
            ? { tenantVehicleCode: row.tenantVehicleCode.trim() }
            : {}),
          vehicleType: row.vehicleType?.trim() || 'car',
          make: row.make?.trim() || '',
          model: row.model?.trim() || '',
          ...(row.trim?.trim() ? { trim: row.trim.trim() } : {}),
          year: Number.parseInt(row.year?.trim() || '', 10),
          ...(row.plate?.trim() ? { plate: row.plate.trim() } : {}),
          ...(row.color?.trim() ? { color: row.color.trim() } : {}),
          ...(row.vin?.trim() ? { vin: row.vin.trim() } : {}),
          ...(row.odometerKm ? { odometerKm: Number.parseInt(row.odometerKm, 10) } : {}),
          ...(row.acquisitionCostMinorUnits
            ? {
                acquisitionCostMinorUnits: Number.parseInt(
                  row.acquisitionCostMinorUnits,
                  10,
                ),
              }
            : {}),
          ...(row.acquisitionDate?.trim()
            ? { acquisitionDate: row.acquisitionDate.trim() }
            : {}),
          ...(row.currentEstimatedValueMinorUnits
            ? {
                currentEstimatedValueMinorUnits: Number.parseInt(
                  row.currentEstimatedValueMinorUnits,
                  10,
                ),
              }
            : {}),
          ...(row.valuationSource?.trim()
            ? { valuationSource: row.valuationSource.trim() }
            : {}),
        };
        await this.create(tenantId, payload);
        createdCount += 1;
      } catch (error) {
        errors.push(
          `Row ${index + 2}: ${error instanceof Error ? error.message : 'Vehicle import failed.'}`,
        );
      }
    }

    return {
      createdCount,
      failedCount: errors.length,
      errors,
    };
  }

  async exportVehiclesCsv(
    tenantId: string,
    input: { fleetIds?: string[] } = {},
  ): Promise<string> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        tenantId,
        ...(input.fleetIds?.length ? { fleetId: { in: input.fleetIds } } : {}),
      },
      include: {
        fleet: { select: { name: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return buildCsv(
      [
        'vehicleId',
        'fleetName',
        'tenantVehicleCode',
        'systemVehicleCode',
        'vehicleType',
        'make',
        'model',
        'trim',
        'year',
        'plate',
        'vin',
        'odometerKm',
        'status',
        'createdAt',
      ],
      vehicles.map((vehicle) => [
        vehicle.id,
        vehicle.fleet.name,
        vehicle.tenantVehicleCode,
        vehicle.systemVehicleCode,
        vehicle.vehicleType,
        vehicle.make,
        vehicle.model,
        vehicle.trim ?? '',
        vehicle.year,
        vehicle.plate ?? '',
        vehicle.vin ?? '',
        vehicle.odometerKm ?? '',
        vehicle.status,
        vehicle.createdAt.toISOString(),
      ]),
    );
  }

  async update(tenantId: string, id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(tenantId, id);
    this.assertValuationInputConsistency(dto);

    const nextTenantVehicleCode = this.normalizeTenantVehicleCode(dto.tenantVehicleCode);
    const nextPlate = this.normalizeOptionalPlate(dto.plate);
    const nextVin = this.normalizeOptionalVin(dto.vin);

    if (nextTenantVehicleCode && nextTenantVehicleCode !== vehicle.tenantVehicleCode) {
      await this.assertVehicleUniqueness({
        tenantId,
        tenantVehicleCode: nextTenantVehicleCode,
      });
    }

    if (nextPlate !== undefined && nextPlate !== vehicle.plate) {
      await this.assertVehicleUniqueness({
        tenantId,
        plate: nextPlate,
      });
    }

    if (nextVin !== undefined && nextVin !== vehicle.vin) {
      await this.assertVehicleUniqueness({
        tenantId,
        vin: nextVin,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedVehicle = await tx.vehicle.update({
        where: { id: vehicle.id },
        data: {
          tenantVehicleCode: nextTenantVehicleCode ?? vehicle.tenantVehicleCode,
          plate: nextPlate === undefined ? vehicle.plate : nextPlate,
          vin: nextVin === undefined ? vehicle.vin : nextVin,
          color: dto.color === undefined ? vehicle.color : this.normalizeOptionalText(dto.color),
          year: dto.year ?? vehicle.year,
          odometerKm: dto.odometerKm ?? vehicle.odometerKm,
        },
      });

      const hasValuationUpdate =
        dto.acquisitionCostMinorUnits !== undefined ||
        dto.acquisitionDate !== undefined ||
        dto.currentEstimatedValueMinorUnits !== undefined ||
        dto.valuationSource !== undefined;

      if (hasValuationUpdate) {
        const tenant = await tx.tenant.findUnique({
          where: { id: tenantId },
          select: { country: true },
        });
        const tenantCurrency = tenant ? getCountryConfig(tenant.country).currency : null;

        await this.updateVehicleValuations(tx, {
          tenantId,
          vehicleId: vehicle.id,
          businessEntityCurrency: tenantCurrency,
          ...(dto.acquisitionCostMinorUnits !== undefined
            ? { acquisitionCostMinorUnits: dto.acquisitionCostMinorUnits }
            : {}),
          ...(dto.acquisitionDate !== undefined ? { acquisitionDate: dto.acquisitionDate } : {}),
          ...(dto.currentEstimatedValueMinorUnits !== undefined
            ? {
                currentEstimatedValueMinorUnits: dto.currentEstimatedValueMinorUnits,
              }
            : {}),
          ...(dto.valuationSource !== undefined ? { valuationSource: dto.valuationSource } : {}),
        });
      }

      return updatedVehicle;
    });
  }

  async updateStatus(tenantId: string, id: string, newStatus: string): Promise<Vehicle> {
    const vehicle = await this.findOne(tenantId, id);

    const statusKey = newStatus as keyof typeof VEHICLE_STATUS_CODES;
    const statusConfig = VEHICLE_STATUS_CODES[statusKey];
    if (!statusConfig) {
      const valid = Object.keys(VEHICLE_STATUS_CODES).join(', ');
      throw new BadRequestException(
        `Invalid vehicle status '${newStatus}'. Valid values: ${valid}`,
      );
    }

    const currentConfig = VEHICLE_STATUS_CODES[vehicle.status as keyof typeof VEHICLE_STATUS_CODES];
    if (currentConfig?.terminal) {
      throw new BadRequestException(
        `Vehicle '${id}' is in terminal status '${vehicle.status}' and cannot be transitioned`,
      );
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  private async getVehicleCodeContext(tenantId: string, fleetId: string) {
    const fleet = await this.prisma.fleet.findUnique({
      where: { id: fleetId },
      include: {
        operatingUnit: {
          include: {
            businessEntity: true,
          },
        },
      },
    });

    if (!fleet) {
      throw new NotFoundException(`Fleet '${fleetId}' not found`);
    }

    assertTenantOwnership(asTenantId(fleet.tenantId), asTenantId(tenantId));

    if (fleet.status !== 'active') {
      throw new BadRequestException(
        `Cannot add a vehicle to fleet '${fleetId}' with status '${fleet.status}'`,
      );
    }

    return {
      fleet,
      operatingUnit: fleet.operatingUnit,
      businessEntity: fleet.operatingUnit.businessEntity,
    };
  }

  private async getNextVehicleCodeSerial(
    tenantId: string,
    prefix: string,
    codeKind: 'tenant' | 'system',
  ): Promise<number> {
    const field = codeKind === 'tenant' ? 'tenantVehicleCode' : 'systemVehicleCode';
    const records = await this.prisma.vehicle.findMany({
      where: {
        tenantId,
        [field]: {
          startsWith: `${prefix}-`,
        },
      },
      select: {
        tenantVehicleCode: true,
        systemVehicleCode: true,
      },
    });

    const highest = records.reduce((maxValue, record) => {
      const rawCode = codeKind === 'tenant' ? record.tenantVehicleCode : record.systemVehicleCode;
      if (!rawCode) {
        return maxValue;
      }

      const match = rawCode.match(/-(\d{1,})$/);
      if (!match) {
        return maxValue;
      }

      const serial = Number(match[1]);
      return Number.isFinite(serial) ? Math.max(maxValue, serial) : maxValue;
    }, 0);

    return highest + 1;
  }

  private buildVehicleCodePrefix(name: string): string {
    const tokens = name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (tokens.length === 0) {
      return 'ASSET';
    }

    if (tokens[0] === 'FLEET' && tokens[1]) {
      return ['FLEET', tokens[1]].join('-').slice(0, 16);
    }

    const [firstToken] = tokens;
    return firstToken ? firstToken.slice(0, 16) : 'ASSET';
  }

  private buildSystemVehicleCodePrefix(name: string): string {
    const base = this.buildVehicleCodePrefix(name);
    return `VEH-${base}`.slice(0, 20);
  }

  private formatVehicleCode(prefix: string, serial: number): string {
    return `${prefix}-${String(serial).padStart(4, '0')}`;
  }

  private normalizeTenantVehicleCode(value?: string | null): string | undefined {
    const normalized = value
      ?.trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]+/g, '-');
    return normalized ? normalized.replace(/-+/g, '-').replace(/^-|-$/g, '') : undefined;
  }

  private normalizeOptionalText(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeOptionalPlate(value?: string | null): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const normalized = value.trim().toUpperCase();
    return normalized || null;
  }

  private normalizeOptionalVin(value?: string | null): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const normalized = this.normalizeVin(value);
    return normalized || null;
  }

  private normalizeVin(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  private async assertVehicleUniqueness(input: {
    tenantId: string;
    tenantVehicleCode?: string | undefined;
    plate?: string | null | undefined;
    vin?: string | null | undefined;
  }): Promise<void> {
    if (input.tenantVehicleCode) {
      const existing = await this.prisma.vehicle.findFirst({
        where: {
          tenantId: input.tenantId,
          tenantVehicleCode: input.tenantVehicleCode,
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException(
          `Vehicle code '${input.tenantVehicleCode}' is already in use in this organisation.`,
        );
      }
    }

    if (input.plate) {
      const existing = await this.prisma.vehicle.findFirst({
        where: {
          tenantId: input.tenantId,
          plate: input.plate,
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException(
          `Plate number '${input.plate}' is already linked to another vehicle in this organisation.`,
        );
      }
    }

    if (input.vin) {
      const existing = await this.prisma.vehicle.findFirst({
        where: {
          tenantId: input.tenantId,
          vin: input.vin,
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException(
          `VIN '${input.vin}' is already linked to another vehicle in this organisation.`,
        );
      }
    }
  }

  private assertValuationInputConsistency(
    input: Pick<
      CreateVehicleDto | UpdateVehicleDto,
      | 'acquisitionCostMinorUnits'
      | 'acquisitionDate'
      | 'currentEstimatedValueMinorUnits'
      | 'valuationSource'
    >,
  ): void {
    const hasAcquisitionAmount = input.acquisitionCostMinorUnits !== undefined;
    const hasAcquisitionDate = input.acquisitionDate !== undefined;

    if (hasAcquisitionAmount !== hasAcquisitionDate) {
      throw new BadRequestException(
        'Acquisition cost and acquisition date must be provided together.',
      );
    }
  }

  private async createVehicleValuations(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      vehicleId: string;
      businessEntityCurrency: string | null;
      acquisitionCostMinorUnits?: number | undefined;
      acquisitionDate?: string | undefined;
      currentEstimatedValueMinorUnits?: number | undefined;
      valuationSource?: string | undefined;
    },
  ): Promise<void> {
    const creations: Prisma.VehicleValuationCreateManyInput[] = [];

    if (input.acquisitionCostMinorUnits !== undefined && input.acquisitionDate !== undefined) {
      creations.push({
        tenantId: input.tenantId,
        vehicleId: input.vehicleId,
        valuationKind: 'acquisition',
        amountMinorUnits: input.acquisitionCostMinorUnits,
        currency: input.businessEntityCurrency,
        valuationDate: input.acquisitionDate,
        source: input.valuationSource ?? null,
        isCurrent: true,
      });
    }

    if (input.currentEstimatedValueMinorUnits !== undefined) {
      creations.push({
        tenantId: input.tenantId,
        vehicleId: input.vehicleId,
        valuationKind: 'estimate',
        amountMinorUnits: input.currentEstimatedValueMinorUnits,
        currency: input.businessEntityCurrency,
        valuationDate: this.getTodayIsoDate(),
        source: input.valuationSource ?? null,
        isCurrent: true,
      });
    }

    if (creations.length > 0) {
      await tx.vehicleValuation.createMany({
        data: creations,
      });
    }
  }

  private async updateVehicleValuations(
    tx: Prisma.TransactionClient,
    input: {
      tenantId: string;
      vehicleId: string;
      businessEntityCurrency: string | null;
      acquisitionCostMinorUnits?: number | undefined;
      acquisitionDate?: string | undefined;
      currentEstimatedValueMinorUnits?: number | undefined;
      valuationSource?: string | undefined;
    },
  ): Promise<void> {
    if (input.acquisitionCostMinorUnits !== undefined && input.acquisitionDate !== undefined) {
      const existingAcquisition = await tx.vehicleValuation.findFirst({
        where: {
          vehicleId: input.vehicleId,
          valuationKind: 'acquisition',
          isCurrent: true,
        },
      });

      if (existingAcquisition) {
        await tx.vehicleValuation.update({
          where: { id: existingAcquisition.id },
          data: {
            amountMinorUnits: input.acquisitionCostMinorUnits,
            currency: input.businessEntityCurrency,
            valuationDate: input.acquisitionDate,
            source: input.valuationSource ?? existingAcquisition.source,
          },
        });
      } else {
        await tx.vehicleValuation.create({
          data: {
            tenantId: input.tenantId,
            vehicleId: input.vehicleId,
            valuationKind: 'acquisition',
            amountMinorUnits: input.acquisitionCostMinorUnits,
            currency: input.businessEntityCurrency,
            valuationDate: input.acquisitionDate,
            source: input.valuationSource ?? null,
            isCurrent: true,
          },
        });
      }
    }

    if (input.currentEstimatedValueMinorUnits !== undefined) {
      await tx.vehicleValuation.updateMany({
        where: {
          vehicleId: input.vehicleId,
          valuationKind: 'estimate',
          isCurrent: true,
        },
        data: { isCurrent: false },
      });

      await tx.vehicleValuation.create({
        data: {
          tenantId: input.tenantId,
          vehicleId: input.vehicleId,
          valuationKind: 'estimate',
          amountMinorUnits: input.currentEstimatedValueMinorUnits,
          currency: input.businessEntityCurrency,
          valuationDate: this.getTodayIsoDate(),
          source: input.valuationSource ?? null,
          isCurrent: true,
        },
      });
    }
  }

  private getTodayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private isPrismaUniqueError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private getPrismaErrorTarget(error: Prisma.PrismaClientKnownRequestError): string[] {
    const target = error.meta?.target;
    return Array.isArray(target)
      ? target.map((value) => String(value))
      : typeof target === 'string'
        ? [target]
        : [];
  }
}
