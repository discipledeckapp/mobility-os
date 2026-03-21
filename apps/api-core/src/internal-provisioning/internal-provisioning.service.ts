import { TenantRole } from '@mobility-os/authz-model';
import { getBusinessModel } from '@mobility-os/domain-config';
import { ConflictException, Injectable } from '@nestjs/common';
import { hashPassword } from '../auth/password-utils';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { ProvisionTenantDto } from './dto/provision-tenant.dto';

export interface ProvisionTenantResult {
  tenant: {
    id: string;
    slug: string;
    name: string;
    country: string;
  };
  businessEntity: {
    id: string;
    name: string;
    country: string;
    businessModel: string;
  };
  operatingUnit: {
    id: string;
    name: string;
  };
  fleet: {
    id: string;
    name: string;
    businessModel: string;
  };
  operatorUser: {
    id: string;
    email: string;
    role: string;
    businessEntityId: string;
  };
  operationalWallet: {
    id: string;
    currency: string;
  };
}

@Injectable()
export class InternalProvisioningService {
  constructor(private readonly prisma: PrismaService) {}

  async provisionTenant(dto: ProvisionTenantDto): Promise<ProvisionTenantResult> {
    getBusinessModel(dto.businessModel);

    return this.prisma.$transaction(async (tx) => {
      const existingTenant = await tx.tenant.findUnique({
        where: { slug: dto.tenantSlug },
      });
      if (existingTenant) {
        throw new ConflictException(`Tenant slug '${dto.tenantSlug}' is already in use`);
      }

      const tenant = await tx.tenant.create({
        data: {
          slug: dto.tenantSlug,
          name: dto.tenantName,
          country: dto.tenantCountry,
          status: 'active',
        },
      });

      const businessEntity = await tx.businessEntity.create({
        data: {
          tenantId: tenant.id,
          name: dto.businessEntityName,
          country: dto.tenantCountry,
          businessModel: dto.businessModel,
          status: 'active',
        },
      });

      const operatingUnit = await tx.operatingUnit.create({
        data: {
          tenantId: tenant.id,
          businessEntityId: businessEntity.id,
          name: dto.operatingUnitName ?? `${dto.businessEntityName} Main Unit`,
          status: 'active',
        },
      });

      const fleet = await tx.fleet.create({
        data: {
          tenantId: tenant.id,
          operatingUnitId: operatingUnit.id,
          name: dto.fleetName ?? `${dto.businessEntityName} Main Fleet`,
          businessModel: dto.businessModel,
          status: 'active',
        },
      });

      const operatorUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.operatorEmail.toLowerCase(),
          phone: dto.operatorPhone ?? null,
          name: dto.operatorName,
          role: TenantRole.TenantOwner,
          isActive: true,
          isEmailVerified: true,
          businessEntityId: businessEntity.id,
          passwordHash: hashPassword(dto.operatorPassword),
        },
      });

      const operationalWallet = await tx.operationalWallet.upsert({
        where: { businessEntityId: businessEntity.id },
        create: {
          tenantId: tenant.id,
          businessEntityId: businessEntity.id,
          currency: dto.walletCurrency,
        },
        update: {},
      });

      return {
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          country: tenant.country,
        },
        businessEntity: {
          id: businessEntity.id,
          name: businessEntity.name,
          country: businessEntity.country,
          businessModel: businessEntity.businessModel,
        },
        operatingUnit: {
          id: operatingUnit.id,
          name: operatingUnit.name,
        },
        fleet: {
          id: fleet.id,
          name: fleet.name,
          businessModel: fleet.businessModel,
        },
        operatorUser: {
          id: operatorUser.id,
          email: operatorUser.email,
          role: operatorUser.role,
          businessEntityId: businessEntity.id,
        },
        operationalWallet: {
          id: operationalWallet.id,
          currency: operationalWallet.currency,
        },
      };
    });
  }
}
