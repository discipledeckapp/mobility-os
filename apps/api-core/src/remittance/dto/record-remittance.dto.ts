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

  @ApiPropertyOptional({
    description:
      'Amount in minor currency units (e.g. kobo). When omitted, the assignment remittance plan amount is used.',
    example: 150000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  amountMinorUnits?: number;

  @ApiPropertyOptional({
    description:
      'ISO 4217 currency code. When omitted, the assignment remittance currency is used.',
    example: 'NGN',
  })
  @IsOptional()
  @IsString()
  @IsISO4217CurrencyCode()
  currency?: string;

  @ApiPropertyOptional({
    description:
      'Expected payment date (YYYY-MM-DD). When omitted, the next scheduled due date is derived from the assignment remittance plan.',
    example: '2026-03-20',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueDate must be YYYY-MM-DD' })
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Client-generated idempotency key used for offline replay dedupe.' })
  @IsOptional()
  @IsString()
  clientReferenceId?: string;

  @ApiPropertyOptional({ description: 'Submission source: online | offline_queue' })
  @IsOptional()
  @IsString()
  submissionSource?: string;

  @ApiPropertyOptional({ description: 'Sync state: offline_submitted | synced' })
  @IsOptional()
  @IsString()
  syncStatus?: string;

  @ApiPropertyOptional({ description: 'Original client capture timestamp in ISO-8601 format.' })
  @IsOptional()
  @IsString()
  originalCapturedAt?: string;

  @ApiPropertyOptional({ description: 'Structured evidence payload captured with the remittance.' })
  @IsOptional()
  evidence?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shiftCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkpointLabel?: string;
}
