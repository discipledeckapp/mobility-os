import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'AJAH-0012' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  tenantVehicleCode?: string;

  @ApiPropertyOptional({ example: 'LAG-123-XY' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  plate?: string;

  @ApiPropertyOptional({ example: '1HGCM82633A004352' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  vin?: string;

  @ApiPropertyOptional({ example: 'Blue' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  color?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  @Min(1980)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiPropertyOptional({ example: 245000000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  acquisitionCostMinorUnits?: number;

  @ApiPropertyOptional({ example: '2025-03-20' })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  acquisitionDate?: string;

  @ApiPropertyOptional({ example: 220000000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentEstimatedValueMinorUnits?: number;

  @ApiPropertyOptional({ example: 'operator-estimate' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  valuationSource?: string;

  @ApiPropertyOptional({ example: 128900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  odometerKm?: number;
}
