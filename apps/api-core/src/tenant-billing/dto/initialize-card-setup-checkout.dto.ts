import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

const PAYMENT_PROVIDERS = ['paystack', 'flutterwave'] as const;

export class InitializeCardSetupCheckoutDto {
  @ApiPropertyOptional({ enum: PAYMENT_PROVIDERS, default: 'paystack' })
  @IsOptional()
  @IsIn(PAYMENT_PROVIDERS)
  provider?: (typeof PAYMENT_PROVIDERS)[number];

  @ApiPropertyOptional({
    description: 'Small hosted authorization amount in minor units. Defaults to NGN 100.',
    default: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(5000)
  amountMinorUnits?: number;
}
