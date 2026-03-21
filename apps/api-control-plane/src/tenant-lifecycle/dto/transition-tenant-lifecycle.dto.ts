import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const TENANT_LIFECYCLE_STATUSES = [
  'prospect',
  'onboarded',
  'active',
  'past_due',
  'grace_period',
  'suspended',
  'terminated',
  'archived',
  'canceled',
] as const;

export class TransitionTenantLifecycleDto {
  @ApiProperty({ enum: TENANT_LIFECYCLE_STATUSES })
  @IsIn(TENANT_LIFECYCLE_STATUSES)
  toStatus!: (typeof TENANT_LIFECYCLE_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorId?: string;
}
