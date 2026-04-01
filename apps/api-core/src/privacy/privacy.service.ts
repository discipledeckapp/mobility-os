import { LEGAL_DOCUMENT_VERSIONS } from '@mobility-os/domain-config';
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import type { Prisma } from '@prisma/client';
import { readUserSettings } from '../auth/user-settings';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { DocumentStorageService } from '../drivers/document-storage.service';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { IntelligenceClient } from '../intelligence/intelligence.client';
import type { CreateDataSubjectRequestDto } from './dto/create-data-subject-request.dto';

const OPEN_REVIEW_STATUSES = new Set(['open', 'pending', 'in_review', 'review_required']);

@Injectable()
export class PrivacyService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(PrivacyService.name);
  private readonly jobs: CronJob[] = [];

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

  async getControlPlaneOversight(input: { tenantId?: string } = {}) {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const requestWhere = input.tenantId ? { tenantId: input.tenantId } : null;

    const [requests, consents] = await Promise.all([
      this.prisma.dataSubjectRequest.findMany({
        ...(requestWhere ? { where: requestWhere } : {}),
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          tenantId: true,
          userId: true,
          subjectType: true,
          subjectId: true,
          requestType: true,
          status: true,
          contactEmail: true,
          details: true,
          resolutionNotes: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.userConsent.findMany({
        where: {
          ...(input.tenantId ? { tenantId: input.tenantId } : {}),
          grantedAt: { gte: last30Days },
        },
        orderBy: { grantedAt: 'desc' },
        take: 100,
        select: {
          id: true,
          tenantId: true,
          userId: true,
          subjectType: true,
          subjectId: true,
          policyDocument: true,
          policyVersion: true,
          consentScope: true,
          granted: true,
          grantedAt: true,
        },
      }),
    ]);

    const requestSummary = new Map<
      string,
      {
        openRequests: number;
        pendingReviewRequests: number;
        closedRequests: number;
        lastRequestAt: Date | null;
      }
    >();
    const consentSummary = new Map<
      string,
      {
        consentEventsLast30Days: number;
        lastConsentAt: Date | null;
      }
    >();

    for (const request of requests) {
      const current = requestSummary.get(request.tenantId) ?? {
        openRequests: 0,
        pendingReviewRequests: 0,
        closedRequests: 0,
        lastRequestAt: null,
      };

      if (request.status === 'open') {
        current.openRequests += 1;
      } else if (OPEN_REVIEW_STATUSES.has(request.status)) {
        current.pendingReviewRequests += 1;
      } else {
        current.closedRequests += 1;
      }

      if (!current.lastRequestAt || request.createdAt > current.lastRequestAt) {
        current.lastRequestAt = request.createdAt;
      }

      requestSummary.set(request.tenantId, current);
    }

    for (const consent of consents) {
      const current = consentSummary.get(consent.tenantId) ?? {
        consentEventsLast30Days: 0,
        lastConsentAt: null,
      };

      current.consentEventsLast30Days += 1;
      if (!current.lastConsentAt || consent.grantedAt > current.lastConsentAt) {
        current.lastConsentAt = consent.grantedAt;
      }
      consentSummary.set(consent.tenantId, current);
    }

    const tenantIds = new Set([...requestSummary.keys(), ...consentSummary.keys()]);

    return {
      generatedAt: now.toISOString(),
      totals: {
        openRequests: requests.filter((request) => request.status === 'open').length,
        pendingReviewRequests: requests.filter((request) =>
          OPEN_REVIEW_STATUSES.has(request.status),
        ).length,
        closedRequests: requests.filter(
          (request) => request.status !== 'open' && !OPEN_REVIEW_STATUSES.has(request.status),
        ).length,
        consentEventsLast30Days: consents.length,
        tenantsWithOpenPrivacyRequests: Array.from(requestSummary.values()).filter(
          (summary) => summary.openRequests > 0 || summary.pendingReviewRequests > 0,
        ).length,
      },
      tenantSummaries: Array.from(tenantIds).map((tenantId) => {
        const request = requestSummary.get(tenantId);
        const consent = consentSummary.get(tenantId);
        return {
          tenantId,
          openRequests: request?.openRequests ?? 0,
          pendingReviewRequests: request?.pendingReviewRequests ?? 0,
          closedRequests: request?.closedRequests ?? 0,
          consentEventsLast30Days: consent?.consentEventsLast30Days ?? 0,
          lastRequestAt: request?.lastRequestAt?.toISOString() ?? null,
          lastConsentAt: consent?.lastConsentAt?.toISOString() ?? null,
        };
      }),
      requests: requests.map((request) => ({
        ...request,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
      })),
      consents: consents.map((consent) => ({
        ...consent,
        grantedAt: consent.grantedAt.toISOString(),
      })),
      support: this.getSupportContact(),
    };
  }

  onApplicationBootstrap(): void {
    if (process.env.DISABLE_SCHEDULER === 'true') {
      this.logger.log('Privacy scheduler disabled by environment flag.');
      return;
    }

    this.jobs.push(
      CronJob.from({
        cronTime: '45 3 * * *',
        onTick: () => void this.sweepRetiredBiometricAssets(),
        start: true,
      }),
    );
  }

  onApplicationShutdown(): void {
    for (const job of this.jobs) {
      job.stop();
    }
    this.jobs.length = 0;
  }

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

    this.logger.log(
      `Biometric asset cleanup retired ${retiredUrls.size} stored image reference(s).`,
    );
  }

  private async retireBiometricAsset(storageUrl?: string | null): Promise<string | null> {
    if (!storageUrl) {
      return null;
    }

    await this.documentStorageService.deleteByUrl(storageUrl);
    return storageUrl;
  }
}
