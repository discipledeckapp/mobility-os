import { RouteLoadingState } from '../../features/shared/route-state';

export default function MaintenanceLoading() {
  return (
    <RouteLoadingState
      description="Load the current maintenance queue, inspection pressure, and blocked vehicle states."
      eyebrow="Operations"
      summaryCount={4}
      tableRows={6}
      title="Maintenance and inspections"
    />
  );
}
