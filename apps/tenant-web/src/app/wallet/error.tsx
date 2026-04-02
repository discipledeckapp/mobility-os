'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function WalletError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="This legacy wallet route now points to verification credit."
      eyebrow="Verification Credit"
      error={error}
      heading="Unable to open verification credit"
      reset={reset}
      title="Verification Credit"
    />
  );
}
