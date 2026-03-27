import { BiometricModality, IdentifierType } from '@mobility-os/intelligence-domain';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const IDENTIFIER_TYPES = Object.values(IdentifierType);
const BIOMETRIC_MODALITIES = Object.values(BiometricModality);

export class EnrollmentIdentifierDto {
  @ApiProperty({ enum: IDENTIFIER_TYPES })
  @IsIn(IDENTIFIER_TYPES)
  type!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class EnrollmentBiometricDto {
  @ApiProperty({ enum: BIOMETRIC_MODALITIES })
  @IsIn(BIOMETRIC_MODALITIES)
  modality!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  embeddingBase64!: string;

  @ApiProperty({ minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  qualityScore!: number;
}

export class IdentityValidationDataDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'ISO-8601 date string' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;
}

export class ProviderVerificationContextDto {
  @ApiPropertyOptional({
    description: 'Explicit subject consent flag required by external identity providers',
  })
  @IsOptional()
  @IsBoolean()
  subjectConsent?: boolean;

  @ApiPropertyOptional({ type: IdentityValidationDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => IdentityValidationDataDto)
  validationData?: IdentityValidationDataDto;

  @ApiPropertyOptional({
    description: 'Base64-encoded selfie image for provider facial matching',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  selfieImageBase64?: string;

  @ApiPropertyOptional({
    description: 'Stored object URL for the captured live-selfie image',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  selfieImageUrl?: string;

  @ApiPropertyOptional({
    description:
      'Provider-produced liveness evidence, such as a Rekognition session id or vendor-scored outcome',
    type: Object,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  livenessCheck?: {
    provider?: string;
    sessionId?: string;
    passed?: boolean;
    confidenceScore?: number;
  };
}

export class PersonAssociationContextDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  localEntityType!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  localEntityId!: string;

  @ApiProperty({ enum: ['driver', 'guarantor', 'owner', 'admin'] })
  @IsIn(['driver', 'guarantor', 'owner', 'admin'])
  roleType!: 'driver' | 'guarantor' | 'owner' | 'admin';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessEntityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operatingUnitId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fleetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;
}

export class ResolveEnrollmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  countryCode?: string;

  @ApiPropertyOptional({
    description:
      "Operational role of the subject being enrolled: 'driver' | 'guarantor'. " +
      "Defaults to 'driver'. Used to record role-aware tenant presence and detect " +
      'cross-role conflicts (same person enrolled as both roles at the same tenant).',
    enum: ['driver', 'guarantor'],
  })
  @IsOptional()
  @IsIn(['driver', 'guarantor'])
  roleType?: 'driver' | 'guarantor';

  @ApiPropertyOptional({
    description: 'Whether the required liveness check already passed for this enrollment',
  })
  @IsOptional()
  livenessPassed?: boolean;

  @ApiPropertyOptional({ type: EnrollmentIdentifierDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EnrollmentIdentifierDto)
  identifiers?: EnrollmentIdentifierDto[];

  @ApiPropertyOptional({ type: EnrollmentBiometricDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnrollmentBiometricDto)
  biometric?: EnrollmentBiometricDto;

  @ApiPropertyOptional({ type: ProviderVerificationContextDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProviderVerificationContextDto)
  providerVerification?: ProviderVerificationContextDto;

  @ApiPropertyOptional({ type: PersonAssociationContextDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PersonAssociationContextDto)
  association?: PersonAssociationContextDto;
}
