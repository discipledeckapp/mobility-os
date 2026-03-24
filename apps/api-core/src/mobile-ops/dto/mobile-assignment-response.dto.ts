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

  @ApiProperty()
  startedAt!: Date;

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

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: MobileAssignmentVehicleDto })
  vehicle!: MobileAssignmentVehicleDto;
}
