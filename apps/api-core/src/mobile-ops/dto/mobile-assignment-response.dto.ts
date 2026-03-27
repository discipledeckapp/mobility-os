import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MobileAssignmentVehicleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  systemVehicleCode!: string;

  @ApiProperty()
  tenantVehicleCode!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  vehicleType!: string;

  @ApiProperty()
  make!: string;

  @ApiProperty()
  model!: string;

  @ApiPropertyOptional()
  trim?: string | null;

  @ApiProperty()
  year!: number;

  @ApiPropertyOptional()
  plate?: string | null;
}

export class MobileAssignmentResponseDto {
  @ApiProperty()
  id!: string;

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

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  startedAt?: Date | null;

  @ApiPropertyOptional()
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

  @ApiPropertyOptional()
  contractStatus?: string | null;

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

  @ApiProperty({ type: MobileAssignmentVehicleDto })
  vehicle!: MobileAssignmentVehicleDto;
}
