import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  fleetId!: string;

  @ApiProperty()
  businessEntityId!: string;

  @ApiProperty()
  operatingUnitId!: string;

  @ApiProperty()
  driverId!: string;

  @ApiProperty()
  vehicleId!: string;

  @ApiProperty({
    description:
      'AssignmentStatus: created | pending_driver_confirmation | active | declined | ended | cancelled',
  })
  status!: string;

  @ApiPropertyOptional()
  startedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Null while the assignment is active' })
  endedAt?: Date | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiPropertyOptional()
  remittanceModel?: string | null;

  @ApiPropertyOptional()
  remittanceFrequency?: string | null;

  @ApiPropertyOptional()
  remittanceAmountMinorUnits?: number | null;

  @ApiPropertyOptional()
  remittanceCurrency?: string | null;

  @ApiPropertyOptional()
  remittanceStartDate?: string | null;

  @ApiPropertyOptional()
  remittanceCollectionDay?: number | null;

  @ApiPropertyOptional()
  contractVersion?: string | null;

  @ApiPropertyOptional({ type: Object })
  contractSnapshot?: unknown | null;

  @ApiPropertyOptional({ type: Object })
  financialContract?: unknown | null;

  @ApiPropertyOptional()
  contractStatus?: string;

  @ApiPropertyOptional()
  driverAcceptedTermsAt?: Date | null;

  @ApiPropertyOptional({ type: Object })
  driverAcceptanceEvidence?: unknown | null;

  @ApiPropertyOptional()
  driverConfirmedAt?: Date | null;

  @ApiPropertyOptional()
  driverConfirmationMethod?: string | null;

  @ApiPropertyOptional({ type: Object })
  driverConfirmationEvidence?: unknown | null;

  @ApiPropertyOptional()
  acceptanceSnapshotHash?: string | null;

  @ApiPropertyOptional()
  returnedAt?: Date | null;

  @ApiPropertyOptional()
  returnedBy?: string | null;

  @ApiPropertyOptional({ type: Object })
  returnEvidence?: unknown | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
