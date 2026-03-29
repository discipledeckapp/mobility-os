import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class UpdateAssignmentRemittancePlanDto {
  @ApiPropertyOptional({
    description: 'Canonical financial contract type for this assignment.',
    example: 'regular_hire',
  })
  @IsOptional()
  @IsString()
  @IsIn(['regular_hire', 'hire_purchase'])
  contractType?: string;

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
  @IsIn(['daily', 'weekly', 'monthly'])
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

  @ApiPropertyOptional({
    description: 'Hire purchase principal amount in minor currency units.',
    example: 450000000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  principalAmountMinorUnits?: number;

  @ApiPropertyOptional({
    description: 'Hire purchase total target / total payable amount in minor currency units.',
    example: 520000000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalTargetAmountMinorUnits?: number;

  @ApiPropertyOptional({
    description: 'Upfront deposit amount recognized against the contract in minor currency units.',
    example: 50000000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  depositAmountMinorUnits?: number;

  @ApiPropertyOptional({
    description: 'Number of repayment periods used to generate the expected installment.',
    example: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  contractDurationPeriods?: number;

  @ApiPropertyOptional({
    description: 'Contract end date (YYYY-MM-DD). Used to derive repayment periods when duration is omitted.',
    example: '2026-12-24',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'contractEndDate must be YYYY-MM-DD' })
  contractEndDate?: string;
}
