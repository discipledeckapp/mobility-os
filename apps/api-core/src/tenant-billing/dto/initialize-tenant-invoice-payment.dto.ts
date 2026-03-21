import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

const PAYMENT_PROVIDERS = ['paystack', 'flutterwave'] as const;

export class InitializeTenantInvoicePaymentDto {
  @ApiProperty({ enum: PAYMENT_PROVIDERS })
  @IsIn(PAYMENT_PROVIDERS)
  provider!: (typeof PAYMENT_PROVIDERS)[number];

  @ApiProperty()
  @IsString()
  invoiceId!: string;
}
