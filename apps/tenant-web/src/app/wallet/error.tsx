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
      description="Review operational wallet balances and ledger activity for the selected business entity."
      eyebrow="Operational Finance"
      error={error}
      heading="Unable to load operational wallet"
      reset={reset}
      title="Operational wallet"
    />
  );
}
