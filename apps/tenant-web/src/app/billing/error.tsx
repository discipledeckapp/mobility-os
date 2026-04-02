'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function BillingError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Load subscription payment methods, invoices, and receipts for your organisation."
      eyebrow="Billing"
      error={error}
      heading="Unable to load billing"
      reset={reset}
      title="Billing"
    />
  );
}
