import {
  ASSIGNMENT_STATUS_CODES,
  getCountryConfig,
  isCountrySupported,
  normalizeRemittanceFrequency,
  toIsoDate,
} from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Assignment, Prisma } from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DriversService } from '../drivers/drivers.service';
import type { CreateAssignmentDto } from './dto/create-assignment.dto';
import type { UpdateAssignmentRemittancePlanDto } from './dto/update-assignment-remittance-plan.dto';

const OPEN_ASSIGNMENT_STATUSES = ['created', 'assigned', 'active'] as const;
type AssignmentResourceInput = {
  driverId: string;
  vehicleId: string;
  fleetId?: string;
};

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly driversService: DriversService,
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

  private normalizeRemittancePlan(
    tenantCurrency: string,
    input: {
      remittanceAmountMinorUnits?: number | null;
      remittanceModel?: string | null;
      remittanceFrequency?: string | null;
      remittanceCurrency?: string | null;
      remittanceStartDate?: string | null;
      remittanceCollectionDay?: number | null;
    },
  ) {
    const remittanceModel =
      input.remittanceModel?.trim().toLowerCase() === 'hire_purchase' ? 'hire_purchase' : 'fixed';
    const remittanceFrequency = normalizeRemittanceFrequency(input.remittanceFrequency ?? 'daily');
    if (!remittanceFrequency) {
      throw new BadRequestException('remittanceFrequency must be daily or weekly.');
    }

    if (!input.remittanceAmountMinorUnits || input.remittanceAmountMinorUnits < 1) {
      throw new BadRequestException('remittanceAmountMinorUnits must be greater than 0.');
    }

    const remittanceCurrency = (input.remittanceCurrency ?? tenantCurrency).trim().toUpperCase();
    if (remittanceCurrency !== tenantCurrency.toUpperCase()) {
      throw new BadRequestException(
        `Assignment remittance currency must be '${tenantCurrency}' for this organisation.`,
      );
    }

    if (remittanceFrequency === 'weekly') {
      if (
        !input.remittanceCollectionDay ||
        input.remittanceCollectionDay < 1 ||
        input.remittanceCollectionDay > 7
      ) {
        throw new BadRequestException(
          'Weekly remittance plans require remittanceCollectionDay between 1 and 7.',
        );
      }
    }

    return {
      remittanceModel,
      remittanceFrequency,
      remittanceAmountMinorUnits: input.remittanceAmountMinorUnits,
      remittanceCurrency,
      remittanceStartDate: input.remittanceStartDate ?? toIsoDate(new Date()),
      remittanceCollectionDay:
        remittanceFrequency === 'weekly' ? input.remittanceCollectionDay ?? null : null,
    };
  }

  async list(
    tenantId: string,
    filters: {
      driverId?: string;
      vehicleId?: string;
      fleetId?: string;
      fleetIds?: string[];
      page?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedResponse<Assignment>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const where = {
      tenantId,
      ...(filters.driverId ? { driverId: filters.driverId } : {}),
      ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
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
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(tenantId: string, id: string): Promise<Assignment> {
    const assignment = await this.prisma.assignment.findUnique({ where: { id } });

    if (!assignment) {
      throw new NotFoundException(`Assignment '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(assignment.tenantId), asTenantId(tenantId));

    return assignment;
  }

  private async loadAssignmentResources(
    tenantId: string,
    dto: AssignmentResourceInput,
    allowedVehicleStatuses: string[] = ['available'],
  ) {
    const [driver, vehicle] = await Promise.all([
      this.prisma.driver.findUnique({ where: { id: dto.driverId } }),
      this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } }),
    ]);

    if (!driver) {
      throw new NotFoundException(`Driver '${dto.driverId}' not found`);
    }
    if (!vehicle) {
      throw new NotFoundException(`Vehicle '${dto.vehicleId}' not found`);
    }

    assertTenantOwnership(asTenantId(driver.tenantId), asTenantId(tenantId));
    assertTenantOwnership(asTenantId(vehicle.tenantId), asTenantId(tenantId));

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

    if (driver.status !== 'active') {
      throw new BadRequestException(
        `Driver '${dto.driverId}' must be active to create an assignment (current: '${driver.status}')`,
      );
    }

    if (!(await this.driversService.hasApprovedLicence(tenantId, driver.id))) {
      throw new BadRequestException(
        'This driver cannot be assigned yet because no approved driver licence is on file.',
      );
    }

    if (!allowedVehicleStatuses.includes(vehicle.status)) {
      throw new BadRequestException(
        `Vehicle '${dto.vehicleId}' must be one of [${allowedVehicleStatuses.join(', ')}] ` +
          `for this assignment transition (current: '${vehicle.status}')`,
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

  async create(tenantId: string, dto: CreateAssignmentDto): Promise<Assignment> {
    const tenantCurrency = await this.resolveTenantCurrency(tenantId);
    const { driver } = await this.loadAssignmentResources(tenantId, dto, ['available']);
    await this.ensureNoOverlappingAssignments(dto);
    const remittancePlan = this.normalizeRemittancePlan(tenantCurrency, dto);

    const [assignment] = await this.prisma.$transaction([
      this.prisma.assignment.create({
        data: {
          tenantId,
          fleetId: driver.fleetId,
          operatingUnitId: driver.operatingUnitId,
          businessEntityId: driver.businessEntityId,
          driverId: dto.driverId,
          vehicleId: dto.vehicleId,
          status: 'assigned',
          notes: dto.notes ?? null,
          ...remittancePlan,
        },
      }),
      this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: 'assigned' },
      }),
    ]);

    return assignment;
  }

  async updateRemittancePlan(
    tenantId: string,
    id: string,
    dto: UpdateAssignmentRemittancePlanDto,
  ): Promise<Assignment> {
    const assignment = await this.findOne(tenantId, id);
    const tenantCurrency = await this.resolveTenantCurrency(tenantId);

    const nextPlan = this.normalizeRemittancePlan(tenantCurrency, {
      remittanceAmountMinorUnits:
        dto.remittanceAmountMinorUnits ?? assignment.remittanceAmountMinorUnits,
      remittanceFrequency: dto.remittanceFrequency ?? assignment.remittanceFrequency,
      remittanceCurrency: dto.remittanceCurrency ?? assignment.remittanceCurrency,
      remittanceStartDate: dto.remittanceStartDate ?? assignment.remittanceStartDate,
      remittanceCollectionDay:
        dto.remittanceCollectionDay ?? assignment.remittanceCollectionDay,
    });

    return this.prisma.assignment.update({
      where: { id },
      data: nextPlan,
    });
  }

  async start(tenantId: string, id: string): Promise<Assignment> {
    const assignment = await this.findOne(tenantId, id);

    if (!['created', 'assigned'].includes(assignment.status)) {
      throw new BadRequestException(
        `Assignment '${id}' cannot be started from status '${assignment.status}'`,
      );
    }

    const assignmentRef: AssignmentResourceInput = {
      driverId: assignment.driverId,
      vehicleId: assignment.vehicleId,
    };

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
          startedAt: new Date(),
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
    return updated as Assignment;
  }

  async end(
    tenantId: string,
    id: string,
    resolution: 'completed' | 'cancelled',
    notes?: string,
  ): Promise<Assignment> {
    const assignment = await this.findOne(tenantId, id);

    const currentConfig =
      ASSIGNMENT_STATUS_CODES[assignment.status as keyof typeof ASSIGNMENT_STATUS_CODES];
    if (currentConfig?.terminal) {
      throw new BadRequestException(
        `Assignment '${id}' is already in terminal status '${assignment.status}'`,
      );
    }

    if (resolution === 'completed' && assignment.status !== 'active') {
      throw new BadRequestException(`Assignment '${id}' must be active before it can be completed`);
    }

    // End the assignment and free the vehicle atomically.
    const [updated] = await this.prisma.$transaction([
      this.prisma.assignment.update({
        where: { id },
        data: { status: resolution, endedAt: new Date(), notes: notes ?? assignment.notes },
      }),
      this.prisma.vehicle.update({
        where: { id: assignment.vehicleId },
        data: { status: 'available' },
      }),
    ]);

    return updated;
  }
}
