import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsISO4217CurrencyCode,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const CREATEABLE_INVOICE_STATUSES = ['draft', 'open'] as const;

export class CreateInvoiceDto {
  @ApiProperty({ description: 'References tenants.id in api-core (cross-schema reference)' })
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ description: 'ID of the CpSubscription this invoice belongs to' })
  @IsString()
  @IsNotEmpty()
  subscriptionId!: string;

  @ApiProperty({ description: 'Amount due in minor currency units', example: 5000000 })
  @IsInt()
  @Min(0)
  amountDueMinorUnits!: number;

  @ApiProperty({ description: 'ISO 4217 currency code', example: 'NGN' })
  @IsString()
  @IsISO4217CurrencyCode()
  currency!: string;

  @ApiProperty({ description: 'ISO 8601 — start of the invoiced period' })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ description: 'ISO 8601 — end of the invoiced period' })
  @IsDateString()
  periodEnd!: string;

  @ApiPropertyOptional({ description: 'ISO 8601 — due date for collection' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiPropertyOptional({ enum: CREATEABLE_INVOICE_STATUSES, default: 'draft' })
  @IsOptional()
  @IsIn(CREATEABLE_INVOICE_STATUSES)
  status?: string;
}
