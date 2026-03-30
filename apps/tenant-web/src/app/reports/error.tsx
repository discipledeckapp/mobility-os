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
      description="We could not load the latest operations insight queues right now."
      eyebrow="Insights"
      error={error}
      heading="Unable to load operations insights"
      reset={reset}
      title="Operations Insights"
    />
  );
}
