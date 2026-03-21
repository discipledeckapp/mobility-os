import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  status!: string;

  @ApiProperty()
  currentPeriodStart!: Date;

  @ApiProperty()
  currentPeriodEnd!: Date;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiPropertyOptional()
  trialEndsAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
