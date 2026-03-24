import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class UpdateAssignmentRemittancePlanDto {
  @ApiPropertyOptional({
    description: 'Expected remittance amount per collection cycle in minor currency units.',
    example: 250000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  remittanceAmountMinorUnits?: number;

  @ApiPropertyOptional({
    description: 'Collection frequency for the assignment remittance plan.',
    example: 'weekly',
  })
  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly'])
  remittanceFrequency?: string;

  @ApiPropertyOptional({
    description: 'ISO 4217 currency code.',
    example: 'NGN',
  })
  @IsOptional()
  @IsString()
  remittanceCurrency?: string;

  @ApiPropertyOptional({
    description: 'First scheduled remittance date (YYYY-MM-DD).',
    example: '2026-03-24',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'remittanceStartDate must be YYYY-MM-DD' })
  remittanceStartDate?: string;

  @ApiPropertyOptional({
    description: 'For weekly schedules only: Monday = 1 ... Sunday = 7.',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  remittanceCollectionDay?: number;
}
