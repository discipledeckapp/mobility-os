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
    description: 'AssignmentStatus: created | assigned | active | completed | cancelled',
  })
  status!: string;

  @ApiProperty()
  startedAt!: Date;

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

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
