import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsISO4217CurrencyCode,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const PLATFORM_WALLET_ENTRY_TYPES = ['credit', 'debit', 'reversal'] as const;

export class CreatePlatformWalletEntryDto {
  @ApiProperty({ enum: PLATFORM_WALLET_ENTRY_TYPES })
  @IsIn(PLATFORM_WALLET_ENTRY_TYPES)
  type!: string;

  @ApiProperty({ description: 'Amount in minor currency units', example: 5000000 })
  @IsInt()
  @Min(1)
  amountMinorUnits!: number;

  @ApiProperty({ description: 'ISO 4217 currency code', example: 'NGN' })
  @IsISO4217CurrencyCode()
  currency!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
