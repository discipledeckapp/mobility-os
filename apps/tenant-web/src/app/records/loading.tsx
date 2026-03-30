import { RouteLoadingState } from '../../features/shared/route-state';

export default function RecordsLoading() {
  return (
    <RouteLoadingState
      description="Load operational documents, disputes, and audit history."
      eyebrow="Operations"
      summaryCount={4}
      tableRows={6}
      title="Records"
    />
  );
}
