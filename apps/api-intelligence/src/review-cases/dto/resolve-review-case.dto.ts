import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const RESOLUTIONS = ['merge', 'separate', 'fraud_confirmed', 'dismissed'] as const;

export class ResolveReviewCaseDto {
  @ApiProperty({ enum: RESOLUTIONS })
  @IsIn(RESOLUTIONS)
  resolution!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
