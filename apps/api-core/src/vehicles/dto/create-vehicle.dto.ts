import { getAllVehicleTypeSlugs } from '@mobility-os/domain-config';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ description: 'ID of the parent Fleet' })
  @IsString()
  @IsNotEmpty()
  fleetId!: string;

  @ApiPropertyOptional({
    description:
      'Operator-facing tenant asset code. If omitted, api-core will generate a tenant-scoped suggestion safely.',
    example: 'AJAH-0012',
  })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  tenantVehicleCode?: string;

  @ApiProperty({
    description: 'Vehicle type slug from domain-config VEHICLE_TYPES registry',
    example: 'motorcycle',
    enum: getAllVehicleTypeSlugs(),
  })
  @IsString()
  @IsIn(getAllVehicleTypeSlugs(), {
    message: `vehicleType must be one of: ${getAllVehicleTypeSlugs().join(', ')}`,
  })
  vehicleType!: string;

  @ApiProperty({ example: 'Honda' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 60)
  make!: string;

  @ApiPropertyOptional({ example: 'CB150R' })
  @IsString()
  @Length(0, 60)
  model!: string;

  @ApiPropertyOptional({ example: 'EX-V6' })
  @IsOptional()
  @IsString()
  @Length(1, 60)
  trim?: string;

  @ApiProperty({ example: 2022 })
  @IsInt()
  @Min(1980)
  @Max(new Date().getFullYear() + 1)
  year!: number;

  @ApiPropertyOptional({
    description: 'Normalised registration plate. Optional and secondary.',
    example: 'LAG-123-XY',
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  plate?: string;

  @ApiPropertyOptional({ example: 'Red' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  color?: string;

  @ApiPropertyOptional({ description: 'VIN / chassis number' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  vin?: string;

  @ApiPropertyOptional({
    description: 'Latest known odometer reading in kilometres',
    example: 125430,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  odometerKm?: number;

  @ApiPropertyOptional({
    description: 'Acquisition cost in minor currency units when known',
    example: 245000000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  acquisitionCostMinorUnits?: number;

  @ApiPropertyOptional({
    description: 'Acquisition date in ISO format (YYYY-MM-DD)',
    example: '2025-03-20',
  })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  acquisitionDate?: string;

  @ApiPropertyOptional({
    description: 'Current estimated value in minor currency units',
    example: 220000000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentEstimatedValueMinorUnits?: number;

  @ApiPropertyOptional({
    description: 'Source of the current valuation',
    example: 'operator-estimate',
  })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  valuationSource?: string;
}
