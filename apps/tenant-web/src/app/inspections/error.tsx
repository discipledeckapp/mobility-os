'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function InspectionsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Review inspection holds, recent inspection outcomes, and fleet inspection coverage."
      eyebrow="Operations"
      error={error}
      heading="Unable to load inspections"
      reset={reset}
      title="Inspections"
    />
  );
}
