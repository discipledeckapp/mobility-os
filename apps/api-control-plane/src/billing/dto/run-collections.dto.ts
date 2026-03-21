import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class RunCollectionsDto {
  @ApiPropertyOptional({
    description: 'ISO 8601 timestamp to evaluate overdue invoices against',
  })
  @IsOptional()
  @IsDateString()
  asOf?: string;

  @ApiPropertyOptional({
    description:
      'Attempt to settle overdue invoices from funded platform wallets before marking tenants past due',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoSettleFromWallet?: boolean;
}
