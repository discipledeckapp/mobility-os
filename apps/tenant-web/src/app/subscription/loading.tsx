import { RouteLoadingState } from '../../features/shared/route-state';

export default function SubscriptionLoading() {
  return (
    <RouteLoadingState
      description="Track plan status, subscription invoices, and usage limits for your organisation."
      eyebrow="Subscription"
      summaryCount={3}
      tableRows={5}
      title="Plan and limits"
    />
  );
}
