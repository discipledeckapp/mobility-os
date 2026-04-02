import { RouteLoadingState } from '../../features/shared/route-state';

export default function OperationsLoading() {
  return (
    <RouteLoadingState
      description="Loading alerts, recent operational activity, and the supporting evidence you may need next."
      eyebrow="Operations"
      summaryCount={3}
      tableRows={6}
      title="Operations"
    />
  );
}
