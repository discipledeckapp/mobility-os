import { ApiProperty } from '@nestjs/swagger';

class OperationsTenantDriverIssueDto {
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

class OperationsTenantVehicleIssueDto {
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

class OperationsTenantLicenceExpiryDto {
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

class OperationsTenantDriverActivityDto {
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

class OperationsTenantVerificationHealthDto {
  @ApiProperty()
  driversAwaitingActivation!: number;

  @ApiProperty()
  pendingLicenceReviewCount!: number;

  @ApiProperty()
  providerRetryRequiredCount!: number;

  @ApiProperty()
  expiringLicencesSoonCount!: number;

  @ApiProperty()
  expiredLicencesCount!: number;
}

class OperationsTenantRiskSummaryDto {
  @ApiProperty()
  atRiskAssignmentCount!: number;

  @ApiProperty()
  vehiclesAtRiskCount!: number;

  @ApiProperty()
  criticalMaintenanceCount!: number;

  @ApiProperty()
  inspectionComplianceRate!: number;
}

export class OperationsTenantSummaryDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  tenantName!: string;

  @ApiProperty()
  country!: string;

  @ApiProperty()
  tenantStatus!: string;

  @ApiProperty()
  generatedAt!: string;

  @ApiProperty()
  attentionScore!: number;

  @ApiProperty({ type: OperationsTenantDriverActivityDto })
  driverActivity!: OperationsTenantDriverActivityDto;

  @ApiProperty({ type: OperationsTenantVerificationHealthDto })
  verificationHealth!: OperationsTenantVerificationHealthDto;

  @ApiProperty({ type: OperationsTenantRiskSummaryDto })
  riskSummary!: OperationsTenantRiskSummaryDto;

  @ApiProperty({ type: [OperationsTenantDriverIssueDto] })
  topDriverIssues!: OperationsTenantDriverIssueDto[];

  @ApiProperty({ type: [OperationsTenantVehicleIssueDto] })
  topVehicleIssues!: OperationsTenantVehicleIssueDto[];

  @ApiProperty({ type: [OperationsTenantLicenceExpiryDto] })
  topLicenceExpiries!: OperationsTenantLicenceExpiryDto[];
}

class OperationsOverviewTotalsDto {
  @ApiProperty()
  tenantCount!: number;

  @ApiProperty()
  tenantsNeedingAttention!: number;

  @ApiProperty()
  driversAwaitingActivation!: number;

  @ApiProperty()
  pendingLicenceReviews!: number;

  @ApiProperty()
  providerRetryRequired!: number;

  @ApiProperty()
  expiringLicencesSoon!: number;

  @ApiProperty()
  expiredLicences!: number;

  @ApiProperty()
  atRiskAssignments!: number;

  @ApiProperty()
  vehiclesAtRisk!: number;

  @ApiProperty()
  criticalMaintenanceCount!: number;
}

export class OperationsOverviewDto {
  @ApiProperty()
  generatedAt!: string;

  @ApiProperty({ type: OperationsOverviewTotalsDto })
  totals!: OperationsOverviewTotalsDto;

  @ApiProperty({ type: [OperationsTenantSummaryDto] })
  tenants!: OperationsTenantSummaryDto[];
}
