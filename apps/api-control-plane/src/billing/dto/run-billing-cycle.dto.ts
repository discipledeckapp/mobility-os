import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class RunBillingCycleDto {
  @ApiPropertyOptional({
    description: 'ISO 8601 timestamp to evaluate due subscriptions against',
  })
  @IsOptional()
  @IsDateString()
  asOf?: string;

  @ApiPropertyOptional({
    description:
      'Attempt to settle newly-opened invoices from the tenant platform wallet when funded',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoSettleFromWallet?: boolean;
}
