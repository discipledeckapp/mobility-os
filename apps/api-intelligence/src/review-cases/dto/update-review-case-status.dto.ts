import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const REVIEWABLE_STATUSES = ['in_review', 'escalated'] as const;

export class UpdateReviewCaseStatusDto {
  @ApiProperty({ enum: REVIEWABLE_STATUSES })
  @IsIn(REVIEWABLE_STATUSES)
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
