import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsISO4217CurrencyCode,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const PLAN_TIERS = ['starter', 'growth', 'enterprise'] as const;
const BILLING_INTERVALS = ['monthly', 'annual'] as const;

export class CreatePlanDto {
  @ApiProperty({ example: 'Growth Monthly' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: PLAN_TIERS, example: 'growth' })
  @IsIn(PLAN_TIERS)
  tier!: string;

  @ApiProperty({ enum: BILLING_INTERVALS, example: 'monthly' })
  @IsIn(BILLING_INTERVALS)
  billingInterval!: string;

  @ApiProperty({ description: 'Amount in minor units (kobo, cents)', example: 5000000 })
  @IsInt()
  @Min(0)
  basePriceMinorUnits!: number;

  @ApiProperty({ description: 'ISO 4217', example: 'NGN' })
  @IsString()
  @IsISO4217CurrencyCode()
  currency!: string;

  @ApiProperty({
    description: 'Feature matrix object. Keys vary by tier.',
    example: { seatLimit: 50, fleetCap: 500, intelligenceEnabled: true },
  })
  @IsObject()
  features!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Enterprise negotiated overrides. Null on standard plans.' })
  @IsOptional()
  @IsObject()
  customTerms?: Record<string, unknown>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
