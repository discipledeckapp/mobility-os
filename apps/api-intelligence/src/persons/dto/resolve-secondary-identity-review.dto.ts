import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

const REVIEW_DECISIONS = ['approved', 'rejected', 'request_reverification'] as const;

export class ResolveSecondaryIdentityReviewDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  personId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reviewCaseId!: string;

  @ApiProperty({ enum: REVIEW_DECISIONS })
  @IsIn(REVIEW_DECISIONS)
  decision!: (typeof REVIEW_DECISIONS)[number];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reviewerId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reviewerRole!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  evidenceSnapshot?: Record<string, unknown>;
}
