import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const PAYMENT_PROVIDER_NAMES = ['flutterwave', 'paystack'] as const;
const PAYMENT_PURPOSES = ['invoice_settlement', 'platform_wallet_topup'] as const;

export class VerifyAndApplyPaymentDto {
  @ApiProperty({ enum: PAYMENT_PROVIDER_NAMES })
  @IsIn(PAYMENT_PROVIDER_NAMES)
  provider!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference!: string;

  @ApiProperty({ enum: PAYMENT_PURPOSES })
  @IsIn(PAYMENT_PURPOSES)
  purpose!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tenantId?: string;
}
