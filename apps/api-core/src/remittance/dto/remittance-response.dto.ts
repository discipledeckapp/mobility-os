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
    description: 'RemittanceStatus: pending | confirmed | disputed | waived',
  })
  status!: string;

  @ApiProperty({ description: 'Amount in minor currency units' })
  amountMinorUnits!: number;

  @ApiProperty({ description: 'ISO 4217' })
  currency!: string;

  @ApiProperty({ description: 'YYYY-MM-DD' })
  dueDate!: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD — null until confirmed' })
  paidDate?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: WalletEntryResponseDto })
  walletEntry?: WalletEntryResponseDto;
}
