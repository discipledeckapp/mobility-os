import { RouteLoadingState } from '../../features/shared/route-state';

export default function ReportsLoading() {
  return (
    <RouteLoadingState
      description="Loading the unified operations workspace."
      eyebrow="Operations"
      summaryCount={3}
      tableRows={6}
      title="Operations"
    />
  );
}
