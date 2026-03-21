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
      description="Track subscription billing, verification wallet funding, and operational wallet context."
      eyebrow="Finance"
      error={error}
      heading="Unable to load wallet"
      reset={reset}
      title="Wallet"
    />
  );
}
