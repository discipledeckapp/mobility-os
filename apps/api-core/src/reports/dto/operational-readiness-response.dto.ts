import { ApiProperty } from '@nestjs/swagger';

export class DriverReadinessReportItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  fleetId!: string;

  @ApiProperty()
  activationReadiness!: string;

  @ApiProperty({ type: [String] })
  activationReadinessReasons!: string[];

  @ApiProperty()
  assignmentReadiness!: string;

  @ApiProperty({ required: false })
  approvedLicenceExpiresAt?: string | null;

  @ApiProperty({ required: false })
  lastAssignmentDate?: string | null;

  @ApiProperty({ required: false })
  riskBand?: string | null;

  @ApiProperty({ required: false })
  expectedRemittanceAmountMinorUnits?: number | null;

  @ApiProperty({ required: false })
  remittanceCurrency?: string | null;

  @ApiProperty({ required: false })
  nextRemittanceDueDate?: string | null;

  @ApiProperty({ required: false })
  remittanceRiskStatus?: string | null;

  @ApiProperty({ required: false })
  remittanceRiskReason?: string | null;
}

export class VehicleReadinessReportItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  primaryLabel!: string;

  @ApiProperty()
  fleetId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false })
  currentValuationMinorUnits?: number | null;

  @ApiProperty({ required: false })
  currentValuationCurrency?: string | null;

  @ApiProperty()
  maintenanceSummary!: string;

  @ApiProperty()
  lifecycleStage!: string;

  @ApiProperty({ required: false })
  remittanceRiskStatus?: string | null;

  @ApiProperty({ required: false })
  remittanceRiskReason?: string | null;
}

export class OperationalReadinessResponseDto {
  @ApiProperty({ type: [DriverReadinessReportItemDto] })
  drivers!: DriverReadinessReportItemDto[];

  @ApiProperty({ type: [VehicleReadinessReportItemDto] })
  vehicles!: VehicleReadinessReportItemDto[];
}

export class LicenceExpiryReportItemDto {
  @ApiProperty()
  driverId!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  fleetId!: string;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty()
  daysUntilExpiry!: number;
}
