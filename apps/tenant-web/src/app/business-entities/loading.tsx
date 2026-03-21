import { RouteLoadingState } from '../../features/shared/route-state';

export default function BusinessEntitiesLoading() {
  return (
    <RouteLoadingState
      description="Review organisation legal entities, their operating units, and downstream fleet structure."
      eyebrow="Structure"
      summaryCount={2}
      tableRows={5}
      title="Business entities"
    />
  );
}
