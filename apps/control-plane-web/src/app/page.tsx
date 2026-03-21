import { ControlPlaneDashboard } from '../features/dashboard/control-plane-dashboard';
import { getControlPlaneFeatureCards } from '../features/dashboard/control-plane-dashboard-data';
import { listInvoices, listSubscriptions, listTenants } from '../lib/api-control-plane';

function formatMoney(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

export default async function HomePage() {
  const [tenants, subscriptions, invoices] = await Promise.all([
    listTenants(),
    listSubscriptions(),
    listInvoices(),
  ]);

  const activeTenants = tenants.filter((tenant) => tenant.status === 'active').length;
  const mrrMinorUnits = subscriptions
    .filter((subscription) => subscription.status === 'active')
    .reduce((sum, subscription) => sum + subscription.basePriceMinorUnits, 0);
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'open').length;
  const trialsExpiringSoon = subscriptions.filter((subscription) => {
    if (!subscription.trialEndsAt || subscription.status !== 'trialing') {
      return false;
    }
    const trialEndsAt = new Date(subscription.trialEndsAt).getTime();
    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
    return trialEndsAt >= now && trialEndsAt <= sevenDaysFromNow;
  }).length;

  return (
    <ControlPlaneDashboard
      featureCards={getControlPlaneFeatureCards()}
      summary={[
        {
          label: 'Active tenants',
          value: String(activeTenants),
          tone: 'success',
          detail: 'Organisations currently in active service across the platform.',
        },
        {
          label: 'MRR',
          value: formatMoney(mrrMinorUnits, subscriptions[0]?.currency ?? 'NGN'),
          tone: 'neutral',
          detail: 'Current monthly recurring revenue from active subscriptions.',
        },
        {
          label: 'Overdue invoices',
          value: String(overdueInvoices),
          tone: overdueInvoices > 0 ? 'warning' : 'success',
          detail: `Trials expiring in 7 days: ${trialsExpiringSoon}`,
        },
      ]}
    />
  );
}
