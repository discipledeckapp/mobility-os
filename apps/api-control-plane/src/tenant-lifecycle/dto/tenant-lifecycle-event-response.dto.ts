import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenantLifecycleEventResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiPropertyOptional()
  fromStatus?: string | null;

  @ApiProperty()
  toStatus!: string;

  @ApiProperty()
  triggeredBy!: string;

  @ApiPropertyOptional()
  actorId?: string | null;

  @ApiPropertyOptional()
  reason?: string | null;

  @ApiPropertyOptional()
  metadata?: unknown;

  @ApiProperty()
  occurredAt!: Date;
}
