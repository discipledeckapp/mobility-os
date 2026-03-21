import { RouteLoadingState } from '../features/shared/route-state';

export default function DashboardLoading() {
  return (
    <RouteLoadingState
      description="Fleet and driver operations."
      eyebrow="Operations"
      summaryCount={3}
      tableRows={5}
      title="Dashboard"
    />
  );
}
