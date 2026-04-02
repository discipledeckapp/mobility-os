import { Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  type TenantBillingPlanRecord,
  type TenantBillingSummaryRecord,
  getTenantMe,
  getTenantBillingSummary,
  listTenantBillingPlans,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';
import { SubscriptionManagementPanel } from './subscription-management-panel';

export default async function SubscriptionPage() {
  let billingSummary: TenantBillingSummaryRecord | null = null;
  let plans: TenantBillingPlanRecord[] = [];
  let billingError: string | null = null;
  let locale = 'en-US';

  try {
    const [tenant, billingResult, plansResult] = await Promise.all([
      getTenantMe(),
      getTenantBillingSummary(),
      listTenantBillingPlans(),
    ]);
    locale = getFormattingLocale(tenant.country);
    billingSummary = billingResult;
    plans = plansResult;
  } catch (error) {
    billingError =
      error instanceof Error
        ? error.message
        : 'Unable to load subscription details right now.';
  }

  return (
    <TenantAppShell
      description="See your plan, verification credit, transactions, and billing in one place."
      eyebrow="Billing & Subscription"
      title="Billing & Subscription"
    >
      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {billingError ? (
            <Text>{billingError}</Text>
          ) : !billingSummary ? (
            <Text>Subscription details are not available yet.</Text>
          ) : (
            <SubscriptionManagementPanel
              locale={locale}
              plans={plans}
              summary={billingSummary}
            />
          )}
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}
