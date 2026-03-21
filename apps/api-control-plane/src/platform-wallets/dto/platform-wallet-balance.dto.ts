import { ApiProperty } from '@nestjs/swagger';

export class PlatformWalletBalanceDto {
  @ApiProperty()
  walletId!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ description: 'Derived ledger balance in minor currency units' })
  balanceMinorUnits!: number;
}
