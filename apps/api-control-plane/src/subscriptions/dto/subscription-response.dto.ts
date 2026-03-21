import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'References tenants.id in api-core (cross-schema)' })
  tenantId!: string;

  @ApiProperty()
  planId!: string;

  @ApiProperty({
    description: 'SubscriptionStatus: trialing | active | past_due | canceled | unpaid',
  })
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
