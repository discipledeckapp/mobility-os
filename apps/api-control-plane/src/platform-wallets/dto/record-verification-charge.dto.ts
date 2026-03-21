import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RecordVerificationChargeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ description: 'Amount in minor currency units', example: 15000 })
  @IsInt()
  @Min(1)
  amountMinorUnits!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  referenceId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
