import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'References tenants.id in api-core (cross-schema reference)' })
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({ description: 'ID of an active CpPlan' })
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @ApiProperty({ description: 'ISO 8601 — start of the first billing period' })
  @IsDateString()
  currentPeriodStart!: string;

  @ApiProperty({ description: 'ISO 8601 — end of the first billing period' })
  @IsDateString()
  currentPeriodEnd!: string;

  @ApiPropertyOptional({
    description: 'ISO 8601 — when the trial ends; null for paid-from-day-one',
  })
  @IsOptional()
  @IsDateString()
  trialEndsAt?: string;
}
