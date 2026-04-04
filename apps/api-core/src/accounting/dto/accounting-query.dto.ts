import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';

const LEDGER_TYPES = ['credit', 'debit', 'reversal'] as const;

export class ListAccountingLedgerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: LEDGER_TYPES })
  @IsOptional()
  @IsIn(LEDGER_TYPES)
  type?: string;

  @ApiPropertyOptional({ description: 'Inclusive ISO date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Inclusive ISO date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class GetAccountingProfitAndLossDto {
  @ApiPropertyOptional({ description: 'Inclusive ISO date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Inclusive ISO date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
