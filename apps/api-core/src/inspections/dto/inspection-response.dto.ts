import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InspectionResultResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  checklistItemId!: string;

  @ApiProperty()
  result!: string;

  @ApiPropertyOptional()
  notes?: string | null;
}

export class InspectionScoreResponseDto {
  @ApiProperty()
  score!: number;

  @ApiProperty()
  riskLevel!: string;
}

export class InspectionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  vehicleId!: string;

  @ApiProperty()
  templateId!: string;

  @ApiProperty()
  inspectionType!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  summary?: string | null;

  @ApiPropertyOptional()
  odometerKm?: number | null;

  @ApiProperty()
  startedAt!: string;

  @ApiPropertyOptional()
  submittedAt?: string | null;

  @ApiPropertyOptional()
  reviewedAt?: string | null;

  @ApiProperty({ type: [InspectionResultResponseDto] })
  results!: InspectionResultResponseDto[];

  @ApiPropertyOptional({ type: InspectionScoreResponseDto })
  latestScore?: InspectionScoreResponseDto | null;
}
