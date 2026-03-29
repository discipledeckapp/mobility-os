import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SubscriptionEnforcementDto {
  @ApiProperty()
  stage!: 'active' | 'grace' | 'expired';

  @ApiProperty()
  gracePeriodDays!: number;

  @ApiPropertyOptional()
  graceEndsAt?: Date | null;

  @ApiProperty()
  graceDaysRemaining!: number;

  @ApiProperty()
  degradedMode!: boolean;

  @ApiProperty({ type: [String] })
  blockedFeatures!: string[];
}

export class SubscriptionListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  planId!: string;

  @ApiProperty()
  planName!: string;

  @ApiProperty()
  planTier!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  basePriceMinorUnits!: number;

  @ApiProperty()
  features!: unknown;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  currentPeriodStart!: Date;

  @ApiProperty()
  currentPeriodEnd!: Date;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiPropertyOptional()
  trialEndsAt?: Date | null;

  @ApiProperty({ type: SubscriptionEnforcementDto })
  enforcement!: SubscriptionEnforcementDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
