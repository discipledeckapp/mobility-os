import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { OperatingUnit } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CreateOperatingUnitDto } from './dto/create-operating-unit.dto';

@Injectable()
export class OperatingUnitsService {
  constructor(private readonly prisma: PrismaService) {}

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
