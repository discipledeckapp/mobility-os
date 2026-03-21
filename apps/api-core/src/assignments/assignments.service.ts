import { ASSIGNMENT_STATUS_CODES } from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Assignment, Prisma } from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DriversService } from '../drivers/drivers.service';
import type { CreateAssignmentDto } from './dto/create-assignment.dto';

const OPEN_ASSIGNMENT_STATUSES = ['created', 'assigned', 'active'] as const;

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly driversService: DriversService,
  ) {}

  async list(
    tenantId: string,
    filters: {
      driverId?: string;
      vehicleId?: string;
      fleetId?: string;
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
      ...(filters.fleetId ? { fleetId: filters.fleetId } : {}),
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
    dto: CreateAssignmentDto,
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
    dto: CreateAssignmentDto,
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
    const { driver } = await this.loadAssignmentResources(tenantId, dto, ['available']);
    await this.ensureNoOverlappingAssignments(dto);

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
        },
      }),
      this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: 'assigned' },
      }),
    ]);

    return assignment;
  }

  async start(tenantId: string, id: string): Promise<Assignment> {
    const assignment = await this.findOne(tenantId, id);

    if (!['created', 'assigned'].includes(assignment.status)) {
      throw new BadRequestException(
        `Assignment '${id}' cannot be started from status '${assignment.status}'`,
      );
    }

    const dto: CreateAssignmentDto = {
      driverId: assignment.driverId,
      vehicleId: assignment.vehicleId,
      ...(assignment.notes ? { notes: assignment.notes } : {}),
    };

    const { vehicle } = await this.loadAssignmentResources(
      tenantId,
      dto,
      assignment.status === 'created' ? ['available'] : ['available', 'assigned'],
    );

    await this.ensureNoOverlappingAssignments(dto, assignment.id);

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
