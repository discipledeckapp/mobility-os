import { RouteLoadingState } from '../../features/shared/route-state';

export default function ReportsLoading() {
  return (
    <RouteLoadingState
      description="Loading remittance health, driver readiness, assignment utilization, and risk queues."
      eyebrow="Insights"
      summaryCount={3}
      tableRows={6}
      title="Operations Insights"
    />
  );
}
