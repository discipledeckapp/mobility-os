import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  fleetId!: string;

  @ApiProperty()
  systemVehicleCode!: string;

  @ApiProperty()
  tenantVehicleCode!: string;

  @ApiProperty()
  businessEntityId!: string;

  @ApiProperty()
  operatingUnitId!: string;

  @ApiProperty({ description: 'VehicleStatus: available | assigned | maintenance | retired' })
  status!: string;

  @ApiProperty({ description: 'Vehicle type slug from domain-config' })
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

  @ApiPropertyOptional()
  color?: string | null;

  @ApiPropertyOptional({ description: 'VIN / chassis number' })
  vin?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
