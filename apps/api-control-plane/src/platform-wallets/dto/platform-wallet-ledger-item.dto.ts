import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlatformWalletLedgerItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  walletId!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  amountMinorUnits!: number;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional()
  referenceId?: string | null;

  @ApiPropertyOptional()
  referenceType?: string | null;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class PaginatedPlatformWalletLedgerDto {
  @ApiProperty({ type: [PlatformWalletLedgerItemDto] })
  data!: PlatformWalletLedgerItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
