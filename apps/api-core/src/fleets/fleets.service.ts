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
    await this.findOne(tenantId, id);

    if (dto.businessModel) {
      getBusinessModel(dto.businessModel);
    }

    if (dto.operatingUnitId) {
      const unit = await this.prisma.operatingUnit.findUnique({
        where: { id: dto.operatingUnitId },
      });

      if (!unit) {
        throw new NotFoundException(`OperatingUnit '${dto.operatingUnitId}' not found`);
      }

      assertTenantOwnership(asTenantId(unit.tenantId), asTenantId(tenantId));
    }

    return this.prisma.fleet.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.operatingUnitId ? { operatingUnitId: dto.operatingUnitId } : {}),
        ...(dto.businessModel ? { businessModel: dto.businessModel } : {}),
        ...(dto.maintenanceScheduleType !== undefined ? { maintenanceScheduleType: dto.maintenanceScheduleType || null } : {}),
        ...(dto.maintenanceIntervalDays !== undefined ? { maintenanceIntervalDays: dto.maintenanceIntervalDays || null } : {}),
        ...(dto.maintenanceIntervalKm !== undefined ? { maintenanceIntervalKm: dto.maintenanceIntervalKm || null } : {}),
      },
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
