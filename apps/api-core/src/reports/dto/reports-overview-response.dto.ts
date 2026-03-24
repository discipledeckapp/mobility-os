import { ApiProperty } from '@nestjs/swagger';

export class WalletSummaryDto {
  @ApiProperty()
  currency!: string;

  @ApiProperty()
  totalBalanceMinorUnits!: number;

  @ApiProperty()
  totalInflowMinorUnits!: number;

  @ApiProperty()
  totalOutflowMinorUnits!: number;
}

export class RemittanceTrendPointDto {
  @ApiProperty()
  label!: string;

  @ApiProperty()
  amountMinorUnits!: number;
}

export class DriverActivityDto {
  @ApiProperty()
  active!: number;

  @ApiProperty()
  inactive!: number;
}

export class RemittanceProjectionSummaryDto {
  @ApiProperty()
  currency!: string;

  @ApiProperty()
  activeAssignmentsWithPlans!: number;

  @ApiProperty()
  expectedTodayMinorUnits!: number;

  @ApiProperty()
  expectedThisWeekMinorUnits!: number;

  @ApiProperty()
  atRiskMinorUnits!: number;

  @ApiProperty()
  atRiskAssignmentCount!: number;
}

export class OwnershipProgressSummaryDto {
  @ApiProperty()
  currency!: string;

  @ApiProperty()
  activeHirePurchaseUnits!: number;

  @ApiProperty()
  targetValueMinorUnits!: number;

  @ApiProperty()
  remittedValueMinorUnits!: number;

  @ApiProperty()
  outstandingValueMinorUnits!: number;

  @ApiProperty()
  completionRatio!: number;
}

export class ReportsOverviewResponseDto {
  @ApiProperty({ type: WalletSummaryDto })
  wallet!: WalletSummaryDto;

  @ApiProperty({ type: [RemittanceTrendPointDto] })
  dailyRemittanceTrend!: RemittanceTrendPointDto[];

  @ApiProperty({ type: [RemittanceTrendPointDto] })
  weeklyRemittanceTrend!: RemittanceTrendPointDto[];

  @ApiProperty({ type: DriverActivityDto })
  driverActivity!: DriverActivityDto;

  @ApiProperty({ type: RemittanceProjectionSummaryDto })
  remittanceProjection!: RemittanceProjectionSummaryDto;

  @ApiProperty({ type: OwnershipProgressSummaryDto })
  ownershipProgress!: OwnershipProgressSummaryDto;
}
