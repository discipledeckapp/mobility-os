import { getBusinessModel } from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Fleet } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CreateFleetDto } from './dto/create-fleet.dto';
import type { UpdateFleetDto } from './dto/update-fleet.dto';

@Injectable()
export class FleetsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly openAssignmentStatuses = ['created', 'assigned', 'active'] as const;

  private async syncFleetHierarchy(
    prisma: PrismaService,
    fleetId: string,
    hierarchy: { businessEntityId: string; operatingUnitId: string },
  ): Promise<void> {
    const drivers = await prisma.driver.findMany({
      where: { fleetId },
      select: { id: true },
    });
    const driverIds = drivers.map((driver) => driver.id);

    await prisma.driver.updateMany({
      where: { fleetId },
      data: hierarchy,
    });

    await prisma.vehicle.updateMany({
      where: { fleetId },
      data: hierarchy,
    });

    if (driverIds.length > 0) {
      await prisma.user.updateMany({
        where: { driverId: { in: driverIds } },
        data: hierarchy,
      });
    }

    const openAssignments = await prisma.assignment.findMany({
      where: {
        fleetId,
        status: { in: [...this.openAssignmentStatuses] },
      },
      select: { id: true },
    });
    const openAssignmentIds = openAssignments.map((assignment) => assignment.id);

    await prisma.assignment.updateMany({
      where: {
        fleetId,
        status: { in: [...this.openAssignmentStatuses] },
      },
      data: hierarchy,
    });

    if (openAssignmentIds.length > 0) {
      await prisma.remittance.updateMany({
        where: {
          assignmentId: { in: openAssignmentIds },
          status: 'pending',
        },
        data: hierarchy,
      });
    }
  }

  async list(tenantId: string, operatingUnitId?: string): Promise<Fleet[]> {
    return this.prisma.fleet.findMany({
      where: {
        tenantId,
        ...(operatingUnitId ? { operatingUnitId } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Fleet> {
    const fleet = await this.prisma.fleet.findUnique({ where: { id } });

    if (!fleet) {
      throw new NotFoundException(`Fleet '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(fleet.tenantId), asTenantId(tenantId));

    return fleet;
  }

  async create(tenantId: string, dto: CreateFleetDto): Promise<Fleet> {
    // Validate the business model slug.
    getBusinessModel(dto.businessModel);

    // Verify the operating unit exists and belongs to this tenant.
    const unit = await this.prisma.operatingUnit.findUnique({
      where: { id: dto.operatingUnitId },
    });

    if (!unit) {
      throw new NotFoundException(`OperatingUnit '${dto.operatingUnitId}' not found`);
    }

    assertTenantOwnership(asTenantId(unit.tenantId), asTenantId(tenantId));

    return this.prisma.fleet.create({
      data: {
        tenantId,
        operatingUnitId: dto.operatingUnitId,
        name: dto.name,
        businessModel: dto.businessModel,
        status: dto.status ?? 'active',
        ...(dto.maintenanceScheduleType ? { maintenanceScheduleType: dto.maintenanceScheduleType } : {}),
        ...(dto.maintenanceIntervalDays ? { maintenanceIntervalDays: dto.maintenanceIntervalDays } : {}),
        ...(dto.maintenanceIntervalKm ? { maintenanceIntervalKm: dto.maintenanceIntervalKm } : {}),
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateFleetDto): Promise<Fleet> {
    const currentFleet = await this.findOne(tenantId, id);

    if (dto.businessModel) {
      getBusinessModel(dto.businessModel);
    }

    let nextHierarchy:
      | {
          businessEntityId: string;
          operatingUnitId: string;
        }
      | undefined;

    if (dto.operatingUnitId) {
      const unit = await this.prisma.operatingUnit.findUnique({
        where: { id: dto.operatingUnitId },
      });

      if (!unit) {
        throw new NotFoundException(`OperatingUnit '${dto.operatingUnitId}' not found`);
      }

      assertTenantOwnership(asTenantId(unit.tenantId), asTenantId(tenantId));
      nextHierarchy = {
        businessEntityId: unit.businessEntityId,
        operatingUnitId: unit.id,
      };
    }

    return this.prisma.$transaction(async (tx) => {
      const fleet = await tx.fleet.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.operatingUnitId ? { operatingUnitId: dto.operatingUnitId } : {}),
          ...(dto.businessModel ? { businessModel: dto.businessModel } : {}),
          ...(dto.maintenanceScheduleType !== undefined
            ? { maintenanceScheduleType: dto.maintenanceScheduleType || null }
            : {}),
          ...(dto.maintenanceIntervalDays !== undefined
            ? { maintenanceIntervalDays: dto.maintenanceIntervalDays || null }
            : {}),
          ...(dto.maintenanceIntervalKm !== undefined
            ? { maintenanceIntervalKm: dto.maintenanceIntervalKm || null }
            : {}),
        },
      });

      if (
        nextHierarchy &&
        currentFleet.operatingUnitId !== nextHierarchy.operatingUnitId
      ) {
        await this.syncFleetHierarchy(tx as never, id, nextHierarchy);
      }

      return fleet;
    });
  }

  async deactivate(tenantId: string, id: string): Promise<Fleet> {
    const fleet = await this.findOne(tenantId, id);

    if (fleet.status === 'inactive') {
      throw new ForbiddenException(`Fleet '${id}' is already inactive`);
    }

    return this.prisma.fleet.update({
      where: { id },
      data: { status: 'inactive' },
    });
  }
}
