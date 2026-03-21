import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const PAYMENT_PROVIDERS = ['paystack', 'flutterwave'] as const;
const PAYMENT_PURPOSES = ['invoice_settlement', 'platform_wallet_topup'] as const;

export class VerifyTenantPaymentDto {
  @ApiProperty({ enum: PAYMENT_PROVIDERS })
  @IsIn(PAYMENT_PROVIDERS)
  provider!: (typeof PAYMENT_PROVIDERS)[number];

  @ApiProperty()
  @IsString()
  reference!: string;

  @ApiProperty({ enum: PAYMENT_PURPOSES })
  @IsIn(PAYMENT_PURPOSES)
  purpose!: (typeof PAYMENT_PURPOSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceId?: string;
}
