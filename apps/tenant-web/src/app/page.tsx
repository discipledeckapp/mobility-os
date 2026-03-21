import { TenantDashboardShell } from '../features/dashboard/tenant-dashboard-shell';
import {
  getDashboardData,
} from '../features/dashboard/tenant-dashboard-data';

export default async function HomePage() {
  const dashboardData = await getDashboardData();

  return (
    <TenantDashboardShell
      summary={dashboardData.summary}
      remittanceSummary={dashboardData.remittanceSummary}
      recentActivity={dashboardData.recentActivity}
      featureCards={dashboardData.featureCards}
      notes={dashboardData.notes}
      isEmpty={dashboardData.isEmpty}
    />
  );
}
