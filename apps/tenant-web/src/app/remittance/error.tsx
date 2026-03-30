'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function RemittanceError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Daily collections recording and reconciliation for transport operators."
      eyebrow="Collections"
      error={error}
      heading="Unable to load remittance"
      reset={reset}
      title="Remittance"
    />
  );
}
