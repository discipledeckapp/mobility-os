import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlatformWalletSummaryDto {
  @ApiProperty()
  walletId!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  balanceMinorUnits!: number;

  @ApiProperty()
  entryCount!: number;

  @ApiPropertyOptional()
  lastEntryAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
