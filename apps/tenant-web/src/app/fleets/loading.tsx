import { RouteLoadingState } from '../../features/shared/route-state';

export default function FleetsLoading() {
  return (
    <RouteLoadingState
      description="Review fleet structure, assignment-ready assets, and the operating hierarchy behind each fleet."
      eyebrow="Structure"
      summaryCount={2}
      tableRows={5}
      title="Fleets"
    />
  );
}
