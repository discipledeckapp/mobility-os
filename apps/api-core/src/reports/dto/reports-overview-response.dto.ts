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

export class ReportsOverviewResponseDto {
  @ApiProperty({ type: WalletSummaryDto })
  wallet!: WalletSummaryDto;

  @ApiProperty({ type: [RemittanceTrendPointDto] })
  dailyRemittanceTrend!: RemittanceTrendPointDto[];

  @ApiProperty({ type: [RemittanceTrendPointDto] })
  weeklyRemittanceTrend!: RemittanceTrendPointDto[];

  @ApiProperty({ type: DriverActivityDto })
  driverActivity!: DriverActivityDto;
}
