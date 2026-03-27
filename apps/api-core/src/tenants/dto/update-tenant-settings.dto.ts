import { DocumentScope, getDocumentTypesByScope } from '@mobility-os/domain-config';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const DRIVER_DOCUMENT_TYPES = getDocumentTypesByScope(DocumentScope.Driver).map(
  (document) => document.slug,
);
const VEHICLE_DOCUMENT_TYPES = getDocumentTypesByScope(DocumentScope.Vehicle).map(
  (document) => document.slug,
);
const DRIVER_IDENTIFIER_TYPES = ['NATIONAL_ID', 'BANK_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'TAX_ID'];

export class UpdateTenantSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  logoUrl?: string;

  @ApiPropertyOptional({ enum: ['en', 'fr'] })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'fr'])
  defaultLanguage?: 'en' | 'fr';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  guarantorMaxActiveDrivers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoSendDriverSelfServiceLinkOnCreate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requireIdentityVerificationForActivation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requireBiometricVerification?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requireGovernmentVerificationLookup?: boolean;

  @ApiPropertyOptional({ type: [String], enum: DRIVER_IDENTIFIER_TYPES })
  @IsOptional()
  @IsArray()
  @IsIn(DRIVER_IDENTIFIER_TYPES, { each: true })
  enabledDriverIdentifierTypes?: string[];

  @ApiPropertyOptional({ type: [String], enum: DRIVER_IDENTIFIER_TYPES })
  @IsOptional()
  @IsArray()
  @IsIn(DRIVER_IDENTIFIER_TYPES, { each: true })
  requiredDriverIdentifierTypes?: string[];

  @ApiPropertyOptional({ type: [String], enum: DRIVER_DOCUMENT_TYPES })
  @IsOptional()
  @IsArray()
  @IsIn(DRIVER_DOCUMENT_TYPES, { each: true })
  requiredDriverDocumentSlugs?: string[];

  @ApiPropertyOptional({ type: [String], enum: VEHICLE_DOCUMENT_TYPES })
  @IsOptional()
  @IsArray()
  @IsIn(VEHICLE_DOCUMENT_TYPES, { each: true })
  requiredVehicleDocumentSlugs?: string[];

  @ApiPropertyOptional({ description: 'When true, drivers are charged for their own KYC check instead of the org wallet.' })
  @IsOptional()
  @IsBoolean()
  driverPaysKyc?: boolean;

  @ApiPropertyOptional({ description: 'When false, guarantors are not required for driver onboarding.' })
  @IsOptional()
  @IsBoolean()
  requireGuarantor?: boolean;

  @ApiPropertyOptional({ description: 'When true, guarantors must also pass identity verification.' })
  @IsOptional()
  @IsBoolean()
  requireGuarantorVerification?: boolean;

  @ApiPropertyOptional({
    description:
      'When true (default), org admins can mark individual drivers as ready for assignment even when standard KYC checks are incomplete. Blocked by active fraud flags regardless of this setting.',
  })
  @IsOptional()
  @IsBoolean()
  allowAdminAssignmentOverride?: boolean;
}
