import { getAllBusinessModelSlugs } from '@mobility-os/domain-config';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateFleetDto {
  @ApiPropertyOptional({ description: 'ID of the parent OperatingUnit' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  operatingUnitId?: string;

  @ApiPropertyOptional({ example: 'Okada Fleet A' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Business model slug. May differ from the parent BusinessEntity model ' +
      '(e.g. a mixed hire-purchase + lease fleet within one entity).',
    example: 'hire-purchase',
    enum: getAllBusinessModelSlugs(),
  })
  @IsOptional()
  @IsString()
  @IsIn(getAllBusinessModelSlugs(), {
    message: `businessModel must be one of: ${getAllBusinessModelSlugs().join(', ')}`,
  })
  businessModel?: string;

  @ApiPropertyOptional({ description: 'Default maintenance schedule type for vehicles in this fleet', example: 'preventive_service' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  maintenanceScheduleType?: string;

  @ApiPropertyOptional({ description: 'Default service interval in days for this fleet', example: 90 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maintenanceIntervalDays?: number;

  @ApiPropertyOptional({ description: 'Default service interval in km for this fleet', example: 10000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maintenanceIntervalKm?: number;
}
