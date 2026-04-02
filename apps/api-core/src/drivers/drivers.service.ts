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
import { type Driver, Prisma, type UserNotification } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuditService } from '../audit/audit.service';
import { generateOtpCode, hashAuthSecret } from '../auth/auth-token-utils';
import { hashPassword, verifyPassword } from '../auth/password-utils';
import { readUserSettings, writeUserSettings } from '../auth/user-settings';
import { buildCsv, parseCsv } from '../common/csv-utils';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import {
  parseFinancialContractSnapshot,
  resolveAssignmentPaymentModel,
} from '../assignments/financial-contract';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { IntelligenceClient } from '../intelligence/intelligence.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthEmailService } from '../notifications/auth-email.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { NotificationsService } from '../notifications/notifications.service';
import type { EnforcementSummary } from '../policy/policy.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PolicyService } from '../policy/policy.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneBillingClient } from '../tenant-billing/control-plane-billing.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneMeteringClient } from '../tenant-billing/control-plane-metering.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SubscriptionEntitlementsService } from '../tenant-billing/subscription-entitlements.service';
import { VerificationSpendService } from '../tenant-billing/verification-spend.service';
import {
  compareVerificationTiers,
  getDefaultLanguageForCountry,
  getVerificationAddonPrice,
  readOrganisationSettings,
  resolveVerificationPolicy,
  resolveVerificationTier,
  getVerificationTierDescriptor,
  type VerificationComponentKey,
  type VerificationTier,
} from '../tenants/tenant-settings';
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
  identitySignatureImageUrl?: string | null;
  identityProfile?: Prisma.JsonValue | null;
  operationalProfile?: Prisma.JsonValue | null;
  identityVerificationMetadata?: Prisma.JsonValue | null;
  identityProviderRawData?: Prisma.JsonValue | null;
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
  driverLicenceVerification?: {
    id: string;
    status: string;
    licenceNumber: string;
    maskedLicenceNumber: string;
    validity: 'valid' | 'invalid' | 'unknown' | null;
    issueDate: string | null;
    expiryDate: string | null;
    expiresSoon: boolean;
    isExpired: boolean;
    providerName: string | null;
    providerReference: string | null;
    holderFirstName: string | null;
    holderMiddleName: string | null;
    holderLastName: string | null;
    holderFullName: string | null;
    holderDateOfBirth: string | null;
    holderGender: string | null;
    stateOfIssuance: string | null;
    licenceClass: string | null;
    portraitUrl: string | null;
    linkageStatus: 'matched' | 'mismatch' | 'pending' | 'insufficient_data';
    demographicMatchScore: number | null;
    biometricMatchScore: number | null;
    linkageConfidence: number | null;
    overallLinkageScore: number | null;
    linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
    linkageReasons: string[];
    discrepancyFlags: string[];
    identityComparison: {
      firstNameMatch: boolean | null;
      middleNameMatch: boolean | null;
      lastNameMatch: boolean | null;
      dateOfBirthMatch: boolean | null;
      genderMatch: boolean | null;
      biometricMatch: boolean | null;
      biometricConfidence: number | null;
      matchedFieldCount: number;
      comparedFieldCount: number;
    };
    reviewCaseId: string | null;
    manualReviewRequired: boolean;
    reviewDecision: 'approved' | 'rejected' | 'request_reverification' | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    riskImpact: 'low' | 'medium' | 'high' | 'critical';
    riskSummary: string;
    failureReason: string | null;
    verifiedAt: string | null;
  } | null;
};

type DriverMobileAccessSummary = {
  hasMobileAccess: boolean;
  mobileAccessStatus?: string | null;
};

type DriverReadinessSummary = {
  verificationTier?: VerificationTier;
  verificationTierLabel?: string;
  verificationTierDescription?: string;
  verificationComponents?: Array<{
    key: VerificationComponentKey;
    label: string;
    required: boolean;
    status: 'completed' | 'pending' | 'not_required';
    message: string;
  }>;
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
  /** Non-blocking risk signals that don't prevent readiness but should be surfaced. */
  localRiskFlags?: string[];
};

type DriverOperationalProfile = {
  phoneNumber?: string;
  address?: string;
  town?: string;
  localGovernmentArea?: string;
  state?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
};

type DriverGuarantorCapacityAssessment = {
  matched: boolean;
  matchedBy: Array<'phone' | 'email'>;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorEmail: string | null;
  activeDriverCount: number;
  organisationLimit: number;
  eligible: boolean;
  linkedToCurrentDriver: boolean;
  message: string;
};

type VerifiedContactBindingConflict = {
  entityType: 'driver' | 'guarantor';
  contactType: 'email' | 'phone';
  personId: string | null;
};

const DRIVER_OPERATIONAL_FIELD_LABELS: Record<keyof DriverOperationalProfile, string> = {
  phoneNumber: 'Phone number',
  address: 'Address',
  town: 'Town',
  localGovernmentArea: 'Local government area',
  state: 'State',
  nextOfKinName: 'Next of kin name',
  nextOfKinPhone: 'Next of kin phone',
  nextOfKinRelationship: 'Next of kin relationship',
  emergencyContactName: 'Emergency contact name',
  emergencyContactPhone: 'Emergency contact phone',
  emergencyContactRelationship: 'Emergency contact relationship',
};

const DRIVER_VERIFICATION_TIERS: VerificationTier[] = [
  'BASIC_IDENTITY',
  'VERIFIED_IDENTITY',
  'FULL_TRUST_VERIFICATION',
];

type SelfServiceAssignmentSummary = {
  id: string;
  status: string;
  driverId: string;
  vehicleId: string;
  fleetId: string;
  paymentModel: 'remittance' | 'salary' | 'commission' | 'hire_purchase' | null;
  remittanceAmountMinorUnits: number | null;
  remittanceCurrency: string | null;
  remittanceFrequency: string | null;
  remittanceStartDate: string | null;
  contractStatus: string | null;
  driverConfirmedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  financialContract: ReturnType<typeof parseFinancialContractSnapshot>;
  vehicle: {
    id: string;
    make: string | null;
    model: string | null;
    plate: string | null;
    tenantVehicleCode: string | null;
    systemVehicleCode: string | null;
    status: string;
  };
};

type DriverCanonicalInsights = {
  driverIdentity: {
    personId: string | null;
    tenantCount: number | null;
    hasMultiTenantPresence: boolean;
    hasMultiRolePresence: boolean;
    linkedRoles: string[];
  };
  guarantorIdentity: {
    personId: string | null;
    tenantCount: number | null;
    hasMultiTenantPresence: boolean;
    hasMultiRolePresence: boolean;
    linkedRoles: string[];
    reuseCount: number | null;
  } | null;
  fraudIndicators: string[];
};

type VerificationComponentSummary = {
  key: VerificationComponentKey;
  label: string;
  required: boolean;
  status: 'completed' | 'pending' | 'not_required';
  message: string;
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
type VerificationAddonChargeKey = 'guarantor_verification' | 'drivers_license_verification';
type VerificationEntitlementPurpose =
  | 'identity_verification'
  | VerificationAddonChargeKey;
type VerificationFlowState =
  | 'not_started'
  | 'in_progress'
  | 'provider_called'
  | 'success'
  | 'failed';

type DriverLivenessReadiness = {
  countryCode: string;
  ready: boolean;
  status: 'ready' | 'misconfigured' | 'temporarily_unavailable' | 'unsupported_country';
  activeProvider?: string;
  configuredProviders: string[];
  checkedAt: string;
  message: string;
};

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
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    fullAddress?: string;
    addressLine?: string;
    town?: string;
    localGovernmentArea?: string;
    state?: string;
    mobileNumber?: string;
    emailAddress?: string;
    birthState?: string;
    birthLga?: string;
    nextOfKinState?: string;
    religion?: string;
    ninIdNumber?: string;
    gender?: string;
    photoUrl?: string;
    signatureUrl?: string;
    providerImageUrl?: string;
    selfieImageUrl?: string;
  };
  verificationMetadata?: {
    validity?: 'valid' | 'invalid' | 'unknown';
    issueDate?: string;
    expiryDate?: string;
    portraitAvailable?: boolean;
    matchScore?: number;
    riskScore?: number;
  };
  providerAudit?: Record<string, unknown>;
  providerPending?: boolean;
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
  inviteStatus?: string | null;
  lastInviteSentAt?: Date | null;
  inviteExpiresAt?: Date | null;
  guarantorReminderCount?: number | null;
  lastGuarantorReminderSentAt?: Date | null;
  guarantorReminderSuppressed?: boolean | null;
  responsibilityAcceptedAt?: Date | null;
  responsibilityAcceptanceEvidence?: Prisma.JsonValue | null;
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
const SELF_SERVICE_INVITE_TTL_MS = 48 * 60 * 60 * 1000;
const GUARANTOR_REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MAX_GUARANTOR_REMINDER_COUNT = 3;

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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type DriverDocumentReviewQueueItem = DriverDocumentRecord & {
  driverName: string;
  driverPhone: string;
  driverStatus: string;
  fleetId: string;
};

type DriverLicenceReviewQueueItem = {
  id: string;
  tenantId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverStatus: string;
  fleetId: string;
  status: string;
  validity: 'valid' | 'invalid' | 'unknown' | null;
  expiryDate: string | null;
  linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
  overallLinkageScore: number | null;
  riskImpact: 'low' | 'medium' | 'high' | 'critical';
  reviewCaseId: string | null;
  createdAt: Date;
  verifiedAt: Date | null;
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
  private static readonly guarantorInvitationMessages = {
    sent:
      'Guarantor saved. A verification link and code have been sent to the guarantor email address. We will remind both of you until verification is complete.',
    already_verified: 'Guarantor saved. This guarantor is already verified.',
    missing_email:
      'Guarantor saved, but no email address was provided for the verification link yet. Add one so we can send the onboarding link and code.',
    operator_action_required:
      'Guarantor saved. Your operator needs to send the guarantor verification link.',
    queued_until_driver_verified:
      'Guarantor saved. The verification link will be sent after your identity verification is completed.',
    failed:
      'Guarantor saved, but we could not send the verification link and code right now. Please ask your operator to retry.',
    not_ready: 'Guarantor saved.',
  } as const;

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

  private readJsonString(
    value: Prisma.JsonValue | Record<string, unknown> | null | undefined,
    key: string,
  ): string | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return typeof value[key] === 'string' ? (value[key] as string) : null;
  }

  private readOperationalProfile(
    value: Prisma.JsonValue | null | undefined,
    fallback?: { phone?: string | null },
  ): DriverOperationalProfile {
    const profile = isVerificationMetadataRecord(value) ? value : null;
    return {
      ...(this.readJsonString(profile, 'phoneNumber') ?? fallback?.phone
        ? { phoneNumber: this.readJsonString(profile, 'phoneNumber') ?? fallback?.phone ?? '' }
        : {}),
      ...(this.readJsonString(profile, 'address')
        ? { address: this.readJsonString(profile, 'address') ?? '' }
        : {}),
      ...(this.readJsonString(profile, 'town')
        ? { town: this.readJsonString(profile, 'town') ?? '' }
        : {}),
      ...(this.readJsonString(profile, 'localGovernmentArea')
        ? {
            localGovernmentArea: this.readJsonString(profile, 'localGovernmentArea') ?? '',
          }
        : {}),
      ...(this.readJsonString(profile, 'state')
        ? { state: this.readJsonString(profile, 'state') ?? '' }
        : {}),
      ...(this.readJsonString(profile, 'nextOfKinName')
        ? { nextOfKinName: this.readJsonString(profile, 'nextOfKinName') ?? '' }
        : {}),
      ...(this.readJsonString(profile, 'nextOfKinPhone')
        ? { nextOfKinPhone: this.readJsonString(profile, 'nextOfKinPhone') ?? '' }
        : {}),
      ...(this.readJsonString(profile, 'nextOfKinRelationship')
        ? {
            nextOfKinRelationship: this.readJsonString(profile, 'nextOfKinRelationship') ?? '',
          }
        : {}),
      ...(this.readJsonString(profile, 'emergencyContactName')
        ? {
            emergencyContactName: this.readJsonString(profile, 'emergencyContactName') ?? '',
          }
        : {}),
      ...(this.readJsonString(profile, 'emergencyContactPhone')
        ? {
            emergencyContactPhone: this.readJsonString(profile, 'emergencyContactPhone') ?? '',
          }
        : {}),
      ...(this.readJsonString(profile, 'emergencyContactRelationship')
        ? {
            emergencyContactRelationship:
              this.readJsonString(profile, 'emergencyContactRelationship') ?? '',
          }
        : {}),
    };
  }

  private getMissingOperationalProfileFields(
    profile: DriverOperationalProfile,
  ): Array<keyof DriverOperationalProfile> {
    const requiredFields: Array<keyof DriverOperationalProfile> = [
      'phoneNumber',
      'address',
      'town',
      'localGovernmentArea',
      'state',
      'nextOfKinName',
      'nextOfKinPhone',
      'emergencyContactName',
      'emergencyContactPhone',
    ];
    return requiredFields.filter((field) => {
      const value = profile[field];
      return typeof value !== 'string' || value.trim().length === 0;
    });
  }

  private formatOperationalFieldLabels(
    fields: Array<keyof DriverOperationalProfile>,
  ): string[] {
    return fields.map((field) => DRIVER_OPERATIONAL_FIELD_LABELS[field] ?? field);
  }

  private normalizeDriverVerificationTierOverride(
    tier?: string | null,
  ): VerificationTier | null {
    if (!tier) {
      return null;
    }
    return DRIVER_VERIFICATION_TIERS.includes(tier as VerificationTier)
      ? (tier as VerificationTier)
      : null;
  }

  private getEffectiveDriverVerificationTier(
    settings: {
      verificationTier?: VerificationTier;
      requireGuarantor?: boolean;
      requiredDriverDocumentSlugs?: string[];
    },
    driver: { verificationTierOverride?: string | null },
  ): VerificationTier {
    return (
      this.normalizeDriverVerificationTierOverride(driver.verificationTierOverride) ??
      resolveVerificationTier(settings)
    );
  }

  private getEffectiveDriverVerificationPolicy(
    settings: {
      verificationTier?: VerificationTier;
      requireGuarantor?: boolean;
      requiredDriverDocumentSlugs?: string[];
    },
    driver: { verificationTierOverride?: string | null },
    currency = 'NGN',
  ) {
    const tier = this.getEffectiveDriverVerificationTier(settings, driver);
    return resolveVerificationPolicy({ verificationTier: tier }, currency);
  }

  private getEffectiveDriverOperationsSettings<
    TSettings extends {
      verificationTier?: VerificationTier;
      requireGuarantor?: boolean;
      requiredDriverDocumentSlugs?: string[];
    },
  >(settings: TSettings, driver: { verificationTierOverride?: string | null }): TSettings {
    const policy = this.getEffectiveDriverVerificationPolicy(settings, driver);
    return {
      ...settings,
      verificationTier: policy.tier,
      requireGuarantor: policy.components.includes('guarantor'),
      requiredDriverDocumentSlugs: policy.components.includes('drivers_license')
        ? [DRIVER_LICENCE_DOCUMENT_TYPE]
        : [],
    };
  }

  private normalizeComparableText(value?: string | null): string | null {
    if (!value) {
      return null;
    }
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ');
    return normalized.length > 0 ? normalized : null;
  }

  private normalizeComparableGender(value?: string | null): string | null {
    if (!value) {
      return null;
    }
    const normalized = value.trim().toLowerCase();
    if (['m', 'male'].includes(normalized)) return 'male';
    if (['f', 'female'].includes(normalized)) return 'female';
    return normalized.length > 0 ? normalized : null;
  }

  private computeTextSimilarity(left?: string | null, right?: string | null): number | null {
    const a = this.normalizeComparableText(left);
    const b = this.normalizeComparableText(right);
    if (!a || !b) {
      return null;
    }
    if (a === b) {
      return 100;
    }
    const aTokens = new Set(a.split(' ').filter(Boolean));
    const bTokens = new Set(b.split(' ').filter(Boolean));
    const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
    const total = new Set([...aTokens, ...bTokens]).size;
    if (total === 0) {
      return null;
    }
    return Math.max(0, Math.min(100, Math.round((overlap / total) * 100)));
  }

  private isDateExpired(value?: string | null): boolean {
    if (!value) {
      return false;
    }
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) && timestamp < Date.now();
  }

  private isDateExpiringSoon(value?: string | null, withinDays = 30): boolean {
    if (!value) {
      return false;
    }
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) {
      return false;
    }
    const diffMs = timestamp - Date.now();
    return diffMs >= 0 && diffMs <= withinDays * 24 * 60 * 60 * 1000;
  }

  private maskSensitiveDocumentNumber(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length <= 4) {
      return trimmed;
    }
    return `${'*'.repeat(Math.max(0, trimmed.length - 4))}${trimmed.slice(-4)}`;
  }

  private getDriverIdentityReference(
    driver: DriverWithIdentityState & Partial<DriverDocumentSummary>,
  ): {
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    fullName: string | null;
    selfieImageUrl: string | null;
    providerImageUrl: string | null;
  } {
    const profile = isVerificationMetadataRecord(driver.identityProfile)
      ? driver.identityProfile
      : null;
    const firstName = this.readJsonString(profile, 'firstName') ?? driver.firstName ?? null;
    const middleName = this.readJsonString(profile, 'middleName');
    const lastName = this.readJsonString(profile, 'lastName') ?? driver.lastName ?? null;
    const dateOfBirth = this.readJsonString(profile, 'dateOfBirth') ?? driver.dateOfBirth ?? null;
    const gender =
      this.normalizeComparableGender(this.readJsonString(profile, 'gender') ?? driver.gender) ??
      null;
    const fullName =
      this.readJsonString(profile, 'fullName') ??
      [firstName, middleName, lastName].filter(Boolean).join(' ').trim() ??
      null;
    return {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      fullName: fullName || null,
      selfieImageUrl:
        this.readJsonString(profile, 'selfieImageUrl') ?? driver.selfieImageUrl ?? null,
      providerImageUrl:
        this.readJsonString(profile, 'providerImageUrl') ?? driver.providerImageUrl ?? null,
    };
  }

  private evaluateDriverLicenceLinkage(
    reference: ReturnType<DriversService['getDriverIdentityReference']>,
    provider: {
      firstName?: string | null;
      middleName?: string | null;
      lastName?: string | null;
      dateOfBirth?: string | null;
      gender?: string | null;
      auditRecord?: Record<string, unknown> | null;
    },
  ): {
    linkageStatus: 'matched' | 'mismatch' | 'pending' | 'insufficient_data';
    demographicMatchScore: number | null;
    biometricMatchScore: number | null;
    overallLinkageScore: number | null;
    linkageReasons: string[];
    discrepancyFlags: string[];
    identityComparison: {
      firstNameMatch: boolean | null;
      middleNameMatch: boolean | null;
      lastNameMatch: boolean | null;
      dateOfBirthMatch: boolean | null;
      genderMatch: boolean | null;
      biometricMatch: boolean | null;
      biometricConfidence: number | null;
      matchedFieldCount: number;
      comparedFieldCount: number;
    };
    hardFailure: boolean;
  } {
    const weightedScores: Array<{ score: number; weight: number }> = [];
    const linkageReasons: string[] = [];
    const discrepancyFlags: string[] = [];
    const firstNameScore = this.computeTextSimilarity(reference.firstName, provider.firstName);
    const firstNameMatch = firstNameScore === null ? null : firstNameScore >= 85;
    if (firstNameScore !== null) weightedScores.push({ score: firstNameScore, weight: 15 });
    const middleNameScore = this.computeTextSimilarity(reference.middleName, provider.middleName);
    const middleNameMatch = middleNameScore === null ? null : middleNameScore >= 85;
    if (middleNameScore !== null) weightedScores.push({ score: middleNameScore, weight: 10 });
    const lastNameScore = this.computeTextSimilarity(reference.lastName, provider.lastName);
    const lastNameMatch = lastNameScore === null ? null : lastNameScore >= 85;
    if (lastNameScore !== null) weightedScores.push({ score: lastNameScore, weight: 20 });
    const fullNameScore = this.computeTextSimilarity(
      reference.fullName,
      [provider.firstName, provider.middleName, provider.lastName].filter(Boolean).join(' '),
    );
    if (fullNameScore !== null) weightedScores.push({ score: fullNameScore, weight: 10 });
    const dateOfBirthMatch =
      reference.dateOfBirth && provider.dateOfBirth ? reference.dateOfBirth === provider.dateOfBirth : null;
    if (reference.dateOfBirth && provider.dateOfBirth) {
      if (reference.dateOfBirth !== provider.dateOfBirth) {
        linkageReasons.push('Date of birth does not match the NIN-verified identity.');
        discrepancyFlags.push('date_of_birth_mismatch');
      }
      weightedScores.push({
        score: reference.dateOfBirth === provider.dateOfBirth ? 100 : 0,
        weight: 35,
      });
    }
    const normalizedProviderGender = this.normalizeComparableGender(provider.gender);
    const genderMatch =
      reference.gender && normalizedProviderGender ? reference.gender === normalizedProviderGender : null;
    if (reference.gender && normalizedProviderGender) {
      if (reference.gender !== normalizedProviderGender) {
        linkageReasons.push(
          'Gender returned by the licence provider differs from the verified identity.',
        );
        discrepancyFlags.push('gender_mismatch');
      }
      weightedScores.push({
        score: reference.gender === normalizedProviderGender ? 100 : 0,
        weight: 10,
      });
    }

    const totalWeight = weightedScores.reduce((sum, entry) => sum + entry.weight, 0);
    const demographicMatchScore =
      totalWeight > 0
        ? Math.round(
            weightedScores.reduce((sum, entry) => sum + entry.score * entry.weight, 0) /
              totalWeight,
          )
        : null;

    const validations =
      provider.auditRecord && isObjectRecord(provider.auditRecord.validations)
        ? provider.auditRecord.validations
        : null;
    const selfie = validations && isObjectRecord(validations.selfie) ? validations.selfie : null;
    const biometricMatch =
      selfie && typeof selfie.match === 'boolean' ? (selfie.match as boolean) : null;
    const biometricConfidence =
      selfie && typeof selfie.confidenceLevel === 'number'
        ? (selfie.confidenceLevel as number)
        : null;
    const biometricMatchScore =
      biometricMatch === false
        ? (biometricConfidence ?? 0)
        : biometricConfidence !== null
          ? Math.max(0, Math.min(100, Math.round(biometricConfidence)))
          : null;
    const biometricMatchResult = biometricMatch === null ? null : biometricMatch;

    if (firstNameMatch === false) discrepancyFlags.push('first_name_mismatch');
    if (middleNameMatch === false) discrepancyFlags.push('middle_name_mismatch');
    if (lastNameMatch === false) discrepancyFlags.push('last_name_mismatch');
    if (biometricMatch === false || (biometricMatchScore !== null && biometricMatchScore < 70)) {
      discrepancyFlags.push('biometric_mismatch');
    }

    const comparedFieldMatches = [
      firstNameMatch,
      middleNameMatch,
      lastNameMatch,
      dateOfBirthMatch,
      genderMatch,
    ].filter((value): value is boolean => value !== null);
    const matchedFieldCount = comparedFieldMatches.filter(Boolean).length;
    const comparedFieldCount = comparedFieldMatches.length;

    const overallLinkageScore =
      demographicMatchScore !== null && biometricMatchScore !== null
        ? Math.round(demographicMatchScore * 0.55 + biometricMatchScore * 0.45)
        : demographicMatchScore;

    const hardFailure =
      (reference.dateOfBirth !== null &&
        provider.dateOfBirth !== null &&
        reference.dateOfBirth !== provider.dateOfBirth) ||
      (biometricMatchScore !== null && biometricMatchScore < 60);

    if (biometricMatchScore === null) {
      linkageReasons.push(
        'Biometric linkage data was not returned, so human review is required before auto-pass.',
      );
      return {
        linkageStatus: 'insufficient_data',
        demographicMatchScore,
        biometricMatchScore,
        overallLinkageScore,
        linkageReasons,
        discrepancyFlags: Array.from(new Set(discrepancyFlags)),
        identityComparison: {
          firstNameMatch,
          middleNameMatch,
          lastNameMatch,
          dateOfBirthMatch,
          genderMatch,
          biometricMatch: biometricMatchResult,
          biometricConfidence: biometricMatchScore,
          matchedFieldCount,
          comparedFieldCount,
        },
        hardFailure,
      };
    }

    if (
      hardFailure ||
      (demographicMatchScore !== null && demographicMatchScore < 65) ||
      biometricMatchScore < 70 ||
      (overallLinkageScore !== null && overallLinkageScore < 60)
    ) {
      if (biometricMatchScore < 70) {
        linkageReasons.push(
          'Biometric similarity is too weak for the licence to be linked safely.',
        );
      }
      return {
        linkageStatus: 'mismatch',
        demographicMatchScore,
        biometricMatchScore,
        overallLinkageScore,
        linkageReasons,
        discrepancyFlags: Array.from(new Set(discrepancyFlags)),
        identityComparison: {
          firstNameMatch,
          middleNameMatch,
          lastNameMatch,
          dateOfBirthMatch,
          genderMatch,
          biometricMatch: biometricMatchResult,
          biometricConfidence: biometricMatchScore,
          matchedFieldCount,
          comparedFieldCount,
        },
        hardFailure,
      };
    }

    if (
      (demographicMatchScore !== null && demographicMatchScore < 85) ||
      biometricMatchScore < 85 ||
      (overallLinkageScore !== null && overallLinkageScore < 85)
    ) {
      linkageReasons.push(
        'The licence is valid, but the linkage confidence is not strong enough for automatic approval.',
      );
      return {
        linkageStatus: 'pending',
        demographicMatchScore,
        biometricMatchScore,
        overallLinkageScore,
        linkageReasons,
        discrepancyFlags: Array.from(new Set(discrepancyFlags)),
        identityComparison: {
          firstNameMatch,
          middleNameMatch,
          lastNameMatch,
          dateOfBirthMatch,
          genderMatch,
          biometricMatch: biometricMatchResult,
          biometricConfidence: biometricMatchScore,
          matchedFieldCount,
          comparedFieldCount,
        },
        hardFailure,
      };
    }

    return {
      linkageStatus: 'matched',
      demographicMatchScore,
      biometricMatchScore,
      overallLinkageScore,
      linkageReasons,
      discrepancyFlags: Array.from(new Set(discrepancyFlags)),
      identityComparison: {
        firstNameMatch,
        middleNameMatch,
        lastNameMatch,
        dateOfBirthMatch,
        genderMatch,
        biometricMatch: biometricMatchResult,
        biometricConfidence: biometricMatchScore,
        matchedFieldCount,
        comparedFieldCount,
      },
      hardFailure,
    };
  }

  private assessDriverLicenceRisk(input: {
    validity: 'valid' | 'invalid' | 'unknown' | null;
    expiryDate: string | null;
    linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
  }): {
    riskImpact: 'low' | 'medium' | 'high' | 'critical';
    riskSummary: string;
  } {
    if (input.validity === 'invalid' || this.isDateExpired(input.expiryDate)) {
      return {
        riskImpact: 'critical',
        riskSummary: "Driver's licence is expired or invalid and should block driving readiness.",
      };
    }
    if (input.linkageDecision === 'fail') {
      return {
        riskImpact: 'high',
        riskSummary: "Driver's licence could not be linked to the verified identity.",
      };
    }
    if (input.linkageDecision === 'pending_human_review') {
      return {
        riskImpact: 'medium',
        riskSummary:
          "Driver's licence needs additional verification before confidence can improve.",
      };
    }
    if (this.isDateExpiringSoon(input.expiryDate, 60)) {
      return {
        riskImpact: 'medium',
        riskSummary:
          "Driver's licence is valid but close to expiry. Renewal should be planned soon.",
      };
    }
    return {
      riskImpact: 'low',
      riskSummary: "Driver's licence is valid and strongly linked to the verified identity.",
    };
  }

  private buildDriverLicenceVerificationSummary(
    verification: DriverDocumentVerificationRecord,
  ): DriverDocumentSummary['driverLicenceVerification'] {
    if (
      this.normalizeStoredDocumentType(verification.documentType) !== DRIVER_LICENCE_DOCUMENT_TYPE
    ) {
      return null;
    }
    const providerResult = isVerificationMetadataRecord(verification.providerResult)
      ? verification.providerResult
      : null;
    const holder =
      providerResult && isVerificationMetadataRecord(providerResult.holder)
        ? providerResult.holder
        : null;
    const linkage =
      providerResult && isVerificationMetadataRecord(providerResult.linkage)
        ? providerResult.linkage
        : null;
    const risk =
      providerResult && isVerificationMetadataRecord(providerResult.risk)
        ? providerResult.risk
        : null;
    const expiryDate =
      verification.providerExpiryDate ?? this.readJsonString(providerResult, 'expiryDate');
    return {
      id: verification.id,
      status: verification.status,
      licenceNumber: verification.idNumber,
      maskedLicenceNumber: this.maskSensitiveDocumentNumber(verification.idNumber),
      validity:
        providerResult && typeof providerResult.validity === 'string'
          ? (providerResult.validity as 'valid' | 'invalid' | 'unknown')
          : null,
      issueDate: this.readJsonString(providerResult, 'issueDate'),
      expiryDate,
      expiresSoon: this.isDateExpiringSoon(expiryDate, 60),
      isExpired: this.isDateExpired(expiryDate),
      providerName: verification.provider ?? null,
      providerReference: this.readJsonString(providerResult, 'providerReference'),
      holderFirstName:
        holder && typeof holder.firstName === 'string' ? holder.firstName : null,
      holderMiddleName:
        holder && typeof holder.middleName === 'string' ? holder.middleName : null,
      holderLastName:
        holder && typeof holder.lastName === 'string' ? holder.lastName : null,
      holderFullName:
        [
          holder && typeof holder.firstName === 'string' ? holder.firstName : null,
          holder && typeof holder.middleName === 'string' ? holder.middleName : null,
          holder && typeof holder.lastName === 'string' ? holder.lastName : null,
        ]
          .filter(Boolean)
          .join(' ') || null,
      holderDateOfBirth:
        holder && typeof holder.dateOfBirth === 'string' ? holder.dateOfBirth : null,
      holderGender: holder && typeof holder.gender === 'string' ? holder.gender : null,
      stateOfIssuance: this.readJsonString(providerResult, 'stateOfIssuance'),
      licenceClass: this.readJsonString(providerResult, 'licenceClass'),
      portraitUrl: this.readJsonString(providerResult, 'portraitUrl'),
      linkageStatus:
        linkage && typeof linkage.status === 'string'
          ? (linkage.status as 'matched' | 'mismatch' | 'pending' | 'insufficient_data')
          : 'pending',
      demographicMatchScore:
        linkage && typeof linkage.demographicMatchScore === 'number'
          ? linkage.demographicMatchScore
          : null,
      biometricMatchScore:
        linkage && typeof linkage.biometricMatchScore === 'number'
          ? linkage.biometricMatchScore
          : null,
      linkageConfidence:
        linkage && typeof linkage.overallLinkageScore === 'number'
          ? linkage.overallLinkageScore
          : linkage && typeof linkage.linkageConfidence === 'number'
            ? linkage.linkageConfidence
            : null,
      overallLinkageScore:
        linkage && typeof linkage.overallLinkageScore === 'number'
          ? linkage.overallLinkageScore
          : null,
      linkageDecision:
        linkage && typeof linkage.decision === 'string'
          ? (linkage.decision as 'auto_pass' | 'pending_human_review' | 'fail')
          : 'fail',
      linkageReasons:
        linkage &&
        Array.isArray(linkage.reasons) &&
        linkage.reasons.every((value) => typeof value === 'string')
          ? (linkage.reasons as string[])
          : [],
      discrepancyFlags:
        linkage &&
        Array.isArray(linkage.discrepancyFlags) &&
        linkage.discrepancyFlags.every((value) => typeof value === 'string')
          ? (linkage.discrepancyFlags as string[])
          : [],
      identityComparison:
        linkage && isVerificationMetadataRecord(linkage.identityComparison)
          ? {
              firstNameMatch:
                typeof linkage.identityComparison.firstNameMatch === 'boolean'
                  ? linkage.identityComparison.firstNameMatch
                  : null,
              middleNameMatch:
                typeof linkage.identityComparison.middleNameMatch === 'boolean'
                  ? linkage.identityComparison.middleNameMatch
                  : null,
              lastNameMatch:
                typeof linkage.identityComparison.lastNameMatch === 'boolean'
                  ? linkage.identityComparison.lastNameMatch
                  : null,
              dateOfBirthMatch:
                typeof linkage.identityComparison.dateOfBirthMatch === 'boolean'
                  ? linkage.identityComparison.dateOfBirthMatch
                  : null,
              genderMatch:
                typeof linkage.identityComparison.genderMatch === 'boolean'
                  ? linkage.identityComparison.genderMatch
                  : null,
              biometricMatch:
                typeof linkage.identityComparison.biometricMatch === 'boolean'
                  ? linkage.identityComparison.biometricMatch
                  : null,
              biometricConfidence:
                typeof linkage.identityComparison.biometricConfidence === 'number'
                  ? linkage.identityComparison.biometricConfidence
                  : null,
              matchedFieldCount:
                typeof linkage.identityComparison.matchedFieldCount === 'number'
                  ? linkage.identityComparison.matchedFieldCount
                  : 0,
              comparedFieldCount:
                typeof linkage.identityComparison.comparedFieldCount === 'number'
                  ? linkage.identityComparison.comparedFieldCount
                  : 0,
            }
          : {
              firstNameMatch: null,
              middleNameMatch: null,
              lastNameMatch: null,
              dateOfBirthMatch: null,
              genderMatch: null,
              biometricMatch: null,
              biometricConfidence: null,
              matchedFieldCount: 0,
              comparedFieldCount: 0,
            },
      reviewCaseId: this.readJsonString(providerResult, 'reviewCaseId'),
      manualReviewRequired:
        providerResult && typeof providerResult.manualReviewRequired === 'boolean'
          ? providerResult.manualReviewRequired
          : false,
      reviewDecision:
        providerResult && typeof providerResult.reviewDecision === 'string'
          ? (providerResult.reviewDecision as 'approved' | 'rejected' | 'request_reverification')
          : null,
      reviewedBy: verification.reviewedBy ?? null,
      reviewedAt: verification.reviewedAt ? verification.reviewedAt.toISOString() : null,
      reviewNotes: verification.reviewNotes ?? null,
      riskImpact:
        risk && typeof risk.impact === 'string'
          ? (risk.impact as 'low' | 'medium' | 'high' | 'critical')
          : 'medium',
      riskSummary:
        risk && typeof risk.summary === 'string'
          ? risk.summary
          : (verification.failureReason ?? 'Driver licence verification is pending.'),
      failureReason: verification.failureReason ?? null,
      verifiedAt: verification.verifiedAt ? verification.verifiedAt.toISOString() : null,
    };
  }

  private get driverDocumentVerifications(): {
    create(args: {
      data: Record<string, unknown>;
    }): Promise<DriverDocumentVerificationRecord>;
    findFirst(args: Record<string, unknown>): Promise<DriverDocumentVerificationRecord | null>;
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
          findFirst(
            args: Record<string, unknown>,
          ): Promise<DriverDocumentVerificationRecord | null>;
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
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
    private readonly verificationSpendService: VerificationSpendService = {
      getSpendSummary: async () => ({
        currency: 'NGN',
        walletBalanceMinorUnits: 2_000_000,
        creditLimitMinorUnits: 0,
        creditUsedMinorUnits: 0,
        availableSpendMinorUnits: 2_000_000,
        starterCreditActive: false,
        starterCreditEligible: false,
        cardCreditActive: false,
        unlockedTiers: ['BASIC_IDENTITY', 'VERIFIED_IDENTITY', 'FULL_TRUST_VERIFICATION'],
        savedCard: null,
      }),
      saveAuthorizedCard: async () => undefined,
      ensureVerificationSpendApplied: async () => ({
        status: 'applied',
        fundingSource: 'wallet' as const,
      }),
    } as unknown as VerificationSpendService,
  ) {}

  private readonly selfServicePurpose = 'driver_self_service';

  private formatCurrencyAmount(amountMinorUnits: number, currency: string): string {
    return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amountMinorUnits / 100);
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
    purpose: VerificationEntitlementPurpose = 'identity_verification',
  ): Promise<VerificationEntitlementRecord | null> {
    const rows = await this.prisma.$queryRaw<VerificationEntitlementRecord[]>(Prisma.sql`
      SELECT *
      FROM "verification_entitlements"
      WHERE "tenantId" = ${tenantId}
        AND "subjectType" = ${subjectType}
        AND "subjectId" = ${subjectId}
        AND "purpose" = ${purpose}
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
        purpose,
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
    purpose?: VerificationEntitlementPurpose;
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
        ${input.purpose ?? 'identity_verification'},
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
    purpose?: VerificationEntitlementPurpose;
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
      input.purpose ?? 'identity_verification',
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
      purpose: input.purpose ?? 'identity_verification',
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

  private async getSelfServiceVerificationPolicy(
    tenantId: string,
    driver: DriverWithIdentityState,
  ): Promise<{
    verificationTier: VerificationTier;
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
    verificationWalletBalanceMinorUnits: number;
    verificationAvailableSpendMinorUnits: number;
    verificationCreditLimitMinorUnits: number;
    verificationCreditUsedMinorUnits: number;
    verificationStarterCreditActive: boolean;
    verificationCardCreditActive: boolean;
    verificationSavedCard?: {
      provider: string;
      last4: string;
      brand: string;
      status: string;
      active: boolean;
      createdAt: string;
      initialReference: string | null;
    } | null;
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
    const effectiveOperations = this.getEffectiveDriverOperationsSettings(
      settings.operations,
      driver,
    );
    const verificationTier = effectiveOperations.verificationTier;
    const countryCode = driver.nationality ?? tenant?.country ?? null;
    const verificationCurrency =
      countryCode && isCountrySupported(countryCode)
        ? getCountryConfig(countryCode).currency
        : 'NGN';
    const verificationTierPolicy = resolveVerificationPolicy(
      { verificationTier },
      verificationCurrency,
    );
    const verificationAmountMinorUnits = verificationTierPolicy.price.amountMinorUnits;
    const verificationTierLabel = verificationTierPolicy.label;
    const formattedVerificationAmount = this.formatCurrencyAmount(
      verificationAmountMinorUnits,
      verificationCurrency,
    );
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
    let verificationAvailableSpendMinorUnits = 0;
    let verificationWalletBalanceMinorUnits = 0;
    let verificationCreditLimitMinorUnits = 0;
    let verificationCreditUsedMinorUnits = 0;
    let verificationStarterCreditActive = false;
    let verificationCardCreditActive = false;
    let verificationSavedCard:
      | {
          provider: string;
          last4: string;
          brand: string;
          status: string;
          active: boolean;
          createdAt: string;
          initialReference: string | null;
        }
      | null = null;

    if (driverPaysKyc) {
      if (verificationEntitlementState === 'paid' || verificationEntitlementState === 'reserved') {
        verificationPaymentStatus = 'ready';
        verificationPaymentMessage =
          verificationEntitlementState === 'reserved'
            ? `Your payment for ${verificationTierLabel} has already been received. Continue from where you stopped.`
            : `Your payment for ${verificationTierLabel} has already been received. You can continue from where you stopped.`;
      } else if (verificationEntitlementState === 'consumed') {
        // The entitlement was consumed by a prior provider call. Regardless of
        // whether that call succeeded or failed, we do NOT require a new payment —
        // the driver has already paid. If verification failed, they can retry
        // verification without paying again.
        verificationPaymentStatus = 'ready';
        verificationPaymentMessage = verificationAlreadySatisfied
          ? `Your payment for ${verificationTierLabel} has already been used for this completed onboarding flow.`
          : `Your payment for ${verificationTierLabel} was already received. You can retry verification.`;
      } else if (verificationEntitlementState === 'expired') {
        verificationPaymentStatus = 'driver_payment_required';
        verificationPaymentMessage =
          `Your previous ${verificationTierLabel} payment entitlement expired. A new ${formattedVerificationAmount} payment is required before verification can continue.`;
      } else {
        verificationPaymentStatus = 'driver_payment_required';
        verificationPaymentMessage =
          `You must pay ${formattedVerificationAmount} for ${verificationTierLabel} before live verification can continue.`;
      }
    } else if (settings.operations.requireIdentityVerificationForActivation) {
      const spendSummary = await this.verificationSpendService.getSpendSummary(
        tenantId,
        verificationCurrency,
      );
      verificationWalletBalanceMinorUnits = spendSummary.walletBalanceMinorUnits;
      verificationAvailableSpendMinorUnits = spendSummary.availableSpendMinorUnits;
      verificationCreditLimitMinorUnits = spendSummary.creditLimitMinorUnits;
      verificationCreditUsedMinorUnits = spendSummary.creditUsedMinorUnits;
      verificationStarterCreditActive = spendSummary.starterCreditActive;
      verificationCardCreditActive = spendSummary.cardCreditActive;
      verificationSavedCard = spendSummary.savedCard;
      const unlockedByCredit =
        spendSummary.unlockedTiers.includes(verificationTier) ||
        spendSummary.walletBalanceMinorUnits >= verificationAmountMinorUnits;
      verificationPaymentStatus =
        spendSummary.availableSpendMinorUnits >= verificationAmountMinorUnits && unlockedByCredit
          ? 'ready'
          : 'driver_payment_required';
      verificationPaymentMessage =
        verificationPaymentStatus === 'ready'
          ? `Your organisation has enough wallet or credit cover for ${verificationTierLabel} (${formattedVerificationAmount}).`
          : `Your organisation has not prepaid ${verificationTierLabel}. You can pay ${formattedVerificationAmount} now and continue verification immediately.`;
    }

    if (latestAttempt?.status === 'blocked') {
      verificationBlockedReason =
        latestAttempt?.failureReason ??
        'Too many recent verification retries. Please wait before trying again.';
    }

    return {
      verificationTier: verificationTierPolicy.tier,
      enabledDriverIdentifierTypes: settings.operations.enabledDriverIdentifierTypes,
      requiredDriverIdentifierTypes: settings.operations.requiredDriverIdentifierTypes,
      requiredDriverDocumentSlugs: effectiveOperations.requiredDriverDocumentSlugs,
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
      verificationPayer:
        verificationPaymentStatus === 'driver_payment_required'
          ? 'driver'
          : driverPaysKyc
            ? 'driver'
            : 'organisation',
      verificationAmountMinorUnits,
      verificationCurrency,
      verificationWalletBalanceMinorUnits,
      verificationAvailableSpendMinorUnits,
      verificationCreditLimitMinorUnits,
      verificationCreditUsedMinorUnits,
      verificationStarterCreditActive,
      verificationCardCreditActive,
      verificationSavedCard,
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

  private buildVerificationAddonPaymentMessage(input: {
    key: VerificationAddonChargeKey;
    amount: string;
    status: 'driver_payment_required' | 'ready' | 'not_required';
  }): string {
    const label =
      input.key === 'guarantor_verification'
        ? 'guarantor verification'
        : "driver's licence verification";
    if (input.status === 'ready') {
      return `Payment for ${label} has already been received. You can continue.`;
    }
    if (input.status === 'not_required') {
      return `${label.charAt(0).toUpperCase()}${label.slice(1)} is covered by your organisation.`;
    }
    return `You must pay ${input.amount} for ${label} before it can continue.`;
  }

  private async getDriverVerificationAddonPaymentPolicy(
    tenantId: string,
    driver: DriverWithIdentityState,
    key: VerificationAddonChargeKey,
  ): Promise<{
    key: VerificationAddonChargeKey;
    required: boolean;
    paymentStatus: 'not_required' | 'ready' | 'driver_payment_required';
    paymentMessage: string;
    amountMinorUnits: number;
    currency: string;
    payer: 'driver' | 'organisation';
    entitlementState: VerificationEntitlementState;
    entitlementCode?: string | null;
    paymentReference?: string | null;
  }> {
    const guarantorRequirement = await this.getDriverGuarantorRequirement(tenantId, driver);
    const tenant = guarantorRequirement.tenant;
    const settings = guarantorRequirement.settings;
    const effectiveOperations = guarantorRequirement.effectiveOperations;
    const addonRequired =
      key === 'guarantor_verification'
        ? guarantorRequirement.verificationRequired &&
          !guarantorRequirement.requiredByTier &&
          driver.identityStatus === 'verified'
        : (effectiveOperations.requiredDriverDocumentSlugs ?? []).includes(
            DRIVER_LICENCE_DOCUMENT_TYPE,
          );
    const currency = guarantorRequirement.currency;
    const addonPrice = getVerificationAddonPrice(key, currency);
    const entitlement = await this.getLatestVerificationEntitlement(
      tenantId,
      'driver',
      driver.id,
      key,
    );
    const entitlementState = this.mapEntitlementState(entitlement);
    const alreadyPaid = ['paid', 'reserved', 'consumed'].includes(entitlementState);
    const paymentStatus = !addonRequired
      ? 'not_required'
      : settings.operations.driverPaysKyc
        ? alreadyPaid
          ? 'ready'
          : 'driver_payment_required'
        : 'not_required';
    const amount = this.formatCurrencyAmount(addonPrice.amountMinorUnits, addonPrice.currency);

    return {
      key,
      required: addonRequired,
      paymentStatus,
      paymentMessage: this.buildVerificationAddonPaymentMessage({
        key,
        amount,
        status: paymentStatus,
      }),
      amountMinorUnits: addonPrice.amountMinorUnits,
      currency: addonPrice.currency,
      payer: settings.operations.driverPaysKyc ? 'driver' : 'organisation',
      entitlementState,
      entitlementCode: entitlement?.entitlementCode ?? null,
      paymentReference: entitlement?.paymentReference ?? null,
    };
  }

  private async getDriverGuarantorRequirement(
    tenantId: string,
    driver: DriverWithIdentityState,
  ): Promise<{
    tenant: { country: string | null; metadata: Prisma.JsonValue | null } | null;
    settings: ReturnType<typeof readOrganisationSettings>;
    effectiveOperations: {
      verificationTier?: VerificationTier;
      requireGuarantor?: boolean;
      requiredDriverDocumentSlugs?: string[];
      driverPaysKyc?: boolean;
      requireGuarantorVerification?: boolean;
    };
    currency: string;
    requiredByTier: boolean;
    verificationRequired: boolean;
  }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true, metadata: true },
    });
    const settings = readOrganisationSettings(tenant?.metadata, tenant?.country);
    const effectiveOperations = this.getEffectiveDriverOperationsSettings(
      settings.operations,
      driver,
    );
    const requiredByTier = effectiveOperations.requireGuarantor === true;
    const currency =
      tenant?.country && isCountrySupported(tenant.country)
        ? getCountryConfig(tenant.country).currency
        : 'NGN';

    return {
      tenant,
      settings,
      effectiveOperations,
      currency,
      requiredByTier,
      verificationRequired:
        requiredByTier || settings.operations.requireGuarantorVerification === true,
    };
  }

  private throwGuarantorNotRequiredError(): never {
    throw new BadRequestException(
      'A guarantor is not required for this driver under the current verification policy.',
    );
  }

  private getGuarantorReminderCount(guarantor: DriverGuarantorRecord): number {
    return guarantor.guarantorReminderCount ?? 0;
  }

  private async updateGuarantorLifecycleState(
    driverId: string,
    data: Partial<
      Pick<
        DriverGuarantorRecord,
        | 'inviteStatus'
        | 'lastInviteSentAt'
        | 'inviteExpiresAt'
        | 'guarantorReminderCount'
        | 'lastGuarantorReminderSentAt'
        | 'guarantorReminderSuppressed'
        | 'status'
        | 'personId'
        | 'disconnectedAt'
        | 'disconnectedReason'
        | 'responsibilityAcceptedAt'
        | 'responsibilityAcceptanceEvidence'
      >
    >,
  ): Promise<void> {
    try {
      await this.driverGuarantors.update({
        where: { driverId },
        data,
      });
    } catch {
      // Best-effort lifecycle updates should not block the main flow in tests
      // or during stale-record cleanup.
    }
  }

  private async createAndStoreSelfServiceOtp(
    tenantId: string,
    subjectType: 'driver' | 'guarantor',
    subjectId: string,
  ): Promise<{ otpCode: string; expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + SELF_SERVICE_INVITE_TTL_MS);

    for (let attempt = 0; attempt < 5; attempt++) {
      const otpCode = this.generateOtpCode();
      try {
        await this.prisma.selfServiceOtp.create({
          data: { tenantId, subjectType, subjectId, otpCode, expiresAt },
        });
        return { otpCode, expiresAt };
      } catch {
        if (attempt === 4) throw new Error('Failed to generate a unique OTP after 5 attempts');
      }
    }

    throw new Error('OTP generation failed');
  }

  private async syncGuarantorReminderLifecycleState(
    tenantId: string,
    driver: DriverWithIdentityState,
    guarantor: DriverGuarantorRecord,
  ): Promise<{
    shouldStop: boolean;
    reason?:
      | 'verified'
      | 'not_required'
      | 'driver_not_ready'
      | 'suppressed'
      | 'maxed_out'
      | 'expired';
  }> {
    const guarantorRequirement = await this.getDriverGuarantorRequirement(tenantId, driver);
    const now = Date.now();

    if (guarantor.status === 'verified' || guarantor.personId) {
      await this.updateGuarantorLifecycleState(driver.id, {
        inviteStatus: 'verified',
        inviteExpiresAt: null,
      });
      return { shouldStop: true, reason: 'verified' };
    }

    if (!guarantorRequirement.verificationRequired) {
      await this.updateGuarantorLifecycleState(driver.id, {
        inviteStatus: 'not_required',
        inviteExpiresAt: null,
      });
      return { shouldStop: true, reason: 'not_required' };
    }

    if (driver.identityStatus !== 'verified') {
      await this.updateGuarantorLifecycleState(driver.id, {
        inviteStatus: 'queued_until_driver_verified',
      });
      return { shouldStop: true, reason: 'driver_not_ready' };
    }

    if (guarantor.guarantorReminderSuppressed) {
      return { shouldStop: true, reason: 'suppressed' };
    }

    if (this.getGuarantorReminderCount(guarantor) >= MAX_GUARANTOR_REMINDER_COUNT) {
      return { shouldStop: true, reason: 'maxed_out' };
    }

    if (guarantor.inviteExpiresAt && guarantor.inviteExpiresAt.getTime() < now) {
      await this.updateGuarantorLifecycleState(driver.id, {
        inviteStatus: 'expired',
      });
      return { shouldStop: true, reason: 'expired' };
    }

    return { shouldStop: false };
  }

  private async assertDriverVerificationAddonPaymentReady(
    tenantId: string,
    driver: DriverWithIdentityState,
    key: VerificationAddonChargeKey,
  ): Promise<void> {
    const policy = await this.getDriverVerificationAddonPaymentPolicy(tenantId, driver, key);
    if (policy.paymentStatus === 'driver_payment_required') {
      throw new BadRequestException(policy.paymentMessage);
    }
  }

  private async getOrganisationSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true, metadata: true },
    });

    return readOrganisationSettings(tenant?.metadata, tenant?.country);
  }

  private async getTenantNotificationContext(tenantId: string): Promise<{
    tenantCountry: string | null;
    organisationName: string | null;
  }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, country: true, metadata: true },
    });

    if (!tenant) {
      return {
        tenantCountry: null,
        organisationName: null,
      };
    }

    return {
      tenantCountry: tenant.country ?? null,
      organisationName:
        readOrganisationSettings(tenant.metadata, tenant.country).branding.displayName ??
        tenant.name,
    };
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
    findMany(args: {
      where: {
        tenantId?: string;
        driverId?: { in: string[] };
        status?: string;
        disconnectedAt?: null;
        guarantorReminderSuppressed?: boolean;
      };
      select?: Record<string, boolean>;
    }): Promise<any>;
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
        | 'inviteStatus'
        | 'lastInviteSentAt'
        | 'inviteExpiresAt'
        | 'guarantorReminderCount'
        | 'lastGuarantorReminderSentAt'
        | 'guarantorReminderSuppressed'
        | 'responsibilityAcceptedAt'
        | 'responsibilityAcceptanceEvidence'
        | 'disconnectedAt'
        | 'disconnectedReason'
      >;
    }): Promise<DriverGuarantorRecord>;
    update(args: {
      where: { driverId: string };
      data: Partial<
        Pick<
          DriverGuarantorRecord,
          | 'status'
          | 'disconnectedAt'
          | 'disconnectedReason'
          | 'personId'
          | 'inviteStatus'
          | 'lastInviteSentAt'
          | 'inviteExpiresAt'
          | 'guarantorReminderCount'
          | 'lastGuarantorReminderSentAt'
          | 'guarantorReminderSuppressed'
          | 'responsibilityAcceptedAt'
          | 'responsibilityAcceptanceEvidence'
        >
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
              | 'inviteStatus'
              | 'lastInviteSentAt'
              | 'inviteExpiresAt'
              | 'guarantorReminderCount'
              | 'lastGuarantorReminderSentAt'
              | 'guarantorReminderSuppressed'
              | 'responsibilityAcceptedAt'
              | 'responsibilityAcceptanceEvidence'
              | 'disconnectedAt'
              | 'disconnectedReason'
            >;
          }): Promise<DriverGuarantorRecord>;
          update(args: {
            where: { driverId: string };
            data: Partial<
              Pick<
                DriverGuarantorRecord,
                | 'status'
                | 'disconnectedAt'
                | 'disconnectedReason'
                | 'personId'
                | 'inviteStatus'
                | 'lastInviteSentAt'
                | 'inviteExpiresAt'
                | 'guarantorReminderCount'
                | 'lastGuarantorReminderSentAt'
                | 'guarantorReminderSuppressed'
                | 'responsibilityAcceptedAt'
                | 'responsibilityAcceptanceEvidence'
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
      archivedAt: null,
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
      const totalCount = await this.prisma.driver.count({ where: { tenantId, archivedAt: null } });
      if (totalCount > driverCap) {
        // The first `driverCap` drivers by createdAt are unlocked; everything else is locked.
        const unlockedRows = await this.prisma.driver.findMany({
          where: { tenantId, archivedAt: null },
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
      DriverReadinessSummary & {
        canonicalInsights?: DriverCanonicalInsights;
      }
  > {
    const driver = (await this.prisma.driver.findUnique({
      where: { id },
    })) as (DriverWithIdentityState & { archivedAt?: Date | null }) | null;

    if (!driver || driver.archivedAt) {
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
    const canonicalInsights = driverWithReadiness
      ? await this.buildDriverCanonicalInsights(tenantId, driverWithReadiness)
      : undefined;
    const driverWithCanonicalInsights = driverWithReadiness
      ? {
          ...driverWithReadiness,
          ...(canonicalInsights ? { canonicalInsights } : {}),
        }
      : null;
    return (
      driverWithCanonicalInsights ?? {
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
        requiresGuarantor?: boolean;
        guarantorBlocking?: boolean;
        localRiskFlags?: string[];
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
        verificationWalletBalanceMinorUnits?: number;
        verificationAvailableSpendMinorUnits?: number;
        verificationCreditLimitMinorUnits?: number;
        verificationCreditUsedMinorUnits?: number;
        verificationStarterCreditActive?: boolean;
        verificationCardCreditActive?: boolean;
        verificationSavedCard?: {
          provider: string;
          last4: string;
          brand: string;
          status: string;
          active: boolean;
          createdAt: string;
          initialReference: string | null;
        } | null;
        verificationPaymentStatus?:
          | 'not_required'
          | 'ready'
          | 'driver_payment_required'
          | 'wallet_missing'
          | 'insufficient_balance';
        verificationPaymentMessage?: string | null;
        verificationTier?: VerificationTier;
        verificationTierLabel?: string;
        verificationTierDescription?: string;
        verificationTierComponents?: VerificationComponentKey[];
        guarantorVerificationPaymentStatus?: 'not_required' | 'ready' | 'driver_payment_required';
        guarantorVerificationPaymentMessage?: string | null;
        guarantorVerificationAmountMinorUnits?: number;
        guarantorVerificationCurrency?: string;
        driversLicenseVerificationPaymentStatus?: 'not_required' | 'ready' | 'driver_payment_required';
        driversLicenseVerificationPaymentMessage?: string | null;
        driversLicenseVerificationAmountMinorUnits?: number;
        driversLicenseVerificationCurrency?: string;
      }
  > {
    const payload = await this.verifySelfServiceToken(token);
    const [driver, settings] = await Promise.all([
      this.findOne(payload.tenantId, payload.driverId),
      this.getOrganisationSettings(payload.tenantId),
    ]);
    const effectiveOperations = this.getEffectiveDriverOperationsSettings(
      settings.operations,
      driver,
    );
    const verificationPolicy = await this.getSelfServiceVerificationPolicy(
      payload.tenantId,
      driver,
    );
    const [guarantorPaymentPolicy, driversLicensePaymentPolicy] = await Promise.all([
      this.getDriverVerificationAddonPaymentPolicy(
        payload.tenantId,
        driver,
        'guarantor_verification',
      ),
      this.getDriverVerificationAddonPaymentPolicy(
        payload.tenantId,
        driver,
        'drivers_license_verification',
      ),
    ]);

    const selfServiceLocalRiskFlags: string[] = [];
    const verificationTierPolicy = resolveVerificationPolicy({
      verificationTier: verificationPolicy.verificationTier,
    });
    if (
      !verificationTierPolicy.components.includes('guarantor') &&
      !driver.hasGuarantor
    ) {
      selfServiceLocalRiskFlags.push('missing_optional_guarantor');
    }

    return {
      ...driver,
      verificationTier: verificationTierPolicy.tier,
      verificationTierLabel: verificationTierPolicy.label,
      verificationTierDescription: verificationTierPolicy.description,
      verificationTierComponents: verificationTierPolicy.components,
      requireIdentityVerificationForActivation:
        settings.operations.requireIdentityVerificationForActivation,
      requireBiometricVerification: settings.operations.requireBiometricVerification,
      requireGovernmentVerificationLookup: settings.operations.requireGovernmentVerificationLookup,
      requiresGuarantor: effectiveOperations.requireGuarantor !== false,
      guarantorBlocking: effectiveOperations.guarantorBlocking,
      ...(selfServiceLocalRiskFlags.length > 0
        ? { localRiskFlags: selfServiceLocalRiskFlags }
        : {}),
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
      verificationWalletBalanceMinorUnits:
        verificationPolicy.verificationWalletBalanceMinorUnits,
      verificationAvailableSpendMinorUnits:
        verificationPolicy.verificationAvailableSpendMinorUnits,
      verificationCreditLimitMinorUnits: verificationPolicy.verificationCreditLimitMinorUnits,
      verificationCreditUsedMinorUnits: verificationPolicy.verificationCreditUsedMinorUnits,
      verificationStarterCreditActive: verificationPolicy.verificationStarterCreditActive,
      verificationCardCreditActive: verificationPolicy.verificationCardCreditActive,
      verificationSavedCard: verificationPolicy.verificationSavedCard ?? null,
      verificationPaymentStatus: verificationPolicy.verificationPaymentStatus,
      verificationPaymentMessage: verificationPolicy.verificationPaymentMessage,
      guarantorVerificationPaymentStatus: guarantorPaymentPolicy.paymentStatus,
      guarantorVerificationPaymentMessage: guarantorPaymentPolicy.paymentMessage,
      guarantorVerificationAmountMinorUnits: guarantorPaymentPolicy.amountMinorUnits,
      guarantorVerificationCurrency: guarantorPaymentPolicy.currency,
      driversLicenseVerificationPaymentStatus: driversLicensePaymentPolicy.paymentStatus,
      driversLicenseVerificationPaymentMessage: driversLicensePaymentPolicy.paymentMessage,
      driversLicenseVerificationAmountMinorUnits: driversLicensePaymentPolicy.amountMinorUnits,
      driversLicenseVerificationCurrency: driversLicensePaymentPolicy.currency,
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
      | 'guarantor'
      | 'manual_review'
      | 'complete';
    reason: string;
    verificationTier: VerificationTier;
    verificationTierLabel: string;
    verificationTierDescription: string;
    verificationTierComponents: VerificationComponentKey[];
    // Contextual fields the frontend needs to render the step.
    paymentStatus?: string;
    paymentMessage?: string | null;
    verificationPaymentStatus?: string;
    identityStatus?: string;
    verificationState?: VerificationFlowState;
    hasConsentOnFile?: boolean;
    missingOperationalFields?: string[];
    requiredDocumentTypes?: string[];
    verifiedDocumentTypes?: string[];
    documentVerificationStatus?: string;
    documentFailureReason?: string | null;
    requiresGuarantor?: boolean;
    guarantorBlocking?: boolean;
    guarantorVerified?: boolean;
    guarantorName?: string | null;
    guarantorPhone?: string | null;
    guarantorEmail?: string | null;
    guarantorCountryCode?: string | null;
    guarantorRelationship?: string | null;
    guarantorStatus?: string | null;
  }> {
    const payload = await this.verifySelfServiceToken(token);
    const [driver, settings] = await Promise.all([
      this.findOne(payload.tenantId, payload.driverId),
      this.getOrganisationSettings(payload.tenantId),
    ]);
    const effectiveOperations = this.getEffectiveDriverOperationsSettings(
      settings.operations,
      driver,
    );
    const policy = await this.getSelfServiceVerificationPolicy(payload.tenantId, driver);
    const verificationTierPolicy = resolveVerificationPolicy({
      verificationTier: effectiveOperations.verificationTier,
    });
    const onboardingContext = {
      verificationTier: verificationTierPolicy.tier,
      verificationTierLabel: verificationTierPolicy.label,
      verificationTierDescription: verificationTierPolicy.description,
      verificationTierComponents: verificationTierPolicy.components,
    } as const;

    // Step 1: account setup
    const linkedUser = await this.prisma.user.findFirst({
      where: { tenantId: payload.tenantId, driverId: driver.id },
      select: { id: true },
    });

    if (!linkedUser) {
      return {
        step: 'account',
        reason: 'Driver needs to create a sign-in account.',
        ...onboardingContext,
      };
    }

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
        ...onboardingContext,
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
        ...onboardingContext,
        hasConsentOnFile: false,
      };
    }

    if (paymentBlocked) {
      return {
        step: 'payment',
        reason: 'Verification payment is required.',
        ...onboardingContext,
        paymentStatus: policy.verificationPaymentStatus,
        paymentMessage: policy.verificationPaymentMessage,
        hasConsentOnFile: true,
      };
    }

    // Step 5: identity verification (liveness + biometric)
    const verificationState = policy.verificationState;
    const verificationCompleted =
      driver.identityStatus === 'verified' && verificationState === 'success';
    const verificationAwaitingReview =
      driver.identityStatus === 'review_needed' ||
      (driver.identityStatus === 'pending_verification' &&
        (verificationState === 'in_progress' || verificationState === 'provider_called'));

    if (verificationState === 'failed') {
      return {
        step: 'identity_verification',
        reason: 'Identity verification failed. Review the details and try again.',
        ...onboardingContext,
        identityStatus: driver.identityStatus,
        verificationState,
        verificationPaymentStatus: policy.verificationPaymentStatus,
      };
    }

    if (!verificationCompleted && !verificationAwaitingReview) {
      return {
        step: 'identity_verification',
        reason: 'Identity verification has not been completed yet.',
        ...onboardingContext,
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
        ...onboardingContext,
        identityStatus: driver.identityStatus,
        verificationState,
      };
    }

    // Step 6b: operational profile completion after verified identity is available.
    const operationalProfile = this.readOperationalProfile(
      (driver as { operationalProfile?: Prisma.JsonValue | null }).operationalProfile,
      { phone: driver.phone },
    );
    const missingOperationalFields = this.getMissingOperationalProfileFields(operationalProfile);
    if (missingOperationalFields.length > 0) {
      return {
        step: 'profile',
        reason: 'Complete your contact and operational details before continuing.',
        ...onboardingContext,
        missingOperationalFields,
      };
    }

    // Step 7: guarantor onboarding when required
    const requiresGuarantor = verificationTierPolicy.components.includes('guarantor');
    const guarantorBlocking = requiresGuarantor;
    let guarantorVerified = !requiresGuarantor;
    let guarantorRecord: DriverGuarantorRecord | null = null;
    if (requiresGuarantor) {
      guarantorRecord = await this.prisma.driverGuarantor.findFirst({
        where: { tenantId: payload.tenantId, driverId: driver.id, disconnectedAt: null },
      });
      const needsGuarantorVerification = true;
      if (guarantorRecord) {
        guarantorVerified = needsGuarantorVerification
          ? guarantorRecord.status === 'verified'
          : true;
      } else {
        guarantorVerified = false;
      }

      if (!guarantorVerified) {
        return {
          step: 'guarantor',
          reason: needsGuarantorVerification
            ? 'A guarantor must be added and verified before onboarding is complete.'
            : 'A guarantor must be added before onboarding is complete.',
          ...onboardingContext,
          verificationState,
          requiresGuarantor,
          guarantorBlocking,
          guarantorVerified,
          guarantorName: guarantorRecord?.name ?? null,
          guarantorPhone: guarantorRecord?.phone ?? null,
          guarantorEmail: guarantorRecord?.email ?? null,
          guarantorCountryCode: guarantorRecord?.countryCode ?? null,
          guarantorRelationship: guarantorRecord?.relationship ?? null,
          guarantorStatus: guarantorRecord?.status ?? null,
        };
      }
    }

    // Step 8: driver's licence verification for Full Trust Verification
    const requiredDocumentSlugs = verificationTierPolicy.components.includes('drivers_license')
      ? [DRIVER_LICENCE_DOCUMENT_TYPE]
      : [];
    if (requiredDocumentSlugs.includes(DRIVER_LICENCE_DOCUMENT_TYPE)) {
      const driverLicenceVerifications = await this.driverDocumentVerifications.findMany({
        where: {
          tenantId: payload.tenantId,
          driverId: driver.id,
          documentType: DRIVER_LICENCE_DOCUMENT_TYPE,
        },
        orderBy: { createdAt: 'desc' },
      });
      const latestDriverLicenceVerification = driverLicenceVerifications[0] ?? null;
      const verifiedTypes = latestDriverLicenceVerification?.status === 'verified'
        ? [DRIVER_LICENCE_DOCUMENT_TYPE]
        : [];

      if (!latestDriverLicenceVerification) {
        return {
          step: 'document_verification',
          reason: "Driver's licence verification is required before onboarding can continue.",
          ...onboardingContext,
          verificationState,
          requiredDocumentTypes: requiredDocumentSlugs,
          verifiedDocumentTypes: verifiedTypes,
        };
      }

      if (latestDriverLicenceVerification.status === 'failed') {
        return {
          step: 'document_verification',
          reason:
            latestDriverLicenceVerification.failureReason ??
            "Driver's licence verification did not complete successfully.",
          ...onboardingContext,
          verificationState,
          requiredDocumentTypes: requiredDocumentSlugs,
          verifiedDocumentTypes: verifiedTypes,
          documentVerificationStatus: latestDriverLicenceVerification.status,
          ...(latestDriverLicenceVerification.failureReason
            ? { documentFailureReason: latestDriverLicenceVerification.failureReason }
            : {}),
        };
      }

      if (latestDriverLicenceVerification.status === 'provider_unavailable') {
        return {
          step: 'document_verification',
          reason:
            latestDriverLicenceVerification.failureReason ??
            "Driver's licence verification is temporarily unavailable. Please try again.",
          ...onboardingContext,
          verificationState,
          requiredDocumentTypes: requiredDocumentSlugs,
          verifiedDocumentTypes: verifiedTypes,
          documentVerificationStatus: latestDriverLicenceVerification.status,
          ...(latestDriverLicenceVerification.failureReason
            ? { documentFailureReason: latestDriverLicenceVerification.failureReason }
            : {}),
        };
      }
    }

    return {
      step: 'complete',
      reason: 'All onboarding requirements are met.',
      ...onboardingContext,
      identityStatus: driver.identityStatus,
      verificationState,
      requiresGuarantor,
      guarantorBlocking,
      guarantorVerified,
      guarantorStatus: guarantorRecord?.status ?? null,
    };
  }

  async listAssignmentsFromSelfService(token: string): Promise<SelfServiceAssignmentSummary[]> {
    const payload = await this.verifySelfServiceToken(token);
    const assignments = await this.prisma.assignment.findMany({
      where: {
        tenantId: payload.tenantId,
        driverId: payload.driverId,
        status: {
          in: ['driver_action_required', 'pending_driver_confirmation', 'accepted', 'active'],
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        tenantId: payload.tenantId,
        id: { in: assignments.map((assignment) => assignment.vehicleId) },
      },
      select: {
        id: true,
        make: true,
        model: true,
        plate: true,
        tenantVehicleCode: true,
        systemVehicleCode: true,
        status: true,
      },
    });
    const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

    return assignments.map((assignment) => ({
      id: assignment.id,
      status: assignment.status,
      driverId: assignment.driverId,
      vehicleId: assignment.vehicleId,
      fleetId: assignment.fleetId,
      paymentModel: resolveAssignmentPaymentModel(assignment),
      remittanceAmountMinorUnits: assignment.remittanceAmountMinorUnits,
      remittanceCurrency: assignment.remittanceCurrency,
      remittanceFrequency: assignment.remittanceFrequency,
      remittanceStartDate: assignment.remittanceStartDate,
      contractStatus: assignment.contractStatus,
      driverConfirmedAt: assignment.driverConfirmedAt?.toISOString() ?? null,
      notes: assignment.notes,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
      financialContract: parseFinancialContractSnapshot(
        assignment.contractSnapshot,
        assignment,
      ),
      vehicle: {
        id: assignment.vehicleId,
        make: vehicleById.get(assignment.vehicleId)?.make ?? null,
        model: vehicleById.get(assignment.vehicleId)?.model ?? null,
        plate: vehicleById.get(assignment.vehicleId)?.plate ?? null,
        tenantVehicleCode: vehicleById.get(assignment.vehicleId)?.tenantVehicleCode ?? null,
        systemVehicleCode: vehicleById.get(assignment.vehicleId)?.systemVehicleCode ?? null,
        status: vehicleById.get(assignment.vehicleId)?.status ?? 'assigned',
      },
    }));
  }

  async listNotificationsFromSelfService(token: string): Promise<UserNotification[]> {
    const payload = await this.verifySelfServiceToken(token);
    const userIds = await this.listLinkedUserIdsForDriver(payload.tenantId, payload.driverId);
    if (userIds.length === 0) {
      return [];
    }

    return this.prisma.userNotification.findMany({
      where: {
        tenantId: payload.tenantId,
        userId: { in: userIds },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
    });
  }

  async markNotificationReadFromSelfService(
    token: string,
    notificationId: string,
  ): Promise<UserNotification> {
    const payload = await this.verifySelfServiceToken(token);
    const userIds = await this.listLinkedUserIdsForDriver(payload.tenantId, payload.driverId);
    if (userIds.length === 0) {
      throw new NotFoundException('Notification not found.');
    }

    const notification = await this.prisma.userNotification.findFirst({
      where: {
        id: notificationId,
        tenantId: payload.tenantId,
        userId: { in: userIds },
      },
      select: { id: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    return this.prisma.userNotification.update({
      where: { id: notification.id },
      data: { readAt: new Date() },
    });
  }

  async getMobileAccess(
    tenantId: string,
    driverId: string,
  ): Promise<{
    linkedUser:
      | (MobileAccessUserRecord & {
          mobileAccessRevoked?: boolean | null;
          activePushDeviceCount: number;
          lastPushDeviceSeenAt: Date | null;
          pushDevices: Array<{
            id: string;
            platform: string;
            deviceToken: string;
            lastSeenAt: Date;
            createdAt: Date;
            disabledAt: Date | null;
          }>;
        })
      | null;
    suggestedUsers: Array<MobileAccessUserRecord & { matchReason?: string | null }>;
  }> {
    const driver = await this.findOne(tenantId, driverId);

    const linkedUser = await this.prisma.user.findFirst({
      where: {
        tenantId,
        driverId: driver.id,
      },
      include: {
        pushDevices: {
          orderBy: [{ disabledAt: 'asc' }, { lastSeenAt: 'desc' }],
          select: {
            id: true,
            platform: true,
            deviceToken: true,
            lastSeenAt: true,
            createdAt: true,
            disabledAt: true,
          },
        },
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
      linkedUser: linkedUser
        ? {
            ...linkedUser,
            activePushDeviceCount: linkedUser.pushDevices.filter((device) => !device.disabledAt)
              .length,
            lastPushDeviceSeenAt:
              linkedUser.pushDevices.find((device) => !device.disabledAt)?.lastSeenAt ??
              linkedUser.pushDevices[0]?.lastSeenAt ??
              null,
          }
        : null,
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

  async updateDriverMobileAccessStatus(
    tenantId: string,
    driverId: string,
    userId: string,
    revoked: boolean,
  ): Promise<void> {
    const driver = await this.findOne(tenantId, driverId);
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user || user.driverId !== driver.id) {
      throw new NotFoundException('No linked mobile access account was found for this driver.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { mobileAccessRevoked: revoked },
    });
  }

  async disableDriverMobileAccessDevice(
    tenantId: string,
    driverId: string,
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const driver = await this.findOne(tenantId, driverId);
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
      select: { id: true, driverId: true },
    });

    if (!user || user.driverId !== driver.id) {
      throw new NotFoundException('No linked mobile access account was found for this driver.');
    }

    const device = await this.prisma.userPushDevice.findFirst({
      where: { id: deviceId, tenantId, userId, disabledAt: null },
      select: { id: true },
    });

    if (!device) {
      throw new NotFoundException('Registered device not found.');
    }

    await this.prisma.userPushDevice.update({
      where: { id: deviceId },
      data: { disabledAt: new Date() },
    });
  }

  async sendSelfServiceLink(
    tenantId: string,
    id: string,
    options: {
      driverPaysKycOverride?: boolean;
      verificationTierOverride?: VerificationTier;
      forceReverification?: boolean;
      requestedBy?: string | null;
    } = {},
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string; otpCode: string }> {
    const driver = await this.findOne(tenantId, id);

    if (!driver.email) {
      throw new BadRequestException(
        'Driver has no email; please add one before sending a self-service link.',
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: driver.tenantId },
      select: { name: true, country: true, metadata: true },
    });
    const settings = readOrganisationSettings(tenant?.metadata, tenant?.country);
    const requestedTierCandidate =
      this.normalizeDriverVerificationTierOverride(options.verificationTierOverride) ??
      this.getEffectiveDriverVerificationTier(settings.operations, driver);
    const requestedTierOverride =
      compareVerificationTiers(requestedTierCandidate, settings.operations.verificationTier) < 0
        ? settings.operations.verificationTier
        : requestedTierCandidate;
    const storedTierOverride =
      requestedTierOverride === settings.operations.verificationTier ? null : requestedTierOverride;
    const shouldResetForFreshVerification = options.forceReverification === true;

    if (
      options.driverPaysKycOverride !== undefined ||
      storedTierOverride !== this.normalizeDriverVerificationTierOverride(driver.verificationTierOverride) ||
      shouldResetForFreshVerification
    ) {
      const updatePayload: Prisma.DriverUpdateInput = {
        ...(options.driverPaysKycOverride !== undefined
          ? { driverPaysKycOverride: options.driverPaysKycOverride }
          : {}),
        verificationTierOverride: storedTierOverride,
      };

      if (shouldResetForFreshVerification) {
        Object.assign(updatePayload, {
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
        } satisfies Prisma.DriverUpdateInput);
      }

      await this.prisma.driver.update({
        where: { id: driver.id },
        data: updatePayload,
      });

      await this.auditService.recordTenantAction({
        tenantId,
        entityType: 'driver',
        entityId: driver.id,
        action: shouldResetForFreshVerification
          ? 'driver.reverification.requested'
          : 'driver.verification.configuration.updated',
        beforeState: {
          verificationTierOverride:
            this.normalizeDriverVerificationTierOverride(driver.verificationTierOverride) ?? null,
          driverPaysKycOverride:
            (driver as Driver & { driverPaysKycOverride?: boolean | null }).driverPaysKycOverride ??
            null,
          identityStatus: driver.identityStatus,
        },
        afterState: {
          verificationTierOverride: storedTierOverride,
          driverPaysKycOverride:
            options.driverPaysKycOverride !== undefined
              ? options.driverPaysKycOverride
              : (driver as Driver & { driverPaysKycOverride?: boolean | null })
                  .driverPaysKycOverride ?? null,
          identityStatus: shouldResetForFreshVerification ? 'unverified' : driver.identityStatus,
        },
        metadata: {
          requestedTier: requestedTierOverride,
          forceReverification: shouldResetForFreshVerification,
          requestedBy: options.requestedBy ?? null,
        },
      });
    }

    const [token, otp] = await Promise.all([
      this.createSelfServiceToken(driver.tenantId, driver.id),
      this.createAndStoreSelfServiceOtp(driver.tenantId, 'driver', driver.id),
    ]);

    const verificationUrl = `${process.env.TENANT_WEB_URL ?? 'http://localhost:3000'}/driver-self-service?token=${encodeURIComponent(token)}`;

    await this.authEmailService.sendDriverSelfServiceVerificationEmail({
      email: driver.email,
      name: this.formatDriverName(driver),
      driverName: this.formatDriverName(driver),
      organisationName: tenant
        ? (readOrganisationSettings(tenant.metadata, tenant.country).branding.displayName ??
          tenant.name)
        : null,
      verificationUrl,
      otpCode: otp.otpCode,
    });

    return {
      delivery: 'email',
      verificationUrl,
      destination: driver.email,
      otpCode: otp.otpCode,
    };
  }

  async sendGuarantorSelfServiceLink(
    tenantId: string,
    driverId: string,
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string; otpCode: string }> {
    return this.dispatchGuarantorSelfServiceLink(tenantId, driverId, { deliveryKind: 'invite' });
  }

  private async dispatchGuarantorSelfServiceLink(
    tenantId: string,
    driverId: string,
    options: { deliveryKind: 'invite' | 'reminder' },
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string; otpCode: string }> {
    const driver = await this.findOne(tenantId, driverId);
    const guarantorRequirement = await this.getDriverGuarantorRequirement(tenantId, driver);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: driver.tenantId },
      select: { country: true, metadata: true, name: true },
    });

    if (!guarantorRequirement.verificationRequired) {
      throw new BadRequestException(
        'This verification tier does not require a guarantor, so no guarantor link can be sent.',
      );
    }

    const guarantorPaymentPolicy = await this.getDriverVerificationAddonPaymentPolicy(
      tenantId,
      driver,
      'guarantor_verification',
    );
    if (
      guarantorPaymentPolicy.required &&
      guarantorPaymentPolicy.paymentStatus === 'driver_payment_required'
    ) {
      throw new BadRequestException(
        guarantorPaymentPolicy.paymentMessage,
      );
    }

    const guarantor = await this.driverGuarantors.findUnique({ where: { driverId: driver.id } });

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    if (!guarantor.email) {
      throw new BadRequestException(
        'Guarantor has no email address; please add one before sending a verification link.',
      );
    }

    const inviteSentAt = new Date();
    const [token, otp] = await Promise.all([
      this.createGuarantorSelfServiceToken(driver.tenantId, driver.id),
      this.createAndStoreSelfServiceOtp(driver.tenantId, 'guarantor', driver.id),
    ]);

    const verificationUrl = `${process.env.TENANT_WEB_URL ?? 'http://localhost:3000'}/guarantor-self-service?token=${encodeURIComponent(token)}`;

    await this.authEmailService.sendGuarantorSelfServiceVerificationEmail({
      email: guarantor.email,
      guarantorName: guarantor.name,
      driverName: this.formatDriverName(driver),
      organisationName: tenant
        ? (readOrganisationSettings(tenant.metadata, tenant.country).branding.displayName ??
          tenant.name)
        : null,
      verificationUrl,
      otpCode: otp.otpCode,
    });

    await this.driverGuarantors.update({
      where: { driverId: driver.id },
      data:
        options.deliveryKind === 'reminder'
          ? {
              inviteStatus: 'sent',
              lastInviteSentAt: inviteSentAt,
              inviteExpiresAt: otp.expiresAt,
              guarantorReminderCount: this.getGuarantorReminderCount(guarantor) + 1,
              lastGuarantorReminderSentAt: inviteSentAt,
            }
          : {
              inviteStatus: 'sent',
              lastInviteSentAt: inviteSentAt,
              inviteExpiresAt: otp.expiresAt,
              guarantorReminderCount: 0,
              lastGuarantorReminderSentAt: null,
              guarantorReminderSuppressed: false,
            },
    });

    await this.auditService.recordTenantAction({
      tenantId,
      entityType: 'driver',
      entityId: driver.id,
      action:
        options.deliveryKind === 'reminder'
          ? 'driver.guarantor.reminder.sent'
          : 'driver.guarantor.invitation.sent',
      beforeState: null,
      afterState: {
        guarantorEmail: guarantor.email,
        guarantorStatus: guarantor.status,
        inviteExpiresAt: otp.expiresAt.toISOString(),
      },
      metadata: {
        delivery: 'email',
        destination: guarantor.email,
      },
    });

    return {
      delivery: 'email',
      verificationUrl,
      destination: guarantor.email,
      otpCode: otp.otpCode,
    };
  }

  private async maybeSendGuarantorSelfServiceLinkIfEligible(
    tenantId: string,
    driverId: string,
    reason: 'guarantor_updated' | 'driver_verified' | 'reminder',
  ): Promise<{
    status:
      | 'sent'
      | 'already_verified'
      | 'missing_email'
      | 'operator_action_required'
      | 'queued_until_driver_verified'
      | 'failed'
      | 'not_ready';
    message: string;
    destination?: string;
  }> {
    const driver = await this.findOne(tenantId, driverId);
    const guarantorRequirement = await this.getDriverGuarantorRequirement(tenantId, driver);
    const driverName = this.formatDriverName(driver);

    if (!guarantorRequirement.verificationRequired) {
      await this.updateGuarantorLifecycleState(driverId, {
        inviteStatus: 'not_required',
        inviteExpiresAt: null,
      });
      await this.notificationsService.notifyGuarantorStatus({
        tenantId,
        driverId,
        driverName,
        driverEmail: driver.email ?? null,
        guarantorName: 'Guarantor',
        status: 'operator_action_required',
        actionUrl: `/drivers/${driverId}`,
      });
      return {
        status: 'operator_action_required',
        message: DriversService.guarantorInvitationMessages.operator_action_required,
      };
    }

    if (driver.identityStatus !== 'verified') {
      await this.updateGuarantorLifecycleState(driverId, {
        inviteStatus: 'queued_until_driver_verified',
      });
      await this.notificationsService.notifyGuarantorStatus({
        tenantId,
        driverId,
        driverName,
        driverEmail: driver.email ?? null,
        guarantorName: 'Guarantor',
        status: 'queued_until_driver_verified',
        actionUrl: `/drivers/${driverId}`,
      });
      return {
        status: 'queued_until_driver_verified',
        message: DriversService.guarantorInvitationMessages.queued_until_driver_verified,
      };
    }

    const guarantor = await this.driverGuarantors.findUnique({ where: { driverId } });
    if (
      !guarantor ||
      guarantor.disconnectedAt !== null
    ) {
      return {
        status: 'not_ready',
        message: DriversService.guarantorInvitationMessages.not_ready,
      };
    }

    if (guarantor.status === 'verified') {
      await this.updateGuarantorLifecycleState(driverId, {
        inviteStatus: 'verified',
        inviteExpiresAt: null,
      });
      await this.notificationsService.notifyGuarantorStatus({
        tenantId,
        driverId,
        driverName,
        driverEmail: driver.email ?? null,
        guarantorName: guarantor.name,
        guarantorEmail: guarantor.email ?? null,
        status: 'verified',
        actionUrl: `/drivers/${driverId}`,
      });
      return {
        status: 'already_verified',
        message: DriversService.guarantorInvitationMessages.already_verified,
        ...(guarantor.email ? { destination: guarantor.email } : {}),
      };
    }

    if (!guarantor.email) {
      await this.updateGuarantorLifecycleState(driverId, {
        inviteStatus: 'missing_email',
      });
      await this.notificationsService.notifyGuarantorStatus({
        tenantId,
        driverId,
        driverName,
        driverEmail: driver.email ?? null,
        guarantorName: guarantor.name,
        status: 'missing_email',
        actionUrl: `/drivers/${driverId}`,
      });
      return {
        status: 'missing_email',
        message: DriversService.guarantorInvitationMessages.missing_email,
      };
    }

    try {
      const delivery = await this.dispatchGuarantorSelfServiceLink(tenantId, driverId, {
        deliveryKind: reason === 'reminder' ? 'reminder' : 'invite',
      });
      this.logger.log(
        JSON.stringify({
          event: 'guarantor_self_service_link_auto_sent',
          tenantId,
          driverId,
          guarantorId: guarantor.id,
          reason,
        }),
      );
      await this.notificationsService.notifyGuarantorStatus({
        tenantId,
        driverId,
        driverName,
        driverEmail: driver.email ?? null,
        guarantorName: guarantor.name,
        guarantorEmail: delivery.destination,
        status: reason === 'reminder' ? 'pending' : 'invited',
        actionUrl: `/drivers/${driverId}`,
      });
      return {
        status: 'sent',
        message: DriversService.guarantorInvitationMessages.sent,
        destination: delivery.destination,
      };
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'guarantor_self_service_link_auto_send_failed',
          tenantId,
          driverId,
          guarantorId: guarantor.id,
          reason,
          error: error instanceof Error ? error.message : 'unknown error',
        }),
      );
      await this.updateGuarantorLifecycleState(driverId, {
        inviteStatus: 'failed',
      });
      await this.notificationsService.notifyGuarantorStatus({
        tenantId,
        driverId,
        driverName,
        driverEmail: driver.email ?? null,
        guarantorName: guarantor.name,
        guarantorEmail: guarantor.email ?? null,
        status: 'failed',
        actionUrl: `/drivers/${driverId}`,
      });
      return {
        status: 'failed',
        message: DriversService.guarantorInvitationMessages.failed,
        ...(guarantor.email ? { destination: guarantor.email } : {}),
      };
    }
  }

  async findDriversPendingGuarantorReminders(): Promise<
    Array<{ tenantId: string; driverId: string }>
  > {
    const filteredPending = (await this.driverGuarantors.findMany({
      where: {
        status: 'pending_verification',
        disconnectedAt: null,
        guarantorReminderSuppressed: false,
      },
      select: {
        id: true,
        tenantId: true,
        driverId: true,
        inviteStatus: true,
        lastInviteSentAt: true,
        inviteExpiresAt: true,
        guarantorReminderCount: true,
        lastGuarantorReminderSentAt: true,
        guarantorReminderSuppressed: true,
      },
    })) as Array<{
      tenantId: string;
      driverId: string;
      inviteStatus?: string | null;
      lastInviteSentAt?: Date | null;
      inviteExpiresAt?: Date | null;
      guarantorReminderCount?: number | null;
      lastGuarantorReminderSentAt?: Date | null;
      guarantorReminderSuppressed?: boolean | null;
    }>;

    const reminders: Array<{ tenantId: string; driverId: string }> = [];
    const cutoff = Date.now() - GUARANTOR_REMINDER_INTERVAL_MS;
    const now = Date.now();

    for (const item of filteredPending) {
      const [driver, guarantor] = await Promise.all([
        this.findOne(item.tenantId, item.driverId),
        this.driverGuarantors.findUnique({ where: { driverId: item.driverId } }),
      ]);
      if (!guarantor) {
        continue;
      }
      const lifecycle = await this.syncGuarantorReminderLifecycleState(
        item.tenantId,
        driver,
        guarantor,
      );
      if (lifecycle.shouldStop) {
        continue;
      }

      if (item.inviteStatus !== 'sent') {
        continue;
      }

      if (item.inviteExpiresAt && item.inviteExpiresAt.getTime() < now) {
        continue;
      }

      if ((item.guarantorReminderCount ?? 0) >= MAX_GUARANTOR_REMINDER_COUNT) {
        continue;
      }

      const lastReminderContactAt =
        item.lastGuarantorReminderSentAt ?? item.lastInviteSentAt ?? null;
      if (lastReminderContactAt && lastReminderContactAt.getTime() >= cutoff) {
        continue;
      }

      reminders.push(item);
    }

    return reminders;
  }

  async sendPendingGuarantorReminder(
    tenantId: string,
    driverId: string,
  ): Promise<{
    status:
      | 'sent'
      | 'already_verified'
      | 'missing_email'
      | 'operator_action_required'
      | 'queued_until_driver_verified'
      | 'failed'
      | 'not_ready';
    message: string;
    destination?: string;
  }> {
    const [driver, guarantor] = await Promise.all([
      this.findOne(tenantId, driverId),
      this.driverGuarantors.findUnique({ where: { driverId } }),
    ]);

    if (!guarantor || guarantor.disconnectedAt !== null) {
      return {
        status: 'not_ready',
        message: DriversService.guarantorInvitationMessages.not_ready,
      };
    }

    const lifecycle = await this.syncGuarantorReminderLifecycleState(tenantId, driver, guarantor);
    if (lifecycle.shouldStop) {
      return {
        status: 'not_ready',
        message:
          lifecycle.reason === 'verified'
            ? DriversService.guarantorInvitationMessages.already_verified
            : lifecycle.reason === 'not_required'
              ? 'Guarantor reminders stopped because this driver no longer requires a guarantor.'
              : lifecycle.reason === 'driver_not_ready'
                ? DriversService.guarantorInvitationMessages.queued_until_driver_verified
                : lifecycle.reason === 'suppressed'
                  ? 'Guarantor reminders are currently paused for this driver.'
                  : lifecycle.reason === 'maxed_out'
                    ? 'Guarantor reminders stopped because the maximum reminder count has been reached.'
                    : 'The guarantor invite has expired. Send a fresh invitation to restart reminders.',
      };
    }

    return this.maybeSendGuarantorSelfServiceLinkIfEligible(tenantId, driverId, 'reminder');
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
    guarantorResponsibilityAcceptedAt: string | null;
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
      guarantorResponsibilityAcceptedAt: guarantor.responsibilityAcceptedAt?.toISOString() ?? null,
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
      verificationTier: verificationPolicy.verificationTier,
      amountMinorUnits: verificationPolicy.verificationAmountMinorUnits,
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

  async initiateVerificationAddonCheckoutFromSelfService(
    token: string,
    chargeKey: VerificationAddonChargeKey,
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
    const policy = await this.getDriverVerificationAddonPaymentPolicy(
      payload.tenantId,
      driver,
      chargeKey,
    );

    if (!policy.required) {
      throw new BadRequestException('This verification add-on is not required for this driver.');
    }
    if (policy.payer !== 'driver') {
      throw new BadRequestException(policy.paymentMessage);
    }
    if (!driver.email) {
      throw new BadRequestException(
        'A driver email address is required to initiate this verification payment checkout.',
      );
    }
    if (policy.paymentStatus === 'ready') {
      return {
        status: 'already_paid',
        amountMinorUnits: policy.amountMinorUnits,
        currency: policy.currency,
        entitlementState: policy.entitlementState,
      };
    }

    const tenantWebUrl = process.env.TENANT_WEB_URL ?? 'http://localhost:3000';
    const redirectUrl = new URL('/driver-kyc/payment-return', tenantWebUrl);
    redirectUrl.searchParams.set('provider', provider);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('chargeKey', chargeKey);
    const safeReturnUrl = this.sanitizeSelfServiceReturnUrl(returnUrl);
    if (safeReturnUrl) {
      redirectUrl.searchParams.set('returnUrl', safeReturnUrl);
    }

    const checkout = await this.controlPlaneBillingClient.initializeIdentityVerificationCheckout({
      tenantId: payload.tenantId,
      subjectType: 'driver',
      subjectId: driver.id,
      relatedDriverId: driver.id,
      paymentKey: chargeKey,
      purposeLabel:
        chargeKey === 'guarantor_verification'
          ? 'guarantor verification'
          : "driver's licence verification",
      provider,
      currency: policy.currency,
      verificationTier: this.getEffectiveDriverVerificationTier(
        (await this.getOrganisationSettings(payload.tenantId)).operations,
        driver,
      ),
      amountMinorUnits: policy.amountMinorUnits,
      customerEmail: driver.email,
      customerName: this.formatDriverName(driver),
      redirectUrl: redirectUrl.toString(),
    });

    return {
      status: 'checkout_required',
      checkoutUrl: checkout.checkoutUrl,
      amountMinorUnits: policy.amountMinorUnits,
      currency: policy.currency,
      entitlementState: policy.entitlementState,
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
        payerType: 'driver',
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

  async verifyVerificationAddonPaymentFromSelfService(
    token: string,
    chargeKey: VerificationAddonChargeKey,
    provider: string,
    reference: string,
  ): Promise<{ status: string }> {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const policy = await this.getDriverVerificationAddonPaymentPolicy(
      payload.tenantId,
      driver,
      chargeKey,
    );
    const normalizedReference = reference.trim();
    const existingEntitlement = await this.getLatestVerificationEntitlement(
      payload.tenantId,
      'driver',
      payload.driverId,
      chargeKey,
    );
    const existingEntitlementState = this.mapEntitlementState(existingEntitlement);

    if (
      existingEntitlement &&
      existingEntitlement.paymentReference === normalizedReference &&
      ['paid', 'reserved', 'consumed'].includes(existingEntitlementState)
    ) {
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
        status: 'paid',
        paymentReference: normalizedReference,
        paymentProvider: provider,
        paidAt: new Date(),
      });
    } else {
      await this.createVerificationEntitlement({
        subjectType: 'driver',
        subjectId: payload.driverId,
        tenantId: payload.tenantId,
        payerType: 'driver',
        purpose: chargeKey,
        paymentReference: normalizedReference,
        paymentProvider: provider,
        amountMinorUnits: policy.amountMinorUnits,
        currency: policy.currency,
        status: 'paid',
        paidAt: new Date(),
        expiresAt: null,
      });
    }

    if (chargeKey === 'guarantor_verification') {
      await this.maybeSendGuarantorSelfServiceLinkIfEligible(
        payload.tenantId,
        payload.driverId,
        'guarantor_updated',
      );
    }

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

    if (!guarantor) {
      throw new NotFoundException('No guarantor is linked to this driver.');
    }

    await this.assertDriverVerificationAddonPaymentReady(
      payload.tenantId,
      driver,
      'guarantor_verification',
    );

    return this.intelligenceClient.initializeLivenessSession({
      tenantId: payload.tenantId,
      countryCode: resolvedCountryCode,
    });
  }

  async resolveGuarantorIdentityFromSelfService(token: string, dto: ResolveDriverIdentityDto) {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    const [driver, guarantor] = await Promise.all([
      this.findOne(payload.tenantId, payload.driverId),
      this.driverGuarantors.findUnique({ where: { driverId: payload.driverId } }),
    ]);

    if (!guarantor) {
      throw new NotFoundException('No guarantor is linked to this driver.');
    }

    await this.assertDriverVerificationAddonPaymentReady(
      payload.tenantId,
      driver,
      'guarantor_verification',
    );

    const { livenessPassed: _ignoredLivenessPassed, livenessCheck, ...rest } = dto;
    return this.resolveGuarantorIdentity(payload.tenantId, payload.driverId, {
      ...rest,
      ...(livenessCheck
        ? {
            livenessCheck: {
              ...(livenessCheck.provider ? { provider: livenessCheck.provider } : {}),
              ...(livenessCheck.sessionId ? { sessionId: livenessCheck.sessionId } : {}),
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

  async getIdentityImage(
    tenantId: string,
    driverId: string,
    kind: 'selfie' | 'provider' | 'signature',
  ): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const driver = await this.findOne(tenantId, driverId);
    const source = this.getDriverIdentityImageSource(driver, kind);

    if (!source?.trim() && kind === 'selfie') {
      return this.getPortrait(tenantId, driverId);
    }

    if (!source?.trim()) {
      throw new NotFoundException('Identity image not found');
    }

    const trimmedSource = source.trim();
    const dataUrlMatch = trimmedSource.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (dataUrlMatch) {
      const contentType = dataUrlMatch[1] ?? 'image/jpeg';
      const payload = dataUrlMatch[2];
      if (!payload) {
        throw new NotFoundException('Identity image not found');
      }
      return {
        buffer: Buffer.from(payload, 'base64'),
        contentType,
        fileName: `${kind}.${this.getImageExtension(contentType)}`,
      };
    }

    let buffer: Buffer;
    try {
      buffer = await this.documentStorageService.readFileByUrl(trimmedSource);
    } catch {
      if (/^https?:\/\//i.test(trimmedSource)) {
        const response = await fetch(trimmedSource);
        if (!response.ok) {
          throw new NotFoundException('Identity image not found');
        }
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        buffer = Buffer.from(trimmedSource, 'base64');
      }
    }

    const contentType = this.inferImageContentType(trimmedSource);
    return {
      buffer,
      contentType,
      fileName: `${kind}.${this.getImageExtension(contentType)}`,
    };
  }

  private getDriverIdentityImageSource(
    driver: DriverWithIdentityState & Partial<DriverIntelligenceSummary>,
    kind: 'selfie' | 'provider' | 'signature',
  ): string | null {
    const identityProfile = isVerificationMetadataRecord(driver.identityProfile)
      ? driver.identityProfile
      : null;
    const providerRaw = isVerificationMetadataRecord(driver.identityProviderRawData)
      ? driver.identityProviderRawData
      : null;

    if (kind === 'selfie') {
      return this.readJsonString(identityProfile, 'selfieImageUrl') ?? driver.selfieImageUrl ?? null;
    }

    if (kind === 'provider') {
      return (
        this.readJsonString(identityProfile, 'providerImageUrl') ??
        this.readJsonString(identityProfile, 'photoUrl') ??
        driver.providerImageUrl ??
        this.readJsonString(providerRaw, 'providerImageUrl') ??
        this.readJsonString(providerRaw, 'photoUrl') ??
        this.readJsonString(providerRaw, 'portraitUrl') ??
        null
      );
    }

    return (
      this.readJsonString(identityProfile, 'signatureImageUrl') ??
      driver.identitySignatureImageUrl ??
      this.readJsonString(providerRaw, 'signatureUrl') ??
      null
    );
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

  async listDriverLicenceReviewQueue(
    tenantId: string,
    input: {
      q?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<PaginatedResponse<DriverLicenceReviewQueueItem>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const startIndex = (page - 1) * limit;
    return {
      data: [],
      total: 0,
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

  private buildGuarantorCapacityMessage(input: {
    matched: boolean;
    activeDriverCount: number;
    organisationLimit: number;
    eligible: boolean;
    linkedToCurrentDriver: boolean;
  }): string {
    if (!input.matched) {
      return `No existing guarantor match was found in this organisation yet. A guarantor can support up to ${input.organisationLimit} active driver${input.organisationLimit === 1 ? '' : 's'}.`;
    }

    if (!input.eligible) {
      return `This guarantor already supports ${input.activeDriverCount} active driver${input.activeDriverCount === 1 ? '' : 's'}. Your organisation allows a maximum of ${input.organisationLimit}.`;
    }

    if (input.linkedToCurrentDriver) {
      return `Existing guarantor found. They currently support ${input.activeDriverCount} active driver${input.activeDriverCount === 1 ? '' : 's'}, including this relationship. Your organisation allows up to ${input.organisationLimit}.`;
    }

    return `Existing guarantor found. They currently support ${input.activeDriverCount} active driver${input.activeDriverCount === 1 ? '' : 's'}. Your organisation allows up to ${input.organisationLimit}, so this guarantor is still eligible.`;
  }

  private async assessDriverGuarantorCapacity(
    tenantId: string,
    currentDriverId: string,
    input: {
      phone?: string;
      email?: string;
      countryCode?: string | null;
    },
  ): Promise<DriverGuarantorCapacityAssessment> {
    const normalizedPhone = input.phone?.trim()
      ? this.normalizePhoneNumber(input.phone, input.countryCode?.trim().toUpperCase() || null)
      : null;
    const normalizedEmail = input.email?.trim() ? input.email.trim().toLowerCase() : null;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { metadata: true, country: true },
    });
    const organisationLimit = readOrganisationSettings(tenant?.metadata, tenant?.country).operations
      .guarantorMaxActiveDrivers;

    if (!normalizedPhone && !normalizedEmail) {
      return {
        matched: false,
        matchedBy: [],
        guarantorName: null,
        guarantorPhone: normalizedPhone,
        guarantorEmail: normalizedEmail,
        activeDriverCount: 0,
        organisationLimit,
        eligible: true,
        linkedToCurrentDriver: false,
        message: this.buildGuarantorCapacityMessage({
          matched: false,
          activeDriverCount: 0,
          organisationLimit,
          eligible: true,
          linkedToCurrentDriver: false,
        }),
      };
    }

    const matches = await (
      this.prisma as never as {
        driverGuarantor: {
          findMany(args: {
            where: {
              tenantId: string;
              disconnectedAt: null;
              OR: Array<{ phone: string } | { email: string }>;
            };
            orderBy: { createdAt: 'asc' };
          }): Promise<DriverGuarantorRecord[]>;
        };
      }
    ).driverGuarantor.findMany({
      where: {
        tenantId,
        disconnectedAt: null,
        OR: [
          ...(normalizedPhone ? ([{ phone: normalizedPhone }] as const) : []),
          ...(normalizedEmail ? ([{ email: normalizedEmail }] as const) : []),
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    const matchedDrivers = matches.map((record) => record.driverId);
    const activeDrivers =
      matchedDrivers.length > 0
        ? await this.prisma.driver.findMany({
            where: {
              tenantId,
              id: { in: matchedDrivers },
              status: 'active',
              archivedAt: null,
            },
            select: { id: true },
          })
        : [];
    const activeDriverIds = new Set(activeDrivers.map((driver) => driver.id));
    const activeMatchedDriverIds = Array.from(
      new Set(matches.map((record) => record.driverId).filter((driverId) => activeDriverIds.has(driverId))),
    );
    const linkedToCurrentDriver = activeMatchedDriverIds.includes(currentDriverId);
    const activeDriverCount = activeMatchedDriverIds.length;
    const effectiveCountForEligibility = linkedToCurrentDriver
      ? Math.max(activeDriverCount - 1, 0)
      : activeDriverCount;
    const eligible = effectiveCountForEligibility < organisationLimit;
    const primaryMatch = matches[0] ?? null;
    const matchedBy: Array<'phone' | 'email'> = [];
    if (primaryMatch && normalizedPhone && primaryMatch.phone === normalizedPhone) {
      matchedBy.push('phone');
    }
    if (primaryMatch && normalizedEmail && primaryMatch.email === normalizedEmail) {
      matchedBy.push('email');
    }

    return {
      matched: Boolean(primaryMatch),
      matchedBy,
      guarantorName: primaryMatch?.name ?? null,
      guarantorPhone: primaryMatch?.phone ?? normalizedPhone,
      guarantorEmail: primaryMatch?.email ?? normalizedEmail,
      activeDriverCount,
      organisationLimit,
      eligible,
      linkedToCurrentDriver,
      message: this.buildGuarantorCapacityMessage({
        matched: Boolean(primaryMatch),
        activeDriverCount,
        organisationLimit,
        eligible,
        linkedToCurrentDriver,
      }),
    };
  }

  async assessGuarantorCapacityFromSelfService(
    token: string,
    input: {
      phone?: string;
      email?: string;
      countryCode?: string | null;
    },
  ): Promise<DriverGuarantorCapacityAssessment> {
    const payload = await this.verifySelfServiceToken(token);
    return this.assessDriverGuarantorCapacity(payload.tenantId, payload.driverId, input);
  }

  async createOrUpdateGuarantor(
    tenantId: string,
    id: string,
    dto: CreateOrUpdateDriverGuarantorDto,
    options?: { triggerInvitation?: boolean },
  ): Promise<DriverGuarantorRecord> {
    const driver = await this.findOne(tenantId, id);
    const existingGuarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });
    const normalizedPhone = this.normalizePhoneNumber(
      dto.phone,
      dto.countryCode?.trim().toUpperCase() || null,
    );
    const capacityAssessment = await this.assessDriverGuarantorCapacity(tenantId, driver.id, {
      phone: normalizedPhone,
      ...(dto.email ? { email: dto.email } : {}),
      countryCode: dto.countryCode ?? null,
    });

    if (!capacityAssessment.eligible) {
      throw new ConflictException(capacityAssessment.message);
    }

    if (existingGuarantor) {
      this.assertGuarantorReplacementAllowed(existingGuarantor, {
        nextPhone: normalizedPhone,
        nextEmail: dto.email?.trim().toLowerCase() || null,
      });
    }

    await this.assertVerifiedIdentityContactAvailable(tenantId, {
      ...(dto.email?.trim() ? { email: dto.email.trim().toLowerCase() } : {}),
      phone: normalizedPhone,
      ...(dto.countryCode?.trim() ? { phoneCountryCode: dto.countryCode.trim().toUpperCase() } : {}),
      currentGuarantorDriverId: driver.id,
      currentPersonId: existingGuarantor?.personId ?? null,
    });

    const guarantor = await this.driverGuarantors.upsert({
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
        inviteStatus: dto.email?.trim() ? 'not_sent' : 'missing_email',
        lastInviteSentAt: null,
        inviteExpiresAt: null,
        guarantorReminderCount: 0,
        lastGuarantorReminderSentAt: null,
        guarantorReminderSuppressed: false,
        responsibilityAcceptedAt: null,
        responsibilityAcceptanceEvidence: null,
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
        inviteStatus: dto.email?.trim() ? 'not_sent' : 'missing_email',
        lastInviteSentAt: null,
        inviteExpiresAt: null,
        guarantorReminderCount: 0,
        lastGuarantorReminderSentAt: null,
        guarantorReminderSuppressed: false,
        personId: null,
        dateOfBirth: null,
        gender: null,
        selfieImageUrl: null,
        providerImageUrl: null,
        responsibilityAcceptedAt: null,
        responsibilityAcceptanceEvidence: null,
        disconnectedAt: null,
        disconnectedReason: null,
      },
    });

    if (options?.triggerInvitation !== false) {
      await this.maybeSendGuarantorSelfServiceLinkIfEligible(tenantId, driver.id, 'guarantor_updated');
    }

    return guarantor;
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

    const updatedGuarantor = await this.driverGuarantors.update({
      where: { driverId: driver.id },
      data: {
        status: 'disconnected',
        inviteStatus: 'not_sent',
        inviteExpiresAt: null,
        guarantorReminderSuppressed: true,
        disconnectedAt: new Date(),
        disconnectedReason: reason?.trim() || 'Disconnected by operator request',
      },
    });

    await this.policyService.evaluateDriverPolicies(tenantId, driver.id);
    await this.notificationsService.notifyGuarantorStatus({
      tenantId,
      driverId: driver.id,
      driverName: this.formatDriverName(driver),
      driverEmail: driver.email ?? null,
      guarantorName: guarantor.name,
      guarantorEmail: guarantor.email ?? null,
      status: 'disconnected',
      actionUrl: `/drivers/${driver.id}`,
    });

    return updatedGuarantor;
  }

  async removeGuarantorFromSelfService(
    token: string,
    reason?: string | null,
  ): Promise<{ message: string }> {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    await this.removeGuarantor(
      payload.tenantId,
      payload.driverId,
      reason?.trim() || 'Disconnected by guarantor before continuing coverage',
    );
    return {
      message:
        'You are no longer listed as this driver’s guarantor. The driver and organisation have been notified for immediate follow-up.',
    };
  }

  async updateGuarantorReminderSuppression(
    tenantId: string,
    driverId: string,
    suppressed: boolean,
  ): Promise<DriverGuarantorRecord> {
    const driver = await this.findOne(tenantId, driverId);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    return this.driverGuarantors.update({
      where: { driverId: driver.id },
      data: {
        guarantorReminderSuppressed: suppressed,
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
    const [driver, guarantor, tenant] = await Promise.all([
      this.findOne(tenantId, driverId),
      this.driverGuarantors.findUnique({ where: { driverId } }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { country: true, metadata: true },
      }),
    ]);

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    const settings = readOrganisationSettings(tenant?.metadata, tenant?.country);
    if (
      settings.operations.requireGuarantorVerification &&
      settings.operations.driverPaysKyc === false
    ) {
      const addonPrice = getVerificationAddonPrice(
        'guarantor_verification',
        tenant?.country && isCountrySupported(tenant.country)
          ? getCountryConfig(tenant.country).currency
          : 'NGN',
      );
      const spendApplication = await this.verificationSpendService.ensureVerificationSpendApplied({
        tenantId,
        subjectType: 'guarantor',
        subjectId: guarantor.id,
        verificationTier: settings.operations.verificationTier,
        amountMinorUnits: addonPrice.amountMinorUnits,
        currency: addonPrice.currency,
        description: `${addonPrice.label} charge`,
        metadata: {
          driverId,
          channel: 'guarantor_self_service',
        },
      });

      if (spendApplication.status === 'insufficient') {
        throw new BadRequestException(spendApplication.reason);
      }
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
      : dto.selfieImageUrl
        ? await this.persistIdentityReferenceImage(
            dto.selfieImageUrl,
            `guarantor-selfie-${driver.id}-${Date.now()}`,
          )
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
          ...(dto.selfieImageUrl ? { selfieImageUrl: dto.selfieImageUrl } : {}),
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

    if (result.personId) {
      await this.assertVerifiedIdentityContactAvailable(tenantId, {
        ...(guarantor.email ? { email: guarantor.email } : {}),
        phone: guarantor.phone,
        ...(resolvedCountryCode ? { phoneCountryCode: resolvedCountryCode } : {}),
        currentGuarantorDriverId: driver.id,
        currentPersonId: result.personId,
      });
    }

    await this.driverGuarantors.update({
      where: { driverId: driver.id },
      data: {
        ...verifiedProfileUpdate,
        ...(result.personId ? { personId: result.personId } : {}),
        ...(persistedSelfieImageUrl ? { selfieImageUrl: persistedSelfieImageUrl } : {}),
        ...(persistedProviderImageUrl ? { providerImageUrl: persistedProviderImageUrl } : {}),
        status: result.personId ? 'verified' : 'pending_verification',
        inviteStatus: result.personId ? 'verified' : 'sent',
        ...(result.personId ? { inviteExpiresAt: null } : {}),
      },
    });

    if (result.personId) {
      await this.notificationsService.notifyGuarantorStatus({
        tenantId,
        driverId: driver.id,
        driverName: this.formatDriverName(driver),
        driverEmail: driver.email ?? null,
        guarantorName: guarantor.name,
        guarantorEmail: guarantor.email ?? null,
        status: 'verified',
        actionUrl: `/drivers/${driver.id}`,
      });
    }

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
    providerMiddleName: string | null;
    providerLastName: string | null;
    providerDateOfBirth: string | null;
    providerIssueDate: string | null;
    providerExpiryDate: string | null;
    providerGender: string | null;
    providerStateOfIssuance: string | null;
    providerLicenceClass: string | null;
    portraitAvailable: boolean | null;
    portraitUrl: string | null;
    demographicMatchScore: number | null;
    biometricMatchScore: number | null;
    linkageConfidence: number | null;
    overallLinkageScore: number | null;
    linkageStatus: 'matched' | 'mismatch' | 'pending' | 'insufficient_data';
    linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
    linkageReasons: string[];
    discrepancyFlags: string[];
    identityComparison: {
      firstNameMatch: boolean | null;
      middleNameMatch: boolean | null;
      lastNameMatch: boolean | null;
      dateOfBirthMatch: boolean | null;
      genderMatch: boolean | null;
      biometricMatch: boolean | null;
      biometricConfidence: number | null;
      matchedFieldCount: number;
      comparedFieldCount: number;
    };
    reviewCaseId: string | null;
    manualReviewRequired: boolean;
    reviewDecision: 'approved' | 'rejected' | 'request_reverification' | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    riskImpact: 'low' | 'medium' | 'high' | 'critical';
    riskSummary: string;
    matchScore: number | null;
    riskScore: number | null;
    failureReason: string | null;
    providerReference: string | null;
    verifiedAt: string | null;
  }> {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: payload.tenantId },
      select: { country: true, metadata: true },
    });

    // Payment must be resolved before document verification proceeds.
    await this.assertSelfServiceVerificationPaymentReady(payload.tenantId, driver);

    // Normalise inputs
    const { documentSlug, identifierType } = this.normalizeVerificationDocumentType(
      dto.documentType,
    );
    if (documentSlug === DRIVER_LICENCE_DOCUMENT_TYPE) {
      await this.assertDriverVerificationAddonPaymentReady(
        payload.tenantId,
        driver,
        'drivers_license_verification',
      );
    }
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
    let providerMiddleName: string | null = null;
    let providerLastName: string | null = null;
    let providerDateOfBirth: string | null = null;
    let providerIssueDate: string | null = null;
    let providerExpiryDate: string | null = null;
    let providerGender: string | null = null;
    let providerStateOfIssuance: string | null = null;
    let providerLicenceClass: string | null = null;
    let portraitAvailable: boolean | null = null;
    let portraitUrl: string | null = null;
    let demographicMatchScore: number | null = null;
    let biometricMatchScore: number | null = null;
    let linkageConfidence: number | null = null;
    let overallLinkageScore: number | null = null;
    let linkageStatus: 'matched' | 'mismatch' | 'pending' | 'insufficient_data' = 'pending';
    let linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail' = 'pending_human_review';
    let linkageReasons: string[] = [];
    let discrepancyFlags: string[] = [];
    let identityComparison = {
      firstNameMatch: null as boolean | null,
      middleNameMatch: null as boolean | null,
      lastNameMatch: null as boolean | null,
      dateOfBirthMatch: null as boolean | null,
      genderMatch: null as boolean | null,
      biometricMatch: null as boolean | null,
      biometricConfidence: null as number | null,
      matchedFieldCount: 0,
      comparedFieldCount: 0,
    };
    let reviewCaseId: string | null = null;
    let manualReviewRequired = false;
    let riskImpact: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let riskSummary = "Driver's licence verification is pending.";
    let matchScore: number | null = null;
    let riskScore: number | null = null;
    let failureReason: string | null = null;
    let providerName: string | null = null;
    let providerReference: string | null = null;
    let providerResult: Prisma.JsonObject | null = null;
    const isDriverLicenceVerification = documentSlug === DRIVER_LICENCE_DOCUMENT_TYPE;
    const settings = readOrganisationSettings(tenant?.metadata, tenant?.country);
    if (isDriverLicenceVerification && settings.operations.driverPaysKyc === false) {
      const addonPrice = getVerificationAddonPrice(
        'drivers_license_verification',
        tenant?.country && isCountrySupported(tenant.country)
          ? getCountryConfig(tenant.country).currency
          : 'NGN',
      );
      const spendApplication = await this.verificationSpendService.ensureVerificationSpendApplied({
        tenantId: payload.tenantId,
        subjectType: 'driver',
        subjectId: driver.id,
        verificationTier: settings.operations.verificationTier,
        amountMinorUnits: addonPrice.amountMinorUnits,
        currency: addonPrice.currency,
        description: `${addonPrice.label} charge`,
        metadata: {
          channel: 'driver_self_service_document_verification',
          documentType: documentSlug,
        },
      });

      if (spendApplication.status === 'insufficient') {
        throw new BadRequestException(spendApplication.reason);
      }
    }
    const identityReference = this.getDriverIdentityReference(driver);

    try {
      this.logger.log(
        JSON.stringify({
          event: 'driver_licence_verification_started',
          tenantId: payload.tenantId,
          driverId: driver.id,
          documentType: documentSlug,
          countryCode,
        }),
      );
      this.logger.log(
        JSON.stringify({
          event: 'driver_licence_provider_request_started',
          tenantId: payload.tenantId,
          driverId: driver.id,
          provider: 'youverify',
          hasSelfie: Boolean(identityReference.selfieImageUrl),
          hasDob: Boolean(identityReference.dateOfBirth),
        }),
      );

      const result = await this.intelligenceClient.verifyDocumentIdentifier({
        tenantId: payload.tenantId,
        countryCode,
        identifierType,
        identifierValue: idNumber,
        validationData: {
          ...(identityReference.firstName ? { firstName: identityReference.firstName } : {}),
          ...(identityReference.middleName ? { middleName: identityReference.middleName } : {}),
          ...(identityReference.lastName ? { lastName: identityReference.lastName } : {}),
          ...(identityReference.dateOfBirth ? { dateOfBirth: identityReference.dateOfBirth } : {}),
          ...(identityReference.gender ? { gender: identityReference.gender } : {}),
        },
        ...(identityReference.selfieImageUrl
          ? { selfieImageUrl: identityReference.selfieImageUrl }
          : {}),
      });

      providerName = result.providerName ?? null;
      providerValidity = result.verificationMetadata?.validity ?? null;
      providerIssueDate = result.verificationMetadata?.issueDate ?? null;
      providerExpiryDate = result.verificationMetadata?.expiryDate ?? null;
      portraitAvailable = result.verificationMetadata?.portraitAvailable ?? null;
      matchScore = result.verificationMetadata?.matchScore ?? null;
      riskScore = result.verificationMetadata?.riskScore ?? null;
      providerFirstName = result.verifiedProfile?.firstName ?? null;
      providerMiddleName = result.verifiedProfile?.middleName ?? null;
      providerLastName = result.verifiedProfile?.lastName ?? null;
      providerDateOfBirth = result.verifiedProfile?.dateOfBirth ?? null;
      providerGender = result.verifiedProfile?.gender ?? null;

      const auditRecord = isObjectRecord(result.providerAudit) ? result.providerAudit : null;
      providerReference =
        auditRecord && typeof auditRecord.providerReference === 'string'
          ? auditRecord.providerReference
          : null;
      providerStateOfIssuance =
        auditRecord && typeof auditRecord.stateOfIssuance === 'string'
          ? auditRecord.stateOfIssuance
          : null;
      providerLicenceClass =
        auditRecord && typeof auditRecord.licenceClass === 'string'
          ? auditRecord.licenceClass
          : null;

      portraitUrl = await this.persistIdentityReferenceImage(
        result.verifiedProfile?.photoUrl ?? undefined,
        `driver-licence-${driver.id}-${Date.now()}`,
      );

      this.logger.log(
        JSON.stringify({
          event: 'driver_licence_provider_response_received',
          tenantId: payload.tenantId,
          driverId: driver.id,
          providerName,
          providerReference,
          providerLookupStatus: result.providerLookupStatus ?? null,
          providerVerificationStatus: result.providerVerificationStatus ?? null,
          providerValidity,
        }),
      );

      if (isDriverLicenceVerification) {
        const linkageAssessment = this.evaluateDriverLicenceLinkage(identityReference, {
          firstName: providerFirstName,
          middleName: providerMiddleName,
          lastName: providerLastName,
          dateOfBirth: providerDateOfBirth,
          gender: providerGender,
          auditRecord,
        });
        demographicMatchScore = linkageAssessment.demographicMatchScore;
        biometricMatchScore = linkageAssessment.biometricMatchScore;
        linkageConfidence = linkageAssessment.overallLinkageScore;
        overallLinkageScore = linkageAssessment.overallLinkageScore;
        linkageStatus = linkageAssessment.linkageStatus;
        linkageReasons = linkageAssessment.linkageReasons;
        discrepancyFlags = linkageAssessment.discrepancyFlags;
        identityComparison = linkageAssessment.identityComparison;

        if (
          providerValidity === 'invalid' ||
          this.isDateExpired(providerExpiryDate) ||
          linkageAssessment.hardFailure ||
          linkageStatus === 'mismatch'
        ) {
          linkageDecision = 'fail';
        } else if (linkageStatus === 'matched') {
          linkageDecision = 'auto_pass';
        } else {
          linkageDecision = 'pending_human_review';
        }
        manualReviewRequired = linkageDecision === 'pending_human_review';

        const licenceRiskAssessment = this.assessDriverLicenceRisk({
          validity: providerValidity,
          expiryDate: providerExpiryDate,
          linkageDecision,
        });
        riskImpact = licenceRiskAssessment.riskImpact;
        riskSummary = licenceRiskAssessment.riskSummary;
      } else {
        linkageStatus = 'pending';
        linkageDecision = providerValidity === 'valid' ? 'auto_pass' : 'pending_human_review';
        if (providerValidity === 'invalid') {
          riskImpact = 'high';
          riskSummary = 'Document verification failed validity checks.';
        } else if (providerValidity === 'valid') {
          riskImpact = 'low';
          riskSummary = 'Document was verified successfully.';
        } else {
          riskImpact = 'medium';
          riskSummary = 'Document verification needs manual review.';
        }
      }

      if (
        result.providerLookupStatus === 'provider_unavailable' ||
        result.providerVerificationStatus === 'provider_unavailable'
      ) {
        status = 'provider_unavailable';
        providerMatch = null;
        failureReason = isDriverLicenceVerification
          ? "Driver's licence verification is temporarily unavailable."
          : 'Document verification is temporarily unavailable.';
      } else if (result.providerLookupStatus === 'no_match' || result.decision === 'no_match') {
        status = 'failed';
        providerMatch = false;
        failureReason = isDriverLicenceVerification
          ? "We could not confirm that this driver's licence is valid."
          : 'We could not confirm that this document is valid.';
      } else if (providerValidity === 'invalid') {
        status = 'failed';
        providerMatch = false;
        failureReason = isDriverLicenceVerification
          ? "We could not confirm that this driver's licence is valid."
          : 'We could not confirm that this document is valid.';
      } else if (isDriverLicenceVerification && linkageDecision === 'fail') {
        status = 'failed';
        providerMatch = false;
        failureReason = "Unable to verify that this driver's licence belongs to this person.";
      } else if (isDriverLicenceVerification && linkageDecision === 'pending_human_review') {
        status = 'failed';
        providerMatch = false;
        failureReason =
          "Driver's licence verification could not be confirmed strongly enough. Check the licence number and verified identity details, then try again.";
      } else if (
        (result.decision === 'enrolled' ||
          result.decision === 'matched' ||
          result.isVerifiedMatch === true) &&
        (!isDriverLicenceVerification || linkageDecision === 'auto_pass')
      ) {
        status = 'verified';
        providerMatch = true;
      } else if (result.decision === 'review') {
        status = 'failed';
        providerMatch = false;
        failureReason =
          "Driver's licence verification was inconclusive. Retry with the exact provider-issued licence number.";
      } else {
        status = 'failed';
        providerMatch = false;
        failureReason = result.providerLookupStatus ?? 'Provider returned an inconclusive result.';
      }

      if (isDriverLicenceVerification && driver.personId) {
        const canonicalEvidence = await this.intelligenceClient.recordDriverLicenceEvidence({
          personId: driver.personId,
          tenantId: payload.tenantId,
          driverId: driver.id,
          linkageDecision,
          ...(providerName ? { providerName } : {}),
          ...(providerReference ? { providerReference } : {}),
          ...(providerValidity ? { validity: providerValidity } : {}),
          ...(providerIssueDate ? { issueDate: providerIssueDate } : {}),
          ...(providerExpiryDate ? { expiryDate: providerExpiryDate } : {}),
          ...(demographicMatchScore !== null ? { demographicMatchScore } : {}),
          ...(biometricMatchScore !== null ? { biometricMatchScore } : {}),
          ...(overallLinkageScore !== null ? { overallLinkageScore } : {}),
          ...(linkageReasons.length ? { linkageReasons } : {}),
          ...(discrepancyFlags.length ? { discrepancyFlags } : {}),
          manualReviewRequired,
          evidence: {
            documentType: documentSlug,
            holder: {
              firstName: providerFirstName,
              middleName: providerMiddleName,
              lastName: providerLastName,
              dateOfBirth: providerDateOfBirth,
              gender: providerGender,
            },
            portraitUrl,
            stateOfIssuance: providerStateOfIssuance,
            licenceClass: providerLicenceClass,
          },
        });
        reviewCaseId = canonicalEvidence.reviewCaseId;
      }

      providerResult = {
        providerName: result.providerName ?? null,
        providerReference,
        providerLookupStatus: result.providerLookupStatus ?? null,
        providerVerificationStatus: result.providerVerificationStatus ?? null,
        validity: providerValidity,
        issueDate: providerIssueDate,
        expiryDate: providerExpiryDate,
        portraitAvailable,
        portraitUrl,
        matchScore,
        riskScore,
        stateOfIssuance: providerStateOfIssuance,
        licenceClass: providerLicenceClass,
        holder: {
          firstName: providerFirstName,
          middleName: providerMiddleName,
          lastName: providerLastName,
          dateOfBirth: providerDateOfBirth,
          gender: providerGender,
        },
        linkage: {
          status: linkageStatus,
          demographicMatchScore,
          biometricMatchScore,
          overallLinkageScore,
          decision: linkageDecision,
          reasons: linkageReasons,
          discrepancyFlags,
          identityComparison,
        },
        reviewCaseId,
        manualReviewRequired,
        risk: {
          impact: riskImpact,
          summary: riskSummary,
        },
        audit: (auditRecord as Prisma.JsonObject | null) ?? null,
      };

      this.logger.log(
        JSON.stringify({
          event: 'driver_licence_verification_linkage_evaluated',
          tenantId: payload.tenantId,
          driverId: driver.id,
          linkageStatus,
          demographicMatchScore,
          biometricMatchScore,
          overallLinkageScore,
          linkageDecision,
          riskImpact,
          reviewCaseId,
        }),
      );
      this.logger.log(
        JSON.stringify({
          event: 'driver_licence_verification_normalized',
          tenantId: payload.tenantId,
          driverId: driver.id,
          providerName,
          hasPortrait: Boolean(portraitUrl),
          stateOfIssuance: providerStateOfIssuance,
          licenceClass: providerLicenceClass,
        }),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Provider verification failed unexpectedly.';
      status = /temporarily unavailable|request failed|not configured|unavailable/i.test(message)
        ? 'provider_unavailable'
        : 'failed';
      failureReason =
        status === 'provider_unavailable'
          ? isDriverLicenceVerification
            ? "Driver's licence verification is temporarily unavailable."
            : 'Document verification is temporarily unavailable.'
          : `Provider verification failed: ${message}`;
      riskImpact = isDriverLicenceVerification ? 'medium' : 'high';
      riskSummary =
        status === 'provider_unavailable'
          ? isDriverLicenceVerification
            ? "Driver's licence verification is temporarily unavailable."
            : 'Document verification is temporarily unavailable.'
          : isDriverLicenceVerification
            ? 'Driver licence verification failed.'
            : 'Document verification failed.';
      this.logger.warn(
        JSON.stringify({
          event: 'driver_licence_verification_error',
          tenantId: payload.tenantId,
          driverId: driver.id,
          status,
          error: message,
        }),
      );
    }

    // Update the record with the outcome
    await this.driverDocumentVerifications.update({
      where: { id: verificationRecord.id },
      data: {
        provider: providerName ?? 'unknown',
        status,
        providerMatch,
        providerConfidence: linkageConfidence ?? matchScore,
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

    if (isDriverLicenceVerification) {
      const notificationContext = await this.getTenantNotificationContext(payload.tenantId);
      const settings = await this.getOrganisationSettings(payload.tenantId);
      const effectiveOperations = this.getEffectiveDriverOperationsSettings(
        settings.operations,
        driver,
      );
      const verificationTierDescriptor = getVerificationTierDescriptor(
        effectiveOperations.verificationTier,
      );
      await this.notificationsService.notifyDriverVerificationStatus({
        tenantId: payload.tenantId,
        driverId: driver.id,
        driverName: this.formatDriverName(driver),
        ...(driver.email ? { driverEmail: driver.email } : {}),
        ...notificationContext,
        verificationTierLabel: verificationTierDescriptor.label,
        decision: status === 'verified' ? 'verified' : status === 'failed' ? 'failed' : 'pending',
        detail:
          status === 'verified'
            ? `${verificationTierDescriptor.label}: driver's licence verification passed.`
            : (failureReason ?? "Driver's licence verification could not be completed."),
        actionUrl: `/drivers/${driver.id}`,
      });
    }

    this.logger.log(
      JSON.stringify({
        event: 'driver_licence_verification_persisted',
        tenantId: payload.tenantId,
        driverId: driver.id,
        verificationRecordId: verificationRecord.id,
        status,
        linkageStatus,
        linkageDecision,
        riskImpact,
      }),
    );

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
      providerMiddleName,
      providerGender,
      providerStateOfIssuance,
      providerLicenceClass,
      portraitAvailable,
      portraitUrl,
      demographicMatchScore,
      biometricMatchScore,
      linkageConfidence,
      overallLinkageScore,
      linkageStatus,
      linkageDecision,
      linkageReasons,
      discrepancyFlags,
      identityComparison,
      reviewCaseId,
      manualReviewRequired,
      reviewDecision: null,
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      riskImpact,
      riskSummary,
      matchScore,
      riskScore,
      failureReason,
      providerReference,
      verifiedAt:
        status === 'verified'
          ? new Date().toISOString()
          : (verificationRecord.verifiedAt?.toISOString() ?? null),
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
      providerMiddleName: string | null;
      providerLastName: string | null;
      providerDateOfBirth: string | null;
      providerIssueDate: string | null;
      providerExpiryDate: string | null;
      providerGender: string | null;
      providerStateOfIssuance: string | null;
      providerLicenceClass: string | null;
      portraitAvailable: boolean | null;
      portraitUrl: string | null;
      demographicMatchScore: number | null;
      biometricMatchScore: number | null;
      linkageConfidence: number | null;
      overallLinkageScore: number | null;
      linkageStatus: 'matched' | 'mismatch' | 'pending' | 'insufficient_data';
      linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
      linkageReasons: string[];
      discrepancyFlags: string[];
      identityComparison: {
        firstNameMatch: boolean | null;
        middleNameMatch: boolean | null;
        lastNameMatch: boolean | null;
        dateOfBirthMatch: boolean | null;
        genderMatch: boolean | null;
        biometricMatch: boolean | null;
        biometricConfidence: number | null;
        matchedFieldCount: number;
        comparedFieldCount: number;
      };
      reviewCaseId: string | null;
      manualReviewRequired: boolean;
      reviewDecision: 'approved' | 'rejected' | 'request_reverification' | null;
      reviewedBy: string | null;
      reviewedAt: string | null;
      reviewNotes: string | null;
      riskImpact: 'low' | 'medium' | 'high' | 'critical';
      riskSummary: string;
      matchScore: number | null;
      riskScore: number | null;
      providerReference: string | null;
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
      providerMiddleName:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.holder) &&
        typeof verification.providerResult.holder.middleName === 'string'
          ? verification.providerResult.holder.middleName
          : null,
      providerGender:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.holder) &&
        typeof verification.providerResult.holder.gender === 'string'
          ? verification.providerResult.holder.gender
          : null,
      providerStateOfIssuance:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.stateOfIssuance === 'string'
          ? verification.providerResult.stateOfIssuance
          : null,
      providerLicenceClass:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.licenceClass === 'string'
          ? verification.providerResult.licenceClass
          : null,
      portraitAvailable:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.portraitAvailable === 'boolean'
          ? verification.providerResult.portraitAvailable
          : null,
      portraitUrl:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.portraitUrl === 'string'
          ? verification.providerResult.portraitUrl
          : null,
      demographicMatchScore:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.linkage) &&
        typeof verification.providerResult.linkage.demographicMatchScore === 'number'
          ? verification.providerResult.linkage.demographicMatchScore
          : null,
      biometricMatchScore:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.linkage) &&
        typeof verification.providerResult.linkage.biometricMatchScore === 'number'
          ? verification.providerResult.linkage.biometricMatchScore
          : null,
      linkageConfidence:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.linkage) &&
        typeof verification.providerResult.linkage.overallLinkageScore === 'number'
          ? verification.providerResult.linkage.overallLinkageScore
          : isVerificationMetadataRecord(verification.providerResult) &&
              isVerificationMetadataRecord(verification.providerResult.linkage) &&
              typeof verification.providerResult.linkage.linkageConfidence === 'number'
            ? verification.providerResult.linkage.linkageConfidence
            : null,
      overallLinkageScore:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.linkage) &&
        typeof verification.providerResult.linkage.overallLinkageScore === 'number'
          ? verification.providerResult.linkage.overallLinkageScore
          : null,
      linkageStatus:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.linkage) &&
        typeof verification.providerResult.linkage.status === 'string'
          ? (verification.providerResult.linkage.status as
              | 'matched'
              | 'mismatch'
              | 'pending'
              | 'insufficient_data')
          : 'pending',
      linkageDecision:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.linkage) &&
        typeof verification.providerResult.linkage.decision === 'string'
          ? (verification.providerResult.linkage.decision as
              | 'auto_pass'
              | 'pending_human_review'
              | 'fail')
          : 'fail',
      linkageReasons:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.linkage) &&
        Array.isArray(verification.providerResult.linkage.reasons) &&
        verification.providerResult.linkage.reasons.every((value) => typeof value === 'string')
          ? (verification.providerResult.linkage.reasons as string[])
          : [],
      discrepancyFlags:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.linkage) &&
        Array.isArray(verification.providerResult.linkage.discrepancyFlags) &&
        verification.providerResult.linkage.discrepancyFlags.every(
          (value) => typeof value === 'string',
        )
          ? (verification.providerResult.linkage.discrepancyFlags as string[])
          : [],
      identityComparison:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.linkage) &&
        isVerificationMetadataRecord(verification.providerResult.linkage.identityComparison)
          ? {
              firstNameMatch:
                typeof verification.providerResult.linkage.identityComparison.firstNameMatch ===
                'boolean'
                  ? verification.providerResult.linkage.identityComparison.firstNameMatch
                  : null,
              middleNameMatch:
                typeof verification.providerResult.linkage.identityComparison.middleNameMatch ===
                'boolean'
                  ? verification.providerResult.linkage.identityComparison.middleNameMatch
                  : null,
              lastNameMatch:
                typeof verification.providerResult.linkage.identityComparison.lastNameMatch ===
                'boolean'
                  ? verification.providerResult.linkage.identityComparison.lastNameMatch
                  : null,
              dateOfBirthMatch:
                typeof verification.providerResult.linkage.identityComparison.dateOfBirthMatch ===
                'boolean'
                  ? verification.providerResult.linkage.identityComparison.dateOfBirthMatch
                  : null,
              genderMatch:
                typeof verification.providerResult.linkage.identityComparison.genderMatch ===
                'boolean'
                  ? verification.providerResult.linkage.identityComparison.genderMatch
                  : null,
              biometricMatch:
                typeof verification.providerResult.linkage.identityComparison.biometricMatch ===
                'boolean'
                  ? verification.providerResult.linkage.identityComparison.biometricMatch
                  : null,
              biometricConfidence:
                typeof verification.providerResult.linkage.identityComparison
                  .biometricConfidence === 'number'
                  ? verification.providerResult.linkage.identityComparison.biometricConfidence
                  : null,
              matchedFieldCount:
                typeof verification.providerResult.linkage.identityComparison.matchedFieldCount ===
                'number'
                  ? verification.providerResult.linkage.identityComparison.matchedFieldCount
                  : 0,
              comparedFieldCount:
                typeof verification.providerResult.linkage.identityComparison
                  .comparedFieldCount === 'number'
                  ? verification.providerResult.linkage.identityComparison.comparedFieldCount
                  : 0,
            }
          : {
              firstNameMatch: null,
              middleNameMatch: null,
              lastNameMatch: null,
              dateOfBirthMatch: null,
              genderMatch: null,
              biometricMatch: null,
              biometricConfidence: null,
              matchedFieldCount: 0,
              comparedFieldCount: 0,
            },
      reviewCaseId:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.reviewCaseId === 'string'
          ? verification.providerResult.reviewCaseId
          : null,
      manualReviewRequired:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.manualReviewRequired === 'boolean'
          ? verification.providerResult.manualReviewRequired
          : false,
      reviewDecision:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.reviewDecision === 'string'
          ? (verification.providerResult.reviewDecision as
              | 'approved'
              | 'rejected'
              | 'request_reverification')
          : null,
      reviewedBy: verification.reviewedBy ?? null,
      reviewedAt: verification.reviewedAt ? verification.reviewedAt.toISOString() : null,
      reviewNotes: verification.reviewNotes ?? null,
      riskImpact:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.risk) &&
        typeof verification.providerResult.risk.impact === 'string'
          ? (verification.providerResult.risk.impact as 'low' | 'medium' | 'high' | 'critical')
          : 'medium',
      riskSummary:
        isVerificationMetadataRecord(verification.providerResult) &&
        isVerificationMetadataRecord(verification.providerResult.risk) &&
        typeof verification.providerResult.risk.summary === 'string'
          ? verification.providerResult.risk.summary
          : (verification.failureReason ?? 'Document verification is pending.'),
      matchScore: verification.providerConfidence ?? null,
      riskScore:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.riskScore === 'number'
          ? verification.providerResult.riskScore
          : null,
      providerReference:
        isVerificationMetadataRecord(verification.providerResult) &&
        typeof verification.providerResult.providerReference === 'string'
          ? verification.providerResult.providerReference
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

  async getIdentityLivenessReadinessFromSelfService(
    token: string,
    countryCode?: string,
  ): Promise<DriverLivenessReadiness> {
    const payload = await this.verifySelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const resolvedCountryCode = countryCode ?? driver.nationality;

    if (!resolvedCountryCode) {
      throw new BadRequestException(
        'countryCode is required when the driver nationality is not set',
      );
    }

    return this.intelligenceClient.getLivenessReadiness({
      countryCode: resolvedCountryCode,
    });
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
    // For provider_unavailable pending attempts allow a shorter retry window (60 s) so
    // drivers can immediately resubmit once the provider recovers.  For all other
    // in-flight statuses keep the 5-minute dedup window to prevent double-submissions.
    const isPreviousProviderPending =
      duplicateAttempt?.status === 'in_progress' &&
      (duplicateAttempt?.metadata as Record<string, unknown> | null)?.pendingReason ===
        'provider_unavailable';
    const duplicateWindowMs = isPreviousProviderPending ? 60 * 1000 : 5 * 60 * 1000;
    if (
      duplicateAttempt &&
      ['initiated', 'liveness_started', 'in_progress', 'provider_called', 'success'].includes(
        duplicateAttempt.status,
      ) &&
      duplicateAttempt.updatedAt.getTime() >= Date.now() - duplicateWindowMs
    ) {
      throw new ConflictException(
        isPreviousProviderPending
          ? 'The identity provider is temporarily unavailable. Please wait a moment and try again.'
          : 'This verification submission is already being processed. Refresh your status before trying again.',
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

    if (!verificationPolicy.driverPaysKyc) {
      const verificationTier = verificationPolicy.verificationTier;
      const spendApplication = await this.verificationSpendService.ensureVerificationSpendApplied({
        tenantId: payload.tenantId,
        subjectType: 'driver',
        subjectId: payload.driverId,
        verificationTier,
        amountMinorUnits: verificationPolicy.verificationAmountMinorUnits,
        currency: verificationPolicy.verificationCurrency,
        description: `${getVerificationTierDescriptor(verificationTier).label} verification charge`,
        metadata: {
          attemptId: attempt.id,
          channel: 'driver_self_service',
        },
      });

      if (spendApplication.status === 'insufficient') {
        throw new BadRequestException(spendApplication.reason);
      }
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

      // Detect provider-pending: intelligence succeeded but every configured provider was
      // unreachable.  This is distinct from 'failed' — the driver is not at fault and the
      // entitlement must not be consumed.  We store the identifiers in metadata so that the
      // background retry scheduler can reattempt without requiring the driver to re-enter them.
      const isProviderPending =
        attemptStatus === 'in_progress' &&
        !result.isVerifiedMatch &&
        !result.providerLookupStatus &&
        result.decision !== 'review_required';
      const attemptMetadataUpdate = isProviderPending
        ? {
            pendingReason: 'provider_unavailable',
            pendingAt: new Date().toISOString(),
            retryData: {
              identifiers: sanitizedIdentifiers,
              selfieImageUrl:
                result.verifiedProfile?.selfieImageUrl ?? driver.selfieImageUrl ?? null,
              countryCode: rest.countryCode ?? null,
            },
          }
        : undefined;

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
      if (attemptMetadataUpdate) {
        const metadataJson = JSON.stringify(attemptMetadataUpdate);
        await this.prisma.$executeRaw(Prisma.sql`
          UPDATE "verification_attempts"
          SET "metadata" = ${metadataJson}::jsonb, "updatedAt" = NOW()
          WHERE "id" = ${attempt.id}
        `);
      }

      // Only consume the entitlement on terminal outcomes (success or failed).
      // Provider-pending attempts leave the entitlement in 'reserved' so retries
      // can proceed without a new payment.
      if (
        verificationPolicy.driverPaysKyc &&
        entitlement &&
        ['paid', 'reserved'].includes(entitlementState) &&
        !isProviderPending
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
          isProviderPending,
        }),
      );

      return { ...result, ...(isProviderPending ? { providerPending: true } : {}) };
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
    await this.assertVerifiedIdentityContactAvailable(payload.tenantId, {
      email: normalizedEmail,
      ...(driver.phone ? { phone: driver.phone } : {}),
      ...(driver.nationality ? { phoneCountryCode: driver.nationality } : {}),
      currentDriverId: driver.id,
      currentPersonId: driver.personId,
    });
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
    await this.assertVerifiedIdentityContactAvailable(payload.tenantId, {
      email: normalizedEmail,
      phone: guarantor.phone,
      ...(guarantor.countryCode ? { phoneCountryCode: guarantor.countryCode } : {}),
      currentGuarantorDriverId: driver.id,
      ...(guarantor.personId !== undefined ? { currentPersonId: guarantor.personId } : {}),
    });
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
    const currentDriver = await this.findOne(payload.tenantId, payload.driverId);
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

    await this.assertVerifiedIdentityContactAvailable(payload.tenantId, {
      ...(updates.email ? { email: updates.email } : {}),
      ...(updates.phone ? { phone: updates.phone } : {}),
      ...(currentDriver.nationality ? { phoneCountryCode: currentDriver.nationality } : {}),
      currentDriverId: payload.driverId,
      currentPersonId: currentDriver.personId,
    });

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

    const acceptedAt = new Date();
    const existingConsent = await this.prisma.userConsent.findFirst({
      where: {
        tenantId: payload.tenantId,
        userId: linkedUser.id,
        subjectType: 'guarantor',
        subjectId: guarantor.id,
        policyDocument: 'verification_sensitive_processing',
        policyVersion: LEGAL_DOCUMENT_VERSIONS.privacy,
        granted: true,
      },
      select: { id: true },
    });

    await this.prisma.$transaction([
      ...(!existingConsent
        ? [
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
          ]
        : []),
      this.prisma.driverGuarantor.update({
        where: { id: guarantor.id },
        data: {
          responsibilityAcceptedAt: acceptedAt,
          responsibilityAcceptanceEvidence: {
            acceptedAt: acceptedAt.toISOString(),
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

    await this.assertVerifiedIdentityContactAvailable(payload.tenantId, {
      ...(updates.email ? { email: updates.email } : {}),
      ...(updates.phone ? { phone: updates.phone } : {}),
      ...(updates.countryCode
        ? { phoneCountryCode: updates.countryCode }
        : guarantor.countryCode
          ? { phoneCountryCode: guarantor.countryCode }
          : {}),
      currentGuarantorDriverId: payload.driverId,
      ...(guarantor.personId !== undefined ? { currentPersonId: guarantor.personId } : {}),
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
    profile: DriverOperationalProfile,
  ): Promise<{ message: string }> {
    const payload = await this.verifySelfServiceToken(token);
    const currentDriver = (await this.prisma.driver.findUnique({
      where: { id: payload.driverId },
    })) as (Driver & { operationalProfile?: Prisma.JsonValue | null }) | null;
    if (!currentDriver || currentDriver.tenantId !== payload.tenantId) {
      throw new NotFoundException('Driver not found.');
    }

    const normalizedProfile: DriverOperationalProfile = {
      ...(profile.phoneNumber?.trim() ? { phoneNumber: profile.phoneNumber.trim() } : {}),
      ...(profile.address?.trim() ? { address: profile.address.trim() } : {}),
      ...(profile.town?.trim() ? { town: profile.town.trim() } : {}),
      ...(profile.localGovernmentArea?.trim()
        ? { localGovernmentArea: profile.localGovernmentArea.trim() }
        : {}),
      ...(profile.state?.trim() ? { state: profile.state.trim() } : {}),
      ...(profile.nextOfKinName?.trim() ? { nextOfKinName: profile.nextOfKinName.trim() } : {}),
      ...(profile.nextOfKinPhone?.trim()
        ? { nextOfKinPhone: profile.nextOfKinPhone.trim() }
        : {}),
      ...(profile.nextOfKinRelationship?.trim()
        ? { nextOfKinRelationship: profile.nextOfKinRelationship.trim() }
        : {}),
      ...(profile.emergencyContactName?.trim()
        ? { emergencyContactName: profile.emergencyContactName.trim() }
        : {}),
      ...(profile.emergencyContactPhone?.trim()
        ? { emergencyContactPhone: profile.emergencyContactPhone.trim() }
        : {}),
      ...(profile.emergencyContactRelationship?.trim()
        ? {
            emergencyContactRelationship: profile.emergencyContactRelationship.trim(),
          }
        : {}),
    };

    if (Object.keys(normalizedProfile).length === 0) {
      return { message: 'No changes.' };
    }

    const existingOperationalProfile = this.readOperationalProfile(currentDriver.operationalProfile, {
      phone: currentDriver.phone,
    });
    const nextOperationalProfile = {
      ...existingOperationalProfile,
      ...normalizedProfile,
    };
    const missingOperationalFields = this.getMissingOperationalProfileFields(nextOperationalProfile);

    if (missingOperationalFields.length > 0) {
      throw new BadRequestException(
        `Complete the required profile fields before continuing: ${this.formatOperationalFieldLabels(
          missingOperationalFields,
        ).join(', ')}.`,
      );
    }

    await this.prisma.driver.update({
      where: { id: payload.driverId },
      data: {
        ...(nextOperationalProfile.phoneNumber
          ? { phone: nextOperationalProfile.phoneNumber }
          : {}),
        operationalProfile: nextOperationalProfile as Prisma.InputJsonValue,
      } as never,
    });
    return { message: 'Operational profile updated.' };
  }

  async submitGuarantorFromSelfService(
    token: string,
    dto: CreateOrUpdateDriverGuarantorDto,
  ): Promise<{
    guarantor: DriverGuarantorRecord;
    capacity: DriverGuarantorCapacityAssessment;
    payment: {
      required: boolean;
      paymentStatus: 'not_required' | 'ready' | 'driver_payment_required';
      paymentMessage: string;
      amountMinorUnits: number;
      currency: string;
      payer: 'driver' | 'organisation';
    };
    invitation: {
      status:
        | 'sent'
        | 'already_verified'
        | 'missing_email'
        | 'operator_action_required'
        | 'queued_until_driver_verified'
        | 'failed'
        | 'not_ready';
      message: string;
      destination?: string;
    };
  }> {
    const payload = await this.verifySelfServiceToken(token);
    const capacity = await this.assessDriverGuarantorCapacity(payload.tenantId, payload.driverId, {
      phone: dto.phone,
      ...(dto.email ? { email: dto.email } : {}),
      countryCode: dto.countryCode ?? null,
    });
    if (!capacity.eligible) {
      throw new ConflictException(capacity.message);
    }
    const guarantor = await this.createOrUpdateGuarantor(payload.tenantId, payload.driverId, dto, {
      triggerInvitation: false,
    });
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const guarantorRequirement = await this.getDriverGuarantorRequirement(payload.tenantId, driver);
    const paymentPolicy = await this.getDriverVerificationAddonPaymentPolicy(
      payload.tenantId,
      driver,
      'guarantor_verification',
    );
    if (!guarantorRequirement.verificationRequired) {
      this.throwGuarantorNotRequiredError();
    }
    const invitation =
      paymentPolicy.required &&
      paymentPolicy.payer === 'driver' &&
      paymentPolicy.paymentStatus === 'driver_payment_required'
        ? {
            status: 'not_ready' as const,
            message: `Guarantor saved. ${paymentPolicy.paymentMessage}`,
          }
        : await this.maybeSendGuarantorSelfServiceLinkIfEligible(
            payload.tenantId,
            payload.driverId,
            'guarantor_updated',
          );
    return {
      guarantor,
      capacity,
      payment: {
        required: paymentPolicy.required,
        paymentStatus: paymentPolicy.paymentStatus,
        paymentMessage: paymentPolicy.paymentMessage,
        amountMinorUnits: paymentPolicy.amountMinorUnits,
        currency: paymentPolicy.currency,
        payer: paymentPolicy.payer,
      },
      invitation,
    };
  }

  async resendGuarantorInviteFromSelfService(token: string): Promise<{
    status:
      | 'sent'
      | 'already_verified'
      | 'missing_email'
      | 'operator_action_required'
      | 'queued_until_driver_verified'
      | 'failed'
      | 'not_ready';
    message: string;
    destination?: string;
  }> {
    const payload = await this.verifySelfServiceToken(token);
    const [driver, guarantor] = await Promise.all([
      this.findOne(payload.tenantId, payload.driverId),
      this.driverGuarantors.findUnique({ where: { driverId: payload.driverId } }),
    ]);
    const guarantorRequirement = await this.getDriverGuarantorRequirement(
      payload.tenantId,
      driver,
    );

    if (!guarantorRequirement.verificationRequired) {
      this.throwGuarantorNotRequiredError();
    }

    if (!guarantor || guarantor.disconnectedAt !== null) {
      throw new NotFoundException('No active guarantor has been linked to this driver yet.');
    }

    if (guarantor.status === 'verified') {
      throw new BadRequestException('This guarantor has already completed verification.');
    }

    const invitation = await this.maybeSendGuarantorSelfServiceLinkIfEligible(
      payload.tenantId,
      payload.driverId,
      'reminder',
    );

    await this.auditService.recordTenantAction({
      tenantId: payload.tenantId,
      entityType: 'driver',
      entityId: payload.driverId,
      action: 'driver.guarantor.invitation.resent_by_driver',
      beforeState: {
        guarantorStatus: guarantor.status,
        guarantorEmail: guarantor.email ?? null,
      },
      afterState: {
        guarantorStatus: guarantor.status,
        guarantorEmail: guarantor.email ?? null,
      },
      metadata: {
        invitationStatus: invitation.status,
        destination: invitation.destination ?? guarantor.email ?? null,
      },
    });

    return invitation;
  }

  private assertGuarantorReplacementAllowed(
    existingGuarantor: DriverGuarantorRecord,
    next: { nextPhone: string; nextEmail?: string | null },
  ) {
    const nextEmail = next.nextEmail?.trim().toLowerCase() || null;
    const existingEmail = existingGuarantor.email?.trim().toLowerCase() || null;
    const isSameContact =
      existingGuarantor.phone === next.nextPhone &&
      existingEmail === nextEmail;

    if (isSameContact) {
      return;
    }

    const hasAcceptedResponsibility = Boolean(existingGuarantor.responsibilityAcceptedAt);
    const hasStartedKyc = Boolean(
      existingGuarantor.personId ||
        existingGuarantor.selfieImageUrl ||
        existingGuarantor.providerImageUrl ||
        existingGuarantor.dateOfBirth ||
        existingGuarantor.gender ||
        existingGuarantor.status === 'verified',
    );

    if (hasAcceptedResponsibility || hasStartedKyc) {
      throw new ConflictException(
        'You can only change this guarantor before they accept responsibility or start KYC. Ask your organisation to review the current guarantor before replacing them.',
      );
    }
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

  private async buildDriverCanonicalInsights(
    tenantId: string,
    driver: DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary &
      DriverMobileAccessSummary &
      DriverReadinessSummary,
  ): Promise<DriverCanonicalInsights | undefined> {
    const settings = await this.getOrganisationSettings(tenantId);
    const effectiveOperations = this.getEffectiveDriverOperationsSettings(settings.operations, driver);
    if (effectiveOperations.verificationTier !== 'FULL_TRUST_VERIFICATION') {
      return undefined;
    }

    const [driverRolePresence, guarantorRolePresence, guarantorReuseCount] = await Promise.all([
      driver.personId
        ? this.intelligenceClient.queryPersonRolePresence(driver.personId).catch(() => null)
        : Promise.resolve(null),
      driver.guarantorPersonId
        ? this.intelligenceClient.queryPersonRolePresence(driver.guarantorPersonId).catch(() => null)
        : Promise.resolve(null),
      driver.guarantorPersonId
        ? this.prisma.driverGuarantor.count({
            where: {
              tenantId,
              personId: driver.guarantorPersonId,
              disconnectedAt: null,
            },
          })
        : Promise.resolve(0),
    ]);

    const fraudIndicators: string[] = [];
    if (driver.duplicateIdentityFlag) {
      fraudIndicators.push('Duplicate identity signal detected.');
    }
    if (driver.isWatchlisted) {
      fraudIndicators.push('Driver watchlist signal is active.');
    }
    if (driver.riskBand === 'high' || driver.riskBand === 'critical') {
      fraudIndicators.push(`Driver risk band is ${driver.riskBand}.`);
    }
    if (driverRolePresence?.hasMultiTenantPresence) {
      fraudIndicators.push('Driver identity appears across multiple tenants.');
    }
    if (driver.guarantorIsAlsoDriver) {
      fraudIndicators.push('Guarantor identity is also linked to a driver role.');
    }
    if (guarantorRolePresence?.hasMultiTenantPresence) {
      fraudIndicators.push('Guarantor identity appears across multiple tenants.');
    }
    if ((guarantorReuseCount ?? 0) > 1) {
      fraudIndicators.push('Guarantor identity is reused across multiple drivers in this tenant.');
    }

    const toLinkedRoles = (
      presence: { isDriver: boolean; isGuarantor: boolean } | null,
    ): string[] => {
      if (!presence) return [];
      return [
        ...(presence.isDriver ? ['driver'] : []),
        ...(presence.isGuarantor ? ['guarantor'] : []),
      ];
    };

    return {
      driverIdentity: {
        personId: driver.personId ?? null,
        tenantCount: driverRolePresence?.tenantCount ?? null,
        hasMultiTenantPresence: driverRolePresence?.hasMultiTenantPresence ?? false,
        hasMultiRolePresence: driverRolePresence?.hasMultiRolePresence ?? false,
        linkedRoles: toLinkedRoles(driverRolePresence),
      },
      guarantorIdentity: driver.guarantorPersonId
        ? {
            personId: driver.guarantorPersonId,
            tenantCount: guarantorRolePresence?.tenantCount ?? null,
            hasMultiTenantPresence: guarantorRolePresence?.hasMultiTenantPresence ?? false,
            hasMultiRolePresence: guarantorRolePresence?.hasMultiRolePresence ?? false,
            linkedRoles: toLinkedRoles(guarantorRolePresence),
            reuseCount: guarantorReuseCount,
          }
        : null,
      fraudIndicators,
    };
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
  ): Promise<
    Driver & {
      selfServiceInviteStatus?: 'sent' | 'skipped' | 'failed';
      selfServiceInviteReason?: string | null;
    }
  > {
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

    await this.assertVerifiedIdentityContactAvailable(tenantId, {
      ...(dto.email?.trim() ? { email: dto.email.trim().toLowerCase() } : {}),
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      ...(dto.nationality ? { phoneCountryCode: dto.nationality } : {}),
    });

    const currentDriverCount = await this.prisma.driver.count({
      where: { tenantId, archivedAt: null },
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
    const shouldForceSelfServiceLink =
      settings.operations.requireIdentityVerificationForActivation !== false &&
      settings.operations.driverPaysKyc;
    const shouldAutoSendSelfServiceLink =
      shouldForceSelfServiceLink ||
      options.autoSendSelfServiceLink ||
      settings.operations.autoSendDriverSelfServiceLinkOnCreate;

    let selfServiceInviteStatus: 'sent' | 'skipped' | 'failed' = 'skipped';
    let selfServiceInviteReason: string | null = null;

    if (shouldAutoSendSelfServiceLink && !createdDriver.email) {
      selfServiceInviteStatus = 'failed';
      selfServiceInviteReason = 'Driver has no email address.';
    } else if (shouldAutoSendSelfServiceLink && createdDriver.email) {
      try {
        await this.sendSelfServiceLink(tenantId, createdDriver.id);
        selfServiceInviteStatus = 'sent';
      } catch (error) {
        selfServiceInviteStatus = 'failed';
        selfServiceInviteReason = this.getErrorMessage(error);
        this.logger.warn(
          `Unable to send self-service link for driver '${createdDriver.id}': ${this.getErrorMessage(error)}`,
        );
      }
    }

    return {
      ...createdDriver,
      selfServiceInviteStatus,
      selfServiceInviteReason,
    };
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

  async archiveDriver(
    tenantId: string,
    id: string,
    input: { reason?: string; archivedBy?: string | null } = {},
  ): Promise<{ message: string; mode: 'archived' }> {
    const driver = (await this.prisma.driver.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        status: true,
        personId: true,
        firstName: true,
        lastName: true,
        archivedAt: true,
      },
    })) as
      | {
          id: string;
          tenantId: string;
          status: string;
          personId: string | null;
          firstName: string | null;
          lastName: string | null;
          archivedAt: Date | null;
        }
      | null;

    if (!driver) {
      throw new NotFoundException(`Driver '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(driver.tenantId), asTenantId(tenantId));

    if (driver.archivedAt) {
      throw new BadRequestException('This driver record has already been removed from the roster.');
    }

    const [activeAssignments, assignmentHistoryCount, remittanceHistoryCount] = await Promise.all([
      this.prisma.assignment.count({
        where: {
          tenantId,
          driverId: id,
          status: {
            in: ['created', 'pending_driver_confirmation', 'driver_action_required', 'accepted', 'active'],
          },
        },
      }),
      this.prisma.assignment.count({ where: { tenantId, driverId: id } }),
      this.prisma.remittance.count({ where: { tenantId, driverId: id } }),
    ]);

    if (activeAssignments > 0) {
      throw new BadRequestException(
        'This driver still has active assignment activity. End or cancel the active assignment before removing the driver record.',
      );
    }

    const archiveReason =
      input.reason?.trim() ||
      (assignmentHistoryCount > 0 || remittanceHistoryCount > 0
        ? 'Archived from active roster with historical activity preserved.'
        : 'Archived from active roster.');

    const archivedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.driver.update({
        where: { id },
        data: {
          archivedAt,
          archivedBy: input.archivedBy?.trim() || null,
          archiveReason,
          status: driver.status === 'active' ? 'terminated' : driver.status,
        },
      }),
      this.prisma.user.updateMany({
        where: { tenantId, driverId: id },
        data: { isActive: false },
      }),
    ]);

    await this.auditService.recordTenantAction({
      tenantId,
      entityType: 'driver',
      entityId: id,
      action: 'driver.archived',
      beforeState: {
        status: driver.status,
        archivedAt: null,
      },
      afterState: {
        status: driver.status === 'active' ? 'terminated' : driver.status,
        archivedAt: archivedAt.toISOString(),
      },
      metadata: {
        archiveReason,
        hadAssignmentHistory: assignmentHistoryCount > 0,
        hadRemittanceHistory: remittanceHistoryCount > 0,
      },
    });

    return {
      message:
        assignmentHistoryCount > 0 || remittanceHistoryCount > 0
          ? 'Driver removed from the active roster. Historical assignment and remittance records were preserved.'
          : 'Driver removed from the active roster.',
      mode: 'archived',
    };
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
        const message = error.message.toLowerCase();
        if (message.includes('not configured for this country')) {
          throw new ServiceUnavailableException(
            'Live verification is not available for this country yet.',
          );
        }
        if (message.includes('not ready right now')) {
          throw new ServiceUnavailableException(
            'Live verification is not ready right now. Please contact support.',
          );
        }
        throw new ServiceUnavailableException(
          'Live verification is temporarily unavailable right now. Please try again in a moment.',
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
      firstName?: string;
      middleName?: string;
      lastName?: string;
      fullName?: string;
      dateOfBirth?: string;
      nationality?: string;
      address?: string;
      fullAddress?: string;
      addressLine?: string;
      town?: string;
      localGovernmentArea?: string;
      state?: string;
      mobileNumber?: string;
      emailAddress?: string;
      birthState?: string;
      birthLga?: string;
      nextOfKinState?: string;
      religion?: string;
      ninIdNumber?: string;
      gender?: string;
      photoUrl?: string;
      signatureUrl?: string;
      providerImageUrl?: string;
      selfieImageUrl?: string;
      signatureImageUrl?: string;
    };
    verificationMetadata?: {
      validity?: 'valid' | 'invalid' | 'unknown';
      issueDate?: string;
      expiryDate?: string;
      portraitAvailable?: boolean;
      matchScore?: number;
      riskScore?: number;
    };
    providerAudit?: Record<string, unknown>;
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
      : dto.selfieImageUrl
        ? await this.persistIdentityReferenceImage(
            dto.selfieImageUrl,
            `driver-selfie-${driver.id}-${Date.now()}`,
          )
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
        ...(dto.selfieImageUrl ? { selfieImageUrl: dto.selfieImageUrl } : {}),
        ...(persistedSelfieImageUrl ? { selfieImageUrl: persistedSelfieImageUrl } : {}),
        ...(dto.livenessCheck ? { livenessCheck: dto.livenessCheck } : {}),
      },
    });

    if (result.personId) {
      const conflictingDriver = await this.prisma.driver.findFirst({
        where: {
          tenantId,
          personId: result.personId,
          id: { not: driver.id },
          archivedAt: null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      });

      if (conflictingDriver && !this.isSameDriverRetryCandidate(driver, conflictingDriver)) {
        const conflictingName =
          [conflictingDriver.firstName, conflictingDriver.lastName].filter(Boolean).join(' ') ||
          conflictingDriver.email ||
          conflictingDriver.phone ||
          conflictingDriver.id;

        await this.auditService.recordTenantAction({
          tenantId,
          entityType: 'driver',
          entityId: driver.id,
          action: 'driver.identity.duplicate_detected',
          beforeState: {
            personId: driver.personId ?? null,
            identityStatus: driver.identityStatus,
          },
          afterState: {
            personId: result.personId,
            conflictingDriverId: conflictingDriver.id,
          },
          metadata: {
            conflictingDriverName: conflictingName,
            conflictingDriverStatus: conflictingDriver.status,
            duplicateSignal: 'same_person_in_same_tenant',
          },
        });

        throw new ConflictException(
          `This verified identity is already linked to ${conflictingName} in your organisation. ` +
            'Review that existing driver record instead of creating a second driver identity.',
        );
      }

      await this.assertVerifiedIdentityContactAvailable(tenantId, {
        ...(driver.email ? { email: driver.email } : {}),
        ...(driver.phone ? { phone: driver.phone } : {}),
        ...(resolvedCountryCode ? { phoneCountryCode: resolvedCountryCode } : {}),
        currentDriverId: driver.id,
        currentPersonId: result.personId,
      });
    }

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
    const persistedSignatureImageUrl = await this.persistIdentityReferenceImage(
      result.verifiedProfile?.signatureUrl,
      `driver-signature-${driver.id}-${Date.now()}`,
    );
    const identityProfileSnapshot = this.buildDriverIdentityProfileSnapshot(result, {
      selfieImageUrl: persistedSelfieImageUrl,
      providerImageUrl: persistedProviderImageUrl,
      signatureImageUrl: persistedSignatureImageUrl,
    });

    this.logger.log(
      JSON.stringify({
        event: 'driver_verification_assets_persisted',
        tenantId,
        driverId: driver.id,
        hasSelfieImage: Boolean(persistedSelfieImageUrl),
        hasProviderPortrait: Boolean(persistedProviderImageUrl),
        hasSignatureImage: Boolean(persistedSignatureImageUrl),
      }),
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
        ...(persistedSignatureImageUrl
          ? { identitySignatureImageUrl: persistedSignatureImageUrl }
          : {}),
        ...(identityProfileSnapshot ? { identityProfile: identityProfileSnapshot } : {}),
        ...(result.verificationMetadata
          ? { identityVerificationMetadata: result.verificationMetadata as Prisma.InputJsonValue }
          : {}),
        ...(result.providerAudit
          ? { identityProviderRawData: result.providerAudit as Prisma.InputJsonValue }
          : {}),
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
        event: 'driver_profile_updated_from_verification',
        tenantId,
        driverId: driver.id,
        updatedOperationalProfile: Object.keys(verifiedProfileUpdate).length > 0,
        savedIdentitySnapshot: Boolean(identityProfileSnapshot),
        savedVerificationMetadata: Boolean(result.verificationMetadata),
        savedProviderAudit: Boolean(result.providerAudit),
      }),
    );

    this.logger.log(
      JSON.stringify({
        event: 'driver_verification_transition',
        tenantId,
        driverId: driver.id,
        identityStatus: nextIdentityStatus,
        decision: result.decision,
        providerLookupStatus: result.providerLookupStatus ?? null,
        providerVerificationStatus: result.providerVerificationStatus ?? null,
        hasIdentityProfileSnapshot: Boolean(identityProfileSnapshot),
        hasProviderAudit: Boolean(result.providerAudit),
        livenessPassed: result.livenessPassed ?? null,
        livenessProviderName: result.livenessProviderName ?? null,
      }),
    );

    if (nextIdentityStatus === 'verified') {
      await this.maybeSendGuarantorSelfServiceLinkIfEligible(tenantId, driver.id, 'driver_verified');
    }

    return {
      ...result,
      ...(result.verifiedProfile || persistedSelfieImageUrl || persistedProviderImageUrl
        ? {
            verifiedProfile: {
              ...(result.verifiedProfile ?? {}),
              ...(persistedSelfieImageUrl ? { selfieImageUrl: persistedSelfieImageUrl } : {}),
              ...(persistedProviderImageUrl ? { providerImageUrl: persistedProviderImageUrl } : {}),
              ...(persistedSignatureImageUrl
                ? { signatureImageUrl: persistedSignatureImageUrl }
                : {}),
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

  private isSameDriverRetryCandidate(
    currentDriver: Pick<Driver, 'email' | 'phone'>,
    conflictingDriver: {
      email?: string | null;
      phone?: string | null;
    },
  ): boolean {
    const currentEmail = currentDriver.email?.trim().toLowerCase() ?? null;
    const conflictingEmail = conflictingDriver.email?.trim().toLowerCase() ?? null;
    if (currentEmail && conflictingEmail && currentEmail === conflictingEmail) {
      return true;
    }

    const currentPhone = currentDriver.phone?.trim() ?? null;
    const conflictingPhone = conflictingDriver.phone?.trim() ?? null;
    return Boolean(currentPhone && conflictingPhone && currentPhone === conflictingPhone);
  }

  private buildVerifiedDriverProfileUpdate(result: DriverIdentityResolutionResult): {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    nationality?: string;
    gender?: string;
  } {
    if (result.isVerifiedMatch !== true || !result.verifiedProfile) {
      return {};
    }

    const updates: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      nationality?: string;
      gender?: string;
    } = {};
    const firstName = result.verifiedProfile.firstName?.trim();
    const middleName = result.verifiedProfile.middleName?.trim();
    const lastName = result.verifiedProfile.lastName?.trim();
    if (firstName || middleName || lastName) {
      if (firstName || middleName) {
        updates.firstName = [firstName, middleName].filter(Boolean).join(' ');
      }
      if (lastName) {
        updates.lastName = lastName;
      }
    } else {
      const fullName = result.verifiedProfile.fullName?.trim();
      if (fullName) {
        const parts = fullName.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
          const fallbackFirstName = parts[0];
          if (fallbackFirstName) {
            updates.firstName = fallbackFirstName;
          }
        } else if (parts.length > 1) {
          updates.firstName = parts.slice(0, -1).join(' ');
          const fallbackLastName = parts.at(-1);
          if (fallbackLastName) {
            updates.lastName = fallbackLastName;
          }
        }
      }
    }

    if (result.verifiedProfile.dateOfBirth?.trim()) {
      updates.dateOfBirth = result.verifiedProfile.dateOfBirth.trim();
    }

    if (result.verifiedProfile.nationality?.trim()) {
      updates.nationality = result.verifiedProfile.nationality.trim().toUpperCase();
    }

    if (result.verifiedProfile.gender?.trim()) {
      const normalizedGender = this.normalizeGenderValue(result.verifiedProfile.gender);
      if (normalizedGender) {
        updates.gender = normalizedGender;
      }
    }

    return updates;
  }

  private normalizeGenderValue(input?: string | null): string | undefined {
    const normalized = input?.trim();
    if (!normalized) {
      return undefined;
    }
    const compact = normalized.toLowerCase();
    if (compact === 'm' || compact === 'male') return 'male';
    if (compact === 'f' || compact === 'female') return 'female';
    return normalized;
  }

  private buildDriverIdentityProfileSnapshot(
    result: DriverIdentityResolutionResult,
    persistedImages: {
      selfieImageUrl?: string | null;
      providerImageUrl?: string | null;
      signatureImageUrl?: string | null;
    },
  ): Prisma.InputJsonValue | undefined {
    const profile = result.verifiedProfile;
    if (!profile && !persistedImages.selfieImageUrl && !persistedImages.providerImageUrl) {
      return undefined;
    }

    const snapshot: Record<string, unknown> = {
      ...(profile?.firstName?.trim() ? { firstName: profile.firstName.trim() } : {}),
      ...(profile?.middleName?.trim() ? { middleName: profile.middleName.trim() } : {}),
      ...(profile?.lastName?.trim() ? { lastName: profile.lastName.trim() } : {}),
      ...(profile?.fullName?.trim() ? { fullName: profile.fullName.trim() } : {}),
      ...(profile?.dateOfBirth?.trim() ? { dateOfBirth: profile.dateOfBirth.trim() } : {}),
      ...(profile?.nationality?.trim()
        ? { nationality: profile.nationality.trim().toUpperCase() }
        : {}),
      ...(profile?.gender?.trim()
        ? { gender: this.normalizeGenderValue(profile.gender) ?? profile.gender.trim() }
        : {}),
      ...(profile?.ninIdNumber?.trim() ? { ninIdNumber: profile.ninIdNumber.trim() } : {}),
      ...(persistedImages.selfieImageUrl ? { selfieImageUrl: persistedImages.selfieImageUrl } : {}),
      ...(persistedImages.providerImageUrl
        ? { providerImageUrl: persistedImages.providerImageUrl }
        : {}),
      ...(persistedImages.signatureImageUrl
        ? { signatureImageUrl: persistedImages.signatureImageUrl }
        : {}),
    };

    return Object.keys(snapshot).length > 0 ? (snapshot as Prisma.InputJsonValue) : undefined;
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

  private inferImageContentType(source: string): string {
    const normalized = source.toLowerCase();
    if (normalized.includes('.png')) return 'image/png';
    if (normalized.includes('.webp')) return 'image/webp';
    if (normalized.includes('.svg')) return 'image/svg+xml';
    return 'image/jpeg';
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

  private buildPhoneContactCandidates(phone: string, countryCode?: string | null): string[] {
    const trimmed = phone.trim();
    const candidates = new Set<string>();
    if (!trimmed) {
      return [];
    }

    candidates.add(trimmed);
    const compact = trimmed.replace(/[^\d+]/g, '');
    if (compact) {
      candidates.add(compact);
    }

    try {
      candidates.add(this.normalizePhoneNumber(trimmed, countryCode));
    } catch {
      // Keep best-effort raw candidates when normalization is not possible.
    }

    return Array.from(candidates);
  }

  private async findVerifiedContactBindingConflict(
    tenantId: string,
    input: {
      email?: string | null;
      phoneCandidates?: string[];
      currentDriverId?: string;
      currentGuarantorDriverId?: string;
      currentPersonId?: string | null;
    },
  ): Promise<VerifiedContactBindingConflict | null> {
    const normalizedEmail = input.email?.trim() ? input.email.trim().toLowerCase() : null;
    const phoneCandidates = (input.phoneCandidates ?? []).filter(Boolean);

    if (normalizedEmail) {
      const [driverConflict, guarantorConflict] = await Promise.all([
        this.prisma.driver.findFirst({
          where: {
            tenantId,
            email: normalizedEmail,
            identityStatus: 'verified',
            archivedAt: null,
            ...(input.currentDriverId ? { id: { not: input.currentDriverId } } : {}),
          },
          select: { personId: true },
        }),
        this.prisma.driverGuarantor.findFirst({
          where: {
            tenantId,
            email: normalizedEmail,
            status: 'verified',
            disconnectedAt: null,
            ...(input.currentGuarantorDriverId
              ? { driverId: { not: input.currentGuarantorDriverId } }
              : {}),
          },
          select: { personId: true },
        }),
      ]);

      if (driverConflict && driverConflict.personId !== input.currentPersonId) {
        return { entityType: 'driver', contactType: 'email', personId: driverConflict.personId };
      }
      if (guarantorConflict && guarantorConflict.personId !== input.currentPersonId) {
        return {
          entityType: 'guarantor',
          contactType: 'email',
          personId: guarantorConflict.personId,
        };
      }
    }

    if (phoneCandidates.length > 0) {
      const [driverConflict, guarantorConflict] = await Promise.all([
        this.prisma.driver.findFirst({
          where: {
            tenantId,
            phone: { in: phoneCandidates },
            identityStatus: 'verified',
            archivedAt: null,
            ...(input.currentDriverId ? { id: { not: input.currentDriverId } } : {}),
          },
          select: { personId: true },
        }),
        this.prisma.driverGuarantor.findFirst({
          where: {
            tenantId,
            phone: { in: phoneCandidates },
            status: 'verified',
            disconnectedAt: null,
            ...(input.currentGuarantorDriverId
              ? { driverId: { not: input.currentGuarantorDriverId } }
              : {}),
          },
          select: { personId: true },
        }),
      ]);

      if (driverConflict && driverConflict.personId !== input.currentPersonId) {
        return { entityType: 'driver', contactType: 'phone', personId: driverConflict.personId };
      }
      if (guarantorConflict && guarantorConflict.personId !== input.currentPersonId) {
        return {
          entityType: 'guarantor',
          contactType: 'phone',
          personId: guarantorConflict.personId,
        };
      }
    }

    return null;
  }

  private async assertVerifiedIdentityContactAvailable(
    tenantId: string,
    input: {
      email?: string | null;
      phone?: string | null;
      phoneCountryCode?: string | null;
      currentDriverId?: string;
      currentGuarantorDriverId?: string;
      currentPersonId?: string | null;
    },
  ): Promise<void> {
    const conflict = await this.findVerifiedContactBindingConflict(tenantId, {
      ...(input.email ? { email: input.email } : {}),
      ...(input.phone
        ? { phoneCandidates: this.buildPhoneContactCandidates(input.phone, input.phoneCountryCode) }
        : {}),
      ...(input.currentDriverId ? { currentDriverId: input.currentDriverId } : {}),
      ...(input.currentGuarantorDriverId
        ? { currentGuarantorDriverId: input.currentGuarantorDriverId }
        : {}),
      ...(input.currentPersonId ? { currentPersonId: input.currentPersonId } : {}),
    });

    if (!conflict) {
      return;
    }

    if (conflict.contactType === 'email') {
      throw new ConflictException(
        'This email address is already bound to another verified NIN-backed identity in this organisation. Use a different email address.',
      );
    }

    throw new ConflictException(
      'This phone number is already bound to another verified NIN-backed identity in this organisation. Use a different phone number.',
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

  private buildVerificationComponentSummaries(
    driver: {
      identityStatus: string;
      guarantorStatus?: string | null;
      guarantorPersonId?: string | null;
      hasApprovedLicence: boolean;
      driverLicenceVerification?: DriverDocumentSummary['driverLicenceVerification'];
    },
    tier: VerificationTier,
  ): VerificationComponentSummary[] {
    const tierDescriptor = getVerificationTierDescriptor(tier);
    const requiresGuarantor = tierDescriptor.components.includes('guarantor');
    const requiresDriversLicense = tierDescriptor.components.includes('drivers_license');
    const guarantorCompleted =
      Boolean(driver.guarantorStatus) &&
      driver.guarantorStatus !== 'disconnected' &&
      Boolean(driver.guarantorPersonId);
    const licence = driver.driverLicenceVerification ?? null;
    const licenceCompleted =
      driver.hasApprovedLicence &&
      licence?.status === 'verified' &&
      licence.validity !== 'invalid' &&
      !licence.isExpired &&
      licence.linkageStatus !== 'mismatch';

    return [
      {
        key: 'identity',
        label: 'Identity verification',
        required: true,
        status: driver.identityStatus === 'verified' ? 'completed' : 'pending',
        message:
          driver.identityStatus === 'verified'
            ? 'Identity verified successfully.'
            : 'Identity verification is required for this level.',
      },
      {
        key: 'guarantor',
        label: 'Guarantor verification',
        required: requiresGuarantor,
        status: requiresGuarantor
          ? guarantorCompleted
            ? 'completed'
            : 'pending'
          : 'not_required',
        message: requiresGuarantor
          ? guarantorCompleted
            ? 'Guarantor verification completed.'
            : 'A verified guarantor is required for this level.'
          : `Guarantor not required under ${tierDescriptor.label}.`,
      },
      {
        key: 'drivers_license',
        label: "Driver's licence verification",
        required: requiresDriversLicense,
        status: requiresDriversLicense
          ? licenceCompleted
            ? 'completed'
            : 'pending'
          : 'not_required',
        message: requiresDriversLicense
          ? licenceCompleted
            ? "Driver's licence verified successfully."
            : "A verified driver's licence is required for this level."
          : `Driver's licence not required under ${tierDescriptor.label}.`,
      },
    ];
  }

  private computeReadiness(
    driver: {
      status: string;
      identityStatus: string;
      guarantorStatus?: string | null;
      guarantorPersonId?: string | null;
      hasApprovedLicence: boolean;
      driverLicenceVerification?: DriverDocumentSummary['driverLicenceVerification'];
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
      guarantorBlocking?: boolean;
      requireGuarantorVerification?: boolean;
      allowAdminAssignmentOverride: boolean;
    },
  ): DriverReadinessSummary {
    const verificationTier = resolveVerificationTier(settings);
    const verificationTierDescriptor = getVerificationTierDescriptor(verificationTier);
    const verificationComponents = this.buildVerificationComponentSummaries(
      driver,
      verificationTier,
    );
    const requiresGuarantor = verificationTierDescriptor.components.includes('guarantor');
    const requiresDriversLicense =
      verificationTierDescriptor.components.includes('drivers_license');
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
    const localRiskFlags: string[] = [];

    if (driver.identityStatus !== 'verified') {
      activationReasons.push('Identity verification must be completed.');
    }

    const guarantorMissing =
      !driver.guarantorStatus || driver.guarantorStatus === 'disconnected' || !driver.guarantorPersonId;
    if (requiresGuarantor && guarantorMissing) {
      activationReasons.push('A verified guarantor is required.');
    } else if (!requiresGuarantor && guarantorMissing) {
      localRiskFlags.push('missing_optional_guarantor');
    }

    const driverLicenceRequired = requiresDriversLicense;
    const approvedDocumentTypes = new Set(driver.approvedDocumentTypes ?? []);
    const latestLicenceVerification = driver.driverLicenceVerification ?? null;

    if (driverLicenceRequired && !driver.hasApprovedLicence) {
      if (!latestLicenceVerification) {
        activationReasons.push("A verified driver's licence is required.");
      }
    }

    // Drivers-licence is handled by the dedicated block above; exclude it here to avoid
    // duplicate activation reasons that inflate the reason count and push readiness to not_ready.
    const missingRequiredDocuments = settings.requiredDriverDocumentSlugs.filter((slug) => {
      if (slug === DRIVER_LICENCE_DOCUMENT_TYPE) {
        return false;
      }
      return !approvedDocumentTypes.has(slug);
    });

    if (driverLicenceRequired) {
      if (
        latestLicenceVerification?.isExpired ||
        latestLicenceVerification?.validity === 'invalid'
      ) {
        activationReasons.push(
          "Driver's licence is expired or invalid. Renew and reverify it before activation.",
        );
      } else if (latestLicenceVerification?.linkageStatus === 'mismatch') {
        activationReasons.push(
          "Driver's licence could not be linked to the driver's verified identity.",
        );
      } else if (latestLicenceVerification?.status === 'provider_unavailable') {
        activationReasons.push("Driver's licence verification needs to be retried.");
      } else if (latestLicenceVerification?.status === 'failed') {
        activationReasons.push("Driver's licence verification failed.");
      } else if (latestLicenceVerification && latestLicenceVerification.status !== 'verified') {
        activationReasons.push("Driver's licence verification is still pending.");
      }
    } else if (
      !driverLicenceRequired &&
      !latestLicenceVerification
    ) {
      localRiskFlags.push('missing_optional_driver_licence');
    } else if (
      latestLicenceVerification?.isExpired ||
      latestLicenceVerification?.validity === 'invalid'
    ) {
      localRiskFlags.push('expired_driver_licence');
    }

    if (latestLicenceVerification?.expiresSoon && !latestLicenceVerification.isExpired) {
      localRiskFlags.push('driver_licence_expiring_soon');
    }

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
        verificationTier,
        verificationTierLabel: verificationTierDescriptor.label,
        verificationTierDescription: verificationTierDescriptor.description,
        verificationComponents,
        authenticationAccess,
        authenticationAccessReasons,
        activationReadiness,
        activationReadinessReasons: activationReasons,
        assignmentReadiness: 'ready',
        assignmentReadinessReasons: ['Admin has approved this driver for assignment.'],
        remittanceReadiness,
        remittanceReadinessReasons,
        ...(localRiskFlags.length > 0 ? { localRiskFlags } : {}),
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
        verificationTier,
        verificationTierLabel: verificationTierDescriptor.label,
        verificationTierDescription: verificationTierDescriptor.description,
        verificationComponents,
        authenticationAccess,
        authenticationAccessReasons,
        activationReadiness,
        activationReadinessReasons: activationReasons,
        assignmentReadiness,
        assignmentReadinessReasons: blockedAssignmentReasons,
        remittanceReadiness,
        remittanceReadinessReasons,
        ...(localRiskFlags.length > 0 ? { localRiskFlags } : {}),
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
      verificationTier,
      verificationTierLabel: verificationTierDescriptor.label,
      verificationTierDescription: verificationTierDescriptor.description,
      verificationComponents,
      authenticationAccess,
      authenticationAccessReasons,
      activationReadiness,
      activationReadinessReasons: activationReasons,
      assignmentReadiness,
      assignmentReadinessReasons: assignmentReasons,
      remittanceReadiness,
      remittanceReadinessReasons,
      ...(localRiskFlags.length > 0 ? { localRiskFlags } : {}),
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
      ((await this.driverGuarantors.findMany({
        where: {
          tenantId,
          driverId: { in: drivers.map((driver) => driver.id) },
        },
      })) as DriverGuarantorRecord[] | null) ?? [];

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
        driverLicenceVerification: null,
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

    const latestDriverLicenceVerificationByDriverId = new Map<
      string,
      DriverDocumentVerificationRecord
    >();
    for (const verification of zeroTrustVerifications) {
      const summary = summaries.get(verification.driverId);
      if (!summary) continue;
      const normalizedDocumentType = this.normalizeStoredDocumentType(verification.documentType);

      if (verification.status === 'verified') {
        if (!summary.approvedDocumentTypes.includes(normalizedDocumentType)) {
          summary.approvedDocumentTypes.push(normalizedDocumentType);
        }
        if (
          normalizedDocumentType === DRIVER_LICENCE_DOCUMENT_TYPE &&
          !summary.hasApprovedLicence
        ) {
          summary.hasApprovedLicence = true;
        }
      } else if (
        verification.status === 'pending' ||
        verification.status === 'provider_unavailable'
      ) {
        summary.pendingDocumentCount += 1;
      } else if (verification.status === 'failed') {
        summary.rejectedDocumentCount += 1;
      }

      if (normalizedDocumentType === DRIVER_LICENCE_DOCUMENT_TYPE) {
        const latest = latestDriverLicenceVerificationByDriverId.get(verification.driverId);
        if (!latest || latest.createdAt < verification.createdAt) {
          latestDriverLicenceVerificationByDriverId.set(verification.driverId, verification);
        }
      }
    }

    for (const [driverId, latestVerification] of latestDriverLicenceVerificationByDriverId) {
      const summary = summaries.get(driverId);
      if (!summary) continue;
      summary.driverLicenceVerification =
        this.buildDriverLicenceVerificationSummary(latestVerification) ?? null;
    }

    return drivers.map((driver) => ({
      ...driver,
      ...(summaries.get(driver.id) ?? {
        hasApprovedLicence: false,
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
        approvedDocumentTypes: [],
        driverLicenceVerification: null,
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
      const readiness = this.computeReadiness(
        driver,
        this.getEffectiveDriverOperationsSettings(settings.operations, driver),
      );
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

  private async listLinkedUserIdsForDriver(
    tenantId: string,
    driverId: string,
  ): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        driverId,
        isActive: true,
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    return users.map((user) => user.id);
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

  /**
   * Admin-triggered retry for a driver whose identity verification is pending
   * because all providers were unavailable at submission time.
   * Re-uses the identifiers stored in the attempt metadata — no re-entry required.
   */
  async adminRetryIdentityVerification(
    tenantId: string,
    driverId: string,
  ): Promise<{ queued: boolean; reason?: string }> {
    const driver = await this.findOne(tenantId, driverId);

    if (driver.identityStatus !== 'pending_verification') {
      return {
        queued: false,
        reason: `driver identity status is '${driver.identityStatus}', not 'pending_verification'`,
      };
    }

    const latestAttempt = await this.getLatestVerificationAttempt(tenantId, 'driver', driverId);
    if (!latestAttempt) {
      return { queued: false, reason: 'no verification attempt found' };
    }

    const meta = latestAttempt.metadata as Record<string, unknown> | null;
    if (meta?.pendingReason !== 'provider_unavailable') {
      return {
        queued: false,
        reason: 'latest attempt is not in a provider_unavailable pending state',
      };
    }

    const retryData = meta.retryData as {
      identifiers: Array<{ type: string; value: string; countryCode?: string }>;
      selfieImageUrl: string | null;
      countryCode: string | null;
    } | null;

    if (!retryData?.identifiers?.length) {
      return { queued: false, reason: 'no retry data available on attempt' };
    }

    this.logger.log(
      JSON.stringify({
        event: 'admin_verification_retry_queued',
        tenantId,
        driverId,
        attemptId: latestAttempt.id,
      }),
    );

    // Run the retry in the background — admin gets an immediate response.
    void this.executeProviderRetry(tenantId, driverId, latestAttempt, retryData).catch((err) => {
      this.logger.warn(
        JSON.stringify({
          event: 'admin_verification_retry_failed',
          tenantId,
          driverId,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    });

    return { queued: true };
  }

  /**
   * Background-safe retry: calls the intelligence service with stored identifiers.
   * Used by both admin-triggered retries and the scheduled retry job.
   */
  async executeProviderRetry(
    tenantId: string,
    driverId: string,
    attempt: VerificationAttemptRecord,
    retryData: {
      identifiers: Array<{ type: string; value: string; countryCode?: string }>;
      selfieImageUrl: string | null;
      countryCode: string | null;
    },
  ): Promise<void> {
    const driver = await this.findOne(tenantId, driverId);

    // Clear the pending metadata before retrying to prevent duplicate retries.
    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE "verification_attempts"
      SET "metadata" = "metadata" - 'pendingReason' - 'retryData', "updatedAt" = NOW()
      WHERE "id" = ${attempt.id}
    `);

    try {
      const resolvedCountry = retryData.countryCode ?? driver.nationality;
      const result = await this.resolveIdentity(tenantId, driverId, {
        ...(resolvedCountry ? { countryCode: resolvedCountry } : {}),
        identifiers: retryData.identifiers,
        subjectConsent: true,
      });

      const retryAttemptStatus = this.determineVerificationAttemptStatus(result);
      const isStillProviderPending =
        retryAttemptStatus === 'in_progress' &&
        !result.isVerifiedMatch &&
        !result.providerLookupStatus &&
        result.decision !== 'review_required';

      await this.updateVerificationAttempt(attempt.id, {
        status: retryAttemptStatus,
        providerCallCountIncrement: 1,
        billableStageReached: true,
        providerCostIncurred: true,
        completedAt:
          retryAttemptStatus === 'success' || retryAttemptStatus === 'failed' ? new Date() : null,
        failureReason:
          retryAttemptStatus === 'failed'
            ? (result.providerLookupStatus ?? result.providerVerificationStatus ?? result.decision)
            : null,
      });

      if (isStillProviderPending) {
        // Re-stamp pending metadata so future retries can still pick it up.
        const retryMeta = JSON.stringify({
          pendingReason: 'provider_unavailable',
          pendingAt: new Date().toISOString(),
          retryData,
        });
        await this.prisma.$executeRaw(Prisma.sql`
          UPDATE "verification_attempts"
          SET "metadata" = ${retryMeta}::jsonb, "updatedAt" = NOW()
          WHERE "id" = ${attempt.id}
        `);
      }

      this.logger.log(
        JSON.stringify({
          event: 'provider_retry_completed',
          tenantId,
          driverId,
          attemptId: attempt.id,
          retryAttemptStatus,
          isStillProviderPending,
          isVerifiedMatch: result.isVerifiedMatch ?? false,
        }),
      );
    } catch (error) {
      // On retry error, restore pending metadata so the next retry window picks it up.
      const retryMeta = JSON.stringify({
        pendingReason: 'provider_unavailable',
        pendingAt: new Date().toISOString(),
        retryData,
      });
      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE "verification_attempts"
        SET "metadata" = ${retryMeta}::jsonb, "updatedAt" = NOW()
        WHERE "id" = ${attempt.id}
      `);

      this.logger.warn(
        JSON.stringify({
          event: 'provider_retry_error',
          tenantId,
          driverId,
          attemptId: attempt.id,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }

  /**
   * Find all drivers with pending_verification identity status where the latest attempt
   * has pendingReason='provider_unavailable' and is less than 24 hours old.
   * Used by the background retry scheduler.
   */
  async findDriversPendingProviderRetry(): Promise<
    Array<{ tenantId: string; driverId: string; attempt: VerificationAttemptRecord }>
  > {
    const cutoffMs = 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - cutoffMs);
    const rows = await this.prisma.$queryRaw<
      Array<{ tenantId: string; subjectId: string; id: string }>
    >(Prisma.sql`
      SELECT DISTINCT ON (va."tenantId", va."subjectId")
        va."tenantId",
        va."subjectId",
        va."id"
      FROM "verification_attempts" va
      WHERE va."subjectType" = 'driver'
        AND va."status" = 'in_progress'
        AND va."metadata" ->> 'pendingReason' = 'provider_unavailable'
        AND va."updatedAt" >= ${cutoffDate}
      ORDER BY va."tenantId", va."subjectId", va."updatedAt" DESC
    `);

    const results: Array<{
      tenantId: string;
      driverId: string;
      attempt: VerificationAttemptRecord;
    }> = [];
    for (const row of rows) {
      const attempt = await this.getLatestVerificationAttempt(
        row.tenantId,
        'driver',
        row.subjectId,
      );
      if (attempt?.status === 'in_progress') {
        const meta = attempt.metadata as Record<string, unknown> | null;
        if (meta?.pendingReason === 'provider_unavailable') {
          results.push({ tenantId: row.tenantId, driverId: row.subjectId, attempt });
        }
      }
    }
    return results;
  }
}
