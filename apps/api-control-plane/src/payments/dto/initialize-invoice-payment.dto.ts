import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const PAYMENT_PROVIDER_NAMES = ['flutterwave', 'paystack'] as const;

export class InitializeInvoicePaymentDto {
  @ApiProperty({ enum: PAYMENT_PROVIDER_NAMES })
  @IsIn(PAYMENT_PROVIDER_NAMES)
  provider!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;

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
