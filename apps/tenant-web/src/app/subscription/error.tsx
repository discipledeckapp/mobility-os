'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function SubscriptionError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Track plan status, subscription invoices, and usage limits for your organisation."
      eyebrow="Subscription"
      error={error}
      heading="Unable to load plan and limits"
      reset={reset}
      title="Plan and limits"
    />
  );
}
