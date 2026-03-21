import { ApiProperty } from '@nestjs/swagger';

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
}
