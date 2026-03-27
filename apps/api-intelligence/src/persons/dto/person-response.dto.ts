import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Full staff-facing view — all fields included.
export class PersonResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  globalPersonCode?: string | null;

  @ApiPropertyOptional()
  fullName?: string | null;

  @ApiPropertyOptional({ description: 'ISO-8601 date string from provider enrichment' })
  dateOfBirth?: string | null;

  @ApiPropertyOptional()
  address?: string | null;

  @ApiPropertyOptional()
  gender?: string | null;

  @ApiPropertyOptional()
  photoUrl?: string | null;

  @ApiPropertyOptional()
  selfieImageUrl?: string | null;

  @ApiPropertyOptional()
  providerImageUrl?: string | null;

  @ApiProperty({ minimum: 0, maximum: 100 })
  globalRiskScore!: number;

  @ApiProperty({ description: 'low | medium | high | critical' })
  riskBand!: string;

  @ApiProperty()
  isWatchlisted!: boolean;

  @ApiProperty()
  hasDuplicateFlag!: boolean;

  @ApiProperty({ description: 'Count of active fraud signals' })
  fraudSignalCount!: number;

  @ApiProperty({ description: 'Confidence of most recent successful verification (0.0–1.0)' })
  verificationConfidence!: number;

  @ApiPropertyOptional()
  verificationStatus?: string | null;

  @ApiPropertyOptional()
  verificationProvider?: string | null;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code of verification context' })
  verificationCountryCode?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PersonAssociationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiPropertyOptional()
  businessEntityId?: string | null;

  @ApiPropertyOptional()
  operatingUnitId?: string | null;

  @ApiPropertyOptional()
  fleetId?: string | null;

  @ApiProperty()
  localEntityType!: string;

  @ApiPropertyOptional()
  localEntityId?: string | null;

  @ApiProperty()
  roleType!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  source!: string;

  @ApiPropertyOptional()
  verifiedAt?: Date | null;

  @ApiProperty()
  reverificationRequired!: boolean;

  @ApiPropertyOptional()
  reverificationReason?: string | null;

  @ApiPropertyOptional({ type: [String] })
  staleFieldKeys?: string[] | null;

  @ApiProperty()
  createdAt!: Date;
}

export class LinkageEventResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty()
  eventType!: string;

  @ApiPropertyOptional()
  confidenceScore?: number | null;

  @ApiProperty()
  actor!: string;

  @ApiPropertyOptional()
  reason?: string | null;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, unknown> | null;

  @ApiProperty()
  occurredAt!: Date;
}

export class IdentityChangeEventResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty()
  eventType!: string;

  @ApiProperty()
  source!: string;

  @ApiPropertyOptional()
  verificationProvider?: string | null;

  @ApiPropertyOptional()
  verificationCountryCode?: string | null;

  @ApiPropertyOptional()
  tenantId?: string | null;

  @ApiPropertyOptional()
  localEntityType?: string | null;

  @ApiPropertyOptional()
  localEntityId?: string | null;

  @ApiProperty({ type: [String] })
  changedFields!: string[];

  @ApiPropertyOptional({ type: Object })
  previousValues?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: Object })
  newValues?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  reason?: string | null;

  @ApiPropertyOptional()
  verifiedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;
}

// Tenant-facing view — only derived signals, never raw cross-tenant data.
// Shape matches IntelligenceQueryResult from @mobility-os/intelligence-domain.
export class IntelligenceQueryResultDto {
  @ApiProperty()
  personId!: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  globalRiskScore!: number;

  @ApiProperty({ description: 'RiskBand: low | medium | high | critical' })
  riskBand!: string;

  @ApiProperty()
  isWatchlisted!: boolean;

  @ApiProperty()
  hasDuplicateIdentityFlag!: boolean;

  @ApiProperty()
  fraudIndicatorCount!: number;

  @ApiProperty({ description: '0.0–1.0' })
  verificationConfidence!: number;

  @ApiPropertyOptional()
  verificationStatus?: string | null;

  @ApiPropertyOptional()
  verificationProvider?: string | null;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code of verification context' })
  verificationCountryCode?: string | null;

  @ApiProperty()
  reverificationRequired!: boolean;

  @ApiPropertyOptional()
  reverificationReason?: string | null;
}

// Tenant-facing role presence summary — aggregate role signals only.
// Never includes tenant IDs, raw records, or cross-tenant operational data.
export class RolePresenceDto {
  @ApiProperty({
    description: 'True when the person has appeared as a driver at any tenant.',
  })
  isDriver!: boolean;

  @ApiProperty({
    description: 'True when the person has appeared as a guarantor at any tenant.',
  })
  isGuarantor!: boolean;

  @ApiProperty({
    description: 'Total number of distinct tenants this person has appeared at.',
  })
  tenantCount!: number;

  @ApiProperty({
    description:
      'True when the person has enrolled at more than one tenant. ' +
      'Cross-tenant details are not returned — only the count.',
  })
  hasMultiTenantPresence!: boolean;

  @ApiProperty({
    description:
      'True when the person holds more than one operational role (driver + guarantor). ' +
      'A cross_role_presence risk signal will have been emitted on their record.',
  })
  hasMultiRolePresence!: boolean;
}

// DTO for updating the watchlist flag on a person.
export class UpdateWatchlistedDto {
  @ApiProperty()
  isWatchlisted!: boolean;

  @ApiPropertyOptional({ description: 'Reason for the change (required when adding to watchlist)' })
  reason?: string;
}
