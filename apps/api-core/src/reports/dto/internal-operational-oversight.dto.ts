import { ApiProperty } from '@nestjs/swagger';

export class InternalOperationalDriverIssueDto {
  @ApiProperty()
  driverId!: string;

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
  remittanceRiskStatus?: string | null;

  @ApiProperty({ required: false })
  remittanceRiskReason?: string | null;

  @ApiProperty({ required: false })
  riskBand?: string | null;
}

export class InternalOperationalVehicleIssueDto {
  @ApiProperty()
  vehicleId!: string;

  @ApiProperty()
  primaryLabel!: string;

  @ApiProperty()
  fleetId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  maintenanceSummary!: string;

  @ApiProperty({ required: false })
  remittanceRiskStatus?: string | null;

  @ApiProperty({ required: false })
  remittanceRiskReason?: string | null;
}

export class InternalOperationalLicenceExpiryDto {
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

export class InternalOperationalDriverActivityDto {
  @ApiProperty()
  active!: number;

  @ApiProperty()
  inactive!: number;

  @ApiProperty()
  activeVerified!: number;

  @ApiProperty()
  activeUnverified!: number;

  @ApiProperty()
  onboardingPool!: number;
}

export class InternalOperationalVerificationHealthDto {
  @ApiProperty()
  driversAwaitingActivation!: number;

  @ApiProperty()
  licenceVerificationIssueCount!: number;

  @ApiProperty()
  providerRetryRequiredCount!: number;

  @ApiProperty()
  expiringLicencesSoonCount!: number;

  @ApiProperty()
  expiredLicencesCount!: number;
}

export class InternalOperationalRiskSummaryDto {
  @ApiProperty()
  atRiskAssignmentCount!: number;

  @ApiProperty()
  vehiclesAtRiskCount!: number;

  @ApiProperty()
  criticalMaintenanceCount!: number;

  @ApiProperty()
  inspectionComplianceRate!: number;
}

export class InternalOperationalTenantSummaryDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  generatedAt!: string;

  @ApiProperty({ type: InternalOperationalDriverActivityDto })
  driverActivity!: InternalOperationalDriverActivityDto;

  @ApiProperty({ type: InternalOperationalVerificationHealthDto })
  verificationHealth!: InternalOperationalVerificationHealthDto;

  @ApiProperty({ type: InternalOperationalRiskSummaryDto })
  riskSummary!: InternalOperationalRiskSummaryDto;

  @ApiProperty({ type: [InternalOperationalDriverIssueDto] })
  topDriverIssues!: InternalOperationalDriverIssueDto[];

  @ApiProperty({ type: [InternalOperationalVehicleIssueDto] })
  topVehicleIssues!: InternalOperationalVehicleIssueDto[];

  @ApiProperty({ type: [InternalOperationalLicenceExpiryDto] })
  topLicenceExpiries!: InternalOperationalLicenceExpiryDto[];
}
