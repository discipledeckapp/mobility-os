import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsISO4217CurrencyCode,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const PAYMENT_PROVIDER_NAMES = ['flutterwave', 'paystack'] as const;

export class InitializeSubscriptionBillingSetupDto {
  @ApiProperty({ enum: PAYMENT_PROVIDER_NAMES })
  @IsIn(PAYMENT_PROVIDER_NAMES)
  provider!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ description: 'Small hosted authorization amount in minor currency units', example: 10000 })
  @IsInt()
  @Min(1)
  amountMinorUnits!: number;

  @ApiProperty()
  @IsISO4217CurrencyCode()
  currency!: string;

  @ApiProperty()
  @IsEmail()
  customerEmail!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  redirectUrl?: string;
}
