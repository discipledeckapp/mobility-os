import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class StartInspectionDto {
  @ApiProperty()
  @IsString()
  vehicleId!: string;

  @ApiProperty({ example: 'pre_assignment' })
  @IsString()
  @Length(1, 40)
  inspectionType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Min(0)
  odometerKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gpsLatitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gpsLongitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startedAt?: string;
}
