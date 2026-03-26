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
}
