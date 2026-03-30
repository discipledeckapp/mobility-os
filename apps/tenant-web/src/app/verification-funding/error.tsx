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
      description="Track verification funding, available credit, and company-paid verification readiness."
      eyebrow="Verification Funding"
      error={error}
      heading="Unable to load verification funding"
      reset={reset}
      title="Verification funding"
    />
  );
}
