import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AccountingLedgerRemittanceSummaryDto {
  @ApiProperty()
  remittanceId!: string;

  @ApiProperty()
  driverId!: string;

  @ApiProperty()
  assignmentId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  dueDate!: string;
}

export class AccountingLedgerEntryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  walletId!: string;

  @ApiProperty({ enum: ['credit', 'debit', 'reversal'] })
  type!: string;

  @ApiProperty({ enum: ['inflow', 'outflow'] })
  direction!: 'inflow' | 'outflow';

  @ApiProperty()
  category!: string;

  @ApiProperty()
  amountMinorUnits!: number;

  @ApiProperty()
  signedAmountMinorUnits!: number;

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

  @ApiPropertyOptional({ type: AccountingLedgerRemittanceSummaryDto })
  remittance?: AccountingLedgerRemittanceSummaryDto | null;
}

export class AccountingBalanceSummaryResponseDto {
  @ApiProperty()
  businessEntityId!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  currentBalanceMinorUnits!: number;

  @ApiProperty()
  totalCreditsMinorUnits!: number;

  @ApiProperty()
  totalDebitsMinorUnits!: number;

  @ApiProperty()
  remittanceCollectedMinorUnits!: number;

  @ApiProperty()
  pendingRemittanceMinorUnits!: number;

  @ApiProperty()
  overdueRemittanceCount!: number;

  @ApiProperty()
  disputedRemittanceCount!: number;

  @ApiProperty()
  ledgerEntryCount!: number;
}

export class AccountingCategoryBreakdownDto {
  @ApiProperty()
  category!: string;

  @ApiProperty()
  amountMinorUnits!: number;
}

export class AccountingProfitAndLossResponseDto {
  @ApiProperty()
  businessEntityId!: string;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional()
  dateFrom?: string | null;

  @ApiPropertyOptional()
  dateTo?: string | null;

  @ApiProperty()
  revenueMinorUnits!: number;

  @ApiProperty()
  expenseMinorUnits!: number;

  @ApiProperty()
  netProfitMinorUnits!: number;

  @ApiProperty({ type: [AccountingCategoryBreakdownDto] })
  revenueBreakdown!: AccountingCategoryBreakdownDto[];

  @ApiProperty({ type: [AccountingCategoryBreakdownDto] })
  expenseBreakdown!: AccountingCategoryBreakdownDto[];
}
