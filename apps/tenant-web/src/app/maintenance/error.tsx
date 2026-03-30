'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function MaintenanceError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Review maintenance queue pressure, inspection holds, and blocked assets."
      eyebrow="Operations"
      error={error}
      heading="Unable to load maintenance and inspection queue"
      reset={reset}
      title="Maintenance and inspections"
    />
  );
}
