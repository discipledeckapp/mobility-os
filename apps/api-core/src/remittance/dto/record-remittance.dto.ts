import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsISO4217CurrencyCode,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class RecordRemittanceDto {
  @ApiPropertyOptional({ description: 'Optional fleet context selected by the operator' })
  @IsOptional()
  @IsString()
  fleetId?: string;

  @ApiProperty({ description: 'ID of the active Assignment this remittance belongs to' })
  @IsString()
  @IsNotEmpty()
  assignmentId!: string;

  @ApiProperty({ description: 'Amount in minor currency units (e.g. kobo)', example: 150000 })
  @IsInt()
  @Min(1)
  amountMinorUnits!: number;

  @ApiProperty({ description: 'ISO 4217 currency code', example: 'NGN' })
  @IsString()
  @IsISO4217CurrencyCode()
  currency!: string;

  @ApiProperty({ description: 'Expected payment date (YYYY-MM-DD)', example: '2026-03-20' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueDate must be YYYY-MM-DD' })
  dueDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
