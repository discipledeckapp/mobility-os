import { RouteLoadingState } from '../../features/shared/route-state';

export default function VehiclesLoading() {
  return (
    <RouteLoadingState
      description="Vehicle onboarding, fleet assignment visibility, and status control."
      eyebrow="Assets"
      summaryCount={3}
      tableRows={6}
      title="Vehicles"
    />
  );
}
