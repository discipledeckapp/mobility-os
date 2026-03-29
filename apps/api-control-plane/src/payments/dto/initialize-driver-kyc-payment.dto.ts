import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const PAYMENT_PROVIDER_NAMES = ['flutterwave', 'paystack'] as const;
const VERIFICATION_TIERS = [
  'BASIC_IDENTITY',
  'VERIFIED_IDENTITY',
  'FULL_TRUST_VERIFICATION',
] as const;

export class InitializeDriverKycPaymentDto {
  @ApiProperty({ enum: PAYMENT_PROVIDER_NAMES })
  @IsIn(PAYMENT_PROVIDER_NAMES)
  provider!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  driverId!: string;

  @ApiProperty()
  @IsISO4217CurrencyCode()
  currency!: string;

  @ApiProperty({ enum: VERIFICATION_TIERS })
  @IsIn(VERIFICATION_TIERS)
  verificationTier!: (typeof VERIFICATION_TIERS)[number];

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amountMinorUnits!: number;

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
