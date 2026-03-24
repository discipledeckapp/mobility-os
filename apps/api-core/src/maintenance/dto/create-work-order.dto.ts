import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateWorkOrderDto {
  @ApiProperty()
  @IsString()
  vehicleId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maintenanceRecordId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inspectionId?: string;

  @ApiPropertyOptional({ example: 'inspection_failure' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  triggerType?: string;

  @ApiPropertyOptional({ example: 'medium' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  severity?: string;

  @ApiPropertyOptional({ example: 'corrective' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  recordType?: string;

  @ApiProperty({ example: 'Replace brake pads and inspect brake line.' })
  @IsString()
  @Length(1, 2000)
  issueDescription!: string;

  @ApiProperty({ example: 'HIGH' })
  @IsString()
  @Length(1, 20)
  priority!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  partsCostMinorUnits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  labourCostMinorUnits?: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;
}
