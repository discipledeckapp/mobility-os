import { RouteLoadingState } from '../../features/shared/route-state';

export default function ReportsLoading() {
  return (
    <RouteLoadingState
      description="Operational readiness and compliance visibility across drivers and vehicles."
      eyebrow="Reports"
      summaryCount={3}
      tableRows={6}
      title="Reports"
    />
  );
}
