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
      description="Operational readiness and compliance visibility across drivers and vehicles."
      eyebrow="Reports"
      error={error}
      heading="Unable to load reports"
      reset={reset}
      title="Reports"
    />
  );
}
