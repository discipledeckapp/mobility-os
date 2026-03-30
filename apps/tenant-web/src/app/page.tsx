import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { TenantDashboardShell } from '../features/dashboard/tenant-dashboard-shell';
import {
  getDashboardData,
} from '../features/dashboard/tenant-dashboard-data';
import { getTenantApiToken, getTenantMe, getTenantSession } from '../lib/api-core';
import { getSelfServiceContinuationPath } from '../lib/auth';

export default async function HomePage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const session = await getTenantSession(token).catch(() => null);
  const continuationPath = getSelfServiceContinuationPath(session);

  if (continuationPath) {
    redirect(continuationPath as Route);
  }

  const [dashboardData, tenant] = await Promise.all([
    getDashboardData(token),
    getTenantMe(token).catch(() => null),
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
