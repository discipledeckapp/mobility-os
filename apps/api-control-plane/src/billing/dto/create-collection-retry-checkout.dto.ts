import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

const COLLECTION_RETRY_PROVIDERS = ['flutterwave', 'paystack'] as const;

export class CreateCollectionRetryCheckoutDto {
  @ApiProperty({ enum: COLLECTION_RETRY_PROVIDERS })
  @IsIn(COLLECTION_RETRY_PROVIDERS)
  provider!: (typeof COLLECTION_RETRY_PROVIDERS)[number];

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
