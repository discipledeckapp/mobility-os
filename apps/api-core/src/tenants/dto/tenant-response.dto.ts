import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code' })
  country!: string;

  @ApiProperty({ description: 'TenantStatus value from tenancy-domain' })
  status!: string;

  @ApiPropertyOptional({ description: 'Arbitrary platform metadata' })
  metadata?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  displayName?: string | null;

  @ApiPropertyOptional()
  logoUrl?: string | null;

  @ApiPropertyOptional()
  defaultLanguage?: 'en' | 'fr';

  @ApiPropertyOptional()
  guarantorMaxActiveDrivers?: number;

  @ApiPropertyOptional()
  autoSendDriverSelfServiceLinkOnCreate?: boolean;

  @ApiPropertyOptional()
  requireIdentityVerificationForActivation?: boolean;

  @ApiPropertyOptional()
  requireBiometricVerification?: boolean;

  @ApiPropertyOptional()
  requireGovernmentVerificationLookup?: boolean;

  @ApiPropertyOptional({ type: [String] })
  enabledDriverIdentifierTypes?: string[];

  @ApiPropertyOptional({ type: [String] })
  requiredDriverIdentifierTypes?: string[];

  @ApiPropertyOptional({ type: [String] })
  customDriverDocumentTypes?: string[];

  @ApiPropertyOptional({ type: [String] })
  requiredDriverDocumentSlugs?: string[];

  @ApiPropertyOptional({ type: [String] })
  requiredVehicleDocumentSlugs?: string[];

  @ApiPropertyOptional()
  driverPaysKyc?: boolean;

  @ApiPropertyOptional()
  verificationTier?: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION';

  @ApiPropertyOptional()
  verificationTierLabel?: string;

  @ApiPropertyOptional()
  verificationTierDescription?: string;

  @ApiPropertyOptional()
  requireGuarantor?: boolean;

  @ApiPropertyOptional()
  guarantorBlocking?: boolean;

  @ApiPropertyOptional()
  requireGuarantorVerification?: boolean;

  @ApiPropertyOptional()
  allowAdminAssignmentOverride?: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
