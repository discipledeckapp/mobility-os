'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function ReportsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="We could not load the operations workspace right now."
      eyebrow="Operations"
      error={error}
      heading="Unable to load operations"
      reset={reset}
      title="Operations"
    />
  );
}
