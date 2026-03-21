import { ApiProperty } from '@nestjs/swagger';

class BillingRunInvoiceResultDto {
  @ApiProperty()
  invoiceId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  amountDueMinorUnits!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  settlementOutcome!:
    | 'settled_from_platform_wallet'
    | 'insufficient_platform_wallet_balance'
    | 'already_paid'
    | 'skipped';
}

class BillingRunSubscriptionResultDto {
  @ApiProperty()
  subscriptionId!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  cyclesProcessed!: number;

  @ApiProperty()
  finalStatus!: string;

  @ApiProperty({ type: BillingRunInvoiceResultDto, isArray: true })
  invoices!: BillingRunInvoiceResultDto[];
}

export class BillingRunResponseDto {
  @ApiProperty()
  processedAt!: string;

  @ApiProperty()
  subscriptionCount!: number;

  @ApiProperty({ type: BillingRunSubscriptionResultDto, isArray: true })
  results!: BillingRunSubscriptionResultDto[];
}
