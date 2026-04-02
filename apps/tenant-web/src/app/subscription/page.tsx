import { Text } from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import { getBillingPageData } from '../../features/billing/billing-page-data';
import { SubscriptionDecisionSurface } from '../../features/billing/billing-surfaces';

export default async function SubscriptionPage() {
  const { billingSummary, plans, locale, billingError } = await getBillingPageData();

  return (
    <TenantAppShell
      description="See your current plan, usage, and upgrade options without billing or funding noise."
      eyebrow="Subscription"
      title="Subscription"
    >
      {billingError ? (
        <Text>{billingError}</Text>
      ) : !billingSummary ? (
        <Text>Subscription details are not available yet.</Text>
      ) : (
        <SubscriptionDecisionSurface locale={locale} plans={plans} summary={billingSummary} />
      )}
    </TenantAppShell>
  );
}
