import { RouteLoadingState } from '../../features/shared/route-state';

export default function BillingLoading() {
  return (
    <RouteLoadingState
      description="Load subscription payment methods, invoices, and receipts for your organisation."
      eyebrow="Billing"
      summaryCount={3}
      tableRows={5}
      title="Billing"
    />
  );
}
