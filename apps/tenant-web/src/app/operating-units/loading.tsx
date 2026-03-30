import { RouteLoadingState } from '../../features/shared/route-state';

export default function OperatingUnitsLoading() {
  return (
    <RouteLoadingState
      description="Load operating units, dispatch coverage, and linked fleet structure."
      eyebrow="Structure"
      summaryCount={4}
      tableRows={6}
      title="Operating units"
    />
  );
}
