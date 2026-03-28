import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const LINKAGE_DECISIONS = ['auto_pass', 'pending_human_review', 'fail'] as const;

export class RecordSecondaryIdentityEvidenceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  personId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  driverId!: string;

  @ApiProperty({ enum: LINKAGE_DECISIONS })
  @IsIn(LINKAGE_DECISIONS)
  linkageDecision!: (typeof LINKAGE_DECISIONS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerReference?: string;

  @ApiPropertyOptional({ description: 'valid | invalid | unknown' })
  @IsOptional()
  @IsString()
  validity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  demographicMatchScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  biometricMatchScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallLinkageScore?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  linkageReasons?: string[];

  @ApiProperty()
  @IsBoolean()
  manualReviewRequired!: boolean;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  evidence?: Record<string, unknown>;
}
