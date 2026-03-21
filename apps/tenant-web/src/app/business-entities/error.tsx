'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function BusinessEntitiesError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Review organisation legal entities, their operating units, and downstream fleet structure."
      eyebrow="Structure"
      error={error}
      heading="Unable to load business entities"
      reset={reset}
      title="Business entities"
    />
  );
}
