import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Tenant } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { InternalTenantOwnerSummaryDto } from './dto/internal-tenant-owner-summary.dto';
import type { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
import { writeOrganisationSettings } from './tenant-settings';

// Tenants are provisioned by api-control-plane, never created here.
// This service provides read-only access scoped to the calling tenant.

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant '${tenantId}' not found`);
    }

    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug '${slug}' not found`);
    }

    return tenant;
  }

  async updateSettings(tenantId: string, dto: UpdateTenantSettingsDto): Promise<Tenant> {
    const tenant = await this.findById(tenantId);
    const metadata = writeOrganisationSettings(
      tenant.metadata,
      {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName.trim() } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl.trim() } : {}),
        ...(dto.defaultLanguage !== undefined ? { defaultLanguage: dto.defaultLanguage } : {}),
        ...(dto.guarantorMaxActiveDrivers !== undefined
          ? { guarantorMaxActiveDrivers: dto.guarantorMaxActiveDrivers }
          : {}),
        ...(dto.autoSendDriverSelfServiceLinkOnCreate !== undefined
          ? { autoSendDriverSelfServiceLinkOnCreate: dto.autoSendDriverSelfServiceLinkOnCreate }
          : {}),
        ...(dto.requireIdentityVerificationForActivation !== undefined
          ? {
              requireIdentityVerificationForActivation:
                dto.requireIdentityVerificationForActivation,
            }
          : {}),
        ...(dto.requireBiometricVerification !== undefined
          ? { requireBiometricVerification: dto.requireBiometricVerification }
          : {}),
        ...(dto.requireGovernmentVerificationLookup !== undefined
          ? {
              requireGovernmentVerificationLookup: dto.requireGovernmentVerificationLookup,
            }
          : {}),
        ...(dto.customDriverDocumentTypes !== undefined
          ? { customDriverDocumentTypes: dto.customDriverDocumentTypes }
          : {}),
        ...(dto.requiredDriverDocumentSlugs !== undefined
          ? { requiredDriverDocumentSlugs: dto.requiredDriverDocumentSlugs }
          : {}),
        ...(dto.requiredVehicleDocumentSlugs !== undefined
          ? { requiredVehicleDocumentSlugs: dto.requiredVehicleDocumentSlugs }
          : {}),
        ...(dto.driverPaysKyc !== undefined ? { driverPaysKyc: dto.driverPaysKyc } : {}),
        ...(dto.requireGuarantor !== undefined ? { requireGuarantor: dto.requireGuarantor } : {}),
        ...(dto.requireGuarantorVerification !== undefined
          ? { requireGuarantorVerification: dto.requireGuarantorVerification }
          : {}),
        ...(dto.allowAdminAssignmentOverride !== undefined
          ? { allowAdminAssignmentOverride: dto.allowAdminAssignmentOverride }
          : {}),
      },
      tenant.country,
    );

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { metadata: metadata as Prisma.InputJsonValue },
    });
  }

  async getOwnerSummary(tenantId: string): Promise<InternalTenantOwnerSummaryDto> {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        OR: [{ role: 'TENANT_OWNER' }, { role: 'TENANT_ADMIN' }, { role: 'ADMIN' }],
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
    });

    const owner =
      users.find((user) => user.role === 'TENANT_OWNER') ??
      users.find((user) => user.role === 'TENANT_ADMIN') ??
      users[0] ??
      null;

    return {
      ownerUserId: owner?.id ?? null,
      ownerName: owner?.name ?? null,
      ownerEmail: owner?.email ?? null,
      ownerPhone: owner?.phone ?? null,
      ownerRole: owner?.role ?? null,
      ownerIsActive: owner?.isActive ?? null,
      adminContacts: users.map((user) => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role,
        isActive: user.isActive,
      })),
    };
  }
}
