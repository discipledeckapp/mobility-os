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

export class DriverEnrollmentIdentifierDto {
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

export class DriverEnrollmentBiometricDto {
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

export class DriverLivenessCheckDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  confidenceScore?: number;
}

export class ResolveDriverIdentityDto {
  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  countryCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  livenessPassed?: boolean;

  @ApiPropertyOptional({ type: DriverEnrollmentIdentifierDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DriverEnrollmentIdentifierDto)
  identifiers?: DriverEnrollmentIdentifierDto[];

  @ApiPropertyOptional({ type: DriverEnrollmentBiometricDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DriverEnrollmentBiometricDto)
  biometric?: DriverEnrollmentBiometricDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  subjectConsent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selfieImageBase64?: string;

  @ApiPropertyOptional({ type: DriverLivenessCheckDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DriverLivenessCheckDto)
  livenessCheck?: DriverLivenessCheckDto;
}
