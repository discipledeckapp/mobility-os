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
      description="Track verification wallet funding, available credit, and operational wallet context."
      eyebrow="Verification Wallet"
      error={error}
      heading="Unable to load verification wallet"
      reset={reset}
      title="Verification wallet"
    />
  );
}
