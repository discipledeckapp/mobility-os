import { Injectable } from '@nestjs/common';
import type { ApiCoreTenantRecord } from '../tenants/api-core-tenants.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ApiCoreTenantsClient } from '../tenants/api-core-tenants.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ApiCoreReportsClient } from './api-core-reports.client';
import type {
  OperationsOverviewDto,
  OperationsTenantSummaryDto,
} from './dto/operations-overview.dto';

@Injectable()
export class OperationsService {
  constructor(
    private readonly apiCoreTenantsClient: ApiCoreTenantsClient,
    private readonly apiCoreReportsClient: ApiCoreReportsClient,
  ) {}

  private computeAttentionScore(summary: OperationsTenantSummaryDto): number {
    return (
      summary.verificationHealth.driversAwaitingActivation * 4 +
      summary.verificationHealth.pendingLicenceReviewCount * 5 +
      summary.verificationHealth.providerRetryRequiredCount * 4 +
      summary.verificationHealth.expiredLicencesCount * 5 +
      summary.verificationHealth.expiringLicencesSoonCount * 2 +
      summary.riskSummary.atRiskAssignmentCount * 3 +
      summary.riskSummary.vehiclesAtRiskCount * 2 +
      summary.riskSummary.criticalMaintenanceCount * 4
    );
  }

  private async buildTenantSummary(
    tenant: ApiCoreTenantRecord,
  ): Promise<OperationsTenantSummaryDto> {
    const summary = await this.apiCoreReportsClient.getTenantOperationalSummary(tenant.id);

    const tenantSummary: OperationsTenantSummaryDto = {
      tenantId: tenant.id,
      slug: tenant.slug,
      tenantName: tenant.name,
      country: tenant.country,
      tenantStatus: tenant.status,
      generatedAt: summary.generatedAt,
      attentionScore: 0,
      driverActivity: summary.driverActivity,
      verificationHealth: summary.verificationHealth,
      riskSummary: summary.riskSummary,
      topDriverIssues: summary.topDriverIssues,
      topVehicleIssues: summary.topVehicleIssues,
      topLicenceExpiries: summary.topLicenceExpiries,
    };

    tenantSummary.attentionScore = this.computeAttentionScore(tenantSummary);
    return tenantSummary;
  }

  async getTenantOperationalSummary(tenantId: string): Promise<OperationsTenantSummaryDto> {
    const tenant = await this.apiCoreTenantsClient.getTenant(tenantId);
    return this.buildTenantSummary(tenant);
  }

  async getOverview(): Promise<OperationsOverviewDto> {
    const tenants = await this.apiCoreTenantsClient.listTenants();
    const summaries = await Promise.all(tenants.map((tenant) => this.buildTenantSummary(tenant)));
    const ordered = summaries.sort((left, right) => right.attentionScore - left.attentionScore);

    return {
      generatedAt: new Date().toISOString(),
      totals: {
        tenantCount: ordered.length,
        tenantsNeedingAttention: ordered.filter((tenant) => tenant.attentionScore > 0).length,
        driversAwaitingActivation: ordered.reduce(
          (sum, tenant) => sum + tenant.verificationHealth.driversAwaitingActivation,
          0,
        ),
        pendingLicenceReviews: ordered.reduce(
          (sum, tenant) => sum + tenant.verificationHealth.pendingLicenceReviewCount,
          0,
        ),
        providerRetryRequired: ordered.reduce(
          (sum, tenant) => sum + tenant.verificationHealth.providerRetryRequiredCount,
          0,
        ),
        expiringLicencesSoon: ordered.reduce(
          (sum, tenant) => sum + tenant.verificationHealth.expiringLicencesSoonCount,
          0,
        ),
        expiredLicences: ordered.reduce(
          (sum, tenant) => sum + tenant.verificationHealth.expiredLicencesCount,
          0,
        ),
        atRiskAssignments: ordered.reduce(
          (sum, tenant) => sum + tenant.riskSummary.atRiskAssignmentCount,
          0,
        ),
        vehiclesAtRisk: ordered.reduce(
          (sum, tenant) => sum + tenant.riskSummary.vehiclesAtRiskCount,
          0,
        ),
        criticalMaintenanceCount: ordered.reduce(
          (sum, tenant) => sum + tenant.riskSummary.criticalMaintenanceCount,
          0,
        ),
      },
      tenants: ordered,
    };
  }
}
