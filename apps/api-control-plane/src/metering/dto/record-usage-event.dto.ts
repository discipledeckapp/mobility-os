import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { IsOptional, Length } from 'class-validator';

const USAGE_EVENT_TYPES = [
  'active_vehicle',
  'active_driver',
  'identity_verification',
  'biometric_match',
  'remittance_transaction',
  'api_call',
] as const;

export class RecordUsageEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ enum: USAGE_EVENT_TYPES })
  @IsIn(USAGE_EVENT_TYPES)
  eventType!: (typeof USAGE_EVENT_TYPES)[number];

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country code' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @ApiProperty({ description: 'ISO 8601 event time' })
  @IsDateString()
  occurredAt!: string;
}
