import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// personId is intentionally excluded from this DTO.
// The cross-schema intel_persons reference must never be surfaced to tenant
// API callers — intelligence results are returned via IntelligenceQueryResult
// through a dedicated intelligence endpoint.

export class DriverResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  fleetId!: string;

  @ApiProperty()
  businessEntityId!: string;

  @ApiProperty()
  operatingUnitId!: string;

  @ApiProperty({ description: 'DriverStatus: active | inactive | suspended | terminated' })
  status!: string;

  @ApiPropertyOptional()
  firstName?: string | null;

  @ApiPropertyOptional()
  lastName?: string | null;

  @ApiPropertyOptional({ description: 'E.164 format' })
  phone?: string | null;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional({
    description: 'Display name of the tenant or branded organisation running this onboarding flow.',
  })
  organisationName?: string | null;

  @ApiPropertyOptional({
    description:
      'Proxied URL to the driver portrait image, populated when a portrait has been captured.',
  })
  photoUrl?: string | null;

  @ApiPropertyOptional({ description: 'Stored object URL for the captured live-selfie image.' })
  selfieImageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Stored object URL for the provider or government-record identity image.',
  })
  providerImageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Stored object URL for the provider-returned signature image, when available.',
  })
  identitySignatureImageUrl?: string | null;

  @ApiPropertyOptional({
    description:
      'Result of the automatic self-service invitation attempt when the driver record was created.',
  })
  selfServiceInviteStatus?: 'sent' | 'skipped' | 'failed' | null;

  @ApiPropertyOptional({
    description: 'Additional operator-safe context for the self-service invitation outcome.',
  })
  selfServiceInviteReason?: string | null;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
    description: 'Structured provider-returned identity fields persisted for operator review.',
  })
  identityProfile?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
    description:
      'Driver-supplied contact and operational fields captured after identity verification.',
  })
  operationalProfile?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
    description: 'Normalized verification metadata such as validity, match score, and risk score.',
  })
  identityVerificationMetadata?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
    description: 'Sanitized provider audit payload retained for operational troubleshooting.',
  })
  identityProviderRawData?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
    description:
      "Latest driver's licence verification summary, when zero-trust licence verification has been attempted.",
  })
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

  @ApiPropertyOptional({ description: 'ISO 8601 date (YYYY-MM-DD)' })
  dateOfBirth?: string | null;

  @ApiPropertyOptional()
  gender?: string | null;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2' })
  nationality?: string | null;

  @ApiProperty({
    description:
      'True when identity resolution has linked the driver to a canonical person record.',
  })
  hasResolvedIdentity!: boolean;

  @ApiProperty({
    description:
      'Operator-facing identity workflow state: unverified | pending_verification | verified | review_needed | failed',
  })
  identityStatus!: string;

  @ApiPropertyOptional()
  identityReviewCaseId?: string | null;

  @ApiPropertyOptional()
  identityReviewStatus?: string | null;

  @ApiPropertyOptional()
  identityLastDecision?: string | null;

  @ApiPropertyOptional()
  identityVerificationConfidence?: number | null;

  @ApiPropertyOptional()
  identityLastVerifiedAt?: Date | null;

  @ApiPropertyOptional()
  identityLivenessPassed?: boolean | null;

  @ApiPropertyOptional()
  identityLivenessProvider?: string | null;

  @ApiPropertyOptional()
  identityLivenessConfidence?: number | null;

  @ApiPropertyOptional()
  identityLivenessReason?: string | null;

  @ApiPropertyOptional()
  verificationProvider?: string | null;

  @ApiPropertyOptional()
  verificationStatus?: string | null;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2' })
  verificationCountryCode?: string | null;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  globalRiskScore?: number | null;

  @ApiPropertyOptional({
    description:
      'Risk band from the intelligence plane (low | medium | high | critical). Only present when the driver has a resolved identity.',
  })
  riskBand?: string | null;

  @ApiPropertyOptional({
    description:
      'True when the canonical person record is on the watchlist. Only present when the driver has a resolved identity.',
  })
  isWatchlisted?: boolean | null;

  @ApiPropertyOptional({
    description:
      'True when the linked canonical person has an unresolved duplicate-identity conflict.',
  })
  duplicateIdentityFlag?: boolean | null;

  @ApiPropertyOptional({
    description:
      'True when the linked canonical identity indicates tenant records require reverification.',
  })
  reverificationRequired?: boolean | null;

  @ApiPropertyOptional()
  reverificationReason?: string | null;

  @ApiProperty()
  hasGuarantor!: boolean;

  @ApiPropertyOptional()
  guarantorStatus?: string | null;

  @ApiPropertyOptional()
  guarantorDisconnectedAt?: Date | null;

  @ApiPropertyOptional({
    description:
      'Canonical person ID of the linked guarantor, once identity resolution is complete.',
  })
  guarantorPersonId?: string | null;

  @ApiPropertyOptional({
    description:
      "Risk band of the guarantor's canonical person record (low | medium | high | critical).",
  })
  guarantorRiskBand?: string | null;

  @ApiPropertyOptional({
    description: "True when the guarantor's canonical person is on the watchlist.",
  })
  guarantorIsWatchlisted?: boolean | null;

  @ApiPropertyOptional()
  guarantorReverificationRequired?: boolean | null;

  @ApiPropertyOptional()
  guarantorReverificationReason?: string | null;

  @ApiPropertyOptional({
    description:
      'True when the guarantor resolves to a person who is also registered as a driver — cross-role conflict.',
  })
  guarantorIsAlsoDriver?: boolean;

  @ApiProperty()
  hasApprovedLicence!: boolean;

  @ApiProperty()
  hasMobileAccess!: boolean;

  @ApiPropertyOptional({
    description: 'Operator-facing mobile access status: linked | inactive | revoked | missing',
  })
  mobileAccessStatus?: string | null;

  @ApiPropertyOptional({ type: [String] })
  enabledDriverIdentifierTypes?: string[];

  @ApiPropertyOptional({ type: [String] })
  requiredDriverIdentifierTypes?: string[];

  @ApiPropertyOptional({ type: [String] })
  requiredDriverDocumentSlugs?: string[];

  @ApiPropertyOptional()
  driverPaysKyc?: boolean;

  @ApiPropertyOptional()
  verificationTier?: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION';

  @ApiPropertyOptional()
  verificationTierLabel?: string;

  @ApiPropertyOptional()
  verificationTierDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  verificationTierComponents?: Array<'identity' | 'guarantor' | 'drivers_license'>;

  @ApiPropertyOptional({
    type: [Object],
    description: 'Tier-aware verification component requirements and completion state.',
  })
  verificationComponents?: Array<{
    key: 'identity' | 'guarantor' | 'drivers_license';
    label: string;
    required: boolean;
    status: 'completed' | 'pending' | 'not_required';
    message: string;
  }>;

  @ApiPropertyOptional()
  kycPaymentVerified?: boolean;

  @ApiPropertyOptional()
  verificationPaymentState?: 'not_required' | 'required' | 'pending' | 'paid' | 'reconciled';

  @ApiPropertyOptional()
  verificationEntitlementState?:
    | 'none'
    | 'paid'
    | 'reserved'
    | 'consumed'
    | 'expired'
    | 'refunded'
    | 'cancelled';

  @ApiPropertyOptional()
  verificationState?: 'not_started' | 'in_progress' | 'provider_called' | 'success' | 'failed';

  @ApiPropertyOptional()
  verificationEntitlementCode?: string | null;

  @ApiPropertyOptional()
  verificationPaymentReference?: string | null;

  @ApiPropertyOptional()
  verificationConsumedAt?: string | null;

  @ApiPropertyOptional()
  verificationAttemptCount?: number;

  @ApiPropertyOptional()
  verificationBlockedReason?: string | null;

  @ApiPropertyOptional()
  verificationPayer?: 'driver' | 'organisation';

  @ApiPropertyOptional()
  verificationAmountMinorUnits?: number;

  @ApiPropertyOptional()
  verificationCurrency?: string | null;

  @ApiPropertyOptional()
  verificationWalletBalanceMinorUnits?: number;

  @ApiPropertyOptional()
  verificationAvailableSpendMinorUnits?: number;

  @ApiPropertyOptional()
  verificationCreditLimitMinorUnits?: number;

  @ApiPropertyOptional()
  verificationCreditUsedMinorUnits?: number;

  @ApiPropertyOptional()
  verificationStarterCreditActive?: boolean;

  @ApiPropertyOptional()
  verificationCardCreditActive?: boolean;

  @ApiPropertyOptional({
    type: Object,
    description: 'Masked active card details used for organisation verification credit.',
  })
  verificationSavedCard?: {
    provider: string;
    last4: string;
    brand: string;
    status: string;
    active: boolean;
    createdAt: string;
    initialReference?: string | null;
  } | null;

  @ApiPropertyOptional()
  verificationPaymentStatus?:
    | 'not_required'
    | 'ready'
    | 'driver_payment_required'
    | 'wallet_missing'
    | 'insufficient_balance';

  @ApiPropertyOptional()
  verificationPaymentMessage?: string | null;

  @ApiPropertyOptional({ type: [String] })
  localRiskFlags?: string[];

  @ApiPropertyOptional({
    description: 'Full Trust-only canonical identity and graph signals for operator review.',
    type: Object,
  })
  canonicalInsights?: {
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
  } | null;

  @ApiProperty()
  pendingDocumentCount!: number;

  @ApiProperty()
  rejectedDocumentCount!: number;

  @ApiProperty()
  expiredDocumentCount!: number;

  @ApiProperty({
    description:
      'Aggregated onboarding readiness for activation: ready | partially_ready | not_ready',
  })
  activationReadiness!: string;

  @ApiProperty({ type: [String] })
  activationReadinessReasons!: string[];

  @ApiProperty({
    description:
      'Aggregated operational readiness for assignment handling: ready | partially_ready | not_ready',
  })
  assignmentReadiness!: string;

  @ApiProperty({ type: [String] })
  assignmentReadinessReasons!: string[];

  @ApiProperty({
    description:
      'Aggregated access readiness for driver/mobile authentication surfaces: ready | not_ready',
  })
  authenticationAccess!: string;

  @ApiProperty({ type: [String] })
  authenticationAccessReasons!: string[];

  @ApiProperty({
    description:
      'Aggregated operational readiness for remittance actions: ready | partially_ready | not_ready',
  })
  remittanceReadiness!: string;

  @ApiProperty({ type: [String] })
  remittanceReadinessReasons!: string[];

  @ApiPropertyOptional({
    description: 'Current policy/enforcement posture: clear | flagged | restricted.',
  })
  enforcementStatus?: string;

  @ApiPropertyOptional({
    type: [Object],
    description: 'Active policy actions and the reasons operators and drivers should see.',
  })
  enforcementActions?: Array<{
    id: string;
    actionType: string;
    reason: string;
    status: string;
    triggeredAt: Date;
    policyRuleId?: string | null;
  }>;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({
    description:
      'True when this driver record exceeds the subscription tier cap. The driver exists but is inaccessible until the plan is upgraded.',
  })
  locked!: boolean;

  @ApiProperty({
    description:
      'When true, an admin has manually approved this driver for assignment even if standard readiness checks are incomplete. Blocked by active fraud flags or when the org disables allowAdminAssignmentOverride.',
  })
  adminAssignmentOverride!: boolean;
}
