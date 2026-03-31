import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Tenant } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { InternalTenantOwnerSummaryDto } from './dto/internal-tenant-owner-summary.dto';
import type { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
import {
  compareVerificationTiers,
  type VerificationTier,
  writeOrganisationSettings,
  readOrganisationSettings,
} from './tenant-settings';

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
    const currentSettings = readOrganisationSettings(tenant.metadata, tenant.country);
    const currentTier = currentSettings.operations.verificationTier;
    const nextTier = dto.verificationTier ?? currentTier;
    const isTierUpgrade = compareVerificationTiers(nextTier, currentTier) > 0;
    const rolloutScope = dto.verificationTierRolloutScope;
    const rolloutChangedAt = isTierUpgrade ? new Date().toISOString() : null;

    if (isTierUpgrade && !rolloutScope) {
      throw new BadRequestException(
        'Choose whether the stronger verification tier applies to new verification journeys only or to both existing and new drivers.',
      );
    }

    if (isTierUpgrade) {
      if (rolloutScope === 'new_only') {
        await this.grandfatherExistingVerificationJourneys(
          tenantId,
          currentTier,
          nextTier,
          new Date(rolloutChangedAt as string),
        );
      } else {
        await this.requireReverificationForExistingDrivers(
          tenantId,
          currentTier,
          nextTier,
          new Date(rolloutChangedAt as string),
        );
      }
    }

    const metadata = writeOrganisationSettings(
      tenant.metadata,
      {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName.trim() } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl.trim() } : {}),
        ...(dto.defaultLanguage !== undefined ? { defaultLanguage: dto.defaultLanguage } : {}),
        ...(dto.verificationTier !== undefined
          ? { verificationTier: dto.verificationTier }
          : {}),
        ...(isTierUpgrade && rolloutScope
          ? {
              verificationTierRolloutScope: rolloutScope,
              verificationTierRolloutChangedAt: rolloutChangedAt,
            }
          : {}),
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
        ...(dto.guarantorBlocking !== undefined ? { guarantorBlocking: dto.guarantorBlocking } : {}),
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

  private normalizeVerificationTierOverride(tier?: string | null): VerificationTier | null {
    if (
      tier === 'BASIC_IDENTITY' ||
      tier === 'VERIFIED_IDENTITY' ||
      tier === 'FULL_TRUST_VERIFICATION'
    ) {
      return tier;
    }
    return null;
  }

  private async findDriversEligibleForVerificationTransition(tenantId: string, effectiveAt: Date) {
    const [verifiedDrivers, invitedOtps] = await Promise.all([
      this.prisma.driver.findMany({
        where: {
          tenantId,
          archivedAt: null,
          identityLastVerifiedAt: { lte: effectiveAt },
        },
        select: {
          id: true,
          verificationTierOverride: true,
          identityStatus: true,
        },
      }),
      this.prisma.selfServiceOtp.findMany({
        where: {
          tenantId,
          subjectType: 'driver',
          createdAt: { lte: effectiveAt },
        },
        distinct: ['subjectId'],
        select: { subjectId: true },
      }),
    ]);

    const eligibleIds = new Set<string>(verifiedDrivers.map((driver) => driver.id));
    for (const otp of invitedOtps) {
      eligibleIds.add(otp.subjectId);
    }

    if (eligibleIds.size === 0) {
      return [];
    }

    return this.prisma.driver.findMany({
      where: {
        tenantId,
        archivedAt: null,
        id: { in: Array.from(eligibleIds) },
      },
      select: {
        id: true,
        verificationTierOverride: true,
        identityStatus: true,
      },
    });
  }

  private async grandfatherExistingVerificationJourneys(
    tenantId: string,
    previousTier: VerificationTier,
    nextTier: VerificationTier,
    effectiveAt: Date,
  ): Promise<void> {
    const drivers = await this.findDriversEligibleForVerificationTransition(tenantId, effectiveAt);

    for (const driver of drivers) {
      const driverTier =
        this.normalizeVerificationTierOverride(driver.verificationTierOverride) ?? previousTier;
      if (compareVerificationTiers(driverTier, nextTier) >= 0) {
        continue;
      }
      if (this.normalizeVerificationTierOverride(driver.verificationTierOverride) === previousTier) {
        continue;
      }
      await this.prisma.driver.update({
        where: { id: driver.id },
        data: { verificationTierOverride: previousTier },
      });
    }
  }

  private async requireReverificationForExistingDrivers(
    tenantId: string,
    previousTier: VerificationTier,
    nextTier: VerificationTier,
    effectiveAt: Date,
  ): Promise<void> {
    const drivers = await this.findDriversEligibleForVerificationTransition(tenantId, effectiveAt);

    for (const driver of drivers) {
      const driverTier =
        this.normalizeVerificationTierOverride(driver.verificationTierOverride) ?? previousTier;
      if (compareVerificationTiers(driverTier, nextTier) >= 0) {
        continue;
      }

      await this.prisma.driver.update({
        where: { id: driver.id },
        data: {
          verificationTierOverride: null,
          identityStatus: 'unverified',
          identityReviewCaseId: null,
          identityReviewStatus: null,
          identityLastDecision: null,
          identityVerificationConfidence: null,
          identityLastVerifiedAt: null,
          identityLivenessPassed: null,
          identityLivenessProvider: null,
          identityLivenessConfidence: null,
          identityLivenessReason: null,
          kycPaymentReference: null,
          kycPaymentVerifiedAt: null,
          adminAssignmentOverride: false,
          adminAssignmentOverrideRequestedAt: null,
          adminAssignmentOverrideRequestedBy: null,
          adminAssignmentOverrideReason: null,
          adminAssignmentOverrideEvidence: Prisma.JsonNull,
          adminAssignmentOverrideOtpHash: null,
          adminAssignmentOverrideOtpExpiresAt: null,
          adminAssignmentOverrideConfirmedAt: null,
          adminAssignmentOverrideConfirmedBy: null,
        },
      });
    }
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
