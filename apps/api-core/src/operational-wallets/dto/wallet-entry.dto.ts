import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO4217CurrencyCode, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

const ENTRY_TYPES = ['credit', 'debit', 'reversal'] as const;

export class CreateWalletEntryDto {
  @ApiProperty({ enum: ENTRY_TYPES })
  @IsIn(ENTRY_TYPES)
  type!: string;

  @ApiProperty({ description: 'Amount in minor currency units (always positive)', example: 150000 })
  @IsInt()
  @Min(1)
  amountMinorUnits!: number;

  @ApiProperty({ description: 'ISO 4217', example: 'NGN' })
  @IsString()
  @IsISO4217CurrencyCode()
  currency!: string;

  @ApiPropertyOptional({ description: 'ID of the originating event (remittance.id, etc.)' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ description: "'remittance' | 'adjustment' | 'reversal' | 'payout'" })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class WalletEntryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  walletId!: string;

  @ApiProperty({ description: 'credit | debit | reversal' })
  type!: string;

  @ApiProperty()
  amountMinorUnits!: number;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional()
  referenceId?: string | null;

  @ApiPropertyOptional()
  referenceType?: string | null;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class WalletBalanceResponseDto {
  @ApiProperty()
  walletId!: string;

  @ApiProperty()
  businessEntityId!: string;

  @ApiProperty({ description: 'ISO 4217' })
  currency!: string;

  @ApiProperty({ description: 'Current balance in minor currency units' })
  balanceMinorUnits!: number;

  @ApiProperty()
  updatedAt!: Date;
}
