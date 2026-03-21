import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';

const PAYMENT_PROVIDERS = ['paystack', 'flutterwave'] as const;

export class InitializeTenantWalletTopUpDto {
  @ApiProperty({ enum: PAYMENT_PROVIDERS })
  @IsIn(PAYMENT_PROVIDERS)
  provider!: (typeof PAYMENT_PROVIDERS)[number];

  @ApiProperty({ description: 'Amount in minor currency units' })
  @IsInt()
  @Min(1)
  amountMinorUnits!: number;
}
