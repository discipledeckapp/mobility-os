import { Text } from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import { getBillingPageData } from '../../features/billing/billing-page-data';
import { BillingOperationsSurface } from '../../features/billing/billing-surfaces';

export default async function BillingPage() {
  const { billingSummary, locale, billingError } = await getBillingPageData();

  return (
    <TenantAppShell
      description="Manage subscription payment methods, invoices, and receipts in one billing workflow."
      eyebrow="Billing"
      title="Billing"
    >
      {billingError ? (
        <Text>{billingError}</Text>
      ) : !billingSummary ? (
        <Text>Billing details are not available yet.</Text>
      ) : (
        <BillingOperationsSurface locale={locale} summary={billingSummary} />
      )}
    </TenantAppShell>
  );
}
