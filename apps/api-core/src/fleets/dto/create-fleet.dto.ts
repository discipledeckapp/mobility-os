import { getAllBusinessModelSlugs } from '@mobility-os/domain-config';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateFleetDto {
  @ApiProperty({ description: 'ID of the parent OperatingUnit' })
  @IsString()
  @IsNotEmpty()
  operatingUnitId!: string;

  @ApiProperty({ example: 'Okada Fleet A' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name!: string;

  @ApiProperty({
    description:
      'Business model slug. May differ from the parent BusinessEntity model ' +
      '(e.g. a mixed hire-purchase + lease fleet within one entity).',
    example: 'hire-purchase',
    enum: getAllBusinessModelSlugs(),
  })
  @IsString()
  @IsIn(getAllBusinessModelSlugs(), {
    message: `businessModel must be one of: ${getAllBusinessModelSlugs().join(', ')}`,
  })
  businessModel!: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'preventive_service' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  maintenanceScheduleType?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maintenanceIntervalDays?: number;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maintenanceIntervalKm?: number;
}
