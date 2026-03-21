'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function FleetsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Review fleet structure, assignment-ready assets, and the operating hierarchy behind each fleet."
      eyebrow="Structure"
      error={error}
      heading="Unable to load fleets"
      reset={reset}
      title="Fleets"
    />
  );
}
