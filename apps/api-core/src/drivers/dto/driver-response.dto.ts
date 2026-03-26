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

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ description: 'E.164 format' })
  phone!: string;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional({ description: 'ISO 8601 date (YYYY-MM-DD)' })
  dateOfBirth?: string | null;

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
    description: 'Operator-facing mobile access status: linked | inactive | missing',
  })
  mobileAccessStatus?: string | null;

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
