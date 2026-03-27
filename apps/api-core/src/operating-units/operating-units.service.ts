import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { OperatingUnit } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CreateOperatingUnitDto } from './dto/create-operating-unit.dto';
import type { UpdateOperatingUnitDto } from './dto/update-operating-unit.dto';

@Injectable()
export class OperatingUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly openAssignmentStatuses = ['created', 'assigned', 'active'] as const;

  private async syncOperatingUnitHierarchy(
    prisma: PrismaService,
    operatingUnitId: string,
    businessEntityId: string,
  ): Promise<void> {
    const fleets = await prisma.fleet.findMany({
      where: { operatingUnitId },
      select: { id: true },
    });
    const fleetIds = fleets.map((fleet) => fleet.id);

    if (fleetIds.length === 0) {
      return;
    }

    const drivers = await prisma.driver.findMany({
      where: { fleetId: { in: fleetIds } },
      select: { id: true },
    });
    const driverIds = drivers.map((driver) => driver.id);

    await prisma.driver.updateMany({
      where: { fleetId: { in: fleetIds } },
      data: { operatingUnitId, businessEntityId },
    });

    await prisma.vehicle.updateMany({
      where: { fleetId: { in: fleetIds } },
      data: { operatingUnitId, businessEntityId },
    });

    if (driverIds.length > 0) {
      await prisma.user.updateMany({
        where: { driverId: { in: driverIds } },
        data: { operatingUnitId, businessEntityId },
      });
    }

    const openAssignments = await prisma.assignment.findMany({
      where: {
        fleetId: { in: fleetIds },
        status: { in: [...this.openAssignmentStatuses] },
      },
      select: { id: true },
    });
    const openAssignmentIds = openAssignments.map((assignment) => assignment.id);

    await prisma.assignment.updateMany({
      where: {
        fleetId: { in: fleetIds },
        status: { in: [...this.openAssignmentStatuses] },
      },
      data: { operatingUnitId, businessEntityId },
    });

    if (openAssignmentIds.length > 0) {
      await prisma.remittance.updateMany({
        where: {
          assignmentId: { in: openAssignmentIds },
          status: 'pending',
        },
        data: { operatingUnitId, businessEntityId },
      });
    }
  }

  async list(tenantId: string, businessEntityId?: string): Promise<OperatingUnit[]> {
    return this.prisma.operatingUnit.findMany({
      where: {
        tenantId,
        ...(businessEntityId ? { businessEntityId } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<OperatingUnit> {
    const unit = await this.prisma.operatingUnit.findUnique({ where: { id } });

    if (!unit) {
      throw new NotFoundException(`OperatingUnit '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(unit.tenantId), asTenantId(tenantId));

    return unit;
  }

  async create(tenantId: string, dto: CreateOperatingUnitDto): Promise<OperatingUnit> {
    // Verify the businessEntity exists and belongs to this tenant.
    const entity = await this.prisma.businessEntity.findUnique({
      where: { id: dto.businessEntityId },
    });

    if (!entity) {
      throw new NotFoundException(`BusinessEntity '${dto.businessEntityId}' not found`);
    }

    assertTenantOwnership(asTenantId(entity.tenantId), asTenantId(tenantId));

    return this.prisma.operatingUnit.create({
      data: {
        tenantId,
        businessEntityId: dto.businessEntityId,
        name: dto.name,
        status: dto.status ?? 'active',
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateOperatingUnitDto,
  ): Promise<OperatingUnit> {
    const currentUnit = await this.findOne(tenantId, id);

    let nextBusinessEntityId = currentUnit.businessEntityId;

    if (dto.businessEntityId) {
      const entity = await this.prisma.businessEntity.findUnique({
        where: { id: dto.businessEntityId },
      });

      if (!entity) {
        throw new NotFoundException(`BusinessEntity '${dto.businessEntityId}' not found`);
      }

      assertTenantOwnership(asTenantId(entity.tenantId), asTenantId(tenantId));
      nextBusinessEntityId = entity.id;
    }

    return this.prisma.$transaction(async (tx) => {
      const unit = await tx.operatingUnit.update({
        where: { id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.businessEntityId ? { businessEntityId: dto.businessEntityId } : {}),
        },
      });

      if (nextBusinessEntityId !== currentUnit.businessEntityId) {
        await this.syncOperatingUnitHierarchy(tx as never, id, nextBusinessEntityId);
      }

      return unit;
    });
  }

  async deactivate(tenantId: string, id: string): Promise<OperatingUnit> {
    const unit = await this.findOne(tenantId, id);

    if (unit.status === 'inactive') {
      throw new ForbiddenException(`OperatingUnit '${id}' is already inactive`);
    }

    return this.prisma.operatingUnit.update({
      where: { id },
      data: { status: 'inactive' },
    });
  }
}
