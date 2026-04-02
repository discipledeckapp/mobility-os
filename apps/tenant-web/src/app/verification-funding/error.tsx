'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function VerificationFundingError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Load available verification credit, recent usage, and funding controls."
      eyebrow="Verification Credit"
      error={error}
      heading="Unable to load verification credit"
      reset={reset}
      title="Verification Credit"
    />
  );
}
