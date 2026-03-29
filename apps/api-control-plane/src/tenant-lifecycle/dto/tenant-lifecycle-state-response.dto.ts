import { ApiProperty } from '@nestjs/swagger';

class TenantLifecycleEnforcementDto {
  @ApiProperty()
  stage!: 'active' | 'grace' | 'expired';

  @ApiProperty()
  gracePeriodDays!: number;

  @ApiProperty({ nullable: true })
  graceEndsAt!: Date | null;

  @ApiProperty()
  graceDaysRemaining!: number;

  @ApiProperty()
  degradedMode!: boolean;

  @ApiProperty({ type: [String] })
  blockedFeatures!: string[];
}

export class TenantLifecycleStateResponseDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  subscriptionId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  currentPeriodStart!: Date;

  @ApiProperty()
  currentPeriodEnd!: Date;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiProperty({ type: TenantLifecycleEnforcementDto })
  enforcement!: TenantLifecycleEnforcementDto;
}
