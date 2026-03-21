import { RouteLoadingState } from '../../features/shared/route-state';

export default function DriversLoading() {
  return (
    <RouteLoadingState
      description="Search and manage the organisation driver registry, then drill into each driver record for verification, review, assignment, and remittance context."
      eyebrow="Operators"
      summaryCount={3}
      tableRows={6}
      title="Drivers"
    />
  );
}
