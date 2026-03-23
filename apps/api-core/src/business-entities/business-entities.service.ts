import { getBusinessModel } from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { BusinessEntity } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CreateBusinessEntityDto } from './dto/create-business-entity.dto';
import type { UpdateBusinessEntityDto } from './dto/update-business-entity.dto';

@Injectable()
export class BusinessEntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string): Promise<BusinessEntity[]> {
    return this.prisma.businessEntity.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<BusinessEntity> {
    const entity = await this.prisma.businessEntity.findUnique({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`BusinessEntity '${id}' not found`);
    }

    // Throws if the record belongs to a different tenant.
    assertTenantOwnership(asTenantId(entity.tenantId), asTenantId(tenantId));

    return entity;
  }

  async create(tenantId: string, dto: CreateBusinessEntityDto): Promise<BusinessEntity> {
    // Validate the business model slug against the domain registry.
    // getBusinessModel() throws if the slug is not registered.
    getBusinessModel(dto.businessModel);

    return this.prisma.businessEntity.create({
      data: {
        tenantId,
        name: dto.name,
        country: dto.country,
        businessModel: dto.businessModel,
        status: dto.status ?? 'active',
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateBusinessEntityDto,
  ): Promise<BusinessEntity> {
    await this.findOne(tenantId, id);

    if (dto.businessModel) {
      getBusinessModel(dto.businessModel);
    }

    return this.prisma.businessEntity.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.country ? { country: dto.country } : {}),
        ...(dto.businessModel ? { businessModel: dto.businessModel } : {}),
      },
    });
  }

  async deactivate(tenantId: string, id: string): Promise<BusinessEntity> {
    const entity = await this.findOne(tenantId, id);

    if (entity.status === 'inactive') {
      throw new ForbiddenException(`BusinessEntity '${id}' is already inactive`);
    }

    return this.prisma.businessEntity.update({
      where: { id },
      data: { status: 'inactive' },
    });
  }
}
