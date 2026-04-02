import { RouteLoadingState } from '../../features/shared/route-state';

export default function SubscriptionLoading() {
  return (
    <RouteLoadingState
      description="Load your current plan, usage, and upgrade options."
      eyebrow="Subscription"
      summaryCount={3}
      tableRows={5}
      title="Subscription"
    />
  );
}
