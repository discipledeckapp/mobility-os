import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsIn, IsOptional, IsString } from 'class-validator';

const DRIVER_DOCUMENT_REVIEW_STATUSES = ['approved', 'rejected'] as const;

export class UpdateDriverDocumentReviewDto {
  @ApiProperty({ enum: DRIVER_DOCUMENT_REVIEW_STATUSES })
  @IsString()
  @IsIn(DRIVER_DOCUMENT_REVIEW_STATUSES)
  status!: (typeof DRIVER_DOCUMENT_REVIEW_STATUSES)[number];

  @ApiPropertyOptional({
    description: 'Required when approving an expiring document such as a driver licence.',
  })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
