import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletEntryResponseDto } from '../../operational-wallets/dto/wallet-entry.dto';

export class RemittanceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  assignmentId!: string;

  @ApiProperty()
  driverId!: string;

  @ApiProperty()
  vehicleId!: string;

  @ApiProperty()
  fleetId!: string;

  @ApiProperty()
  businessEntityId!: string;

  @ApiProperty()
  operatingUnitId!: string;

  @ApiProperty({
    description:
      'RemittanceStatus: pending | completed | partially_settled | cancelled_due_to_assignment_end | disputed | waived',
  })
  status!: string;

  @ApiProperty({ description: 'Amount in minor currency units' })
  amountMinorUnits!: number;

  @ApiProperty({ description: 'ISO 4217' })
  currency!: string;

  @ApiProperty({ description: 'YYYY-MM-DD' })
  dueDate!: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD — null until completed or partially settled' })
  paidDate?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional()
  clientReferenceId?: string | null;

  @ApiPropertyOptional()
  submissionSource?: string;

  @ApiPropertyOptional()
  syncStatus?: string;

  @ApiPropertyOptional()
  originalCapturedAt?: Date | null;

  @ApiPropertyOptional()
  syncedAt?: Date | null;

  @ApiPropertyOptional({ type: Object })
  evidence?: unknown | null;

  @ApiPropertyOptional()
  shiftCode?: string | null;

  @ApiPropertyOptional()
  checkpointLabel?: string | null;

  @ApiPropertyOptional()
  shortfallAmountMinorUnits?: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: WalletEntryResponseDto })
  walletEntry?: WalletEntryResponseDto;
}
