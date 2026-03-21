import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlanResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'PlanTier: starter | growth | enterprise' })
  tier!: string;

  @ApiProperty({ description: 'BillingInterval: monthly | annual' })
  billingInterval!: string;

  @ApiProperty({ description: 'Base price in minor currency units (e.g. kobo, cents)' })
  basePriceMinorUnits!: number;

  @ApiProperty({ description: 'ISO 4217 currency code' })
  currency!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ description: 'Feature matrix (seatLimit, fleetCap, intelligenceEnabled, etc.)' })
  features!: unknown;

  @ApiPropertyOptional({ description: 'Negotiated overrides — present on enterprise plans only' })
  customTerms?: unknown;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
