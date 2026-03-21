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

  @ApiPropertyOptional({ type: VehicleVinDecodeSummaryDto })
  latestVinDecode?: VehicleVinDecodeSummaryDto | null;
}
