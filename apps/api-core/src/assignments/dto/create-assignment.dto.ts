import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateAssignmentDto {
  @ApiPropertyOptional({ description: 'Optional fleet context selected by the operator' })
  @IsOptional()
  @IsString()
  fleetId?: string;

  @ApiProperty({ description: 'ID of the Driver to assign' })
  @IsString()
  @IsNotEmpty()
  driverId!: string;

  @ApiProperty({ description: 'ID of the Vehicle to assign' })
  @IsString()
  @IsNotEmpty()
  vehicleId!: string;

  @ApiPropertyOptional({ description: 'Optional notes at assignment start' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Expected remittance amount per collection cycle in minor currency units.',
    example: 250000,
  })
  @IsInt()
  @Min(1)
  remittanceAmountMinorUnits!: number;

  @ApiPropertyOptional({
    description: 'Collection frequency for the assignment remittance plan.',
    example: 'daily',
  })
  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly'])
  remittanceFrequency?: string;

  @ApiPropertyOptional({
    description: 'ISO 4217 currency code. Defaults to the tenant country currency when omitted.',
    example: 'NGN',
  })
  @IsOptional()
  @IsString()
  remittanceCurrency?: string;

  @ApiPropertyOptional({
    description: 'First scheduled remittance date (YYYY-MM-DD). Defaults to today.',
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
