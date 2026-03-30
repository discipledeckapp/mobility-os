import { RouteLoadingState } from '../../features/shared/route-state';

export default function AssignmentsLoading() {
  return (
    <RouteLoadingState
      description="Search, filter, and open assignment records across the organisation."
      eyebrow="Operations"
      summaryCount={4}
      tableRows={5}
      title="Assignments"
    />
  );
}
