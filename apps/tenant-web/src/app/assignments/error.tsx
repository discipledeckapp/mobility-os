'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function AssignmentsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Pair drivers and vehicles, then track assignment completion and cancellation."
      eyebrow="Operations"
      error={error}
      heading="Unable to load assignments"
      reset={reset}
      title="Assignments"
    />
  );
}
