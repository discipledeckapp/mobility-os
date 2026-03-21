import { ApiProperty } from '@nestjs/swagger';

class CollectionsRunInvoiceResultDto {
  @ApiProperty()
  invoiceId!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  subscriptionId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  amountOutstandingMinorUnits!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  collectionOutcome!:
    | 'settled_from_platform_wallet'
    | 'marked_past_due'
    | 'already_past_due'
    | 'already_paid'
    | 'skipped';

  @ApiProperty()
  subscriptionStatus!: string;
}

export class CollectionsRunResponseDto {
  @ApiProperty()
  processedAt!: string;

  @ApiProperty()
  invoiceCount!: number;

  @ApiProperty({ type: CollectionsRunInvoiceResultDto, isArray: true })
  results!: CollectionsRunInvoiceResultDto[];
}
