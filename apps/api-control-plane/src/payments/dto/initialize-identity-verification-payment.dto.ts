import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

const PAYMENT_PROVIDER_NAMES = ['flutterwave', 'paystack'] as const;
const IDENTITY_SUBJECT_TYPES = ['driver', 'guarantor'] as const;

export class InitializeIdentityVerificationPaymentDto {
  @ApiProperty({ enum: PAYMENT_PROVIDER_NAMES })
  @IsIn(PAYMENT_PROVIDER_NAMES)
  provider!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ enum: IDENTITY_SUBJECT_TYPES })
  @IsIn(IDENTITY_SUBJECT_TYPES)
  subjectType!: 'driver' | 'guarantor';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedDriverId?: string;

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
