import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleResponseDto } from './vehicle-response.dto';

class VehicleValuationSummaryItemDto {
  @ApiProperty()
  valuationKind!: string;

  @ApiProperty()
  amountMinorUnits!: number;

  @ApiPropertyOptional()
  currency?: string | null;

  @ApiProperty()
  valuationDate!: string;

  @ApiPropertyOptional()
  source?: string | null;

  @ApiProperty()
  isCurrent!: boolean;
}

class VehicleAssignmentSummaryDto {
  @ApiProperty()
  totalAssignments!: number;

  @ApiProperty()
  activeAssignments!: number;

  @ApiPropertyOptional()
  latestAssignmentId?: string | null;

  @ApiPropertyOptional()
  latestAssignmentStatus?: string | null;

  @ApiPropertyOptional()
  latestAssignmentStartedAt?: Date | null;
}

class VehicleVinDecodeSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  decodedMake?: string | null;

  @ApiPropertyOptional()
  decodedModel?: string | null;

  @ApiPropertyOptional()
  decodedModelYear?: number | null;

  @ApiPropertyOptional()
  vehicleType?: string | null;

  @ApiPropertyOptional()
  bodyClass?: string | null;

  @ApiProperty()
  createdAt!: Date;
}

class VehicleEconomicsSummaryDto {
  @ApiPropertyOptional()
  acquisitionValueMinorUnits?: number | null;

  @ApiPropertyOptional()
  currentEstimatedValueMinorUnits?: number | null;

  @ApiPropertyOptional()
  valuationCurrency?: string | null;

  @ApiProperty()
  confirmedRevenueMinorUnits!: number;

  @ApiProperty()
  trackedExpenseMinorUnits!: number;

  @ApiProperty()
  profitMinorUnits!: number;

  @ApiProperty()
  recommendation!: string;
}

class VehicleMaintenanceDueSummaryDto {
  @ApiProperty()
  dueCount!: number;

  @ApiProperty()
  overdueCount!: number;

  @ApiPropertyOptional()
  nextDueAt?: string | null;

  @ApiPropertyOptional()
  nextDueOdometerKm?: number | null;
}

class VehicleInspectionTimelineItemDto {
  @ApiProperty()
  id!: string;
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
}

class VehicleMaintenanceScheduleItemDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  scheduleType!: string;
  @ApiProperty()
  isActive!: boolean;
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
}

class VehicleMaintenanceEventItemDto {
  @ApiProperty()
  id!: string;
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
}

class VehicleIncidentItemDto {
  @ApiProperty()
  id!: string;
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
}

export class VehicleDetailResponseDto extends VehicleResponseDto {
  @ApiProperty()
  fleetName!: string;

  @ApiProperty()
  operatingUnitName!: string;

  @ApiProperty()
  businessEntityName!: string;

  @ApiProperty({ type: [VehicleValuationSummaryItemDto] })
  valuations!: VehicleValuationSummaryItemDto[];

  @ApiProperty({ type: VehicleAssignmentSummaryDto })
  assignmentSummary!: VehicleAssignmentSummaryDto;

  @ApiProperty()
  maintenanceSummary!: string;

  @ApiProperty({ type: VehicleMaintenanceDueSummaryDto })
  maintenanceDue!: VehicleMaintenanceDueSummaryDto;

  @ApiProperty({ type: VehicleEconomicsSummaryDto })
  economics!: VehicleEconomicsSummaryDto;

  @ApiProperty({ type: [VehicleInspectionTimelineItemDto] })
  inspections!: VehicleInspectionTimelineItemDto[];

  @ApiProperty({ type: [VehicleMaintenanceScheduleItemDto] })
  maintenanceSchedules!: VehicleMaintenanceScheduleItemDto[];

  @ApiProperty({ type: [VehicleMaintenanceEventItemDto] })
  maintenanceEvents!: VehicleMaintenanceEventItemDto[];

  @ApiProperty({ type: [VehicleIncidentItemDto] })
  incidents!: VehicleIncidentItemDto[];

  @ApiPropertyOptional({ type: VehicleVinDecodeSummaryDto })
  latestVinDecode?: VehicleVinDecodeSummaryDto | null;
}
