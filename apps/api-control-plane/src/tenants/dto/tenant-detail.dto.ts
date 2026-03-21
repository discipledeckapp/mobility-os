import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceResponseDto } from '../../billing/dto/invoice-response.dto';
import { TenantLifecycleEventResponseDto } from '../../tenant-lifecycle/dto/tenant-lifecycle-event-response.dto';
import { TenantLifecycleStateResponseDto } from '../../tenant-lifecycle/dto/tenant-lifecycle-state-response.dto';

class TenantFeatureFlagOverrideDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  flagKey!: string;

  @ApiPropertyOptional()
  countryCode?: string | null;

  @ApiPropertyOptional()
  planTier?: string | null;

  @ApiProperty()
  isEnabled!: boolean;
}

class TenantSubscriptionSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  planId!: string;

  @ApiProperty()
  planName!: string;

  @ApiProperty()
  planTier!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  currentPeriodStart!: Date;

  @ApiProperty()
  currentPeriodEnd!: Date;
}

export class TenantDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  country!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional({ type: TenantSubscriptionSummaryDto })
  subscription?: TenantSubscriptionSummaryDto | null;

  @ApiProperty({ type: [InvoiceResponseDto] })
  invoices!: InvoiceResponseDto[];

  @ApiProperty({ type: [TenantFeatureFlagOverrideDto] })
  featureFlagOverrides!: TenantFeatureFlagOverrideDto[];

  @ApiPropertyOptional({ type: TenantLifecycleStateResponseDto })
  lifecycleState?: TenantLifecycleStateResponseDto | null;

  @ApiProperty({ type: [TenantLifecycleEventResponseDto] })
  lifecycleEvents!: TenantLifecycleEventResponseDto[];
}
