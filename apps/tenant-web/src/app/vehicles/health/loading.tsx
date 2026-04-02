import { RouteLoadingState } from '../../../features/shared/route-state';

export default function VehicleHealthLoading() {
  return (
    <RouteLoadingState
      description="Loading vehicles needing attention, inspection pressure, and maintenance queue activity."
      eyebrow="Vehicles"
      summaryCount={4}
      tableRows={6}
      title="Vehicle Health"
    />
  );
}
