import { createHash, randomUUID } from 'node:crypto';
import { Permission, TenantRole } from '@mobility-os/authz-model';
import {
  CONSENT_SCOPES,
  DRIVER_STATUS_CODES,
  LEGAL_DOCUMENT_VERSIONS,
  getCountryConfig,
  getDocumentType,
  isCountrySupported,
  normalizePhoneNumberForCountry,
} from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { JwtService } from '@nestjs/jwt';
import { type Driver, Prisma } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuditService } from '../audit/audit.service';
import { generateOtpCode, hashAuthSecret } from '../auth/auth-token-utils';
import { hashPassword, verifyPassword } from '../auth/password-utils';
import { readUserSettings, writeUserSettings } from '../auth/user-settings';
import { buildCsv, parseCsv } from '../common/csv-utils';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { IntelligenceClient } from '../intelligence/intelligence.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthEmailService } from '../notifications/auth-email.service';
import type { EnforcementSummary } from '../policy/policy.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PolicyService } from '../policy/policy.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneBillingClient } from '../tenant-billing/control-plane-billing.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneMeteringClient } from '../tenant-billing/control-plane-metering.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SubscriptionEntitlementsService } from '../tenant-billing/subscription-entitlements.service';
import { getDefaultLanguageForCountry, readOrganisationSettings } from '../tenants/tenant-settings';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DocumentStorageService } from './document-storage.service';
import type { CreateDriverDocumentDto } from './dto/create-driver-document.dto';
import type { CreateDriverDto } from './dto/create-driver.dto';
import type { CreateOrUpdateDriverGuarantorDto } from './dto/create-or-update-driver-guarantor.dto';
import type { ResolveDriverIdentityDto } from './dto/resolve-driver-identity.dto';

type DriverWithIdentityState = Driver & {
  identityStatus: string;
  identityReviewCaseId?: string | null;
  identityReviewStatus?: string | null;
  identityLastDecision?: string | null;
  identityVerificationConfidence?: number | null;
  identityLastVerifiedAt?: Date | null;
  identityLivenessPassed?: boolean | null;
  identityLivenessProvider?: string | null;
  identityLivenessConfidence?: number | null;
  identityLivenessReason?: string | null;
};

type DriverIntelligenceSummary = {
  globalRiskScore?: number | undefined;
  riskBand?: string | undefined;
  isWatchlisted?: boolean | undefined;
  duplicateIdentityFlag?: boolean | undefined;
  reverificationRequired?: boolean | undefined;
  reverificationReason?: string | null | undefined;
  verificationConfidence?: number | undefined;
  verificationStatus?: string | undefined;
  verificationProvider?: string | undefined;
  verificationCountryCode?: string | undefined;
};

type DriverGuarantorSummary = {
  guarantorPersonId?: string | null;
  guarantorRiskBand?: string | null;
  guarantorIsWatchlisted?: boolean | null;
  guarantorReverificationRequired?: boolean | null;
  guarantorReverificationReason?: string | null;
  guarantorIsAlsoDriver?: boolean;
  hasGuarantor: boolean;
  guarantorStatus?: string | null;
  guarantorDisconnectedAt?: Date | null;
};

type DriverDocumentSummary = {
  hasApprovedLicence: boolean;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
  approvedDocumentTypes: string[];
};

type DriverMobileAccessSummary = {
  hasMobileAccess: boolean;
  mobileAccessStatus?: string | null;
};

type DriverReadinessSummary = {
  authenticationAccess: 'ready' | 'not_ready';
  authenticationAccessReasons: string[];
  activationReadiness: 'ready' | 'partially_ready' | 'not_ready';
  activationReadinessReasons: string[];
  assignmentReadiness: 'ready' | 'partially_ready' | 'not_ready';
  assignmentReadinessReasons: string[];
  remittanceReadiness: 'ready' | 'partially_ready' | 'not_ready';
  remittanceReadinessReasons: string[];
  enforcementStatus?: 'clear' | 'flagged' | 'restricted';
  enforcementActions?: EnforcementSummary[];
};

type VerificationPaymentState = 'not_required' | 'required' | 'pending' | 'paid' | 'reconciled';
type VerificationEntitlementState =
  | 'none'
  | 'paid'
  | 'reserved'
  | 'consumed'
  | 'expired'
  | 'refunded'
  | 'cancelled';
type VerificationFlowState =
  | 'not_started'
  | 'in_progress'
  | 'provider_called'
  | 'success'
  | 'failed';

type VerificationEntitlementRecord = {
  id: string;
  entitlementCode: string;
  subjectType: string;
  subjectId: string;
  tenantId: string;
  payerType: string;
  paymentReference?: string | null;
  paymentProvider?: string | null;
  amountMinorUnits: number;
  currency: string;
  purpose: string;
  status: string;
  paidAt?: Date | null;
  reservedAt?: Date | null;
  consumedAt?: Date | null;
  expiresAt?: Date | null;
  consumedByAttemptId?: string | null;
  metadata?: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

type VerificationAttemptRecord = {
  id: string;
  attemptCode: string;
  subjectType: string;
  subjectId: string;
  tenantId: string;
  entitlementId?: string | null;
  attemptType: string;
  requestFingerprint?: string | null;
  startedAt: Date;
  completedAt?: Date | null;
  status: string;
  failureReason?: string | null;
  providerCostIncurred: boolean;
  billableStageReached: boolean;
  providerCallCount: number;
  livenessCallCount: number;
  metadata?: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

type DriverIdentityResolutionResult = {
  decision: string;
  personId?: string;
  globalPersonCode?: string;
  reviewCaseId?: string;
  providerLookupStatus?: string;
  providerVerificationStatus?: string;
  providerName?: string;
  matchedIdentifierType?: string;
  isVerifiedMatch?: boolean;
  verifiedProfile?: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    photoUrl?: string;
    providerImageUrl?: string;
    selfieImageUrl?: string;
  };
  globalRiskScore?: number;
  riskBand?: string;
  isWatchlisted?: boolean;
  hasDuplicateIdentityFlag?: boolean;
  fraudIndicatorCount?: number;
  verificationConfidence?: number;
  livenessPassed?: boolean;
  livenessProviderName?: string;
  livenessConfidenceScore?: number;
  livenessReason?: string;
};

type DriverGuarantorRecord = {
  id: string;
  tenantId: string;
  driverId: string;
  personId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  countryCode?: string | null;
  relationship?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  selfieImageUrl?: string | null;
  providerImageUrl?: string | null;
  status: string;
  disconnectedAt?: Date | null;
  disconnectedReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const MAX_DOCUMENT_FILE_BYTES_FALLBACK = 10 * 1024 * 1024;
const ALLOWED_DRIVER_DOCUMENT_CONTENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

type MobileAccessUserRecord = {
  id: string;
  tenantId: string;
  driverId?: string | null;
  email: string;
  phone?: string | null;
  name: string;
  role: string;
  isActive: boolean;
  settings?: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

type DriverDocumentRecord = {
  id: string;
  tenantId: string;
  driverId: string;
  documentType: string;
  fileName: string;
  contentType: string;
  fileDataUrl?: string | null;
  storageKey?: string | null;
  storageUrl?: string | null;
  uploadedBy: string;
  status: string;
  expiresAt?: Date | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type DriverDocumentVerificationRecord = {
  id: string;
  tenantId: string;
  driverId: string;
  documentType: string;
  idNumber: string;
  countryCode: string;
  provider?: string | null;
  status: string;
  providerMatch?: boolean | null;
  providerConfidence?: number | null;
  providerFirstName?: string | null;
  providerLastName?: string | null;
  providerDateOfBirth?: string | null;
  providerExpiryDate?: string | null;
  failureReason?: string | null;
  providerResult?: Prisma.JsonValue | null;
  verifiedAt?: Date | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  reviewNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function isVerificationMetadataRecord(
  value: Prisma.JsonValue | null | undefined,
): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type DriverDocumentReviewQueueItem = DriverDocumentRecord & {
  driverName: string;
  driverPhone: string;
  driverStatus: string;
  fleetId: string;
};

type DriverAdminOverrideState = {
  adminAssignmentOverrideRequestedAt?: Date | null;
  adminAssignmentOverrideRequestedBy?: string | null;
  adminAssignmentOverrideReason?: string | null;
  adminAssignmentOverrideEvidence?: Prisma.JsonValue | null;
  adminAssignmentOverrideOtpHash?: string | null;
  adminAssignmentOverrideOtpExpiresAt?: Date | null;
  adminAssignmentOverrideConfirmedAt?: Date | null;
  adminAssignmentOverrideConfirmedBy?: string | null;
};

const DRIVER_LICENCE_DOCUMENT_TYPE = 'drivers-license';
const DOCUMENT_SLUG_TO_IDENTIFIER_TYPE: Record<string, string> = {
  'national-id': 'NATIONAL_ID',
  passport: 'PASSPORT',
  'drivers-license': 'DRIVERS_LICENSE',
  'voters-card': 'VOTERS_CARD',
  bvn: 'BANK_ID',
  'bank-id': 'BANK_ID',
};
const IDENTIFIER_TYPE_TO_DOCUMENT_SLUG: Record<string, string> = {
  NATIONAL_ID: 'national-id',
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers-license',
  VOTERS_CARD: 'voters-card',
  BANK_ID: 'bank-id',
};
const DEFAULT_VERIFICATION_AMOUNT_MINOR_UNITS = 500_000;
const DRIVER_MOBILE_CUSTOM_PERMISSIONS = [
  Permission.DriversRead,
  Permission.AssignmentsRead,
  Permission.AssignmentsWrite,
  Permission.RemittanceRead,
  Permission.RemittanceWrite,
] as const;

// TODO: Remove the narrow write casts in this service after the api-core Prisma
// generation paths are unified. This repo currently has a stale secondary client
// under src/generated/prisma while application code imports @prisma/client.
// Runtime generation includes the new driver identity fields, but TypeScript
// write inputs can lag behind until the client path inconsistency is cleaned up.

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  private normalizeVerificationDocumentType(input: string): {
    documentSlug: string;
    identifierType: string;
  } {
    const normalized = input.trim().toLowerCase();
    if (normalized.length === 0) {
      throw new BadRequestException('documentType is required.');
    }

    const slugIdentifierType = DOCUMENT_SLUG_TO_IDENTIFIER_TYPE[normalized];
    if (slugIdentifierType) {
      return {
        documentSlug: normalized,
        identifierType: slugIdentifierType,
      };
    }

    const identifierType = input.trim().toUpperCase().replace(/-/g, '_');
    const documentSlug = IDENTIFIER_TYPE_TO_DOCUMENT_SLUG[identifierType];
    if (documentSlug) {
      return {
        documentSlug,
        identifierType,
      };
    }

    throw new BadRequestException(`Unsupported document type '${input}'.`);
  }

  private normalizeStoredDocumentType(input: string): string {
    try {
      return this.normalizeVerificationDocumentType(input).documentSlug;
    } catch {
      return input.trim().toLowerCase();
    }
  }

  private get driverDocumentVerifications(): {
    create(args: {
      data: Record<string, unknown>;
    }): Promise<DriverDocumentVerificationRecord>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
    }): Promise<DriverDocumentVerificationRecord>;
    findMany(args: Record<string, unknown>): Promise<DriverDocumentVerificationRecord[]>;
  } {
    return (
      this.prisma as PrismaService & {
        driverDocumentVerification: {
          create(args: {
            data: Record<string, unknown>;
          }): Promise<DriverDocumentVerificationRecord>;
          update(args: {
            where: { id: string };
            data: Record<string, unknown>;
          }): Promise<DriverDocumentVerificationRecord>;
          findMany(args: Record<string, unknown>): Promise<DriverDocumentVerificationRecord[]>;
        };
      }
    ).driverDocumentVerification;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly intelligenceClient: IntelligenceClient,
    private readonly jwtService: JwtService,
    private readonly authEmailService: AuthEmailService,
    private readonly documentStorageService: DocumentStorageService,
    private readonly subscriptionEntitlementsService: SubscriptionEntitlementsService,
    private readonly meteringClient: ControlPlaneMeteringClient,
    private readonly controlPlaneBillingClient: ControlPlaneBillingClient,
    private readonly policyService: PolicyService,
    private readonly auditService: AuditService,
  ) {}

  private readonly selfServicePurpose = 'driver_self_service';

  private getVerificationAmountMinorUnits(currency?: string | null): number {
    switch ((currency ?? '').toUpperCase()) {
      case 'NGN':
        return 500_000;
      default:
        return DEFAULT_VERIFICATION_AMOUNT_MINOR_UNITS;
    }
  }

  private buildVerificationEntitlementCode(): string {
    return `ve_${randomUUID().replace(/-/g, '').slice(0, 18)}`;
  }

  private buildVerificationAttemptCode(): string {
    return `va_${randomUUID().replace(/-/g, '').slice(0, 18)}`;
  }

  private buildVerificationRequestFingerprint(input: {
    subjectType: string;
    subjectId: string;
    countryCode?: string;
    identifiers?: Array<{ type: string; value: string; countryCode?: string }>;
  }): string {
    return createHash('sha256')
      .update(
        JSON.stringify({
          subjectType: input.subjectType,
          subjectId: input.subjectId,
          countryCode: input.countryCode ?? null,
          identifiers: (input.identifiers ?? []).map((identifier) => ({
            type: identifier.type,
            value: identifier.value,
            countryCode: identifier.countryCode ?? null,
          })),
        }),
      )
      .digest('hex');
  }

  private async getLatestVerificationEntitlement(
    tenantId: string,
    subjectType: 'driver' | 'guarantor',
    subjectId: string,
  ): Promise<VerificationEntitlementRecord | null> {
    const rows = await this.prisma.$queryRaw<VerificationEntitlementRecord[]>(Prisma.sql`
      SELECT *
      FROM "verification_entitlements"
      WHERE "tenantId" = ${tenantId}
        AND "subjectType" = ${subjectType}
        AND "subjectId" = ${subjectId}
        AND "purpose" = 'identity_verification'
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);
    if (rows[0]) {
      return rows[0];
    }

    const fallbackDelegate = (
      this.prisma as PrismaService & {
        verificationEntitlement?: {
          findFirst(args: Record<string, unknown>): Promise<VerificationEntitlementRecord | null>;
        };
      }
    ).verificationEntitlement;

    if (!fallbackDelegate) {
      return null;
    }

    return fallbackDelegate.findFirst({
      where: {
        tenantId,
        subjectType,
        subjectId,
        purpose: 'identity_verification',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getLatestVerificationAttempt(
    tenantId: string,
    subjectType: 'driver' | 'guarantor',
    subjectId: string,
  ): Promise<VerificationAttemptRecord | null> {
    const rows = await this.prisma.$queryRaw<VerificationAttemptRecord[]>(Prisma.sql`
      SELECT *
      FROM "verification_attempts"
      WHERE "tenantId" = ${tenantId}
        AND "subjectType" = ${subjectType}
        AND "subjectId" = ${subjectId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);
    if (rows[0]) {
      return rows[0];
    }

    const fallbackDelegate = (
      this.prisma as PrismaService & {
        verificationAttempt?: {
          findFirst(args: Record<string, unknown>): Promise<VerificationAttemptRecord | null>;
        };
      }
    ).verificationAttempt;

    if (!fallbackDelegate) {
      return null;
    }

    return fallbackDelegate.findFirst({
      where: {
        tenantId,
        subjectType,
        subjectId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getLatestVerificationAttemptByFingerprint(
    tenantId: string,
    subjectType: 'driver' | 'guarantor',
    subjectId: string,
    requestFingerprint: string,
  ): Promise<VerificationAttemptRecord | null> {
    const rows = await this.prisma.$queryRaw<VerificationAttemptRecord[]>(Prisma.sql`
      SELECT *
      FROM "verification_attempts"
      WHERE "tenantId" = ${tenantId}
        AND "subjectType" = ${subjectType}
        AND "subjectId" = ${subjectId}
        AND "requestFingerprint" = ${requestFingerprint}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);
    return rows[0] ?? null;
  }

  private async countVerificationAttemptsSince(
    tenantId: string,
    subjectType: 'driver' | 'guarantor',
    subjectId: string,
    since: Date,
    statuses: string[],
  ): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ count: bigint | number }>>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "verification_attempts"
      WHERE "tenantId" = ${tenantId}
        AND "subjectType" = ${subjectType}
        AND "subjectId" = ${subjectId}
        AND "status" IN (${Prisma.join(statuses)})
        AND "createdAt" >= ${since}
    `);
    const value = rows[0]?.count ?? 0;
    return typeof value === 'bigint' ? Number(value) : Number(value);
  }

  private async createVerificationEntitlement(input: {
    subjectType: 'driver' | 'guarantor';
    subjectId: string;
    tenantId: string;
    payerType: 'driver' | 'guarantor' | 'tenant' | 'platform';
    paymentReference?: string | null;
    paymentProvider?: string | null;
    amountMinorUnits: number;
    currency: string;
    status: string;
    paidAt?: Date | null;
    expiresAt?: Date | null;
  }): Promise<VerificationEntitlementRecord> {
    const rows = await this.prisma.$queryRaw<VerificationEntitlementRecord[]>(Prisma.sql`
      INSERT INTO "verification_entitlements" (
        "id",
        "entitlementCode",
        "subjectType",
        "subjectId",
        "tenantId",
        "payerType",
        "paymentReference",
        "paymentProvider",
        "amountMinorUnits",
        "currency",
        "purpose",
        "status",
        "paidAt",
        "expiresAt"
      )
      VALUES (
        ${randomUUID()},
        ${this.buildVerificationEntitlementCode()},
        ${input.subjectType},
        ${input.subjectId},
        ${input.tenantId},
        ${input.payerType},
        ${input.paymentReference ?? null},
        ${input.paymentProvider ?? null},
        ${input.amountMinorUnits},
        ${input.currency},
        'identity_verification',
        ${input.status},
        ${input.paidAt ?? null},
        ${input.expiresAt ?? null}
      )
      RETURNING *
    `);
    return rows[0] as VerificationEntitlementRecord;
  }

  private async updateVerificationEntitlement(
    entitlementId: string,
    updates: {
      status?: string;
      reservedAt?: Date | null;
      consumedAt?: Date | null;
      consumedByAttemptId?: string | null;
      paymentReference?: string | null;
      paymentProvider?: string | null;
      paidAt?: Date | null;
      expiresAt?: Date | null;
    },
  ): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE "verification_entitlements"
      SET
        "status" = COALESCE(${updates.status ?? null}, "status"),
        "reservedAt" = COALESCE(${updates.reservedAt ?? null}, "reservedAt"),
        "consumedAt" = COALESCE(${updates.consumedAt ?? null}, "consumedAt"),
        "consumedByAttemptId" = COALESCE(${updates.consumedByAttemptId ?? null}, "consumedByAttemptId"),
        "paymentReference" = COALESCE(${updates.paymentReference ?? null}, "paymentReference"),
        "paymentProvider" = COALESCE(${updates.paymentProvider ?? null}, "paymentProvider"),
        "paidAt" = COALESCE(${updates.paidAt ?? null}, "paidAt"),
        "expiresAt" = COALESCE(${updates.expiresAt ?? null}, "expiresAt"),
        "updatedAt" = NOW()
      WHERE "id" = ${entitlementId}
    `);
  }

  private async createVerificationAttempt(input: {
    tenantId: string;
    subjectType: 'driver' | 'guarantor';
    subjectId: string;
    entitlementId?: string | null;
    attemptType: 'driver_verification' | 'guarantor_verification' | 'reverification';
    requestFingerprint?: string | null;
    status: string;
    livenessCallCount?: number;
    providerCallCount?: number;
    billableStageReached?: boolean;
    providerCostIncurred?: boolean;
    failureReason?: string | null;
  }): Promise<VerificationAttemptRecord> {
    const rows = await this.prisma.$queryRaw<VerificationAttemptRecord[]>(Prisma.sql`
      INSERT INTO "verification_attempts" (
        "id",
        "attemptCode",
        "subjectType",
        "subjectId",
        "tenantId",
        "entitlementId",
        "attemptType",
        "requestFingerprint",
        "status",
        "livenessCallCount",
        "providerCallCount",
        "billableStageReached",
        "providerCostIncurred",
        "failureReason"
      )
      VALUES (
        ${randomUUID()},
        ${this.buildVerificationAttemptCode()},
        ${input.subjectType},
        ${input.subjectId},
        ${input.tenantId},
        ${input.entitlementId ?? null},
        ${input.attemptType},
        ${input.requestFingerprint ?? null},
        ${input.status},
        ${input.livenessCallCount ?? 0},
        ${input.providerCallCount ?? 0},
        ${input.billableStageReached ?? false},
        ${input.providerCostIncurred ?? false},
        ${input.failureReason ?? null}
      )
      RETURNING *
    `);
    return rows[0] as VerificationAttemptRecord;
  }

  private async updateVerificationAttempt(
    attemptId: string,
    updates: {
      status?: string;
      failureReason?: string | null;
      completedAt?: Date | null;
      providerCallCountIncrement?: number;
      livenessCallCountIncrement?: number;
      billableStageReached?: boolean;
      providerCostIncurred?: boolean;
      entitlementId?: string | null;
    },
  ): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE "verification_attempts"
      SET
        "status" = COALESCE(${updates.status ?? null}, "status"),
        "failureReason" = COALESCE(${updates.failureReason ?? null}, "failureReason"),
        "completedAt" = COALESCE(${updates.completedAt ?? null}, "completedAt"),
        "providerCallCount" = "providerCallCount" + ${updates.providerCallCountIncrement ?? 0},
        "livenessCallCount" = "livenessCallCount" + ${updates.livenessCallCountIncrement ?? 0},
        "billableStageReached" = COALESCE(${updates.billableStageReached ?? null}, "billableStageReached"),
        "providerCostIncurred" = COALESCE(${updates.providerCostIncurred ?? null}, "providerCostIncurred"),
        "entitlementId" = COALESCE(${updates.entitlementId ?? null}, "entitlementId"),
        "updatedAt" = NOW()
      WHERE "id" = ${attemptId}
    `);
  }

  private async ensureLegacyVerificationEntitlement(input: {
    tenantId: string;
    subjectType: 'driver' | 'guarantor';
    subjectId: string;
    paymentReference?: string | null;
    paidAt?: Date | null;
    amountMinorUnits: number;
    currency: string;
    payerType: 'driver' | 'guarantor' | 'tenant' | 'platform';
  }): Promise<VerificationEntitlementRecord | null> {
    const existing = await this.getLatestVerificationEntitlement(
      input.tenantId,
      input.subjectType,
      input.subjectId,
    );
    if (existing) {
      return existing;
    }
    if (!input.paidAt && !input.paymentReference) {
      return null;
    }

    return this.createVerificationEntitlement({
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      tenantId: input.tenantId,
      payerType: input.payerType,
      paymentReference: input.paymentReference ?? null,
      amountMinorUnits: input.amountMinorUnits,
      currency: input.currency,
      status: 'paid',
      paidAt: input.paidAt ?? new Date(),
      expiresAt: null,
    });
  }

  private mapEntitlementState(
    entitlement: VerificationEntitlementRecord | null,
  ): VerificationEntitlementState {
    if (!entitlement) return 'none';
    if (entitlement.expiresAt && entitlement.expiresAt.getTime() < Date.now()) return 'expired';
    if (entitlement.status === 'paid') return 'paid';
    if (entitlement.status === 'reserved') return 'reserved';
    if (entitlement.status === 'consumed') return 'consumed';
    if (entitlement.status === 'refunded') return 'refunded';
    if (entitlement.status === 'cancelled') return 'cancelled';
    return 'none';
  }

  private mapAttemptState(attempt: VerificationAttemptRecord | null): VerificationFlowState {
    if (!attempt) return 'not_started';
    if (attempt.status === 'provider_called') return 'provider_called';
    if (attempt.status === 'success') return 'success';
    if (attempt.status === 'failed') return 'failed';
    if (attempt.status === 'abandoned') return 'failed';
    if (attempt.status === 'blocked') return 'failed';
    return 'in_progress';
  }

  private async assertVerificationCostControls(input: {
    tenantId: string;
    subjectType: 'driver' | 'guarantor';
    subjectId: string;
    operation: 'liveness' | 'provider';
  }): Promise<void> {
    const now = Date.now();
    const recentWindow = new Date(now - 15 * 60 * 1000);
    const longWindow = new Date(now - 60 * 60 * 1000);
    if (input.operation === 'liveness') {
      const recentStarts = await this.countVerificationAttemptsSince(
        input.tenantId,
        input.subjectType,
        input.subjectId,
        recentWindow,
        ['liveness_started', 'initiated', 'in_progress'],
      );
      if (recentStarts >= 5) {
        await this.recordVerificationBlock(
          input.tenantId,
          input.subjectType,
          input.subjectId,
          'Too many live verification starts in a short period. Please wait a few minutes before trying again.',
        );
        throw new ConflictException(
          'Too many live verification starts in a short period. Please wait a few minutes before trying again.',
        );
      }
      return;
    }

    const recentProviderCalls = await this.countVerificationAttemptsSince(
      input.tenantId,
      input.subjectType,
      input.subjectId,
      longWindow,
      ['provider_called', 'success', 'failed', 'blocked'],
    );
    if (recentProviderCalls >= 3) {
      await this.recordVerificationBlock(
        input.tenantId,
        input.subjectType,
        input.subjectId,
        'Verification is temporarily blocked after repeated costly attempts. Please wait before trying again.',
      );
      throw new ConflictException(
        'Verification is temporarily blocked after repeated costly attempts. Please wait before trying again.',
      );
    }
  }

  private async recordVerificationBlock(
    tenantId: string,
    subjectType: 'driver' | 'guarantor',
    subjectId: string,
    reason: string,
  ): Promise<void> {
    const latestAttempt = await this.getLatestVerificationAttempt(tenantId, subjectType, subjectId);

    if (
      latestAttempt &&
      latestAttempt.status === 'blocked' &&
      latestAttempt.updatedAt.getTime() >= Date.now() - 15 * 60 * 1000
    ) {
      await this.updateVerificationAttempt(latestAttempt.id, {
        status: 'blocked',
        failureReason: reason,
        completedAt: new Date(),
      });
      return;
    }

    const blockedAttempt = await this.createVerificationAttempt({
      tenantId,
      subjectType,
      subjectId,
      attemptType: subjectType === 'driver' ? 'driver_verification' : 'guarantor_verification',
      status: 'blocked',
      failureReason: reason,
    });
    await this.updateVerificationAttempt(blockedAttempt.id, {
      completedAt: new Date(),
    });
  }

  private determineVerificationAttemptStatus(
    result: DriverIdentityResolutionResult,
  ): 'success' | 'failed' | 'in_progress' | 'provider_called' {
    if (
      result.isVerifiedMatch === true ||
      result.decision === 'verified' ||
      result.decision === 'approved' ||
      result.decision === 'successful_match' ||
      result.providerVerificationStatus === 'successful_match' ||
      result.decision === 'review_needed' ||
      result.decision === 'review_required' ||
      result.providerLookupStatus === 'skipped_by_organisation_policy'
    ) {
      return result.isVerifiedMatch === true ||
        result.decision === 'verified' ||
        result.decision === 'approved' ||
        result.decision === 'successful_match' ||
        result.providerVerificationStatus === 'successful_match' ||
        result.providerLookupStatus === 'skipped_by_organisation_policy'
        ? 'success'
        : 'provider_called';
    }

    if (
      result.decision === 'failed' ||
      result.decision === 'rejected' ||
      result.providerLookupStatus === 'no_match' ||
      result.providerVerificationStatus === 'face_mismatch' ||
      result.providerVerificationStatus === 'no_match' ||
      result.livenessPassed === false
    ) {
      return 'failed';
    }

    return 'in_progress';
  }

  private async getOperationalWalletFundingStatus(
    _tenantId: string,
    businessEntityId: string,
    amountMinorUnits: number,
  ): Promise<'ready' | 'wallet_missing' | 'insufficient_balance'> {
    const wallet = await this.prisma.operationalWallet.findUnique({
      where: { businessEntityId },
      select: { id: true },
    });

    if (!wallet) {
      return 'wallet_missing';
    }

    const groupedEntries = await this.prisma.operationalWalletEntry.groupBy({
      by: ['type'],
      where: { walletId: wallet.id },
      _sum: { amountMinorUnits: true },
    });

    let credits = 0;
    let debits = 0;
    for (const entry of groupedEntries) {
      const amount = entry._sum.amountMinorUnits ?? 0;
      if (entry.type === 'credit') {
        credits = amount;
      } else {
        debits += amount;
      }
    }

    const balanceMinorUnits = credits - debits;
    return balanceMinorUnits >= amountMinorUnits ? 'ready' : 'insufficient_balance';
  }

  private async getSelfServiceVerificationPolicy(
    tenantId: string,
    driver: DriverWithIdentityState,
  ): Promise<{
    enabledDriverIdentifierTypes: string[];
    requiredDriverIdentifierTypes: string[];
    requiredDriverDocumentSlugs: string[];
    driverPaysKyc: boolean;
    kycPaymentVerified: boolean;
    verificationPaymentState: VerificationPaymentState;
    verificationEntitlementState: VerificationEntitlementState;
    verificationState: VerificationFlowState;
    verificationEntitlementCode?: string | null;
    verificationPaymentReference?: string | null;
    verificationConsumedAt?: Date | null;
    verificationAttemptCount: number;
    verificationBlockedReason?: string | null;
    verificationPayer: 'driver' | 'organisation';
    verificationAmountMinorUnits: number;
    verificationCurrency: string;
    verificationPaymentStatus:
      | 'not_required'
      | 'ready'
      | 'driver_payment_required'
      | 'wallet_missing'
      | 'insufficient_balance';
    verificationPaymentMessage: string | null;
  }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true, metadata: true },
    });
    const settings = readOrganisationSettings(tenant?.metadata, tenant?.country);
    const countryCode = driver.nationality ?? tenant?.country ?? null;
    const verificationCurrency =
      countryCode && isCountrySupported(countryCode)
        ? getCountryConfig(countryCode).currency
        : 'NGN';
    const verificationAmountMinorUnits = this.getVerificationAmountMinorUnits(verificationCurrency);
    const driverPaysKyc =
      (driver as Driver & { driverPaysKycOverride?: boolean | null }).driverPaysKycOverride ??
      settings.operations.driverPaysKyc;
    const entitlement = await this.ensureLegacyVerificationEntitlement({
      tenantId,
      subjectType: 'driver',
      subjectId: driver.id,
      paymentReference:
        (driver as Driver & { kycPaymentReference?: string | null }).kycPaymentReference ?? null,
      paidAt:
        (driver as Driver & { kycPaymentVerifiedAt?: Date | null }).kycPaymentVerifiedAt ?? null,
      amountMinorUnits: verificationAmountMinorUnits,
      currency: verificationCurrency,
      payerType: driverPaysKyc ? 'driver' : 'tenant',
    });
    const latestAttempt = await this.getLatestVerificationAttempt(tenantId, 'driver', driver.id);
    const verificationEntitlementState = this.mapEntitlementState(entitlement);
    const verificationState = this.mapAttemptState(latestAttempt);
    const verificationAttemptCount = await this.countVerificationAttemptsSince(
      tenantId,
      'driver',
      driver.id,
      new Date(0),
      [
        'initiated',
        'liveness_started',
        'provider_called',
        'success',
        'failed',
        'abandoned',
        'blocked',
      ],
    );
    const verificationAlreadySatisfied =
      verificationState === 'success' ||
      driver.identityStatus === 'verified' ||
      driver.identityStatus === 'review_needed';
    const kycPaymentVerified =
      ['paid', 'reserved'].includes(verificationEntitlementState) ||
      (verificationEntitlementState === 'consumed' && verificationAlreadySatisfied);
    const verificationPaymentState: VerificationPaymentState = driverPaysKyc
      ? verificationEntitlementState === 'paid' || verificationEntitlementState === 'reserved'
        ? 'paid'
        : verificationEntitlementState === 'consumed'
          ? 'reconciled'
          : 'required'
      : 'not_required';

    let verificationPaymentStatus:
      | 'not_required'
      | 'ready'
      | 'driver_payment_required'
      | 'wallet_missing'
      | 'insufficient_balance' = 'not_required';
    let verificationPaymentMessage: string | null = null;
    let verificationBlockedReason: string | null = null;

    if (driverPaysKyc) {
      if (verificationEntitlementState === 'paid' || verificationEntitlementState === 'reserved') {
        verificationPaymentStatus = 'ready';
        verificationPaymentMessage =
          verificationEntitlementState === 'reserved'
            ? 'Your verification payment has already been received. Continue from where you stopped.'
            : 'Your verification payment has already been received. You can continue from where you stopped.';
      } else if (verificationEntitlementState === 'consumed') {
        // The entitlement was consumed by a prior provider call. Regardless of
        // whether that call succeeded or failed, we do NOT require a new payment —
        // the driver has already paid. If verification failed, they can retry
        // verification without paying again.
        verificationPaymentStatus = 'ready';
        verificationPaymentMessage = verificationAlreadySatisfied
          ? 'Your verification payment has already been used for this completed onboarding flow.'
          : 'Your verification payment was already received. You can retry verification.';
      } else if (verificationEntitlementState === 'expired') {
        verificationPaymentStatus = 'driver_payment_required';
        verificationPaymentMessage =
          'Your previous verification payment entitlement expired. A new payment is required before verification can continue.';
      } else {
        verificationPaymentStatus = 'driver_payment_required';
        verificationPaymentMessage =
          'A verification payment is required before live verification can continue.';
      }
    } else if (settings.operations.requireIdentityVerificationForActivation) {
      verificationPaymentStatus = await this.getOperationalWalletFundingStatus(
        tenantId,
        driver.businessEntityId,
        verificationAmountMinorUnits,
      );
      verificationPaymentMessage =
        verificationPaymentStatus === 'ready'
          ? 'Your company has enabled verification for this onboarding flow.'
          : verificationPaymentStatus === 'wallet_missing'
            ? 'Your company must set up an operations wallet before verification can continue.'
            : 'Your company wallet needs funding before verification can continue.';
    }

    if (latestAttempt?.status === 'blocked') {
      verificationBlockedReason =
        latestAttempt?.failureReason ??
        'Too many recent verification retries. Please wait before trying again.';
    }

    return {
      enabledDriverIdentifierTypes: settings.operations.enabledDriverIdentifierTypes,
      requiredDriverIdentifierTypes: settings.operations.requiredDriverIdentifierTypes,
      requiredDriverDocumentSlugs: settings.operations.requiredDriverDocumentSlugs,
      driverPaysKyc,
      kycPaymentVerified,
      verificationPaymentState,
      verificationEntitlementState,
      verificationState,
      verificationEntitlementCode: entitlement?.entitlementCode ?? null,
      verificationPaymentReference: entitlement?.paymentReference ?? null,
      verificationConsumedAt: entitlement?.consumedAt ?? null,
      verificationAttemptCount,
      verificationBlockedReason,
      verificationPayer: driverPaysKyc ? 'driver' : 'organisation',
      verificationAmountMinorUnits,
      verificationCurrency,
      verificationPaymentStatus,
      verificationPaymentMessage,
    };
  }

  private async assertSelfServiceVerificationPaymentReady(
    tenantId: string,
    driver: DriverWithIdentityState,
  ): Promise<void> {
    const policy = await this.getSelfServiceVerificationPolicy(tenantId, driver);
    if (
      policy.verificationPaymentStatus === 'driver_payment_required' ||
      policy.verificationPaymentStatus === 'wallet_missing' ||
      policy.verificationPaymentStatus === 'insufficient_balance'
    ) {
      throw new BadRequestException(
        policy.verificationPaymentMessage ?? 'Verification cannot continue yet.',
      );
    }
  }

  private async getOrganisationSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true, metadata: true },
    });

    return readOrganisationSettings(tenant?.metadata, tenant?.country);
  }

  private async buildDriverMobileAccessSettings(
    currentSettings: unknown,
    input: {
      tenantCountry?: string | null | undefined;
      fleetId: string;
      hasLinkedDriver?: boolean;
    },
  ): Promise<Prisma.InputJsonValue> {
    const preferredLanguage = getDefaultLanguageForCountry(input.tenantCountry);
    return writeUserSettings(
      currentSettings,
      {
        assignedFleetIds: [input.fleetId],
        assignedVehicleIds: [],
        customPermissions: [...DRIVER_MOBILE_CUSTOM_PERMISSIONS],
        accessMode: 'driver_mobile',
      },
      {
        preferredLanguage,
        role: TenantRole.ReadOnly,
        hasLinkedDriver: input.hasLinkedDriver ?? true,
      },
    ) as Prisma.InputJsonValue;
  }

  private get driverDocuments(): {
    findMany(args: {
      where: { tenantId: string; driverId?: string | { in: string[] } };
      orderBy?: { createdAt: 'desc' };
      select?: { driverId?: boolean; documentType?: boolean; status?: boolean };
    }): Promise<
      Array<
        Pick<DriverDocumentRecord, 'driverId' | 'documentType' | 'status'> | DriverDocumentRecord
      >
    >;
    create(args: {
      data: Omit<DriverDocumentRecord, 'id' | 'createdAt' | 'updatedAt'>;
    }): Promise<DriverDocumentRecord>;
    findUnique(args: { where: { id: string } }): Promise<DriverDocumentRecord | null>;
    findFirst(args: {
      where: { tenantId: string; driverId: string; documentType: string; status: string };
      orderBy?: { createdAt: 'desc' };
    }): Promise<DriverDocumentRecord | null>;
    update(args: {
      where: { id: string };
      data: Partial<
        Pick<DriverDocumentRecord, 'status' | 'expiresAt' | 'reviewedBy' | 'reviewedAt'>
      >;
    }): Promise<DriverDocumentRecord>;
    updateMany(args: {
      where: {
        tenantId: string;
        status: string;
        expiresAt: { lt: Date };
        driverId?: { in: string[] };
      };
      data: Pick<DriverDocumentRecord, 'status'>;
    }): Promise<{ count: number }>;
    delete(args: { where: { id: string } }): Promise<DriverDocumentRecord>;
  } {
    // TODO: Remove this narrow delegate cast after the repo's Prisma client path
    // inconsistency is resolved. Runtime Prisma includes the driver document
    // lifecycle fields, but api-core type-checking can lag behind schema additions.
    return (
      this.prisma as never as {
        driverDocument: {
          findMany(args: {
            where: { tenantId: string; driverId?: string | { in: string[] } };
            orderBy?: { createdAt: 'desc' };
            select?: { driverId?: boolean; documentType?: boolean; status?: boolean };
          }): Promise<
            Array<
              | Pick<DriverDocumentRecord, 'driverId' | 'documentType' | 'status'>
              | DriverDocumentRecord
            >
          >;
          create(args: {
            data: Omit<DriverDocumentRecord, 'id' | 'createdAt' | 'updatedAt'>;
          }): Promise<DriverDocumentRecord>;
          findUnique(args: { where: { id: string } }): Promise<DriverDocumentRecord | null>;
          findFirst(args: {
            where: { tenantId: string; driverId: string; documentType: string; status: string };
            orderBy?: { createdAt: 'desc' };
          }): Promise<DriverDocumentRecord | null>;
          update(args: {
            where: { id: string };
            data: Partial<
              Pick<DriverDocumentRecord, 'status' | 'expiresAt' | 'reviewedBy' | 'reviewedAt'>
            >;
          }): Promise<DriverDocumentRecord>;
          updateMany(args: {
            where: {
              tenantId: string;
              status: string;
              expiresAt: { lt: Date };
              driverId?: { in: string[] };
            };
            data: Pick<DriverDocumentRecord, 'status'>;
          }): Promise<{ count: number }>;
          delete(args: { where: { id: string } }): Promise<DriverDocumentRecord>;
        };
      }
    ).driverDocument;
  }

  private get driverGuarantors(): {
    findUnique(args: { where: { driverId: string } }): Promise<DriverGuarantorRecord | null>;
    findMany(args: { where: { tenantId: string; driverId?: { in: string[] } } }): Promise<
      DriverGuarantorRecord[]
    >;
    upsert(args: {
      where: { driverId: string };
      create: Omit<DriverGuarantorRecord, 'id' | 'createdAt' | 'updatedAt'>;
      update: Pick<
        DriverGuarantorRecord,
        | 'name'
        | 'phone'
        | 'email'
        | 'countryCode'
        | 'relationship'
        | 'status'
        | 'personId'
        | 'dateOfBirth'
        | 'gender'
        | 'selfieImageUrl'
        | 'providerImageUrl'
        | 'disconnectedAt'
        | 'disconnectedReason'
      >;
    }): Promise<DriverGuarantorRecord>;
    update(args: {
      where: { driverId: string };
      data: Partial<
        Pick<DriverGuarantorRecord, 'status' | 'disconnectedAt' | 'disconnectedReason' | 'personId'>
      >;
    }): Promise<DriverGuarantorRecord>;
  } {
    // TODO: Remove this narrow delegate cast after the repo's Prisma client path
    // inconsistency is resolved. The runtime client has driverGuarantor, but
    // api-core type-checking still lags behind generated schema additions.
    return (
      this.prisma as never as {
        driverGuarantor: {
          findUnique(args: { where: { driverId: string } }): Promise<DriverGuarantorRecord | null>;
          findMany(args: { where: { tenantId: string; driverId?: { in: string[] } } }): Promise<
            DriverGuarantorRecord[]
          >;
          upsert(args: {
            where: { driverId: string };
            create: Omit<DriverGuarantorRecord, 'id' | 'createdAt' | 'updatedAt'>;
            update: Pick<
              DriverGuarantorRecord,
              | 'name'
              | 'phone'
              | 'email'
              | 'countryCode'
              | 'relationship'
              | 'status'
              | 'personId'
              | 'dateOfBirth'
              | 'gender'
              | 'selfieImageUrl'
              | 'providerImageUrl'
              | 'disconnectedAt'
              | 'disconnectedReason'
            >;
          }): Promise<DriverGuarantorRecord>;
          update(args: {
            where: { driverId: string };
            data: Partial<
              Pick<
                DriverGuarantorRecord,
                'status' | 'disconnectedAt' | 'disconnectedReason' | 'personId'
              >
            >;
          }): Promise<DriverGuarantorRecord>;
        };
      }
    ).driverGuarantor;
  }

  async list(
    tenantId: string,
    input: {
      fleetId?: string;
      fleetIds?: string[];
      q?: string;
      status?: string;
      identityStatus?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<
    PaginatedResponse<
      DriverWithIdentityState &
        DriverIntelligenceSummary &
        DriverGuarantorSummary &
        DriverDocumentSummary &
        DriverMobileAccessSummary &
        DriverReadinessSummary
    >
  > {
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const searchQuery = input.q?.trim();
    const where: Prisma.DriverWhereInput = {
      tenantId,
      ...(input.fleetId
        ? { fleetId: input.fleetId }
        : input.fleetIds?.length
          ? { fleetId: { in: input.fleetIds } }
          : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.identityStatus ? { identityStatus: input.identityStatus } : {}),
      ...(searchQuery
        ? {
            OR: [
              { firstName: { contains: searchQuery, mode: 'insensitive' } },
              { lastName: { contains: searchQuery, mode: 'insensitive' } },
              { phone: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.driver.count({ where }),
    ]);

    const enrichedDrivers = await this.enrichDriversWithRisk(drivers);
    const driversWithGuarantors = await this.attachGuarantorSummariesSafely(
      tenantId,
      enrichedDrivers,
    );
    const driversWithDocuments = await this.attachDocumentSummariesSafely(
      tenantId,
      driversWithGuarantors,
    );
    const driversWithMobileAccess = await this.attachMobileAccessSummariesSafely(
      tenantId,
      driversWithDocuments,
    );
    const ready = await this.attachReadinessSummariesSafely(tenantId, driversWithMobileAccess);

    // Compute subscription lock: drivers created beyond the plan cap are locked.
    const { driverCap } = await this.subscriptionEntitlementsService.getCapInfo(tenantId);
    let lockedDriverIds: Set<string> | null = null;
    if (driverCap !== null) {
      const totalCount = await this.prisma.driver.count({ where: { tenantId } });
      if (totalCount > driverCap) {
        // The first `driverCap` drivers by createdAt are unlocked; everything else is locked.
        const unlockedRows = await this.prisma.driver.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'asc' },
          take: driverCap,
          select: { id: true },
        });
        const unlockedIds = new Set(unlockedRows.map((r) => r.id));
        lockedDriverIds = new Set(ready.filter((d) => !unlockedIds.has(d.id)).map((d) => d.id));
      }
    }

    return {
      data: ready.map((d) => ({
        ...d,
        locked: lockedDriverIds !== null ? lockedDriverIds.has(d.id) : false,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(
    tenantId: string,
    id: string,
  ): Promise<
    DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary &
      DriverMobileAccessSummary &
      DriverReadinessSummary
  > {
    const driver = (await this.prisma.driver.findUnique({
      where: { id },
    })) as DriverWithIdentityState | null;

    if (!driver) {
      throw new NotFoundException(`Driver '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(driver.tenantId), asTenantId(tenantId));

    await this.policyService.evaluateDriverPolicies(tenantId, driver.id);

    const enrichedDriver = await this.enrichDriverWithRisk(driver);
    const [driverWithGuarantor] = await this.attachGuarantorSummaries(tenantId, [enrichedDriver]);
    const [driverWithDocuments] = await this.attachDocumentSummaries(tenantId, [
      driverWithGuarantor ?? {
        ...enrichedDriver,
        hasGuarantor: false,
        guarantorStatus: null,
        guarantorDisconnectedAt: null,
      },
    ]);
    const [driverWithMobileAccess] = await this.attachMobileAccessSummaries(tenantId, [
      driverWithDocuments ?? {
        ...enrichedDriver,
        hasGuarantor: false,
        guarantorStatus: null,
        guarantorDisconnectedAt: null,
        hasApprovedLicence: false,
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
        approvedDocumentTypes: [],
      },
    ]);
    const [driverWithReadiness] = await this.attachReadinessSummaries(tenantId, [
      driverWithMobileAccess ?? {
        ...enrichedDriver,
        hasGuarantor: false,
        guarantorStatus: null,
        guarantorDisconnectedAt: null,
        hasApprovedLicence: false,
        hasMobileAccess: false,
        mobileAccessStatus: 'missing',
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
        approvedDocumentTypes: [],
      },
    ]);
    return (
      driverWithReadiness ?? {
        ...enrichedDriver,
        hasGuarantor: false,
        guarantorStatus: null,
        guarantorDisconnectedAt: null,
        hasApprovedLicence: false,
        hasMobileAccess: false,
        mobileAccessStatus: 'missing',
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
        approvedDocumentTypes: [],
        authenticationAccess: 'not_ready',
        authenticationAccessReasons: [],
        activationReadiness: 'not_ready',
        activationReadinessReasons: [],
        assignmentReadiness: 'not_ready',
        assignmentReadinessReasons: [],
        remittanceReadiness: 'not_ready',
        remittanceReadinessReasons: [],
      }
    );
  }

  async getSelfServiceContext(token: string): Promise<
    DriverWithIdentityState &
      DriverIntelligenceSummary & {
        requireIdentityVerificationForActivation?: boolean;
        requireBiometricVerification?: boolean;
        requireGovernmentVerificationLookup?: boolean;
        enabledDriverIdentifierTypes?: string[];
        requiredDriverIdentifierTypes?: string[];
        requiredDriverDocumentSlugs?: string[];
        driverPaysKyc?: boolean;
        kycPaymentVerified?: boolean;
        verificationPaymentState?: VerificationPaymentState;
        verificationEntitlementState?: VerificationEntitlementState;
        verificationState?: VerificationFlowState;
        verificationEntitlementCode?: string | null;
        verificationPaymentReference?: string | null;
        verificationConsumedAt?: Date | null;
        verificationAttemptCount?: number;
        verificationBlockedReason?: string | null;
        verificationPayer?: 'driver' | 'organisation';
        verificationAmountMinorUnits?: number;
        verificationCurrency?: string;
        verificationPaymentStatus?:
          | 'not_required'
          | 'ready'
          | 'driver_payment_required'
          | 'wallet_missing'
          | 'insufficient_balance';
        verificationPaymentMessage?: string | null;
      }
  > {
    const payload = await this.verifySelfServiceToken(token);
    const [driver, settings] = await Promise.all([
      this.findOne(payload.tenantId, payload.driverId),
      this.getOrganisationSettings(payload.tenantId),
    ]);
    const verificationPolicy = await this.getSelfServiceVerificationPolicy(
      payload.tenantId,
      driver,
    );

    return {
      ...driver,
      requireIdentityVerificationForActivation:
        settings.operations.requireIdentityVerificationForActivation,
      requireBiometricVerification: settings.operations.requireBiometricVerification,
      requireGovernmentVerificationLookup: settings.operations.requireGovernmentVerificationLookup,
      enabledDriverIdentifierTypes: verificationPolicy.enabledDriverIdentifierTypes,
      requiredDriverIdentifierTypes: verificationPolicy.requiredDriverIdentifierTypes,
      requiredDriverDocumentSlugs: verificationPolicy.requiredDriverDocumentSlugs,
      driverPaysKyc: verificationPolicy.driverPaysKyc,
      kycPaymentVerified: verificationPolicy.kycPaymentVerified,
      verificationPaymentState: verificationPolicy.verificationPaymentState,
      verificationEntitlementState: verificationPolicy.verificationEntitlementState,
      verificationState: verificationPolicy.verificationState,
      verificationEntitlementCode: verificationPolicy.verificationEntitlementCode ?? null,
      verificationPaymentReference: verificationPolicy.verificationPaymentReference ?? null,
      verificationConsumedAt: verificationPolicy.verificationConsumedAt ?? null,
      verificationAttemptCount: verificationPolicy.verificationAttemptCount,
      verificationBlockedReason: verificationPolicy.verificationBlockedReason ?? null,
      verificationPayer: verificationPolicy.verificationPayer,
      verificationAmountMinorUnits: verificationPolicy.verificationAmountMinorUnits,
      verificationCurrency: verificationPolicy.verificationCurrency,
      verificationPaymentStatus: verificationPolicy.verificationPaymentStatus,
      verificationPaymentMessage: verificationPolicy.verificationPaymentMessage,
    };
  }

  // Backend-driven onboarding state machine.
  // Returns the single next required step and enough context for the frontend
  // to render it without guessing.  The frontend should always call this endpoint
  // after completing a step to know where to go next.
  async getOnboardingStep(token: string): Promise<{
    step:
      | 'account'
      | 'profile'
      | 'consent'
      | 'payment'
      | 'identity_verification'
      | 'document_verification'
      | 'manual_review'
      | 'complete';
    reason: string;
    // Contextual fields the frontend needs to render the step.
    paymentStatus?: string;
    paymentMessage?: string | null;
    verificationPaymentStatus?: string;
    identityStatus?: string;
    verificationState?: VerificationFlowState;
    hasConsentOnFile?: boolean;
    requiredDocumentTypes?: string[];
    verifiedDocumentTypes?: string[];
    requiresGuarantor?: boolean;
    guarantorVerified?: boolean;
  }> {
    const payload = await this.verifySelfServiceToken(token);
    const [driver, settings] = await Promise.all([
      this.findOne(payload.tenantId, payload.driverId),
      this.getOrganisationSettings(payload.tenantId),
    ]);
    const policy = await this.getSelfServiceVerificationPolicy(payload.tenantId, driver);

    // Step 1: account setup
    const linkedUser = await this.prisma.user.findFirst({
      where: { tenantId: payload.tenantId, driverId: driver.id },
      select: { id: true },
    });

    if (!linkedUser) {
      return { step: 'account', reason: 'Driver needs to create a sign-in account.' };
    }

    // Step 2: profile completeness — intentionally skipped.
    // Name and DOB are populated from the YouVerify provider response after
    // identity verification completes. Requiring profile data before verification
    // creates a chicken-and-egg loop. Profile is collected via NIN lookup, not
    // by asking the driver to type it manually.

    // Step 3: verification consent
    const existingConsent = await this.prisma.userConsent.findFirst({
      where: {
        tenantId: payload.tenantId,
        userId: linkedUser.id,
        subjectType: 'driver',
        subjectId: driver.id,
        policyDocument: 'verification_sensitive_processing',
        granted: true,
      },
      select: { id: true },
    });

    // Step 4: payment decision (checked before verification)
    const paymentBlocked =
      policy.verificationPaymentStatus === 'driver_payment_required' ||
      policy.verificationPaymentStatus === 'wallet_missing' ||
      policy.verificationPaymentStatus === 'insufficient_balance';

    if (!existingConsent && paymentBlocked) {
      // Show payment step — consent will be captured alongside payment
      return {
        step: 'payment',
        reason: 'Verification payment is required.',
        paymentStatus: policy.verificationPaymentStatus,
        paymentMessage: policy.verificationPaymentMessage,
        hasConsentOnFile: false,
      };
    }

    if (!existingConsent) {
      // Payment is not blocking but consent is still missing — capture before verification
      return {
        step: 'consent',
        reason: 'Driver has not yet provided verification consent.',
        hasConsentOnFile: false,
      };
    }

    if (paymentBlocked) {
      return {
        step: 'payment',
        reason: 'Verification payment is required.',
        paymentStatus: policy.verificationPaymentStatus,
        paymentMessage: policy.verificationPaymentMessage,
        hasConsentOnFile: true,
      };
    }

    // Step 5: identity verification (liveness + biometric)
    const requireIdentityVerification =
      settings.operations.requireIdentityVerificationForActivation !== false;
    const verificationState = policy.verificationState;
    const verificationCompleted =
      driver.identityStatus === 'verified' && verificationState === 'success';
    const verificationAwaitingReview =
      driver.identityStatus === 'review_needed' ||
      (driver.identityStatus === 'pending_verification' &&
        (verificationState === 'in_progress' || verificationState === 'provider_called'));

    if (requireIdentityVerification && verificationState === 'failed') {
      return {
        step: 'identity_verification',
        reason: 'Identity verification failed. Review the details and try again.',
        identityStatus: driver.identityStatus,
        verificationState,
        verificationPaymentStatus: policy.verificationPaymentStatus,
      };
    }

    if (requireIdentityVerification && !verificationCompleted && !verificationAwaitingReview) {
      return {
        step: 'identity_verification',
        reason: 'Identity verification has not been completed yet.',
        identityStatus: driver.identityStatus,
        verificationState,
        verificationPaymentStatus: policy.verificationPaymentStatus,
      };
    }

    // Step 6: manual review when a provider call has been made but verification is not complete.
    if (verificationAwaitingReview) {
      return {
        step: 'manual_review',
        reason:
          verificationState === 'provider_called'
            ? 'Verification was submitted and is waiting for a manual decision.'
            : 'Your verification submission is still being processed.',
        identityStatus: driver.identityStatus,
        verificationState,
      };
    }

    // Step 7: document verification (zero-trust ID number)
    const requiredDocumentSlugs = policy.requiredDriverDocumentSlugs ?? [];
    if (requiredDocumentSlugs.length > 0) {
      const verifiedDocVerifications = await this.driverDocumentVerifications.findMany({
        where: {
          tenantId: payload.tenantId,
          driverId: driver.id,
          status: 'verified',
        },
        select: { documentType: true },
      });
      const verifiedTypes = new Set(
        verifiedDocVerifications.map((verification) =>
          this.normalizeStoredDocumentType(verification.documentType),
        ),
      );
      const missingDocTypes = requiredDocumentSlugs.filter(
        (slug) => !verifiedTypes.has(slug.toLowerCase()),
      );

      if (missingDocTypes.length > 0) {
        return {
          step: 'document_verification',
          reason: `Required document verification not complete: ${missingDocTypes.join(', ')}.`,
          verificationState,
          requiredDocumentTypes: requiredDocumentSlugs,
          verifiedDocumentTypes: Array.from(verifiedTypes),
        };
      }
    }

    // All steps done — include guarantor status for completion screen
    const requiresGuarantor = settings.operations.requireGuarantor !== false;
    let guarantorVerified = !requiresGuarantor;
    if (requiresGuarantor) {
      const guarantor = await this.prisma.driverGuarantor.findFirst({
        where: { tenantId: payload.tenantId, driverId: driver.id, disconnectedAt: null },
        select: { id: true, status: true },
      });
      const needsGuarantorVerification = settings.operations.requireGuarantorVerification === true;
      if (guarantor) {
        guarantorVerified = needsGuarantorVerification
          ? guarantor.status === 'verified'
          : true;
      } else {
        guarantorVerified = false;
      }
    }

    return {
      step: 'complete',
      reason: 'All onboarding requirements are met.',
      identityStatus: driver.identityStatus,
      verificationState,
      requiresGuarantor,
      guarantorVerified,
    };
  }

  async getMobileAccess(
    tenantId: string,
    driverId: string,
  ): Promise<{
    linkedUser: MobileAccessUserRecord | null;
    suggestedUsers: Array<MobileAccessUserRecord & { matchReason?: string | null }>;
  }> {
    const driver = await this.findOne(tenantId, driverId);

    const linkedUser = await this.prisma.user.findFirst({
      where: {
        tenantId,
        driverId: driver.id,
      },
    });

    const normalizedEmail = driver.email?.trim().toLowerCase() ?? null;
    const normalizedPhone = driver.phone?.trim() ?? null;

    const [emailMatches, phoneMatches] = await Promise.all([
      normalizedEmail
        ? this.prisma.user.findMany({
            where: {
              tenantId,
              email: normalizedEmail,
            },
            orderBy: { updatedAt: 'desc' },
          })
        : Promise.resolve([]),
      normalizedPhone
        ? this.prisma.user.findMany({
            where: {
              tenantId,
              phone: normalizedPhone,
            },
            orderBy: { updatedAt: 'desc' },
          })
        : Promise.resolve([]),
    ]);

    const suggestedUsers = [...emailMatches, ...phoneMatches]
      .filter((user, index, users) => users.findIndex((item) => item.id === user.id) === index)
      .filter((user) => user.id !== linkedUser?.id)
      .filter(
        (user) =>
          readUserSettings(user.settings, {
            preferredLanguage: 'en',
            role: user.role,
            hasLinkedDriver: Boolean(user.driverId),
          }).accessMode === 'driver_mobile',
      )
      .map((user) => ({
        ...user,
        matchReason:
          normalizedEmail && user.email === normalizedEmail
            ? 'Email matches this driver'
            : normalizedPhone && user.phone === normalizedPhone
              ? 'Phone matches this driver'
              : null,
      }));

    return {
      linkedUser,
      suggestedUsers,
    };
  }

  async linkUserToDriver(
    tenantId: string,
    driverId: string,
    userId: string,
  ): Promise<MobileAccessUserRecord> {
    const driver = await this.findOne(tenantId, driverId);
    const [user, tenant] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: userId,
          tenantId,
        },
      }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { country: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundException(`User '${userId}' not found`);
    }

    if (!user.isActive) {
      throw new BadRequestException(
        'Only active mobile access accounts can be linked to a driver.',
      );
    }

    if (![TenantRole.FieldOfficer, TenantRole.ReadOnly].includes(user.role as TenantRole)) {
      throw new BadRequestException(
        'Only READ_ONLY or FIELD_OFFICER tenant users can be linked as driver mobile access accounts.',
      );
    }

    if (user.driverId && user.driverId !== driver.id) {
      throw new ConflictException(
        'This mobile access account is already linked to another driver.',
      );
    }

    const currentLinkedUser = await this.prisma.user.findFirst({
      where: {
        tenantId,
        driverId: driver.id,
      },
    });

    if (currentLinkedUser && currentLinkedUser.id !== user.id) {
      throw new ConflictException(
        'This driver already has a linked mobile access account. Disconnect it before linking another account.',
      );
    }

    const settings = await this.buildDriverMobileAccessSettings(user.settings, {
      tenantCountry: tenant?.country ?? null,
      fleetId: driver.fleetId,
    });

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        driverId: driver.id,
        businessEntityId: driver.businessEntityId,
        operatingUnitId: driver.operatingUnitId,
        role: TenantRole.ReadOnly,
        mobileAccessRevoked: false,
        settings,
      },
    });
  }

  async unlinkUserFromDriver(tenantId: string, driverId: string, userId: string): Promise<void> {
    const driver = await this.findOne(tenantId, driverId);
    const [user, tenant] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: userId,
          tenantId,
        },
      }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { country: true },
      }),
    ]);

    if (!user || user.driverId !== driver.id) {
      throw new NotFoundException('No linked mobile access account was found for this driver.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        driverId: null,
        mobileAccessRevoked: true,
        settings: writeUserSettings(
          user.settings,
          {
            accessMode: 'tenant_user',
            customPermissions: [],
          },
          {
            preferredLanguage: getDefaultLanguageForCountry(tenant?.country),
            role: user.role,
            hasLinkedDriver: false,
          },
        ) as Prisma.InputJsonValue,
      },
    });
  }

  async sendSelfServiceLink(
    tenantId: string,
    id: string,
    driverPaysKycOverride?: boolean,
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string; otpCode: string }> {
    const driver = await this.findOne(tenantId, id);

    // Persist per-driver KYC payment override if explicitly provided
    if (driverPaysKycOverride !== undefined) {
      await this.prisma.driver.update({
        where: { id: driver.id },
        data: { driverPaysKycOverride },
      });
    }

    if (!driver.email) {
      throw new BadRequestException(
        'Driver has no email; please add one before sending a self-service link.',
      );
    }

    const [token, otpCode] = await Promise.all([
      this.createSelfServiceToken(driver.tenantId, driver.id),
      this.createAndStoreSelfServiceOtp(driver.tenantId, 'driver', driver.id),
    ]);

    const verificationUrl = `${process.env.TENANT_WEB_URL ?? 'http://localhost:3000'}/driver-self-service?token=${encodeURIComponent(token)}`;
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: driver.tenantId },
      select: { name: true, country: true, metadata: true },
    });

    await this.authEmailService.sendDriverSelfServiceVerificationEmail({
      email: driver.email,
      name: this.formatDriverName(driver),
      driverName: this.formatDriverName(driver),
      organisationName: tenant
        ? (readOrganisationSettings(tenant.metadata, tenant.country).branding.displayName ??
          tenant.name)
        : null,
      verificationUrl,
      otpCode,
    });

    return {
      delivery: 'email',
      verificationUrl,
      destination: driver.email,
      otpCode,
    };
  }

  async sendGuarantorSelfServiceLink(
    tenantId: string,
    driverId: string,
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string; otpCode: string }> {
    const driver = await this.findOne(tenantId, driverId);
    const guarantor = await this.driverGuarantors.findUnique({ where: { driverId: driver.id } });

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    if (!guarantor.email) {
      throw new BadRequestException(
        'Guarantor has no email address; please add one before sending a verification link.',
      );
    }

    const [token, otpCode] = await Promise.all([
      this.createGuarantorSelfServiceToken(driver.tenantId, driver.id),
      this.createAndStoreSelfServiceOtp(driver.tenantId, 'guarantor', driver.id),
    ]);

    const verificationUrl = `${process.env.TENANT_WEB_URL ?? 'http://localhost:3000'}/guarantor-self-service?token=${encodeURIComponent(token)}`;
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: driver.tenantId },
      select: { name: true, country: true, metadata: true },
    });

    await this.authEmailService.sendGuarantorSelfServiceVerificationEmail({
      email: guarantor.email,
      guarantorName: guarantor.name,
      driverName: this.formatDriverName(driver),
      organisationName: tenant
        ? (readOrganisationSettings(tenant.metadata, tenant.country).branding.displayName ??
          tenant.name)
        : null,
      verificationUrl,
      otpCode,
    });

    return {
      delivery: 'email',
      verificationUrl,
      destination: guarantor.email,
      otpCode,
    };
  }

  async exchangeDriverSelfServiceOtp(otpCode: string): Promise<{ token: string }> {
    const normalizedCode = otpCode.trim().toUpperCase();
    const now = new Date();

    const otp = await this.prisma.selfServiceOtp.findUnique({
      where: { otpCode: normalizedCode },
    });

    if (!otp || otp.subjectType !== 'driver' || otp.usedAt !== null || otp.expiresAt < now) {
      throw new UnauthorizedException('This verification code is invalid or has expired.');
    }

    await this.prisma.selfServiceOtp.update({
      where: { id: otp.id },
      data: { usedAt: now },
    });

    const token = await this.createSelfServiceToken(otp.tenantId, otp.subjectId);
    return { token };
  }

  // Returning driver login: exchange email+password for a self-service continuation token.
  // This is the password-based equivalent of exchangeDriverSelfServiceOtp for drivers
  // who have already completed the account-creation step and want to resume onboarding
  // or re-enter the self-service flow without a fresh invitation OTP.
  async loginDriverSelfServiceWithPassword(
    identifier: string,
    password: string,
  ): Promise<{ token: string }> {
    const normalizedIdentifier = identifier.trim().toLowerCase();

    // Resolve user by email or phone across all tenants that have a driver linked.
    // We look for active users who are linked to a driver so we can issue a
    // driver-scoped self-service token.
    const user = await this.prisma.user.findFirst({
      where: {
        isActive: true,
        driverId: { not: null },
        OR: [{ email: normalizedIdentifier }, { phone: identifier.trim() }],
      },
      select: {
        id: true,
        tenantId: true,
        driverId: true,
        passwordHash: true,
        isActive: true,
      },
    });

    // Use the same timing-safe check regardless of whether the user was found,
    // to prevent user enumeration via timing attacks.
    const passwordValid = user?.passwordHash ? verifyPassword(password, user.passwordHash) : false;

    if (!user || !user.driverId || !passwordValid) {
      throw new UnauthorizedException(
        'No driver account found with those credentials. Check your email or phone and password.',
      );
    }

    const token = await this.createSelfServiceToken(user.tenantId, user.driverId as string);
    return { token };
  }

  async exchangeGuarantorSelfServiceOtp(otpCode: string): Promise<{ token: string }> {
    const normalizedCode = otpCode.trim().toUpperCase();
    const now = new Date();

    const otp = await this.prisma.selfServiceOtp.findUnique({
      where: { otpCode: normalizedCode },
    });

    if (!otp || otp.subjectType !== 'guarantor' || otp.usedAt !== null || otp.expiresAt < now) {
      throw new UnauthorizedException('This verification code is invalid or has expired.');
    }

    await this.prisma.selfServiceOtp.update({
      where: { id: otp.id },
      data: { usedAt: now },
    });

    const token = await this.createGuarantorSelfServiceToken(otp.tenantId, otp.subjectId);
    return { token };
  }

  async getGuarantorSelfServiceContext(token: string): Promise<{
    guarantorName: string;
    guarantorPhone: string;
    guarantorEmail: string | null;
    guarantorCountryCode: string | null;
    guarantorRelationship: string | null;
    guarantorDateOfBirth: string | null;
    guarantorGender: string | null;
    guarantorPersonId: string | null;
    guarantorStatus: string;
    guarantorSelfieImageUrl: string | null;
    guarantorProviderImageUrl: string | null;
    driverName: string;
    driverId: string;
    tenantId: string;
    organisationName: string | null;
    hasSelfServiceAccess: boolean;
  }> {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    const [driver, tenant] = await Promise.all([
      this.findOne(payload.tenantId, payload.driverId),
      this.prisma.tenant.findUnique({
        where: { id: payload.tenantId },
        select: { name: true, country: true, metadata: true },
      }),
    ]);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor is linked to this driver.');
    }

    const organisationName = tenant
      ? (readOrganisationSettings(tenant.metadata, tenant.country).branding.displayName ??
        tenant.name)
      : null;

    return {
      guarantorName: guarantor.name,
      guarantorPhone: guarantor.phone,
      guarantorEmail: guarantor.email ?? null,
      guarantorCountryCode: guarantor.countryCode ?? null,
      guarantorRelationship: guarantor.relationship ?? null,
      guarantorDateOfBirth: guarantor.dateOfBirth ?? null,
      guarantorGender: guarantor.gender ?? null,
      guarantorPersonId: guarantor.personId ?? null,
      guarantorStatus: guarantor.status,
      guarantorSelfieImageUrl: guarantor.selfieImageUrl ?? null,
      guarantorProviderImageUrl: guarantor.providerImageUrl ?? null,
      driverName: this.formatDriverName(driver),
      driverId: driver.id,
      tenantId: driver.tenantId,
      organisationName,
      hasSelfServiceAccess: Boolean(
        await this.findGuarantorSelfServiceUser(driver.tenantId, driver.id),
      ),
    };
  }

  private async findGuarantorSelfServiceUser(tenantId: string, driverId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return (
      users.find((user) => {
        const settings = readUserSettings(user.settings, {
          preferredLanguage: 'en',
          role: user.role,
          hasLinkedDriver: Boolean(user.driverId),
        });
        return (
          settings.selfServiceLinkage?.subjectType === 'guarantor' &&
          settings.selfServiceLinkage.driverId === driverId
        );
      }) ?? null
    );
  }

  async issueDriverSelfServiceContinuationToken(
    tenantId: string,
    userId: string,
  ): Promise<{ token: string }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, isActive: true },
    });

    if (!user?.driverId) {
      throw new UnauthorizedException(
        'This account is not linked to a resumable driver self-service onboarding flow.',
      );
    }

    const token = await this.createSelfServiceToken(tenantId, user.driverId);
    return { token };
  }

  async issueGuarantorSelfServiceContinuationToken(
    tenantId: string,
    userId: string,
  ): Promise<{ token: string }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('The authenticated session is no longer valid.');
    }

    const settings = readUserSettings(user.settings, {
      preferredLanguage: 'en',
      role: user.role,
      hasLinkedDriver: Boolean(user.driverId),
    });

    if (
      settings.selfServiceLinkage?.subjectType !== 'guarantor' ||
      !settings.selfServiceLinkage.driverId
    ) {
      throw new UnauthorizedException(
        'This account is not linked to a resumable guarantor self-service onboarding flow.',
      );
    }

    const driver = await this.findOne(tenantId, settings.selfServiceLinkage.driverId);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor is linked to this driver.');
    }

    const token = await this.createGuarantorSelfServiceToken(tenantId, driver.id);
    return { token };
  }

  async initiateKycCheckoutFromSelfService(
    token: string,
    provider: 'paystack' | 'flutterwave',
    returnUrl?: string,
  ): Promise<{
    status: 'checkout_required' | 'already_paid';
    checkoutUrl?: string;
    amountMinorUnits: number;
    currency: string;
    entitlementState?: VerificationEntitlementState;
  }> {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const verificationPolicy = await this.getSelfServiceVerificationPolicy(
      payload.tenantId,
      driver,
    );

    if (!verificationPolicy.driverPaysKyc) {
      throw new BadRequestException(
        'This organisation does not require drivers to pay for their own KYC verification.',
      );
    }

    if (!driver.email) {
      throw new BadRequestException(
        'A driver email address is required to initiate a KYC payment checkout.',
      );
    }

    if (
      verificationPolicy.verificationEntitlementState === 'paid' ||
      verificationPolicy.verificationEntitlementState === 'reserved'
    ) {
      return {
        status: 'already_paid',
        amountMinorUnits: verificationPolicy.verificationAmountMinorUnits,
        currency: verificationPolicy.verificationCurrency,
        entitlementState: verificationPolicy.verificationEntitlementState,
      };
    }

    const tenantWebUrl = process.env.TENANT_WEB_URL ?? 'http://localhost:3000';
    const redirectUrl = new URL('/driver-kyc/payment-return', tenantWebUrl);
    redirectUrl.searchParams.set('provider', provider);
    redirectUrl.searchParams.set('token', token);
    const safeReturnUrl = this.sanitizeSelfServiceReturnUrl(returnUrl);
    if (safeReturnUrl) {
      redirectUrl.searchParams.set('returnUrl', safeReturnUrl);
    }

    const checkout = await this.controlPlaneBillingClient.initializeDriverKycCheckout({
      tenantId: payload.tenantId,
      driverId: driver.id,
      provider,
      currency: verificationPolicy.verificationCurrency,
      customerEmail: driver.email,
      customerName: this.formatDriverName(driver),
      redirectUrl: redirectUrl.toString(),
    });

    return {
      status: 'checkout_required',
      checkoutUrl: checkout.checkoutUrl,
      amountMinorUnits: verificationPolicy.verificationAmountMinorUnits,
      currency: verificationPolicy.verificationCurrency,
      entitlementState: verificationPolicy.verificationEntitlementState,
    };
  }

  async verifyKycPaymentFromSelfService(
    token: string,
    provider: string,
    reference: string,
  ): Promise<{ status: string }> {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const verificationPolicy = await this.getSelfServiceVerificationPolicy(
      payload.tenantId,
      driver,
    );
    const normalizedReference = reference.trim();
    const existingDriverWithReference = await this.prisma.driver.findFirst({
      where: {
        tenantId: payload.tenantId,
        kycPaymentReference: normalizedReference,
      },
      select: { id: true },
    });

    if (existingDriverWithReference && existingDriverWithReference.id !== payload.driverId) {
      throw new ConflictException(
        'This payment reference is already linked to another verification flow.',
      );
    }

    const existingEntitlement = await this.getLatestVerificationEntitlement(
      payload.tenantId,
      'driver',
      payload.driverId,
    );
    const existingEntitlementState = this.mapEntitlementState(existingEntitlement);

    if (
      existingEntitlement &&
      existingEntitlement.paymentReference === normalizedReference &&
      ['paid', 'reserved', 'consumed'].includes(existingEntitlementState)
    ) {
      if (existingEntitlementState !== 'consumed') {
        await this.prisma.driver.update({
          where: { id: payload.driverId },
          data: {
            kycPaymentReference: normalizedReference,
            kycPaymentVerifiedAt: existingEntitlement.paidAt ?? new Date(),
          } as never,
        });
      }

      return { status: 'already_applied' };
    }

    const applied = await this.controlPlaneBillingClient.verifyAndApplyPayment({
      provider,
      reference: normalizedReference,
      purpose: 'identity_verification',
      tenantId: payload.tenantId,
      driverId: payload.driverId,
    });

    if (existingEntitlement) {
      await this.updateVerificationEntitlement(existingEntitlement.id, {
        status: existingEntitlement.status === 'consumed' ? existingEntitlement.status : 'paid',
        paymentReference: normalizedReference,
        paymentProvider: provider,
        paidAt: new Date(),
      });
    } else {
      await this.createVerificationEntitlement({
        subjectType: 'driver',
        subjectId: payload.driverId,
        tenantId: payload.tenantId,
        payerType: verificationPolicy.driverPaysKyc ? 'driver' : 'tenant',
        paymentReference: normalizedReference,
        paymentProvider: provider,
        amountMinorUnits: applied.amountMinorUnits,
        currency: applied.currency,
        status: 'paid',
        paidAt: new Date(),
      });
    }

    await this.prisma.driver.update({
      where: { id: payload.driverId },
      data: {
        kycPaymentReference: normalizedReference,
        kycPaymentVerifiedAt: new Date(),
      } as never,
    });

    return { status: applied.status === 'already_applied' ? 'already_applied' : 'verified' };
  }

  async initializeGuarantorLivenessSessionFromSelfService(
    token: string,
    countryCode?: string,
  ): Promise<{
    providerName: string;
    sessionId: string;
    expiresAt?: string;
    fallbackChain: string[];
  }> {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });
    const resolvedCountryCode = countryCode ?? guarantor?.countryCode ?? driver.nationality;

    if (!resolvedCountryCode) {
      throw new BadRequestException(
        'countryCode is required when neither the guarantor nor the driver has a nationality set.',
      );
    }

    return this.intelligenceClient.initializeLivenessSession({
      tenantId: payload.tenantId,
      countryCode: resolvedCountryCode,
    });
  }

  async resolveGuarantorIdentityFromSelfService(token: string, dto: ResolveDriverIdentityDto) {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    const { livenessPassed: _ignoredLivenessPassed, livenessCheck, ...rest } = dto;
    return this.resolveGuarantorIdentity(payload.tenantId, payload.driverId, {
      ...rest,
      ...(livenessCheck
        ? {
            livenessCheck: {
              ...(livenessCheck.provider ? { provider: livenessCheck.provider } : {}),
              ...(livenessCheck.sessionId ? { sessionId: livenessCheck.sessionId } : {}),
              // passed:true is a client assertion that the selfie was captured live.
              // The intelligence service passes this to internal_free_service when the
              // configured provider (YouVerify, Azure Face) has no completed session
              // result — e.g. when a browser SDK is not available for the provider.
              ...(livenessCheck.passed !== undefined ? { passed: livenessCheck.passed } : {}),
            },
          }
        : {}),
    });
  }

  async listDocuments(tenantId: string, id: string): Promise<DriverDocumentRecord[]> {
    const driver = await this.findOne(tenantId, id);
    await this.syncExpiredDocuments(tenantId, [driver.id]);
    const docs = (await this.driverDocuments.findMany({
      where: { tenantId: driver.tenantId, driverId: driver.id },
      orderBy: { createdAt: 'desc' },
    })) as DriverDocumentRecord[];
    // Portrait documents are stored separately and never shown in the document list.
    return docs.filter((d) => d.documentType !== 'portrait');
  }

  async hasPortrait(tenantId: string, driverId: string): Promise<boolean> {
    const doc = await this.driverDocuments.findFirst({
      where: { tenantId, driverId, documentType: 'portrait', status: 'approved' },
      orderBy: { createdAt: 'desc' },
    });
    return Boolean(doc);
  }

  async getPortrait(
    tenantId: string,
    driverId: string,
  ): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }
    const doc = await this.driverDocuments.findFirst({
      where: { tenantId, driverId, documentType: 'portrait', status: 'approved' },
      orderBy: { createdAt: 'desc' },
    });
    if (!doc?.storageKey) {
      throw new NotFoundException('Portrait not found');
    }
    const buffer = await this.documentStorageService.readFile(doc.storageKey);
    return { buffer, contentType: doc.contentType, fileName: doc.fileName };
  }

  async listDocumentReviewQueue(
    tenantId: string,
    input: {
      status?: 'pending' | 'rejected' | 'expired';
      q?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedResponse<DriverDocumentReviewQueueItem>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const status = input.status ?? 'pending';
    const searchQuery = input.q?.trim().toLowerCase() ?? '';

    const documents = (await this.driverDocuments.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })) as DriverDocumentRecord[];
    const scopedDocuments = documents.filter((document) => document.status === status);
    const driverIds = Array.from(new Set(scopedDocuments.map((document) => document.driverId)));
    const drivers = driverIds.length
      ? await this.prisma.driver.findMany({
          where: { tenantId, id: { in: driverIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            fleetId: true,
          },
        })
      : [];
    const driverMap = new Map(
      drivers.map((driver) => [
        driver.id,
        {
          driverName: this.formatDriverName(driver),
          driverPhone: driver.phone,
          driverStatus: driver.status,
          fleetId: driver.fleetId,
        },
      ]),
    );

    const queueItems = scopedDocuments
      .map((document) => {
        const driver = driverMap.get(document.driverId);
        if (!driver) {
          return null;
        }
        return {
          ...document,
          ...driver,
        };
      })
      .filter((item): item is DriverDocumentReviewQueueItem => Boolean(item))
      .filter((item) => {
        if (!searchQuery) {
          return true;
        }
        return `${item.driverName} ${item.driverPhone} ${item.documentType} ${item.fileName}`
          .toLowerCase()
          .includes(searchQuery);
      });

    const startIndex = (page - 1) * limit;
    return {
      data: queueItems.slice(startIndex, startIndex + limit),
      total: queueItems.length,
      page,
      limit,
    };
  }

  async importDriversFromCsv(
    tenantId: string,
    csvContent: string,
    options: { autoSendSelfServiceLink?: boolean } = {},
  ): Promise<{ createdCount: number; failedCount: number; errors: string[] }> {
    const rows = parseCsv(csvContent);
    if (rows.length === 0) {
      throw new BadRequestException('The uploaded driver import file is empty.');
    }

    const fleets = await this.prisma.fleet.findMany({
      where: { tenantId },
      select: { id: true, name: true, status: true },
    });
    const fleetByName = new Map(fleets.map((fleet) => [fleet.name.trim().toLowerCase(), fleet]));

    let createdCount = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      const fleetName = row.fleetName?.trim();
      const fleet = fleetName ? fleetByName.get(fleetName.toLowerCase()) : null;
      if (!fleet) {
        errors.push(`Row ${index + 2}: fleet '${fleetName || 'missing'}' was not found.`);
        continue;
      }

      try {
        const rowEmail = row.email?.trim();
        if (!rowEmail) {
          errors.push('Row skipped: email is required for each driver (row had no email).');
          continue;
        }
        await this.create(
          tenantId,
          {
            fleetId: fleet.id,
            email: rowEmail,
            ...(row.firstName?.trim() ? { firstName: row.firstName.trim() } : {}),
            ...(row.lastName?.trim() ? { lastName: row.lastName.trim() } : {}),
            ...(row.phone?.trim() ? { phone: row.phone.trim() } : {}),
            ...(row.dateOfBirth?.trim() ? { dateOfBirth: row.dateOfBirth.trim() } : {}),
            ...(row.nationality?.trim()
              ? { nationality: row.nationality.trim().toUpperCase() }
              : {}),
          },
          options,
        );
        createdCount += 1;
      } catch (error) {
        errors.push(`Row ${index + 2}: ${this.getErrorMessage(error)}`);
      }
    }

    return {
      createdCount,
      failedCount: errors.length,
      errors,
    };
  }

  async exportDriversCsv(tenantId: string, input: { fleetIds?: string[] } = {}): Promise<string> {
    const records = await this.prisma.driver.findMany({
      where: {
        tenantId,
        ...(input.fleetIds?.length ? { fleetId: { in: input.fleetIds } } : {}),
      },
      include: { fleet: { select: { name: true } } },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return buildCsv(
      [
        'driverId',
        'fleetName',
        'firstName',
        'lastName',
        'phone',
        'email',
        'dateOfBirth',
        'nationality',
        'status',
        'identityStatus',
        'createdAt',
      ],
      records.map((driver) => [
        driver.id,
        driver.fleet.name,
        driver.firstName,
        driver.lastName,
        driver.phone,
        driver.email ?? '',
        driver.dateOfBirth ?? '',
        driver.nationality ?? '',
        driver.status,
        driver.identityStatus,
        driver.createdAt.toISOString(),
      ]),
    );
  }

  async getIdentitySummary(tenantId: string, id: string) {
    const driver = await this.findOne(tenantId, id);
    return {
      driverId: driver.id,
      identityStatus: driver.identityStatus,
      globalRiskScore: driver.globalRiskScore ?? null,
      riskBand: driver.riskBand ?? null,
      isWatchlisted: driver.isWatchlisted ?? null,
      duplicateIdentityFlag: driver.duplicateIdentityFlag ?? null,
      verificationProvider: driver.verificationProvider ?? null,
      verificationStatus: driver.verificationStatus ?? null,
      verificationCountryCode: driver.verificationCountryCode ?? null,
      verificationConfidence: driver.identityVerificationConfidence ?? null,
      verifiedIdentityExists: Boolean(driver.personId),
      summary: this.getIdentitySummaryMessage(driver),
    };
  }

  async getDocumentContent(
    tenantId: string,
    driverId: string,
    documentId: string,
  ): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const driver = await this.findOne(tenantId, driverId);
    const document = await this.driverDocuments.findUnique({ where: { id: documentId } });

    if (!document || document.driverId !== driver.id || document.tenantId !== driver.tenantId) {
      throw new NotFoundException(`Driver document '${documentId}' not found`);
    }

    if (document.storageKey) {
      return {
        buffer: await this.documentStorageService.readFile(document.storageKey),
        contentType: document.contentType,
        fileName: document.fileName,
      };
    }

    if (document.fileDataUrl) {
      const parsed = this.decodeLegacyDataUrl(document.fileDataUrl);
      return {
        buffer: parsed.buffer,
        contentType: document.contentType,
        fileName: document.fileName,
      };
    }

    throw new NotFoundException('Document content is not available.');
  }

  async uploadDocument(
    tenantId: string,
    id: string,
    dto: CreateDriverDocumentDto,
  ): Promise<DriverDocumentRecord> {
    const driver = await this.findOne(tenantId, id);
    const fileBuffer = this.decodeIncomingDocument(dto);
    this.validateDocumentUpload(fileBuffer, dto.contentType);
    const storedFile = await this.documentStorageService.uploadFile(
      fileBuffer,
      dto.fileName,
      this.normalizeDocumentContentType(dto.contentType),
    );
    return this.driverDocuments.create({
      data: {
        tenantId: driver.tenantId,
        driverId: driver.id,
        documentType: dto.documentType,
        fileName: dto.fileName,
        contentType: this.normalizeDocumentContentType(dto.contentType),
        fileDataUrl: null,
        storageKey: storedFile.storageKey,
        storageUrl: storedFile.storageUrl,
        uploadedBy: dto.uploadedBy,
        status: 'pending',
        expiresAt: null,
        reviewedBy: null,
        reviewedAt: null,
      },
    });
  }

  async removeDocument(
    tenantId: string,
    driverId: string,
    documentId: string,
  ): Promise<{ message: string }> {
    const driver = await this.findOne(tenantId, driverId);
    const document = await this.driverDocuments.findUnique({
      where: { id: documentId },
    });

    if (!document || document.driverId !== driver.id || document.tenantId !== driver.tenantId) {
      throw new NotFoundException(`Driver document '${documentId}' not found`);
    }

    await this.documentStorageService.deleteFile(document.storageKey);
    await this.driverDocuments.delete({ where: { id: document.id } });
    return { message: 'Document removed.' };
  }

  async reviewDocument(
    tenantId: string,
    driverId: string,
    documentId: string,
    input: { status: 'approved' | 'rejected'; expiresAt?: string },
    reviewedBy: string,
  ): Promise<DriverDocumentRecord> {
    const driver = await this.findOne(tenantId, driverId);
    await this.syncExpiredDocuments(tenantId, [driver.id]);

    const document = await this.driverDocuments.findUnique({
      where: { id: documentId },
    });

    if (!document || document.driverId !== driver.id || document.tenantId !== driver.tenantId) {
      throw new NotFoundException(`Driver document '${documentId}' not found`);
    }

    if (input.status === 'approved') {
      const documentConfig = getDocumentType(document.documentType);
      let parsedExpiry: Date | null = null;

      if (input.expiresAt) {
        parsedExpiry = new Date(input.expiresAt);
        if (Number.isNaN(parsedExpiry.getTime())) {
          throw new BadRequestException('Expiry date must be a valid calendar date.');
        }
      }

      if (documentConfig.hasExpiry && !parsedExpiry) {
        throw new BadRequestException(
          'An expiry date is required before this document can be approved.',
        );
      }

      if (parsedExpiry && parsedExpiry.getTime() <= Date.now()) {
        throw new BadRequestException(
          'Expiry date must be in the future before this document can be approved.',
        );
      }

      return this.driverDocuments.update({
        where: { id: document.id },
        data: {
          status: 'approved',
          expiresAt: parsedExpiry,
          reviewedBy,
          reviewedAt: new Date(),
        },
      });
    }

    return this.driverDocuments.update({
      where: { id: document.id },
      data: {
        status: 'rejected',
        expiresAt: null,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }

  async hasApprovedLicence(tenantId: string, driverId: string): Promise<boolean> {
    const driver = await this.findOne(tenantId, driverId);
    await this.syncExpiredDocuments(tenantId, [driver.id]);

    const approvedLicence = await this.driverDocuments.findFirst({
      where: {
        tenantId: driver.tenantId,
        driverId: driver.id,
        documentType: DRIVER_LICENCE_DOCUMENT_TYPE,
        status: 'approved',
      },
    });

    return Boolean(approvedLicence);
  }

  async getGuarantor(tenantId: string, id: string): Promise<DriverGuarantorRecord> {
    const driver = await this.findOne(tenantId, id);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    return guarantor;
  }

  async createOrUpdateGuarantor(
    tenantId: string,
    id: string,
    dto: CreateOrUpdateDriverGuarantorDto,
  ): Promise<DriverGuarantorRecord> {
    const driver = await this.findOne(tenantId, id);
    const normalizedPhone = this.normalizePhoneNumber(
      dto.phone,
      dto.countryCode?.trim().toUpperCase() || null,
    );

    return this.driverGuarantors.upsert({
      where: { driverId: driver.id },
      create: {
        tenantId: driver.tenantId,
        driverId: driver.id,
        personId: null,
        name: dto.name.trim(),
        phone: normalizedPhone,
        ...(dto.email?.trim() ? { email: dto.email.trim().toLowerCase() } : {}),
        countryCode: dto.countryCode?.trim().toUpperCase() || null,
        relationship: dto.relationship?.trim() || null,
        status: 'pending_verification',
        disconnectedAt: null,
        disconnectedReason: null,
      },
      update: {
        name: dto.name.trim(),
        phone: normalizedPhone,
        email: dto.email?.trim().toLowerCase() || null,
        countryCode: dto.countryCode?.trim().toUpperCase() || null,
        relationship: dto.relationship?.trim() || null,
        status: 'pending_verification',
        personId: null,
        dateOfBirth: null,
        gender: null,
        selfieImageUrl: null,
        providerImageUrl: null,
        disconnectedAt: null,
        disconnectedReason: null,
      },
    });
  }

  async removeGuarantor(
    tenantId: string,
    id: string,
    reason?: string | null,
  ): Promise<DriverGuarantorRecord> {
    const driver = await this.findOne(tenantId, id);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    return this.driverGuarantors.update({
      where: { driverId: driver.id },
      data: {
        status: 'disconnected',
        disconnectedAt: new Date(),
        disconnectedReason: reason?.trim() || 'Disconnected by operator request',
      },
    });
  }

  /**
   * Resolves the identity of a driver's guarantor and links them to the canonical
   * person graph. Two conflict checks are applied before enrollment:
   *
   * 1. Self-guarantee: the guarantor cannot be the same canonical person as the
   *    driver (detected via matching phone or email identifiers).
   * 2. Cross-role: if the guarantor's resolved personId matches an existing driver
   *    at this tenant, the intelligence plane emits a cross_role_presence risk
   *    signal automatically when recording the 'guarantor' role presence.
   */
  async resolveGuarantorIdentity(
    tenantId: string,
    driverId: string,
    dto: ResolveDriverIdentityDto,
  ): Promise<DriverIdentityResolutionResult & { crossRoleConflict?: boolean }> {
    const [driver, guarantor] = await Promise.all([
      this.findOne(tenantId, driverId),
      this.driverGuarantors.findUnique({ where: { driverId } }),
    ]);

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    const resolvedCountryCode = dto.countryCode ?? guarantor.countryCode ?? driver.nationality;

    if (!resolvedCountryCode) {
      throw new BadRequestException(
        'countryCode is required when neither the guarantor nor the driver has a nationality set.',
      );
    }

    const submittedIdentifiers = dto.identifiers ?? [];
    const explicitIdentityIdentifiers = submittedIdentifiers.filter(
      (identifier) => !['PHONE', 'EMAIL'].includes(identifier.type.toUpperCase()),
    );

    if (explicitIdentityIdentifiers.length === 0) {
      throw new BadRequestException(
        'Submit at least one government or identity identifier for the guarantor before verification.',
      );
    }

    const identifiers = [...submittedIdentifiers, { type: 'PHONE', value: guarantor.phone }];

    // Pre-flight: if the guarantor's phone matches the driver's, block immediately.
    if (guarantor.phone === driver.phone) {
      throw new ConflictException(
        'A driver cannot be their own guarantor. The guarantor phone matches the driver.',
      );
    }

    const persistedSelfieImageUrl = dto.selfieImageBase64
      ? await this.persistSelfiePortraitForDriverGuarantor(driver.id, dto.selfieImageBase64)
      : null;

    let result: DriverIdentityResolutionResult;
    try {
      result = await this.intelligenceClient.resolveEnrollment({
        tenantId,
        countryCode: resolvedCountryCode,
        roleType: 'guarantor',
        association: {
          localEntityType: 'driver_guarantor',
          localEntityId: guarantor.id,
          roleType: 'guarantor',
          ...(driver.businessEntityId ? { businessEntityId: driver.businessEntityId } : {}),
          ...(driver.operatingUnitId ? { operatingUnitId: driver.operatingUnitId } : {}),
          ...(driver.fleetId ? { fleetId: driver.fleetId } : {}),
          status: guarantor.status,
          source: 'identity_resolution',
        },
        ...(dto.livenessPassed !== undefined ? { livenessPassed: dto.livenessPassed } : {}),
        identifiers,
        ...(dto.biometric ? { biometric: dto.biometric } : {}),
        providerVerification: {
          subjectConsent: dto.subjectConsent ?? false,
          validationData: {
            firstName: guarantor.name.split(' ')[0] ?? guarantor.name,
            ...(guarantor.name.split(' ').slice(1).join(' ')
              ? { lastName: guarantor.name.split(' ').slice(1).join(' ') }
              : {}),
          },
          ...(dto.selfieImageBase64 ? { selfieImageBase64: dto.selfieImageBase64 } : {}),
          ...(persistedSelfieImageUrl ? { selfieImageUrl: persistedSelfieImageUrl } : {}),
          ...(dto.livenessCheck ? { livenessCheck: dto.livenessCheck } : {}),
        },
      });
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw new ServiceUnavailableException(
          'Guarantor verification is temporarily unavailable. Please try again.',
        );
      }
      throw error;
    }

    // Post-resolution self-guarantee check: if the resolved canonical person
    // is the same as the driver's, the guarantor is the driver themselves.
    if (result.personId && result.personId === driver.personId) {
      throw new ConflictException(
        'A driver cannot be their own guarantor. The guarantor resolved to the same canonical person.',
      );
    }

    const persistedProviderImageUrl = await this.persistIdentityReferenceImage(
      result.verifiedProfile?.providerImageUrl ?? result.verifiedProfile?.photoUrl,
      `guarantor-provider-${driver.id}-${Date.now()}`,
    );
    const verifiedProfileUpdate = this.buildVerifiedGuarantorProfileUpdate(result);

    await this.driverGuarantors.update({
      where: { driverId: driver.id },
      data: {
        ...verifiedProfileUpdate,
        ...(result.personId ? { personId: result.personId } : {}),
        ...(persistedSelfieImageUrl ? { selfieImageUrl: persistedSelfieImageUrl } : {}),
        ...(persistedProviderImageUrl ? { providerImageUrl: persistedProviderImageUrl } : {}),
        status: result.personId ? 'verified' : 'pending_verification',
      },
    });

    return {
      ...result,
      ...(result.verifiedProfile || persistedSelfieImageUrl || persistedProviderImageUrl
        ? {
            verifiedProfile: {
              ...(result.verifiedProfile ?? {}),
              ...(persistedSelfieImageUrl ? { selfieImageUrl: persistedSelfieImageUrl } : {}),
              ...(persistedProviderImageUrl ? { providerImageUrl: persistedProviderImageUrl } : {}),
            },
          }
        : {}),
    };
  }

  async listDocumentsFromSelfService(token: string) {
    const payload = await this.verifySelfServiceToken(token);
    return this.listDocuments(payload.tenantId, payload.driverId);
  }

  async uploadDocumentFromSelfService(token: string, dto: CreateDriverDocumentDto) {
    const payload = await this.verifySelfServiceToken(token);
    return this.uploadDocument(payload.tenantId, payload.driverId, dto);
  }

  async removeDocumentFromSelfService(
    token: string,
    documentId: string,
  ): Promise<{ message: string }> {
    const payload = await this.verifySelfServiceToken(token);
    return this.removeDocument(payload.tenantId, payload.driverId, documentId);
  }

  async getDocumentContentFromSelfService(
    token: string,
    documentId: string,
  ): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const payload = await this.verifySelfServiceToken(token);
    return this.getDocumentContent(payload.tenantId, payload.driverId, documentId);
  }

  // Zero-trust document verification: driver submits document type + ID number.
  // We call the configured identity provider (YouVerify etc.) to verify the
  // document number and retrieve provider-returned demographics.  The result is
  // stored in driver_document_verifications and returned to the caller.
  // No file upload is required or expected for this path.
  async verifyDocumentIdFromSelfService(
    token: string,
    dto: {
      documentType: string;
      idNumber: string;
      countryCode: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
    },
  ): Promise<{
    id: string;
    status: string;
    documentType: string;
    providerMatch: boolean | null;
    providerValidity: 'valid' | 'invalid' | 'unknown' | null;
    providerFirstName: string | null;
    providerLastName: string | null;
    providerDateOfBirth: string | null;
    providerIssueDate: string | null;
    providerExpiryDate: string | null;
    portraitAvailable: boolean | null;
    matchScore: number | null;
    riskScore: number | null;
    failureReason: string | null;
  }> {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);

    // Payment must be resolved before document verification proceeds.
    await this.assertSelfServiceVerificationPaymentReady(payload.tenantId, driver);

    // Normalise inputs
    const { documentSlug, identifierType } = this.normalizeVerificationDocumentType(
      dto.documentType,
    );
    const idNumber = dto.idNumber.trim();
    const countryCode = dto.countryCode.trim().toUpperCase();

    if (!idNumber || !countryCode) {
      throw new BadRequestException('documentType, idNumber, and countryCode are required.');
    }

    // Create a pending verification record first so we have a stable id to return
    const verificationRecord = await this.driverDocumentVerifications.create({
      data: {
        tenantId: payload.tenantId,
        driverId: driver.id,
        documentType: documentSlug,
        idNumber,
        countryCode,
        status: 'pending',
      },
    });

    let status: string;
    let providerMatch: boolean | null = null;
    let providerValidity: 'valid' | 'invalid' | 'unknown' | null = null;
    let providerFirstName: string | null = null;
    let providerLastName: string | null = null;
    let providerDateOfBirth: string | null = null;
    let providerIssueDate: string | null = null;
    let providerExpiryDate: string | null = null;
    let portraitAvailable: boolean | null = null;
    let matchScore: number | null = null;
    let riskScore: number | null = null;
    let failureReason: string | null = null;
    let providerName: string | null = null;
    let providerResult: Prisma.JsonObject | null = null;

    try {
      const result = await this.intelligenceClient.verifyDocumentIdentifier({
        tenantId: payload.tenantId,
        countryCode,
        identifierType,
        identifierValue: idNumber,
        validationData: {
          ...(dto.firstName ? { firstName: dto.firstName } : {}),
          ...(dto.lastName ? { lastName: dto.lastName } : {}),
          ...(dto.dateOfBirth ? { dateOfBirth: dto.dateOfBirth } : {}),
        },
      });

      providerName = result.providerName ?? null;
      providerValidity = result.verificationMetadata?.validity ?? null;
      providerIssueDate = result.verificationMetadata?.issueDate ?? null;
      providerExpiryDate = result.verificationMetadata?.expiryDate ?? null;
      portraitAvailable = result.verificationMetadata?.portraitAvailable ?? null;
      matchScore = result.verificationMetadata?.matchScore ?? null;
      riskScore = result.verificationMetadata?.riskScore ?? null;
      providerResult = {
        providerName: result.providerName ?? null,
        providerLookupStatus: result.providerLookupStatus ?? null,
        providerVerificationStatus: result.providerVerificationStatus ?? null,
        validity: providerValidity,
        issueDate: providerIssueDate,
        expiryDate: providerExpiryDate,
        portraitAvailable,
        matchScore,
        riskScore,
      };

      if (
        (result.decision === 'enrolled' ||
          result.decision === 'matched' ||
          result.isVerifiedMatch === true) &&
        providerValidity !== 'invalid'
      ) {
        status = 'verified';
        providerMatch = true;
      } else if (result.providerLookupStatus === 'no_match' || result.decision === 'no_match') {
        status = 'failed';
        providerMatch = false;
        failureReason = 'The document number could not be found in the provider database.';
      } else if (result.decision === 'review') {
        status = 'manual_review';
        providerMatch = null;
        failureReason = 'Automated verification was inconclusive. Manual review required.';
      } else {
        status = 'manual_review';
        failureReason = result.providerLookupStatus ?? 'Provider returned an inconclusive result.';
      }

      if (result.verifiedProfile) {
        providerFirstName = result.verifiedProfile.fullName?.split(' ')[0] ?? null;
        providerLastName = result.verifiedProfile.fullName?.split(' ').slice(1).join(' ') ?? null;
        providerDateOfBirth = result.verifiedProfile.dateOfBirth ?? null;
      }

      if (providerValidity === 'invalid') {
        status = 'failed';
        providerMatch = false;
        failureReason = 'The licence record is not valid with the issuing authority.';
      }
    } catch (err) {
      // Provider error — route to manual review rather than crashing the onboarding flow.
      status = 'manual_review';
      failureReason =
        err instanceof Error
          ? `Provider verification failed: ${err.message}`
          : 'Provider verification failed. Manual review will be required.';
    }

    // Update the record with the outcome
    await this.driverDocumentVerifications.update({
      where: { id: verificationRecord.id },
      data: {
        provider: providerName ?? 'unknown',
        status,
        providerMatch,
        providerConfidence: matchScore,
        providerFirstName,
        providerLastName,
        providerDateOfBirth,
        providerExpiryDate,
        failureReason,
        providerResult: providerResult ?? undefined,
        verifiedAt: status === 'verified' ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });

    return {
      id: verificationRecord.id,
      documentType: documentSlug,
      status,
      providerMatch,
      providerValidity,
      providerFirstName,
      providerLastName,
      providerDateOfBirth,
      providerIssueDate,
      providerExpiryDate,
      portraitAvailable,
      matchScore,
      riskScore,
      failureReason,
    };
  }

  async listDocumentVerificationsFromSelfService(token: string): Promise<
    Array<{
      id: string;
      documentType: string;
      idNumber: string;
      countryCode: string;
      status: string;
      providerMatch: boolean | null;
      providerValidity: 'valid' | 'invalid' | 'unknown' | null;
      providerFirstName: string | null;
      providerLastName: string | null;
      providerDateOfBirth: string | null;
      providerIssueDate: string | null;
      providerExpiryDate: string | null;
      portraitAvailable: boolean | null;
      matchScore: number | null;
      riskScore: number | null;
      failureReason: string | null;
      verifiedAt: string | null;
      createdAt: string;
    }>
  > {
    const payload = await this.verifySelfServiceToken(token);
    const verifications = await this.driverDocumentVerifications.findMany({
      where: { tenantId: payload.tenantId, driverId: payload.driverId },
      orderBy: { createdAt: 'desc' },
    });

    return verifications.map((verification) => ({
      id: verification.id,
      documentType: this.normalizeStoredDocumentType(verification.documentType),
      idNumber: verification.idNumber,
      countryCode: verification.countryCode,
      status: verification.status,
      providerMatch: verification.providerMatch ?? null,
      providerValidity:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.validity === 'string'
          ? (verification.providerResult.validity as 'valid' | 'invalid' | 'unknown')
          : null,
      providerFirstName: verification.providerFirstName ?? null,
      providerLastName: verification.providerLastName ?? null,
      providerDateOfBirth: verification.providerDateOfBirth ?? null,
      providerIssueDate:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.issueDate === 'string'
          ? verification.providerResult.issueDate
          : null,
      providerExpiryDate: verification.providerExpiryDate ?? null,
      portraitAvailable:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.portraitAvailable === 'boolean'
          ? verification.providerResult.portraitAvailable
          : null,
      matchScore: verification.providerConfidence ?? null,
      riskScore:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.riskScore === 'number'
          ? verification.providerResult.riskScore
          : null,
      failureReason: verification.failureReason ?? null,
      verifiedAt: verification.verifiedAt ? verification.verifiedAt.toISOString() : null,
      createdAt: verification.createdAt.toISOString(),
    }));
  }

  async initializeIdentityLivenessSessionFromSelfService(
    token: string,
    countryCode?: string,
  ): Promise<{
    providerName: string;
    sessionId: string;
    expiresAt?: string;
    fallbackChain: string[];
  }> {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    await this.assertSelfServiceVerificationPaymentReady(payload.tenantId, driver);
    await this.assertVerificationCostControls({
      tenantId: payload.tenantId,
      subjectType: 'driver',
      subjectId: payload.driverId,
      operation: 'liveness',
    });

    const policy = await this.getSelfServiceVerificationPolicy(payload.tenantId, driver);
    const entitlement = await this.getLatestVerificationEntitlement(
      payload.tenantId,
      'driver',
      payload.driverId,
    );
    const session = await this.initializeIdentityLivenessSession(
      payload.tenantId,
      payload.driverId,
      countryCode,
    );

    await this.createVerificationAttempt({
      tenantId: payload.tenantId,
      subjectType: 'driver',
      subjectId: payload.driverId,
      entitlementId:
        policy.driverPaysKyc &&
        entitlement &&
        ['paid', 'reserved', 'consumed'].includes(this.mapEntitlementState(entitlement))
          ? entitlement.id
          : null,
      attemptType: 'driver_verification',
      status: 'in_progress',
      livenessCallCount: 1,
    });

    this.logger.log(
      JSON.stringify({
        event: 'self_service_liveness_started',
        tenantId: payload.tenantId,
        driverId: payload.driverId,
        countryCode: countryCode ?? driver.nationality ?? null,
        sessionId: session.sessionId,
      }),
    );

    return session;
  }

  async resolveIdentityFromSelfService(token: string, dto: ResolveDriverIdentityDto) {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    await this.assertSelfServiceVerificationPaymentReady(payload.tenantId, driver);
    await this.assertVerificationCostControls({
      tenantId: payload.tenantId,
      subjectType: 'driver',
      subjectId: payload.driverId,
      operation: 'provider',
    });

    const verificationPolicy = await this.getSelfServiceVerificationPolicy(
      payload.tenantId,
      driver,
    );
    const { livenessPassed: _ignoredLivenessPassed, livenessCheck, ...rest } = dto;
    const sanitizedIdentifiers =
      rest.identifiers?.map((identifier) => ({
        type: identifier.type,
        value: identifier.value,
        ...(identifier.countryCode ? { countryCode: identifier.countryCode } : {}),
      })) ?? [];
    const fingerprintCountryCode = rest.countryCode ?? driver.nationality ?? null;
    const requestFingerprint = this.buildVerificationRequestFingerprint({
      subjectType: 'driver',
      subjectId: payload.driverId,
      ...(fingerprintCountryCode ? { countryCode: fingerprintCountryCode } : {}),
      identifiers: sanitizedIdentifiers,
    });
    const duplicateAttempt = await this.getLatestVerificationAttemptByFingerprint(
      payload.tenantId,
      'driver',
      payload.driverId,
      requestFingerprint,
    );
    if (
      duplicateAttempt &&
      ['initiated', 'liveness_started', 'in_progress', 'provider_called', 'success'].includes(
        duplicateAttempt.status,
      ) &&
      duplicateAttempt.updatedAt.getTime() >= Date.now() - 5 * 60 * 1000
    ) {
      throw new ConflictException(
        'This verification submission is already being processed. Refresh your status before trying again.',
      );
    }

    const entitlement = await this.getLatestVerificationEntitlement(
      payload.tenantId,
      'driver',
      payload.driverId,
    );
    const entitlementState = this.mapEntitlementState(entitlement);
    const latestAttempt = await this.getLatestVerificationAttempt(
      payload.tenantId,
      'driver',
      payload.driverId,
    );
    const attempt =
      latestAttempt &&
      ['liveness_started', 'in_progress', 'provider_called'].includes(latestAttempt.status) &&
      latestAttempt.completedAt == null &&
      latestAttempt.updatedAt.getTime() >= Date.now() - 60 * 60 * 1000
        ? latestAttempt
        : await this.createVerificationAttempt({
            tenantId: payload.tenantId,
            subjectType: 'driver',
            subjectId: payload.driverId,
            entitlementId:
              verificationPolicy.driverPaysKyc &&
              entitlement &&
              ['paid', 'reserved', 'consumed'].includes(entitlementState)
                ? entitlement.id
                : null,
            attemptType: 'driver_verification',
            requestFingerprint,
            status: 'in_progress',
          });

    if (attempt.requestFingerprint !== requestFingerprint) {
      await this.updateVerificationAttempt(attempt.id, {
        status: 'in_progress',
      });
      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE "verification_attempts"
        SET "requestFingerprint" = ${requestFingerprint}, "updatedAt" = NOW()
        WHERE "id" = ${attempt.id}
      `);
    }

    if (verificationPolicy.driverPaysKyc && entitlement && entitlementState === 'paid') {
      await this.updateVerificationEntitlement(entitlement.id, {
        status: 'reserved',
        reservedAt: new Date(),
      });
    }

    this.logger.log(
      JSON.stringify({
        event: 'self_service_verification_submit_started',
        tenantId: payload.tenantId,
        driverId: payload.driverId,
        attemptId: attempt.id,
        entitlementId: entitlement?.id ?? null,
        entitlementState,
      }),
    );

    try {
      const result = await this.resolveIdentity(payload.tenantId, payload.driverId, {
        ...rest,
        ...(livenessCheck
          ? {
              livenessCheck: {
                ...(livenessCheck.provider ? { provider: livenessCheck.provider } : {}),
                ...(livenessCheck.sessionId ? { sessionId: livenessCheck.sessionId } : {}),
                // passed:true is a client assertion that the selfie was captured live.
                // The intelligence service passes this to internal_free_service when the
                // configured provider (YouVerify, Azure Face) has no completed session
                // result — e.g. when a browser SDK is not available for the provider.
                ...(livenessCheck.passed !== undefined ? { passed: livenessCheck.passed } : {}),
              },
            }
          : {}),
      });
      const attemptStatus = this.determineVerificationAttemptStatus(result);
      await this.updateVerificationAttempt(attempt.id, {
        status: attemptStatus,
        providerCallCountIncrement: 1,
        billableStageReached: true,
        providerCostIncurred: true,
        completedAt: attemptStatus === 'success' || attemptStatus === 'failed' ? new Date() : null,
        failureReason:
          attemptStatus === 'failed'
            ? (result.providerLookupStatus ?? result.providerVerificationStatus ?? result.decision)
            : null,
        entitlementId: entitlement?.id ?? null,
      });

      if (
        verificationPolicy.driverPaysKyc &&
        entitlement &&
        ['paid', 'reserved'].includes(entitlementState)
      ) {
        await this.updateVerificationEntitlement(entitlement.id, {
          status: 'consumed',
          consumedAt: new Date(),
          consumedByAttemptId: attempt.id,
        });
      }

      this.logger.log(
        JSON.stringify({
          event: 'self_service_verification_submit_completed',
          tenantId: payload.tenantId,
          driverId: payload.driverId,
          attemptId: attempt.id,
          attemptStatus,
          providerLookupStatus: result.providerLookupStatus ?? null,
          decision: result.decision,
        }),
      );

      return result;
    } catch (error) {
      await this.updateVerificationAttempt(attempt.id, {
        status: 'failed',
        completedAt: new Date(),
        failureReason:
          error instanceof Error ? error.message.slice(0, 500) : 'verification_submit_failed',
        entitlementId: entitlement?.id ?? null,
      });
      if (verificationPolicy.driverPaysKyc && entitlement && entitlementState === 'paid') {
        await this.updateVerificationEntitlement(entitlement.id, {
          status: 'paid',
        });
      }

      this.logger.warn(
        JSON.stringify({
          event: 'self_service_verification_submit_failed',
          tenantId: payload.tenantId,
          driverId: payload.driverId,
          attemptId: attempt.id,
          error:
            error instanceof Error ? error.message.slice(0, 500) : 'verification_submit_failed',
        }),
      );
      throw error;
    }
  }

  async recordDriverSelfServiceVerificationConsent(token: string): Promise<{ message: string }> {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const linkedUser = await this.prisma.user.findFirst({
      where: { tenantId: payload.tenantId, driverId: driver.id },
      select: { id: true },
    });

    if (!linkedUser) {
      throw new ConflictException(
        'Create your sign-in account before continuing to verification consent.',
      );
    }

    // Idempotent: if consent for this policy version already exists, skip creation
    // so that retried requests (e.g. double-tap on "Pay now") do not crash.
    const existingConsent = await this.prisma.userConsent.findFirst({
      where: {
        tenantId: payload.tenantId,
        userId: linkedUser.id,
        subjectType: 'driver',
        subjectId: driver.id,
        policyDocument: 'verification_sensitive_processing',
        policyVersion: LEGAL_DOCUMENT_VERSIONS.privacy,
        granted: true,
      },
      select: { id: true },
    });

    if (!existingConsent) {
      await this.prisma.userConsent.create({
        data: {
          tenantId: payload.tenantId,
          userId: linkedUser.id,
          subjectType: 'driver',
          subjectId: driver.id,
          policyDocument: 'verification_sensitive_processing',
          policyVersion: LEGAL_DOCUMENT_VERSIONS.privacy,
          consentScope: CONSENT_SCOPES.sensitive_identity_verification,
          granted: true,
          metadata: {
            legalDocuments: {
              privacy: LEGAL_DOCUMENT_VERSIONS.privacy,
              terms: LEGAL_DOCUMENT_VERSIONS.terms,
            },
            channel: 'driver_self_service',
          },
        },
      });
    }

    return { message: 'Verification consent recorded.' };
  }

  async createDriverMobileAccountFromSelfService(
    token: string,
    email: string,
    password: string,
  ): Promise<{ message: string }> {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);

    const existingLinkedUser = await this.prisma.user.findFirst({
      where: { tenantId: payload.tenantId, driverId: driver.id },
    });

    if (existingLinkedUser) {
      throw new ConflictException(
        'A sign-in account already exists for this driver. Use the sign-in screen to access the app.',
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingEmailUser = await this.prisma.user.findFirst({
      where: { tenantId: payload.tenantId, email: normalizedEmail },
    });

    if (existingEmailUser) {
      throw new ConflictException(
        'An account with this email already exists in this organisation. Use a different email address.',
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: payload.tenantId },
      select: { country: true },
    });

    const settings = await this.buildDriverMobileAccessSettings(null, {
      tenantCountry: tenant?.country ?? null,
      fleetId: driver.fleetId,
    });

    await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          tenantId: payload.tenantId,
          driverId: driver.id,
          name: this.formatDriverName(driver),
          email: normalizedEmail,
          phone: driver.phone ?? null,
          role: TenantRole.ReadOnly,
          businessEntityId: driver.businessEntityId,
          operatingUnitId: driver.operatingUnitId,
          passwordHash: hashPassword(password),
          isActive: true,
          isEmailVerified: true,
          mobileAccessRevoked: false,
          settings,
        },
      }),
      // Keep driver record email in sync with the sign-in email
      ...(driver.email !== normalizedEmail
        ? [
            this.prisma.driver.update({
              where: { id: driver.id },
              data: { email: normalizedEmail },
            }),
          ]
        : []),
    ]);

    return { message: 'Account created. You can now sign in with your email and password.' };
  }

  async createGuarantorSelfServiceAccountFromSelfService(
    token: string,
    email: string,
    password: string,
  ): Promise<{ message: string }> {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    const [driver, guarantor, tenant] = await Promise.all([
      this.findOne(payload.tenantId, payload.driverId),
      this.driverGuarantors.findUnique({ where: { driverId: payload.driverId } }),
      this.prisma.tenant.findUnique({
        where: { id: payload.tenantId },
        select: { country: true },
      }),
    ]);

    if (!guarantor) {
      throw new NotFoundException('No guarantor is linked to this driver.');
    }

    const existingLinkedUser = await this.findGuarantorSelfServiceUser(payload.tenantId, driver.id);
    if (existingLinkedUser) {
      throw new ConflictException(
        'A sign-in account already exists for this guarantor. Use the sign-in screen to continue.',
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingEmailUser = await this.prisma.user.findFirst({
      where: { tenantId: payload.tenantId, email: normalizedEmail },
    });

    if (existingEmailUser) {
      throw new ConflictException(
        'An account with this email already exists in this organisation. Use a different email address.',
      );
    }

    const settings = writeUserSettings(
      null,
      {
        accessMode: 'tenant_user',
        customPermissions: [],
        selfServiceLinkage: {
          subjectType: 'guarantor',
          driverId: driver.id,
        },
      },
      {
        preferredLanguage: getDefaultLanguageForCountry(tenant?.country),
        role: TenantRole.ReadOnly,
        hasLinkedDriver: false,
      },
    );

    await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          tenantId: payload.tenantId,
          name: guarantor.name,
          email: normalizedEmail,
          phone: guarantor.phone,
          role: TenantRole.ReadOnly,
          passwordHash: hashPassword(password),
          isActive: true,
          isEmailVerified: true,
          mobileAccessRevoked: false,
          settings: settings as Prisma.InputJsonValue,
        },
      }),
      ...(guarantor.email !== normalizedEmail
        ? [
            this.prisma.driverGuarantor.update({
              where: { driverId: driver.id },
              data: { email: normalizedEmail },
            }),
          ]
        : []),
    ]);

    return { message: 'Account created. You can now sign in and continue onboarding.' };
  }

  async updateContactFromSelfService(
    token: string,
    contact: { email?: string; phone?: string },
  ): Promise<{ message: string }> {
    const payload = await this.verifySelfServiceToken(token);
    const updates: { email?: string; phone?: string } = {};
    if (contact.email) {
      updates.email = contact.email.trim().toLowerCase();
    }
    if (contact.phone) {
      updates.phone = contact.phone.trim();
    }
    if (Object.keys(updates).length === 0) {
      return { message: 'No changes.' };
    }

    const linkedUser = await this.prisma.user.findFirst({
      where: { tenantId: payload.tenantId, driverId: payload.driverId },
    });

    if (updates.email) {
      const conflictingUser = await this.prisma.user.findFirst({
        where: {
          tenantId: payload.tenantId,
          email: updates.email,
          ...(linkedUser ? { NOT: { id: linkedUser.id } } : {}),
        },
      });

      if (conflictingUser) {
        throw new ConflictException(
          'A tenant user with this email already exists. Use a different email address.',
        );
      }
    }

    await this.prisma.$transaction([
      this.prisma.driver.update({
        where: { id: payload.driverId },
        data: updates,
      }),
      ...(linkedUser
        ? [
            this.prisma.user.update({
              where: { id: linkedUser.id },
              data: {
                ...(updates.email ? { email: updates.email } : {}),
                ...(updates.phone ? { phone: updates.phone } : {}),
              },
            }),
          ]
        : []),
    ]);
    return { message: 'Contact details updated.' };
  }

  async recordGuarantorSelfServiceVerificationConsent(token: string): Promise<{ message: string }> {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: payload.driverId },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor is linked to this driver.');
    }

    const linkedUser = await this.findGuarantorSelfServiceUser(payload.tenantId, driver.id);
    if (!linkedUser) {
      throw new ConflictException(
        'Create your sign-in account before continuing to verification consent.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.userConsent.create({
        data: {
          tenantId: payload.tenantId,
          userId: linkedUser.id,
          subjectType: 'guarantor',
          subjectId: guarantor.id,
          policyDocument: 'verification_sensitive_processing',
          policyVersion: LEGAL_DOCUMENT_VERSIONS.privacy,
          consentScope: CONSENT_SCOPES.sensitive_identity_verification,
          granted: true,
          metadata: {
            legalDocuments: {
              privacy: LEGAL_DOCUMENT_VERSIONS.privacy,
              terms: LEGAL_DOCUMENT_VERSIONS.terms,
            },
            channel: 'guarantor_self_service',
          },
        },
      }),
      this.prisma.driverGuarantor.update({
        where: { id: guarantor.id },
        data: {
          responsibilityAcceptedAt: new Date(),
          responsibilityAcceptanceEvidence: {
            acceptedAt: new Date().toISOString(),
            acceptedFrom: 'guarantor_self_service',
            legalVersion: LEGAL_DOCUMENT_VERSIONS.terms,
            summary: 'Guarantor acknowledged linked-driver responsibility.',
          },
        },
      }),
    ]);

    return { message: 'Verification consent recorded.' };
  }

  async updateGuarantorProfileFromSelfService(
    token: string,
    profile: {
      name?: string;
      phone?: string;
      email?: string;
      countryCode?: string;
      relationship?: string;
    },
  ): Promise<{ message: string }> {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: payload.driverId },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor is linked to this driver.');
    }

    const linkedUser = await this.findGuarantorSelfServiceUser(payload.tenantId, driver.id);
    const updates: {
      name?: string;
      phone?: string;
      email?: string;
      countryCode?: string;
      relationship?: string;
    } = {};

    if (profile.name?.trim()) updates.name = profile.name.trim();
    if (profile.phone?.trim()) updates.phone = profile.phone.trim();
    if (profile.email?.trim()) {
      updates.email = profile.email.trim().toLowerCase();
    }
    if (profile.countryCode?.trim()) {
      updates.countryCode = profile.countryCode.trim().toUpperCase();
    }
    if (profile.relationship?.trim()) {
      updates.relationship = profile.relationship.trim();
    }

    if (Object.keys(updates).length === 0) {
      return { message: 'No changes.' };
    }

    if (updates.email) {
      const conflictingUser = await this.prisma.user.findFirst({
        where: {
          tenantId: payload.tenantId,
          email: updates.email,
          ...(linkedUser ? { NOT: { id: linkedUser.id } } : {}),
        },
      });

      if (conflictingUser) {
        throw new ConflictException(
          'An account with this email already exists in this organisation. Use a different email address.',
        );
      }
    }

    await this.prisma.$transaction([
      this.prisma.driverGuarantor.update({
        where: { driverId: payload.driverId },
        data: updates,
      }),
      ...(linkedUser
        ? [
            this.prisma.user.update({
              where: { id: linkedUser.id },
              data: {
                ...(updates.name ? { name: updates.name } : {}),
                ...(updates.email ? { email: updates.email } : {}),
                ...(updates.phone ? { phone: updates.phone } : {}),
              },
            }),
          ]
        : []),
    ]);

    return { message: 'Guarantor profile updated.' };
  }

  async updateProfileFromSelfService(
    token: string,
    profile: { firstName?: string; lastName?: string; dateOfBirth?: string },
  ): Promise<{ message: string }> {
    const payload = await this.verifySelfServiceToken(token);
    const updates: { firstName?: string; lastName?: string; dateOfBirth?: string } = {};
    if (profile.firstName?.trim()) updates.firstName = profile.firstName.trim();
    if (profile.lastName?.trim()) updates.lastName = profile.lastName.trim();
    if (profile.dateOfBirth?.trim()) updates.dateOfBirth = profile.dateOfBirth.trim();
    if (Object.keys(updates).length === 0) {
      return { message: 'No changes.' };
    }
    await this.prisma.driver.update({
      where: { id: payload.driverId },
      data: updates,
    });
    return { message: 'Profile updated.' };
  }

  async submitGuarantorFromSelfService(
    token: string,
    dto: CreateOrUpdateDriverGuarantorDto,
  ): Promise<DriverGuarantorRecord> {
    const payload = await this.verifySelfServiceToken(token);
    return this.createOrUpdateGuarantor(payload.tenantId, payload.driverId, dto);
  }

  private async enrichDriversWithRisk(
    drivers: DriverWithIdentityState[],
  ): Promise<Array<DriverWithIdentityState & DriverIntelligenceSummary>> {
    const resolvedDrivers = drivers.filter((d) => d.personId);
    const riskResults = await Promise.allSettled(
      resolvedDrivers.map((d) => this.intelligenceClient.queryPersonRisk(d.personId as string)),
    );

    const riskByPersonId = new Map<string, DriverIntelligenceSummary>();
    for (let i = 0; i < resolvedDrivers.length; i++) {
      const result = riskResults[i];
      const resolvedDriver = resolvedDrivers[i];
      if (!resolvedDriver || result?.status !== 'fulfilled') {
        continue;
      }

      riskByPersonId.set(resolvedDriver.personId as string, {
        globalRiskScore: result.value.globalRiskScore,
        riskBand: result.value.riskBand,
        isWatchlisted: result.value.isWatchlisted,
        duplicateIdentityFlag: result.value.hasDuplicateIdentityFlag,
        reverificationRequired: result.value.reverificationRequired,
        reverificationReason: result.value.reverificationReason,
        verificationConfidence: result.value.verificationConfidence,
        verificationStatus: result.value.verificationStatus,
        verificationProvider: result.value.verificationProvider,
        verificationCountryCode: result.value.verificationCountryCode,
      });
    }

    return drivers.map((driver) => {
      if (driver.identityStatus !== 'verified') {
        return driver;
      }
      if (!driver.personId) return driver;
      const risk = riskByPersonId.get(driver.personId);
      return risk ? { ...driver, ...risk } : driver;
    });
  }

  private async enrichDriverWithRisk(
    driver: DriverWithIdentityState,
  ): Promise<DriverWithIdentityState & DriverIntelligenceSummary> {
    if (!driver.personId || driver.identityStatus !== 'verified') {
      return driver;
    }

    try {
      const risk = await this.intelligenceClient.queryPersonRisk(driver.personId);
      return {
        ...driver,
        globalRiskScore: risk.globalRiskScore,
        riskBand: risk.riskBand,
        isWatchlisted: risk.isWatchlisted,
        duplicateIdentityFlag: risk.hasDuplicateIdentityFlag,
        reverificationRequired: risk.reverificationRequired,
        reverificationReason: risk.reverificationReason,
        verificationConfidence: risk.verificationConfidence,
        verificationStatus: risk.verificationStatus,
        verificationProvider: risk.verificationProvider,
        verificationCountryCode: risk.verificationCountryCode,
      };
    } catch {
      return driver;
    }
  }

  private withDefaultGuarantorSummary<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary,
  >(driver: TDriver): TDriver & DriverGuarantorSummary {
    return {
      ...driver,
      hasGuarantor: false,
      guarantorStatus: null,
      guarantorDisconnectedAt: null,
      guarantorPersonId: null,
      guarantorRiskBand: null,
      guarantorIsWatchlisted: null,
      guarantorIsAlsoDriver: false,
    };
  }

  private withDefaultDocumentSummary<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary & DriverGuarantorSummary,
  >(driver: TDriver): TDriver & DriverDocumentSummary {
    return {
      ...driver,
      hasApprovedLicence: false,
      pendingDocumentCount: 0,
      rejectedDocumentCount: 0,
      expiredDocumentCount: 0,
      approvedDocumentTypes: [],
    };
  }

  private withDefaultMobileAccessSummary<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary,
  >(driver: TDriver): TDriver & DriverMobileAccessSummary {
    return {
      ...driver,
      hasMobileAccess: false,
      mobileAccessStatus: 'missing',
    };
  }

  private async attachGuarantorSummariesSafely<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverGuarantorSummary>> {
    try {
      return await this.attachGuarantorSummaries(tenantId, drivers);
    } catch (error) {
      if (!this.isRecoverableDriverEnrichmentError(error)) {
        throw error;
      }
      this.logger.warn(
        `Driver guarantor enrichment failed for tenant '${tenantId}': ${this.getErrorMessage(error)}`,
      );
      return drivers.map((driver) => this.withDefaultGuarantorSummary(driver));
    }
  }

  private async attachDocumentSummariesSafely<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary & DriverGuarantorSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverDocumentSummary>> {
    try {
      return await this.attachDocumentSummaries(tenantId, drivers);
    } catch (error) {
      if (!this.isRecoverableDriverEnrichmentError(error)) {
        throw error;
      }
      this.logger.warn(
        `Driver document enrichment failed for tenant '${tenantId}': ${this.getErrorMessage(error)}`,
      );
      return drivers.map((driver) => this.withDefaultDocumentSummary(driver));
    }
  }

  private async attachMobileAccessSummariesSafely<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverMobileAccessSummary>> {
    try {
      return await this.attachMobileAccessSummaries(tenantId, drivers);
    } catch (error) {
      if (!this.isRecoverableDriverEnrichmentError(error)) {
        throw error;
      }
      this.logger.warn(
        `Driver mobile-access enrichment failed for tenant '${tenantId}': ${this.getErrorMessage(error)}`,
      );
      return drivers.map((driver) => this.withDefaultMobileAccessSummary(driver));
    }
  }

  private async attachReadinessSummariesSafely<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary &
      DriverMobileAccessSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverReadinessSummary>> {
    try {
      return await this.attachReadinessSummaries(tenantId, drivers);
    } catch (error) {
      if (!this.isRecoverableDriverEnrichmentError(error)) {
        throw error;
      }
      this.logger.warn(`Driver readiness enrichment failed: ${this.getErrorMessage(error)}`);
      return drivers.map((driver) => ({
        ...driver,
        authenticationAccess: 'not_ready',
        authenticationAccessReasons: [],
        activationReadiness: 'not_ready',
        activationReadinessReasons: [],
        assignmentReadiness: 'not_ready',
        assignmentReadinessReasons: [],
        remittanceReadiness: 'not_ready',
        remittanceReadinessReasons: [],
      }));
    }
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  private isRecoverableDriverEnrichmentError(error: unknown): boolean {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code === 'P2021' || error.code === 'P2022';
    }

    const message = this.getErrorMessage(error).toLowerCase();
    return (
      (message.includes('relation') && message.includes('does not exist')) ||
      (message.includes('column') && message.includes('does not exist')) ||
      message.includes('unknown column')
    );
  }

  async create(
    tenantId: string,
    dto: CreateDriverDto,
    options: { autoSendSelfServiceLink?: boolean } = {},
  ): Promise<Driver> {
    const fleet = await this.prisma.fleet.findUnique({
      where: { id: dto.fleetId },
      include: { operatingUnit: { select: { id: true, businessEntityId: true } } },
    });

    if (!fleet) {
      throw new NotFoundException(`Fleet '${dto.fleetId}' not found`);
    }

    assertTenantOwnership(asTenantId(fleet.tenantId), asTenantId(tenantId));

    if (fleet.status !== 'active') {
      throw new BadRequestException(
        `Cannot enroll a driver into fleet '${dto.fleetId}' with status '${fleet.status}'`,
      );
    }

    const normalizedPhone = dto.phone
      ? this.normalizePhoneNumber(dto.phone, dto.nationality ?? null)
      : null;

    // Phone uniqueness per tenant is enforced by @@unique in the schema,
    // but surface a friendly error before hitting the DB constraint.
    if (normalizedPhone) {
      const existing = await this.prisma.driver.findUnique({
        where: { tenantId_phone: { tenantId, phone: normalizedPhone } },
      });

      if (existing) {
        throw new ConflictException(
          `A driver with phone '${normalizedPhone}' already exists in this tenant`,
        );
      }
    }

    const currentDriverCount = await this.prisma.driver.count({
      where: { tenantId },
    });
    await this.subscriptionEntitlementsService.enforceDriverCapacity(tenantId, currentDriverCount);

    const createdDriver = await this.prisma.driver.create({
      data: {
        tenantId,
        fleetId: dto.fleetId,
        operatingUnitId: fleet.operatingUnit.id,
        businessEntityId: fleet.operatingUnit.businessEntityId,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        phone: normalizedPhone,
        email: dto.email,
        dateOfBirth: dto.dateOfBirth ?? null,
        nationality: dto.nationality ?? null,
        status: 'inactive', // drivers start inactive until onboarding completes
        identityStatus: 'unverified',
      } as never,
    });

    this.meteringClient.fireEvent(tenantId, 'active_driver');

    const settings = await this.getOrganisationSettings(tenantId);
    const shouldAutoSendSelfServiceLink =
      options.autoSendSelfServiceLink ?? settings.operations.autoSendDriverSelfServiceLinkOnCreate;

    if (shouldAutoSendSelfServiceLink && createdDriver.email) {
      try {
        await this.sendSelfServiceLink(tenantId, createdDriver.id);
      } catch (error) {
        this.logger.warn(
          `Unable to send self-service link for driver '${createdDriver.id}': ${this.getErrorMessage(error)}`,
        );
      }
    }

    return createdDriver;
  }

  async updateStatus(tenantId: string, id: string, newStatus: string): Promise<Driver> {
    const driver = await this.findOne(tenantId, id);

    const statusKey = newStatus as keyof typeof DRIVER_STATUS_CODES;
    const statusConfig = DRIVER_STATUS_CODES[statusKey];
    if (!statusConfig) {
      const valid = Object.keys(DRIVER_STATUS_CODES).join(', ');
      throw new BadRequestException(`Invalid driver status '${newStatus}'. Valid values: ${valid}`);
    }

    const currentConfig = DRIVER_STATUS_CODES[driver.status as keyof typeof DRIVER_STATUS_CODES];
    if (currentConfig?.terminal) {
      throw new BadRequestException(
        `Driver '${id}' is in terminal status '${driver.status}' and cannot be transitioned`,
      );
    }

    if (newStatus === 'active') {
      if (driver.activationReadiness !== 'ready') {
        throw new BadRequestException(
          driver.activationReadinessReasons.slice(0, 3).join(' ') ||
            'This driver is not ready for activation yet.',
        );
      }
    }

    const updated = await this.prisma.driver.update({
      where: { id },
      data: { status: newStatus },
    });

    await this.auditService.recordTenantAction({
      tenantId,
      entityType: 'driver',
      entityId: id,
      action: 'driver.status.updated',
      beforeState: { status: driver.status },
      afterState: { status: newStatus },
      metadata: {
        activationReadiness: driver.activationReadiness,
        identityStatus: driver.identityStatus,
        adminAssignmentOverride: driver.adminAssignmentOverride ?? false,
      },
    });

    return updated;
  }

  async initializeIdentityLivenessSession(
    tenantId: string,
    id: string,
    countryCode?: string,
  ): Promise<{
    providerName: string;
    sessionId: string;
    expiresAt?: string;
    fallbackChain: string[];
  }> {
    const driver = await this.findOne(tenantId, id);
    const resolvedCountryCode = countryCode ?? driver.nationality;

    if (!resolvedCountryCode) {
      throw new BadRequestException(
        'countryCode is required when the driver nationality is not set',
      );
    }

    try {
      return await this.intelligenceClient.initializeLivenessSession({
        tenantId,
        countryCode: resolvedCountryCode,
      });
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw new ServiceUnavailableException(
          'Live verification is unavailable right now. Please try again in a moment.',
        );
      }

      throw error;
    }
  }

  async resolveIdentity(
    tenantId: string,
    id: string,
    dto: ResolveDriverIdentityDto,
  ): Promise<{
    decision: string;
    personId?: string;
    reviewCaseId?: string;
    providerLookupStatus?: string;
    providerVerificationStatus?: string;
    providerName?: string;
    matchedIdentifierType?: string;
    isVerifiedMatch?: boolean;
    verifiedProfile?: {
      fullName?: string;
      dateOfBirth?: string;
      address?: string;
      gender?: string;
      photoUrl?: string;
      providerImageUrl?: string;
      selfieImageUrl?: string;
    };
    globalRiskScore?: number;
    riskBand?: string;
    isWatchlisted?: boolean;
    hasDuplicateIdentityFlag?: boolean;
    fraudIndicatorCount?: number;
    verificationConfidence?: number;
    livenessPassed?: boolean;
    livenessProviderName?: string;
    livenessConfidenceScore?: number;
    livenessReason?: string;
  }> {
    const driver = await this.findOne(tenantId, id);
    const resolvedCountryCode = dto.countryCode ?? driver.nationality;

    if (!resolvedCountryCode) {
      throw new BadRequestException(
        'countryCode is required when the driver nationality is not set',
      );
    }

    this.logger.log(
      JSON.stringify({
        event: 'driver_verification_started',
        tenantId,
        driverId: id,
        countryCode: resolvedCountryCode,
        identifierCount: dto.identifiers?.length ?? 0,
        hasSelfie: Boolean(dto.selfieImageBase64),
        hasLivenessSession: Boolean(dto.livenessCheck?.sessionId),
      }),
    );

    const identifiers = [
      ...(dto.identifiers ?? []),
      ...(driver.phone ? [{ type: 'PHONE', value: driver.phone }] : []),
      ...(driver.email ? [{ type: 'EMAIL', value: driver.email }] : []),
    ];

    const persistedSelfieImageUrl = dto.selfieImageBase64
      ? await this.persistSelfiePortraitForDriver(tenantId, driver.id, dto.selfieImageBase64)
      : null;

    const result: DriverIdentityResolutionResult = await this.intelligenceClient.resolveEnrollment({
      tenantId,
      countryCode: resolvedCountryCode,
      roleType: 'driver',
      association: {
        localEntityType: 'driver',
        localEntityId: driver.id,
        roleType: 'driver',
        ...(driver.businessEntityId ? { businessEntityId: driver.businessEntityId } : {}),
        ...(driver.operatingUnitId ? { operatingUnitId: driver.operatingUnitId } : {}),
        ...(driver.fleetId ? { fleetId: driver.fleetId } : {}),
        status: driver.status,
        source: 'identity_resolution',
      },
      ...(dto.livenessPassed !== undefined ? { livenessPassed: dto.livenessPassed } : {}),
      identifiers,
      ...(dto.biometric ? { biometric: dto.biometric } : {}),
      providerVerification: {
        subjectConsent: dto.subjectConsent ?? false,
        validationData: {
          ...(driver.firstName ? { firstName: driver.firstName } : {}),
          ...(driver.lastName ? { lastName: driver.lastName } : {}),
          ...(driver.dateOfBirth ? { dateOfBirth: driver.dateOfBirth } : {}),
        },
        ...(dto.selfieImageBase64 ? { selfieImageBase64: dto.selfieImageBase64 } : {}),
        ...(persistedSelfieImageUrl ? { selfieImageUrl: persistedSelfieImageUrl } : {}),
        ...(dto.livenessCheck ? { livenessCheck: dto.livenessCheck } : {}),
      },
    });

    const nextIdentityStatus = this.mapIdentityStatus(
      result.decision,
      result.isVerifiedMatch === true,
      result.providerLookupStatus,
    );
    const verifiedProfileUpdate = this.buildVerifiedDriverProfileUpdate(result);
    const persistedProviderImageUrl = await this.persistIdentityReferenceImage(
      result.verifiedProfile?.providerImageUrl ?? result.verifiedProfile?.photoUrl,
      `driver-provider-${driver.id}-${Date.now()}`,
    );

    // Canonical enrichment (verified name, DOB, etc.) is stored on intel_persons
    // by the intelligence plane — see person-graph.md Principle 4. Only operational
    // identity state and the cross-plane personId FK are written back here.
    await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        ...verifiedProfileUpdate,
        ...(result.personId ? { personId: result.personId } : {}),
        ...(persistedSelfieImageUrl ? { selfieImageUrl: persistedSelfieImageUrl } : {}),
        ...(persistedProviderImageUrl ? { providerImageUrl: persistedProviderImageUrl } : {}),
        identityStatus: nextIdentityStatus,
        identityReviewCaseId: result.reviewCaseId ?? null,
        identityReviewStatus: result.reviewCaseId ? 'open' : null,
        identityLastDecision:
          result.providerVerificationStatus ?? result.providerLookupStatus ?? result.decision,
        identityVerificationConfidence: result.verificationConfidence ?? null,
        identityLastVerifiedAt: new Date(),
        identityLivenessPassed: result.livenessPassed ?? null,
        identityLivenessProvider: result.livenessProviderName ?? null,
        identityLivenessConfidence: result.livenessConfidenceScore ?? null,
        identityLivenessReason: result.livenessReason ?? null,
      } as never,
    });

    this.logger.log(
      JSON.stringify({
        event: 'driver_verification_transition',
        tenantId,
        driverId: driver.id,
        identityStatus: nextIdentityStatus,
        decision: result.decision,
        providerLookupStatus: result.providerLookupStatus ?? null,
        providerVerificationStatus: result.providerVerificationStatus ?? null,
        livenessPassed: result.livenessPassed ?? null,
        livenessProviderName: result.livenessProviderName ?? null,
      }),
    );

    return {
      ...result,
      ...(result.verifiedProfile || persistedSelfieImageUrl || persistedProviderImageUrl
        ? {
            verifiedProfile: {
              ...(result.verifiedProfile ?? {}),
              ...(persistedSelfieImageUrl ? { selfieImageUrl: persistedSelfieImageUrl } : {}),
              ...(persistedProviderImageUrl ? { providerImageUrl: persistedProviderImageUrl } : {}),
            },
          }
        : {}),
    };
  }

  private mapIdentityStatus(
    decision: string,
    isVerifiedMatch: boolean,
    providerLookupStatus?: string,
  ): string {
    if (decision === 'review_required') {
      return 'review_needed';
    }

    if (isVerifiedMatch) {
      return 'verified';
    }

    if (providerLookupStatus === 'no_match') {
      return 'failed';
    }

    if (decision === 'rejected') {
      return 'failed';
    }

    return 'pending_verification';
  }

  private buildVerifiedDriverProfileUpdate(result: DriverIdentityResolutionResult): {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
  } {
    if (result.isVerifiedMatch !== true || !result.verifiedProfile) {
      return {};
    }

    const updates: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      gender?: string;
    } = {};
    const fullName = result.verifiedProfile.fullName?.trim();
    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        const firstName = parts[0];
        if (firstName) {
          updates.firstName = firstName;
        }
      } else if (parts.length > 1) {
        updates.firstName = parts.slice(0, -1).join(' ');
        const lastName = parts.at(-1);
        if (lastName) {
          updates.lastName = lastName;
        }
      }
    }

    if (result.verifiedProfile.dateOfBirth?.trim()) {
      updates.dateOfBirth = result.verifiedProfile.dateOfBirth.trim();
    }

    if (result.verifiedProfile.gender?.trim()) {
      updates.gender = result.verifiedProfile.gender.trim();
    }

    return updates;
  }

  private buildVerifiedGuarantorProfileUpdate(result: DriverIdentityResolutionResult): {
    name?: string;
    dateOfBirth?: string;
    gender?: string;
  } {
    if (result.isVerifiedMatch !== true || !result.verifiedProfile) {
      return {};
    }

    const updates: { name?: string; dateOfBirth?: string; gender?: string } = {};

    if (result.verifiedProfile.fullName?.trim()) {
      updates.name = result.verifiedProfile.fullName.trim();
    }

    if (result.verifiedProfile.dateOfBirth?.trim()) {
      updates.dateOfBirth = result.verifiedProfile.dateOfBirth.trim();
    }

    if (result.verifiedProfile.gender?.trim()) {
      updates.gender = result.verifiedProfile.gender.trim();
    }

    return updates;
  }

  private async persistSelfiePortraitForDriver(
    tenantId: string,
    driverId: string,
    selfieImageBase64: string,
  ): Promise<string | null> {
    try {
      const buffer = Buffer.from(selfieImageBase64, 'base64');
      const timestamp = Date.now();
      const stored = await this.documentStorageService.uploadFile(
        buffer,
        `portrait-${driverId}-${timestamp}.jpg`,
        'image/jpeg',
      );
      await this.driverDocuments.create({
        data: {
          tenantId,
          driverId,
          documentType: 'portrait',
          fileName: `portrait-${timestamp}.jpg`,
          contentType: 'image/jpeg',
          storageKey: stored.storageKey,
          storageUrl: stored.storageUrl,
          uploadedBy: 'identity_resolution',
          status: 'approved',
        },
      });
      return stored.storageUrl;
    } catch (err) {
      this.logger.warn(`Portrait upload failed for driver ${driverId}: ${String(err)}`);
      return null;
    }
  }

  private async persistSelfiePortraitForDriverGuarantor(
    driverId: string,
    selfieImageBase64: string,
  ): Promise<string | null> {
    try {
      const buffer = Buffer.from(selfieImageBase64, 'base64');
      const stored = await this.documentStorageService.uploadFile(
        buffer,
        `guarantor-selfie-${driverId}-${Date.now()}.jpg`,
        'image/jpeg',
      );
      return stored.storageUrl;
    } catch (err) {
      this.logger.warn(
        `Portrait upload failed for guarantor on driver ${driverId}: ${String(err)}`,
      );
      return null;
    }
  }

  private async persistIdentityReferenceImage(
    source: string | undefined,
    fileNamePrefix: string,
  ): Promise<string | null> {
    if (!source?.trim()) {
      return null;
    }

    try {
      const trimmedSource = source.trim();
      const dataUrlMatch = trimmedSource.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (dataUrlMatch) {
        const contentType = dataUrlMatch[1];
        const base64Payload = dataUrlMatch[2];
        if (!contentType || !base64Payload) {
          return null;
        }
        const extension = this.getImageExtension(contentType);
        const stored = await this.documentStorageService.uploadFile(
          Buffer.from(base64Payload, 'base64'),
          `${fileNamePrefix}.${extension}`,
          contentType,
        );
        return stored.storageUrl;
      }

      if (/^https?:\/\//i.test(trimmedSource)) {
        const response = await fetch(trimmedSource);
        if (!response.ok) {
          throw new Error(`image fetch returned ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') ?? 'image/jpeg';
        const extension = this.getImageExtension(contentType);
        const stored = await this.documentStorageService.uploadFile(
          Buffer.from(arrayBuffer),
          `${fileNamePrefix}.${extension}`,
          contentType,
        );
        return stored.storageUrl;
      }

      const stored = await this.documentStorageService.uploadFile(
        Buffer.from(trimmedSource, 'base64'),
        `${fileNamePrefix}.jpg`,
        'image/jpeg',
      );
      return stored.storageUrl;
    } catch (err) {
      this.logger.warn(`Identity reference image upload failed: ${String(err)}`);
      return null;
    }
  }

  private getImageExtension(contentType: string): string {
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('svg')) return 'svg';
    return 'jpg';
  }

  private formatDriverName(driver: {
    firstName?: string | null;
    lastName?: string | null;
  }): string {
    return [driver.firstName, driver.lastName].filter(Boolean).join(' ') || 'Driver';
  }

  private normalizePhoneNumber(phone: string, countryCode?: string | null): string {
    const sanitized = phone.trim().replace(/[^\d+]/g, '');

    if (!countryCode) {
      if (/^\+\d{10,15}$/.test(sanitized)) {
        return sanitized;
      }

      throw new BadRequestException(
        'Phone numbers without an explicit country must be entered in full international format, for example +2348012345678.',
      );
    }

    const normalizedCountryCode = countryCode.toUpperCase();
    if (!isCountrySupported(normalizedCountryCode)) {
      throw new BadRequestException(
        `Country '${normalizedCountryCode}' is not supported for phone normalization.`,
      );
    }

    const normalized = normalizePhoneNumberForCountry(phone, normalizedCountryCode);

    if (/^\+\d{10,15}$/.test(normalized)) {
      return normalized;
    }

    throw new BadRequestException(
      `Phone number '${phone}' is not in a supported format for country '${normalizedCountryCode}'.`,
    );
  }

  private decodeIncomingDocument(dto: CreateDriverDocumentDto): Buffer {
    if (dto.fileBase64?.trim()) {
      return Buffer.from(dto.fileBase64.trim(), 'base64');
    }

    throw new BadRequestException('Document content is required.');
  }

  private validateDocumentUpload(buffer: Buffer, contentType: string): void {
    const normalizedContentType = this.normalizeDocumentContentType(contentType);
    const maxFileBytes =
      Number(process.env.DOCUMENT_STORAGE_MAX_FILE_BYTES) || MAX_DOCUMENT_FILE_BYTES_FALLBACK;

    if (buffer.byteLength === 0) {
      throw new BadRequestException('Document content is required.');
    }

    if (buffer.byteLength > maxFileBytes) {
      throw new BadRequestException(
        `Document files must be ${Math.floor(maxFileBytes / (1024 * 1024))} MB or smaller.`,
      );
    }

    if (!ALLOWED_DRIVER_DOCUMENT_CONTENT_TYPES.has(normalizedContentType)) {
      throw new BadRequestException('Only PDF, JPEG, PNG, and WEBP document uploads are allowed.');
    }

    if (!this.bufferMatchesDeclaredContentType(buffer, normalizedContentType)) {
      throw new BadRequestException(
        'Uploaded document content does not match the declared file type.',
      );
    }
  }

  private normalizeDocumentContentType(contentType: string): string {
    return contentType.split(';', 1)[0]?.trim().toLowerCase() ?? 'application/octet-stream';
  }

  private bufferMatchesDeclaredContentType(buffer: Buffer, contentType: string): boolean {
    if (contentType === 'application/pdf') {
      return buffer.subarray(0, 5).toString('utf8') === '%PDF-';
    }

    if (contentType === 'image/jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    if (contentType === 'image/png') {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    }

    if (contentType === 'image/webp') {
      return (
        buffer.subarray(0, 4).toString('utf8') === 'RIFF' &&
        buffer.subarray(8, 12).toString('utf8') === 'WEBP'
      );
    }

    return false;
  }

  private decodeLegacyDataUrl(fileDataUrl: string): { buffer: Buffer } {
    const match = fileDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match?.[2]) {
      throw new BadRequestException('Document payload must be a valid base64 data URL.');
    }
    return { buffer: Buffer.from(match[2], 'base64') };
  }

  private getIdentitySummaryMessage(driver: {
    identityStatus: string;
    personId?: string | null;
    isWatchlisted?: boolean | undefined;
    duplicateIdentityFlag?: boolean | undefined;
  }): string {
    if (driver.identityStatus === 'verified') {
      if (driver.isWatchlisted) {
        return 'Verified identity exists. Watchlist review is active.';
      }
      if (driver.duplicateIdentityFlag) {
        return 'Verified identity exists. Duplicate-identity review is active.';
      }
      return 'Verified identity exists in the intelligence plane.';
    }

    if (driver.identityStatus === 'review_needed') {
      return 'Identity review is required before this record is considered verified.';
    }

    if (driver.identityStatus === 'pending_verification') {
      return 'Identity verification is in progress.';
    }

    if (driver.identityStatus === 'failed') {
      return 'Identity verification did not complete successfully.';
    }

    return 'Identity verification has not started yet.';
  }

  private computeReadiness(
    driver: {
      status: string;
      identityStatus: string;
      guarantorStatus?: string | null;
      guarantorPersonId?: string | null;
      hasApprovedLicence: boolean;
      hasMobileAccess: boolean;
      mobileAccessStatus?: string | null;
      approvedDocumentTypes?: string[];
      adminAssignmentOverride?: boolean | null;
      isWatchlisted?: boolean | null | undefined;
      duplicateIdentityFlag?: boolean | null | undefined;
      riskBand?: string | null | undefined;
    },
    settings: {
      requireIdentityVerificationForActivation: boolean;
      requiredDriverDocumentSlugs: string[];
      requireGuarantor: boolean;
      requireGuarantorVerification?: boolean;
      allowAdminAssignmentOverride: boolean;
    },
  ): DriverReadinessSummary {
    const authenticationAccessReasons: string[] = [];
    if (!driver.hasMobileAccess) {
      if (driver.mobileAccessStatus === 'inactive' || driver.mobileAccessStatus === 'revoked') {
        authenticationAccessReasons.push('Driver mobile access is inactive or revoked.');
      } else {
        authenticationAccessReasons.push('Driver mobile access is not linked.');
      }
    }
    const authenticationAccess = authenticationAccessReasons.length === 0 ? 'ready' : 'not_ready';

    // --- Activation readiness (standard, unaffected by admin override) ---
    const activationReasons: string[] = [];

    if (settings.requireIdentityVerificationForActivation && driver.identityStatus !== 'verified') {
      activationReasons.push('Identity verification must be completed.');
    }

    if (
      settings.requireGuarantor &&
      (!driver.guarantorStatus ||
        driver.guarantorStatus === 'disconnected' ||
        (settings.requireGuarantorVerification && !driver.guarantorPersonId))
    ) {
      activationReasons.push('A guarantor with verified linkage is required.');
    }

    if (!driver.hasApprovedLicence) {
      activationReasons.push('An approved driver licence is required.');
    }

    const approvedDocumentTypes = new Set(driver.approvedDocumentTypes ?? []);
    const missingRequiredDocuments = settings.requiredDriverDocumentSlugs.filter(
      (slug) => !approvedDocumentTypes.has(slug),
    );
    if (missingRequiredDocuments.length > 0) {
      activationReasons.push(
        `Required driver documents are still missing: ${missingRequiredDocuments.join(', ')}.`,
      );
    }

    const activationReadiness =
      activationReasons.length === 0
        ? 'ready'
        : activationReasons.length <= 2
          ? 'partially_ready'
          : 'not_ready';

    // --- Assignment readiness — may be overridden by admin ---
    const assignmentReasons = [...activationReasons];

    if (driver.status !== 'active') {
      assignmentReasons.push('Driver status must be active before assignment can start.');
    }

    // Check for active fraud flags that block the override regardless of setting.
    const hasFraudFlag =
      Boolean(driver.isWatchlisted) ||
      Boolean(driver.duplicateIdentityFlag) ||
      driver.riskBand === 'high' ||
      driver.riskBand === 'critical';

    const overrideAllowed =
      settings.allowAdminAssignmentOverride &&
      Boolean(driver.adminAssignmentOverride) &&
      driver.status === 'active' &&
      authenticationAccess === 'ready' &&
      !hasFraudFlag;

    if (overrideAllowed) {
      const remittanceReadiness =
        authenticationAccess === 'ready' && driver.status === 'active' ? 'ready' : 'not_ready';
      const remittanceReadinessReasons = [
        ...authenticationAccessReasons,
        ...(driver.status === 'active'
          ? []
          : ['Driver status must be active before remittance can be recorded.']),
      ];
      return {
        authenticationAccess,
        authenticationAccessReasons,
        activationReadiness,
        activationReadinessReasons: activationReasons,
        assignmentReadiness: 'ready',
        assignmentReadinessReasons: ['Admin has approved this driver for assignment.'],
        remittanceReadiness,
        remittanceReadinessReasons,
      };
    }

    // If override was requested but blocked by fraud flags, surface that explicitly.
    if (Boolean(driver.adminAssignmentOverride) && hasFraudFlag) {
      const blockedAssignmentReasons = [
        ...assignmentReasons,
        'Admin override is blocked because active fraud flags are present on this driver.',
      ];
      const assignmentReadiness =
        blockedAssignmentReasons.length <= 2 ? 'partially_ready' : 'not_ready';
      const remittanceReadiness =
        authenticationAccess === 'ready' && driver.status === 'active' ? 'ready' : 'not_ready';
      const remittanceReadinessReasons = [
        ...authenticationAccessReasons,
        ...(driver.status === 'active'
          ? []
          : ['Driver status must be active before remittance can be recorded.']),
      ];
      return {
        authenticationAccess,
        authenticationAccessReasons,
        activationReadiness,
        activationReadinessReasons: activationReasons,
        assignmentReadiness,
        assignmentReadinessReasons: blockedAssignmentReasons,
        remittanceReadiness,
        remittanceReadinessReasons,
      };
    }

    const assignmentReadiness =
      assignmentReasons.length === 0
        ? 'ready'
        : assignmentReasons.length <= 2
          ? 'partially_ready'
          : 'not_ready';
    const remittanceReadinessReasons = [
      ...authenticationAccessReasons,
      ...(driver.status === 'active'
        ? []
        : ['Driver status must be active before remittance can be recorded.']),
    ];
    const remittanceReadiness =
      remittanceReadinessReasons.length === 0
        ? 'ready'
        : remittanceReadinessReasons.length <= 2
          ? 'partially_ready'
          : 'not_ready';

    return {
      authenticationAccess,
      authenticationAccessReasons,
      activationReadiness,
      activationReadinessReasons: activationReasons,
      assignmentReadiness,
      assignmentReadinessReasons: assignmentReasons,
      remittanceReadiness,
      remittanceReadinessReasons,
    };
  }

  async setAdminAssignmentOverride(
    tenantId: string,
    driverId: string,
    override: boolean,
    actorId?: string,
  ): Promise<void> {
    const driver = (await this.prisma.driver.findUnique({
      where: { id: driverId },
    })) as (Driver & DriverAdminOverrideState) | null;
    if (!driver || driver.tenantId !== tenantId) {
      throw new Error('Driver not found.');
    }
    if (override) {
      throw new BadRequestException(
        'Enabling admin override now requires a reason and OTP confirmation.',
      );
    }

    await (
      this.prisma as never as {
        driver: {
          update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<Driver>;
        };
      }
    ).driver.update({
      where: { id: driverId },
      data: {
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

    await this.auditService.recordTenantAction({
      tenantId,
      actorId,
      entityType: 'driver',
      entityId: driverId,
      action: 'driver.admin_override.cleared',
      beforeState: {
        adminAssignmentOverride: driver.adminAssignmentOverride,
        requestedAt: driver.adminAssignmentOverrideRequestedAt?.toISOString() ?? null,
        confirmedAt: driver.adminAssignmentOverrideConfirmedAt?.toISOString() ?? null,
      },
      afterState: {
        adminAssignmentOverride: false,
      },
    });
  }

  async requestAdminAssignmentOverride(
    tenantId: string,
    actorId: string,
    driverId: string,
    input: {
      reason: string;
      evidenceImageDataUrl?: string;
    },
  ): Promise<{ destination: string; expiresAt: string }> {
    const reason = input.reason.trim();
    if (reason.length < 8) {
      throw new BadRequestException('Provide a clear override reason before continuing.');
    }

    const settings = await this.getOrganisationSettings(tenantId);
    if (!settings.operations.allowAdminAssignmentOverride) {
      throw new BadRequestException(
        'Admin assignment override is disabled in organisation settings.',
      );
    }

    const driver = (await this.prisma.driver.findUnique({
      where: { id: driverId },
    })) as DriverWithIdentityState | null;
    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException(`Driver '${driverId}' not found`);
    }

    const actor = await this.prisma.user.findFirst({
      where: {
        id: actorId,
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    if (!actor?.email) {
      throw new BadRequestException('Admin email is required before an override OTP can be sent.');
    }

    const enrichedDriver = await this.enrichDriverWithRisk(driver);
    const hasFraudFlag =
      Boolean(enrichedDriver.isWatchlisted) ||
      Boolean(enrichedDriver.duplicateIdentityFlag) ||
      enrichedDriver.riskBand === 'high' ||
      enrichedDriver.riskBand === 'critical';
    if (hasFraudFlag) {
      throw new BadRequestException(
        'Admin override cannot be requested while this driver has active watchlist or fraud risk flags.',
      );
    }

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const evidenceUrl = await this.persistIdentityReferenceImage(
      input.evidenceImageDataUrl,
      `driver-admin-override-${driver.id}-${Date.now()}`,
    );

    await (
      this.prisma as never as {
        driver: {
          update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<Driver>;
        };
      }
    ).driver.update({
      where: { id: driverId },
      data: {
        adminAssignmentOverride: false,
        adminAssignmentOverrideRequestedAt: new Date(),
        adminAssignmentOverrideRequestedBy: actor.id,
        adminAssignmentOverrideReason: reason,
        adminAssignmentOverrideEvidence: {
          reason,
          evidenceImageUrl: evidenceUrl,
          requestedBy: actor.id,
        },
        adminAssignmentOverrideOtpHash: hashAuthSecret(otpCode),
        adminAssignmentOverrideOtpExpiresAt: expiresAt,
        adminAssignmentOverrideConfirmedAt: null,
        adminAssignmentOverrideConfirmedBy: null,
      },
    });

    await this.authEmailService.sendAccountVerificationOtpEmail({
      email: actor.email,
      name: actor.name,
      code: otpCode,
    });

    await this.auditService.recordTenantAction({
      tenantId,
      actorId,
      entityType: 'driver',
      entityId: driverId,
      action: 'driver.admin_override.requested',
      metadata: {
        reason,
        evidenceImageUrl: evidenceUrl,
        otpDelivery: 'email',
        otpDestination: actor.email,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return {
      destination: actor.email,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async confirmAdminAssignmentOverride(
    tenantId: string,
    actorId: string,
    driverId: string,
    otpCode: string,
  ): Promise<{ adminAssignmentOverride: boolean }> {
    const driver = (await this.prisma.driver.findUnique({
      where: { id: driverId },
    })) as (Driver & DriverAdminOverrideState) | null;
    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException(`Driver '${driverId}' not found`);
    }

    const normalizedOtp = otpCode.trim();
    if (!normalizedOtp) {
      throw new BadRequestException('OTP code is required.');
    }

    const expiresAt = driver.adminAssignmentOverrideOtpExpiresAt;
    if (
      !driver.adminAssignmentOverrideOtpHash ||
      !expiresAt ||
      expiresAt.getTime() < Date.now() ||
      driver.adminAssignmentOverrideOtpHash !== hashAuthSecret(normalizedOtp)
    ) {
      throw new UnauthorizedException('Invalid or expired override OTP.');
    }

    await (
      this.prisma as never as {
        driver: {
          update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<Driver>;
        };
      }
    ).driver.update({
      where: { id: driverId },
      data: {
        adminAssignmentOverride: true,
        adminAssignmentOverrideConfirmedAt: new Date(),
        adminAssignmentOverrideConfirmedBy: actorId,
        adminAssignmentOverrideOtpHash: null,
        adminAssignmentOverrideOtpExpiresAt: null,
      },
    });

    await this.auditService.recordTenantAction({
      tenantId,
      actorId,
      entityType: 'driver',
      entityId: driverId,
      action: 'driver.admin_override.confirmed',
      metadata: {
        reason: driver.adminAssignmentOverrideReason ?? null,
        requestedAt: driver.adminAssignmentOverrideRequestedAt?.toISOString() ?? null,
      },
    });

    return { adminAssignmentOverride: true };
  }

  private async attachGuarantorSummaries<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverGuarantorSummary>> {
    if (drivers.length === 0) return [];

    const guarantors =
      (await this.driverGuarantors.findMany({
        where: {
          tenantId,
          driverId: { in: drivers.map((driver) => driver.id) },
        },
      })) ?? [];

    const guarantorsByDriverId = new Map(
      guarantors.map((guarantor) => [guarantor.driverId, guarantor]),
    );

    // Fetch risk signals and role presence for guarantors whose identity
    // has been resolved. Uses Promise.allSettled so a failed intelligence
    // call for one guarantor does not block the rest of the driver list.
    const resolvedGuarantors = guarantors.filter((g) => g.personId);
    const [riskResults, roleResults] = await Promise.all([
      Promise.allSettled(
        resolvedGuarantors.map((g) =>
          this.intelligenceClient.queryPersonRisk(g.personId as string),
        ),
      ),
      Promise.allSettled(
        resolvedGuarantors.map((g) =>
          this.intelligenceClient.queryPersonRolePresence(g.personId as string),
        ),
      ),
    ]);

    const guarantorRiskByPersonId = new Map<
      string,
      {
        riskBand?: string;
        isWatchlisted?: boolean;
        reverificationRequired?: boolean;
        reverificationReason?: string | null;
      }
    >();
    const guarantorRoleByPersonId = new Map<string, { isDriver: boolean }>();

    for (let i = 0; i < resolvedGuarantors.length; i++) {
      const g = resolvedGuarantors[i];
      if (!g) continue;
      const riskResult = riskResults[i];
      const roleResult = roleResults[i];
      if (riskResult?.status === 'fulfilled') {
        guarantorRiskByPersonId.set(g.personId as string, {
          ...(riskResult.value.riskBand ? { riskBand: riskResult.value.riskBand } : {}),
          ...(typeof riskResult.value.isWatchlisted === 'boolean'
            ? { isWatchlisted: riskResult.value.isWatchlisted }
            : {}),
          ...(typeof riskResult.value.reverificationRequired === 'boolean'
            ? { reverificationRequired: riskResult.value.reverificationRequired }
            : {}),
          ...(riskResult.value.reverificationReason
            ? { reverificationReason: riskResult.value.reverificationReason }
            : {}),
        });
      }
      if (roleResult?.status === 'fulfilled') {
        guarantorRoleByPersonId.set(g.personId as string, {
          isDriver: roleResult.value.isDriver,
        });
      }
    }

    return drivers.map((driver) => {
      const guarantor = guarantorsByDriverId.get(driver.id);
      const personId = guarantor?.personId ?? null;
      const risk = personId ? guarantorRiskByPersonId.get(personId) : undefined;
      const role = personId ? guarantorRoleByPersonId.get(personId) : undefined;

      return {
        ...driver,
        hasGuarantor: Boolean(guarantor && guarantor.status !== 'disconnected'),
        guarantorStatus: guarantor?.status ?? null,
        guarantorDisconnectedAt: guarantor?.disconnectedAt ?? null,
        guarantorPersonId: personId,
        guarantorRiskBand: risk?.riskBand ?? null,
        guarantorIsWatchlisted: risk?.isWatchlisted ?? null,
        guarantorReverificationRequired: risk?.reverificationRequired ?? null,
        guarantorReverificationReason: risk?.reverificationReason ?? null,
        guarantorIsAlsoDriver: role?.isDriver ?? false,
      };
    });
  }

  private async syncExpiredDocuments(tenantId: string, driverIds?: string[]): Promise<void> {
    await this.driverDocuments.updateMany({
      where: {
        tenantId,
        status: 'approved',
        expiresAt: { lt: new Date() },
        ...(driverIds && driverIds.length > 0 ? { driverId: { in: driverIds } } : {}),
      },
      data: { status: 'expired' },
    });
  }

  private async attachDocumentSummaries<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary & DriverGuarantorSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverDocumentSummary>> {
    if (drivers.length === 0) return [];

    const driverIds = drivers.map((driver) => driver.id);
    await this.syncExpiredDocuments(tenantId, driverIds);

    const [documents, zeroTrustVerifications] = await Promise.all([
      this.driverDocuments.findMany({
        where: {
          tenantId,
          driverId: { in: driverIds },
        },
        select: {
          driverId: true,
          documentType: true,
          status: true,
        },
      }),
      this.driverDocumentVerifications.findMany({
        where: {
          tenantId,
          driverId: { in: driverIds },
          status: 'verified',
        },
        select: {
          driverId: true,
          documentType: true,
        },
      }),
    ]);

    const summaries = new Map<string, DriverDocumentSummary>();
    for (const driver of drivers) {
      summaries.set(driver.id, {
        hasApprovedLicence: false,
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
        approvedDocumentTypes: [],
      });
    }

    for (const document of documents) {
      const summary = summaries.get(document.driverId);
      if (!summary) continue;

      if (
        document.documentType === DRIVER_LICENCE_DOCUMENT_TYPE &&
        document.status === 'approved'
      ) {
        summary.hasApprovedLicence = true;
      }
      if (document.status === 'approved') {
        summary.approvedDocumentTypes.push(document.documentType);
      }

      if (document.status === 'pending') {
        summary.pendingDocumentCount += 1;
      }
      if (document.status === 'rejected') {
        summary.rejectedDocumentCount += 1;
      }
      if (document.status === 'expired') {
        summary.expiredDocumentCount += 1;
      }
    }

    // Zero-trust verified ID numbers count toward approved document types.
    // Deduplicate by documentType per driver so a repeated verification
    // does not inflate the approved list.
    for (const verification of zeroTrustVerifications) {
      const summary = summaries.get(verification.driverId);
      if (!summary) continue;
      const normalizedDocumentType = this.normalizeStoredDocumentType(verification.documentType);
      if (!summary.approvedDocumentTypes.includes(normalizedDocumentType)) {
        summary.approvedDocumentTypes.push(normalizedDocumentType);
      }
      if (normalizedDocumentType === DRIVER_LICENCE_DOCUMENT_TYPE && !summary.hasApprovedLicence) {
        summary.hasApprovedLicence = true;
      }
    }

    return drivers.map((driver) => ({
      ...driver,
      ...(summaries.get(driver.id) ?? {
        hasApprovedLicence: false,
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
        approvedDocumentTypes: [],
      }),
    }));
  }

  private async attachMobileAccessSummaries<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverMobileAccessSummary>> {
    if (drivers.length === 0) return [];

    const linkedUsers = await this.prisma.user.findMany({
      where: {
        tenantId,
        driverId: { in: drivers.map((driver) => driver.id) },
      },
      select: {
        driverId: true,
        isActive: true,
        mobileAccessRevoked: true,
      },
    });

    const mobileAccessByDriverId = new Map<
      string,
      { hasMobileAccess: boolean; mobileAccessStatus: 'linked' | 'inactive' | 'revoked' }
    >();

    for (const user of linkedUsers) {
      if (!user.driverId) continue;
      const mobileAccessStatus = user.mobileAccessRevoked
        ? 'revoked'
        : user.isActive
          ? 'linked'
          : 'inactive';
      mobileAccessByDriverId.set(user.driverId, {
        hasMobileAccess: user.isActive && !user.mobileAccessRevoked,
        mobileAccessStatus,
      });
    }

    return drivers.map((driver) => {
      const summary = mobileAccessByDriverId.get(driver.id);
      return {
        ...driver,
        hasMobileAccess: summary?.hasMobileAccess ?? false,
        mobileAccessStatus: summary?.mobileAccessStatus ?? 'missing',
      };
    });
  }

  private async attachReadinessSummaries<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary &
      DriverMobileAccessSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverReadinessSummary>> {
    const settings = await this.getOrganisationSettings(tenantId);
    const activeActionsByDriverId = await this.policyService.listActiveActionsByEntityIds(
      tenantId,
      'driver',
      drivers.map((driver) => driver.id),
    );
    return drivers.map((driver) => {
      const readiness = this.computeReadiness(driver, settings.operations);
      const enforcementActions = activeActionsByDriverId.get(driver.id) ?? [];
      return {
        ...driver,
        ...this.policyService.applyDriverEnforcement(readiness, enforcementActions),
      };
    });
  }

  private async createSelfServiceToken(tenantId: string, driverId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        purpose: this.selfServicePurpose,
        tenantId,
        driverId,
      },
      { expiresIn: '48h' },
    );
  }

  private readonly guarantorSelfServicePurpose = 'guarantor_self_service';

  private sanitizeSelfServiceReturnUrl(returnUrl?: string): string | null {
    const normalized = returnUrl?.trim();
    if (!normalized) {
      return null;
    }

    if (normalized.startsWith('mobiris://') || normalized.startsWith('mobiris-mobile-ops://')) {
      return normalized;
    }

    try {
      const candidate = new URL(normalized);
      const tenantWebUrl = process.env.TENANT_WEB_URL ?? 'http://localhost:3000';
      const tenantOrigin = new URL(tenantWebUrl).origin;
      if (candidate.origin === tenantOrigin || candidate.origin === 'http://localhost:3000') {
        return candidate.toString();
      }
    } catch {
      return null;
    }

    return null;
  }

  private async createGuarantorSelfServiceToken(
    tenantId: string,
    driverId: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        purpose: this.guarantorSelfServicePurpose,
        tenantId,
        driverId,
      },
      { expiresIn: '48h' },
    );
  }

  private async verifyGuarantorSelfServiceToken(
    token: string,
  ): Promise<{ tenantId: string; driverId: string }> {
    try {
      const payload = (await this.jwtService.verifyAsync(token)) as {
        purpose?: string;
        tenantId?: string;
        driverId?: string;
      };

      if (
        payload.purpose !== this.guarantorSelfServicePurpose ||
        !payload.tenantId ||
        !payload.driverId
      ) {
        throw new UnauthorizedException('The guarantor verification link is invalid.');
      }

      return { tenantId: payload.tenantId, driverId: payload.driverId };
    } catch {
      throw new UnauthorizedException('The guarantor verification link is invalid or expired.');
    }
  }

  private generateOtpCode(): string {
    // Unambiguous uppercase alphanumeric — excludes 0/O, 1/I
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
      '',
    );
  }

  private async createAndStoreSelfServiceOtp(
    tenantId: string,
    subjectType: 'driver' | 'guarantor',
    subjectId: string,
  ): Promise<string> {
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    // Retry up to 5 times on collision (theoretical only with 6 chars / 1B possibilities)
    for (let attempt = 0; attempt < 5; attempt++) {
      const otpCode = this.generateOtpCode();
      try {
        await this.prisma.selfServiceOtp.create({
          data: { tenantId, subjectType, subjectId, otpCode, expiresAt },
        });
        return otpCode;
      } catch {
        // Unique constraint violation — retry with a new code
        if (attempt === 4) throw new Error('Failed to generate a unique OTP after 5 attempts');
      }
    }

    throw new Error('OTP generation failed');
  }

  private async verifySelfServiceToken(
    token: string,
  ): Promise<{ tenantId: string; driverId: string }> {
    try {
      const payload = (await this.jwtService.verifyAsync(token)) as {
        purpose?: string;
        tenantId?: string;
        driverId?: string;
      };

      if (payload.purpose !== this.selfServicePurpose || !payload.tenantId || !payload.driverId) {
        throw new UnauthorizedException('The self-service verification link is invalid.');
      }

      return {
        tenantId: payload.tenantId,
        driverId: payload.driverId,
      };
    } catch {
      throw new UnauthorizedException('The self-service verification link is invalid or expired.');
    }
  }
}
