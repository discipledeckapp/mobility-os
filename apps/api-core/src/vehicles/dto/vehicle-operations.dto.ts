import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateVehicleInspectionDto {
  @ApiProperty({ example: 'routine' })
  @IsString()
  @Length(1, 40)
  inspectionType!: string;

  @ApiPropertyOptional({ example: 'passed' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  status?: string;

  @ApiPropertyOptional({ example: '2026-03-24T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  inspectionDate?: string;

  @ApiPropertyOptional({ example: 125430 })
  @IsOptional()
  @IsInt()
  @Min(0)
  odometerKm?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  issuesFoundCount?: number;

  @ApiPropertyOptional({ example: 'in_app' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  reportSource?: string;

  @ApiProperty({ example: 'Brake pads need replacement within 2 weeks.' })
  @IsString()
  @Length(1, 500)
  summary!: string;

  @ApiPropertyOptional({ example: 'https://example.com/report.pdf' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reportUrl?: string;

  @ApiPropertyOptional({ example: '2026-04-24T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  nextInspectionDueAt?: string;
}

export class UpsertVehicleMaintenanceScheduleDto {
  @ApiProperty({ example: 'hybrid' })
  @IsString()
  @Length(1, 40)
  scheduleType!: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  intervalDays?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  intervalKm?: number;

  @ApiPropertyOptional({ example: '2026-04-24T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  nextDueAt?: string;

  @ApiPropertyOptional({ example: 130000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  nextDueOdometerKm?: number;

  @ApiPropertyOptional({ example: 'default' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  source?: string;

  @ApiPropertyOptional({ example: 'Use OEM service rhythm for urban ride-hail operations.' })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  notes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateVehicleMaintenanceEventDto {
  @ApiProperty({ example: 'preventive_service' })
  @IsString()
  @Length(1, 40)
  category!: string;

  @ApiProperty({ example: 'Quarterly preventive service' })
  @IsString()
  @Length(1, 120)
  title!: string;

  @ApiPropertyOptional({ example: 'Oil change, filter change, brake check.' })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @ApiPropertyOptional({ example: 'scheduled' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  status?: string;

  @ApiPropertyOptional({ example: '2026-03-28T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @ApiPropertyOptional({ example: '2026-03-28T13:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ example: 128900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  odometerKm?: number;

  @ApiPropertyOptional({ example: 250000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  costMinorUnits?: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ example: 'Ajah Service Hub' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  vendor?: string;
}

export class CreateVehicleIncidentDto {
  @ApiProperty({ example: 'collision' })
  @IsString()
  @Length(1, 40)
  category!: string;

  @ApiProperty({ example: 'minor' })
  @IsString()
  @Length(1, 40)
  severity!: string;

  @ApiProperty({ example: 'Side mirror damaged in traffic' })
  @IsString()
  @Length(1, 120)
  title!: string;

  @ApiPropertyOptional({ example: 'Another vehicle clipped the left mirror in Lekki traffic.' })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @ApiProperty({ example: '2026-03-24T08:30:00.000Z' })
  @IsDateString()
  occurredAt!: string;

  @ApiPropertyOptional({ example: 'driver_123' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional({ example: 90000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedCostMinorUnits?: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}

export class VehicleInspectionResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  vehicleId!: string;
  @ApiProperty()
  inspectionType!: string;
  @ApiProperty()
  status!: string;
  @ApiProperty()
  inspectionDate!: string;
  @ApiPropertyOptional()
  odometerKm?: number | null;
  @ApiProperty()
  issuesFoundCount!: number;
  @ApiProperty()
  reportSource!: string;
  @ApiProperty()
  summary!: string;
  @ApiPropertyOptional()
  reportUrl?: string | null;
  @ApiPropertyOptional()
  nextInspectionDueAt?: string | null;
  @ApiProperty()
  createdAt!: string;
}

export class VehicleMaintenanceScheduleResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  vehicleId!: string;
  @ApiProperty()
  isActive!: boolean;
  @ApiProperty()
  scheduleType!: string;
  @ApiPropertyOptional()
  intervalDays?: number | null;
  @ApiPropertyOptional()
  intervalKm?: number | null;
  @ApiPropertyOptional()
  nextDueAt?: string | null;
  @ApiPropertyOptional()
  nextDueOdometerKm?: number | null;
  @ApiProperty()
  source!: string;
  @ApiPropertyOptional()
  notes?: string | null;
  @ApiProperty()
  createdAt!: string;
}

export class VehicleMaintenanceEventResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  vehicleId!: string;
  @ApiProperty()
  category!: string;
  @ApiProperty()
  title!: string;
  @ApiPropertyOptional()
  description?: string | null;
  @ApiProperty()
  status!: string;
  @ApiPropertyOptional()
  scheduledFor?: string | null;
  @ApiPropertyOptional()
  completedAt?: string | null;
  @ApiPropertyOptional()
  odometerKm?: number | null;
  @ApiPropertyOptional()
  costMinorUnits?: number | null;
  @ApiPropertyOptional()
  currency?: string | null;
  @ApiPropertyOptional()
  vendor?: string | null;
  @ApiProperty()
  createdAt!: string;
}

export class VehicleIncidentResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  vehicleId!: string;
  @ApiPropertyOptional()
  driverId?: string | null;
  @ApiProperty()
  category!: string;
  @ApiProperty()
  severity!: string;
  @ApiProperty()
  title!: string;
  @ApiPropertyOptional()
  description?: string | null;
  @ApiProperty()
  occurredAt!: string;
  @ApiProperty()
  status!: string;
  @ApiPropertyOptional()
  estimatedCostMinorUnits?: number | null;
  @ApiPropertyOptional()
  currency?: string | null;
  @ApiProperty()
  createdAt!: string;
}
