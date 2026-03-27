import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LEGAL_DOCUMENT_VERSIONS } from '@mobility-os/domain-config';
import { Cron } from '@nestjs/schedule';
import type { Prisma } from '@prisma/client';
import { readUserSettings } from '../auth/user-settings';
import { PrismaService } from '../database/prisma.service';
import { DocumentStorageService } from '../drivers/document-storage.service';
import { IntelligenceClient } from '../intelligence/intelligence.client';
import type { CreateDataSubjectRequestDto } from './dto/create-data-subject-request.dto';

const OPEN_REVIEW_STATUSES = new Set(['open', 'pending', 'in_review', 'review_required']);

@Injectable()
export class PrivacyService {
  private readonly logger = new Logger(PrivacyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly documentStorageService: DocumentStorageService,
    private readonly intelligenceClient: IntelligenceClient,
  ) {}

  async listDataRequests(userId: string, tenantId: string) {
    return this.prisma.dataSubjectRequest.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDataRequest(userId: string, tenantId: string, dto: CreateDataSubjectRequestDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: {
        id: true,
        email: true,
        driverId: true,
        settings: true,
      },
    });

    if (!user) {
      throw new Error('Authenticated user could not be resolved for privacy request.');
    }

    const userSettings = readUserSettings(user.settings, {
      preferredLanguage: 'en',
      hasLinkedDriver: Boolean(user.driverId),
    });

    let subjectType = 'tenant_user';
    let subjectId: string | null = user.id;
    const metadata: Record<string, unknown> = {
      policyVersions: LEGAL_DOCUMENT_VERSIONS,
      accessMode: userSettings.accessMode,
    };

    if (user.driverId) {
      subjectType = 'driver';
      subjectId = user.driverId;
    } else if (userSettings.selfServiceLinkage?.subjectType === 'guarantor') {
      subjectType = 'guarantor';
      subjectId = null;
      metadata.relatedDriverId = userSettings.selfServiceLinkage.driverId;
    }

    return this.prisma.dataSubjectRequest.create({
      data: {
        tenantId,
        userId,
        subjectType,
        subjectId,
        requestType: dto.requestType,
        contactEmail: user.email,
        details: dto.details?.trim() || null,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
  }

  getSupportContact() {
    return {
      supportEmail: this.configService.get<string>('SUPPORT_EMAIL') ?? 'support@mobiris.ng',
      supportPhonePrimary: this.configService.get<string>('SUPPORT_PHONE_PRIMARY') ?? null,
      supportPhoneSecondary: this.configService.get<string>('SUPPORT_PHONE_SECONDARY') ?? null,
      privacyPolicyVersion: LEGAL_DOCUMENT_VERSIONS.privacy,
      termsVersion: LEGAL_DOCUMENT_VERSIONS.terms,
    };
  }

  @Cron('45 3 * * *')
  async sweepRetiredBiometricAssets(): Promise<void> {
    const retentionDays = this.configService.get<number>('BIOMETRIC_ASSET_RETENTION_DAYS') ?? 180;
    if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
      this.logger.log('Biometric asset retention cleanup is disabled.');
      return;
    }

    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const retiredUrls = new Set<string>();

    const drivers = await this.prisma.driver.findMany({
      where: {
        identityLastVerifiedAt: { lt: cutoff },
        identityReviewCaseId: null,
        OR: [{ selfieImageUrl: { not: null } }, { providerImageUrl: { not: null } }],
      },
      select: {
        id: true,
        selfieImageUrl: true,
        providerImageUrl: true,
      },
    });

    for (const driver of drivers) {
      const selfieRetired = await this.retireBiometricAsset(driver.selfieImageUrl);
      const providerRetired = await this.retireBiometricAsset(driver.providerImageUrl);
      if (!selfieRetired && !providerRetired) {
        continue;
      }

      if (selfieRetired) {
        retiredUrls.add(selfieRetired);
      }
      if (providerRetired) {
        retiredUrls.add(providerRetired);
      }

      await this.prisma.driver.update({
        where: { id: driver.id },
        data: {
          ...(selfieRetired ? { selfieImageUrl: null } : {}),
          ...(providerRetired ? { providerImageUrl: null } : {}),
        },
      });
    }

    const guarantors = await this.prisma.driverGuarantor.findMany({
      where: {
        updatedAt: { lt: cutoff },
        OR: [{ selfieImageUrl: { not: null } }, { providerImageUrl: { not: null } }],
      },
      select: {
        id: true,
        status: true,
        selfieImageUrl: true,
        providerImageUrl: true,
      },
    });

    for (const guarantor of guarantors) {
      if (OPEN_REVIEW_STATUSES.has(guarantor.status)) {
        continue;
      }

      const selfieRetired = await this.retireBiometricAsset(guarantor.selfieImageUrl);
      const providerRetired = await this.retireBiometricAsset(guarantor.providerImageUrl);
      if (!selfieRetired && !providerRetired) {
        continue;
      }

      if (selfieRetired) {
        retiredUrls.add(selfieRetired);
      }
      if (providerRetired) {
        retiredUrls.add(providerRetired);
      }

      await this.prisma.driverGuarantor.update({
        where: { id: guarantor.id },
        data: {
          ...(selfieRetired ? { selfieImageUrl: null } : {}),
          ...(providerRetired ? { providerImageUrl: null } : {}),
        },
      });
    }

    if (retiredUrls.size === 0) {
      return;
    }

    try {
      await this.intelligenceClient.retireBiometricAssetUrls(Array.from(retiredUrls));
    } catch (error) {
      this.logger.warn(
        `Biometric cleanup retired local assets but could not clear intelligence references: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }

    this.logger.log(`Biometric asset cleanup retired ${retiredUrls.size} stored image reference(s).`);
  }

  private async retireBiometricAsset(storageUrl?: string | null): Promise<string | null> {
    if (!storageUrl) {
      return null;
    }

    await this.documentStorageService.deleteByUrl(storageUrl);
    return storageUrl;
  }
}
