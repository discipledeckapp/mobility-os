import { RouteLoadingState } from '../../features/shared/route-state';

export default function InspectionsLoading() {
  return (
    <RouteLoadingState
      description="Loading the inspection queue, recent review outcomes, and vehicles that are still blocked from service."
      eyebrow="Operations"
      summaryCount={4}
      tableRows={6}
      title="Inspections"
    />
  );
}
