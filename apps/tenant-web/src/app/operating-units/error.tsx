'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function OperatingUnitsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Review operating units, linked fleets, and dispatch structure."
      eyebrow="Structure"
      error={error}
      heading="Unable to load operating units"
      reset={reset}
      title="Operating units"
    />
  );
}
