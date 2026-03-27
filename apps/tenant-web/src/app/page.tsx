import { TenantDashboardShell } from '../features/dashboard/tenant-dashboard-shell';
import {
  getDashboardData,
} from '../features/dashboard/tenant-dashboard-data';
import { getTenantApiToken, getTenantMe, getTenantSession } from '../lib/api-core';

export default async function HomePage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const [dashboardData, tenant, session] = await Promise.all([
    getDashboardData(token),
    getTenantMe(token).catch(() => null),
    getTenantSession(token).catch(() => null),
  ]);

  return (
    <TenantDashboardShell
      organisationDisplayName={
        tenant?.displayName ?? session?.organisationDisplayName ?? tenant?.name ?? session?.tenantName ?? null
      }
      organisationLogoUrl={tenant?.logoUrl ?? session?.organisationLogoUrl ?? null}
      summary={dashboardData.summary}
      remittanceSummary={dashboardData.remittanceSummary}
      recentActivity={dashboardData.recentActivity}
      featureCards={dashboardData.featureCards}
      actionItems={dashboardData.actionItems}
      notes={dashboardData.notes}
      isEmpty={dashboardData.isEmpty}
    />
  );
}
