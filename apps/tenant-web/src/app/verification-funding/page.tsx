import { Text } from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import { getBillingPageData } from '../../features/billing/billing-page-data';
import { VerificationCreditSurface } from '../../features/billing/billing-surfaces';

export default async function VerificationFundingPage() {
  const { billingSummary, locale, billingError } = await getBillingPageData();

  return (
    <TenantAppShell
      description="Check available verification credit, see recent usage, and fund the account when needed."
      eyebrow="Verification Credit"
      title="Verification Credit"
    >
      {billingError ? (
        <Text>{billingError}</Text>
      ) : !billingSummary ? (
        <Text>Verification credit details are not available yet.</Text>
      ) : (
        <VerificationCreditSurface locale={locale} summary={billingSummary} />
      )}
    </TenantAppShell>
  );
}
