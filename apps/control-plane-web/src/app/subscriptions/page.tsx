import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
  Text,
} from '@mobility-os/ui';
import Link from 'next/link';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import {
  ControlPlaneDataNotice,
  ControlPlaneEmptyStateCard,
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
  ControlPlaneSectionShell,
  ControlPlaneToolbarPanel,
} from '../../features/shared/control-plane-page-patterns';
import { buildTenantLookup, getTenantLabel } from '../../features/shared/tenant-lookup';
import { getPlatformApiToken, listInvoices, listSubscriptions, listTenants } from '../../lib/api-control-plane';

function formatCurrency(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

type SubscriptionsPageProps = {
  searchParams?: Promise<{
    plan?: string;
    status?: string;
  }>;
};

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const params = (await searchParams) ?? {};
  const token = await getPlatformApiToken().catch(() => undefined);
  const dataWarnings: string[] = [];
  const [subscriptionsResult, invoicesResult, tenantsResult] = token
    ? await Promise.allSettled([listSubscriptions(token), listInvoices(token), listTenants(token)])
    : await Promise.allSettled([Promise.resolve([]), Promise.resolve([]), Promise.resolve([])]);
  const subscriptions = subscriptionsResult.status === 'fulfilled' ? subscriptionsResult.value : [];
  const invoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value : [];
  const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
  if (!token) dataWarnings.push('Your platform session could not be read on this request.');
  if (subscriptionsResult.status !== 'fulfilled') dataWarnings.push('Subscription registry is temporarily unavailable.');
  if (invoicesResult.status !== 'fulfilled') dataWarnings.push('Invoice exposure could not be loaded.');
  if (tenantsResult.status !== 'fulfilled') dataWarnings.push('Organisation labels could not be resolved.');
  const tenantLookup = buildTenantLookup(tenants);
  const planFilter = params.plan?.trim().toLowerCase() ?? '';
  const statusFilter = params.status?.trim().toLowerCase() ?? '';
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesPlan = !planFilter || subscription.planTier.toLowerCase() === planFilter;
    const matchesStatus = !statusFilter || subscription.status.toLowerCase() === statusFilter;
    return matchesPlan && matchesStatus;
  });
  const availablePlanTiers = Array.from(new Set(subscriptions.map((subscription) => subscription.planTier)));

  const activeCount = subscriptions.filter((subscription) => subscription.status === 'active').length;
  const trialingCount = subscriptions.filter((subscription) => subscription.status === 'trialing').length;
  const atRiskCount = subscriptions.filter((subscription) =>
    ['past_due', 'suspended'].includes(subscription.status),
  ).length;
  const endingSoonCount = subscriptions.filter((subscription) => subscription.cancelAtPeriodEnd).length;
  const openInvoiceTotal = invoices
    .filter((invoice) => invoice.status === 'open')
    .reduce((sum, invoice) => sum + invoice.amountDueMinorUnits, 0);

  return (
    <ControlPlaneShell
      description="Review organisation subscription posture, plan shifts, invoice exposure, and renewal risk from one platform-admin surface."
      eyebrow="Billing oversight"
      title="Subscriptions"
    >
      <div className="space-y-6">
        {dataWarnings.length > 0 ? (
          <ControlPlaneDataNotice
            description={dataWarnings.join(' ')}
            title="Subscriptions loaded with partial billing data"
          />
        ) : null}
        <ControlPlaneHeroPanel
          badges={[
            { label: `${activeCount} active`, tone: 'success' },
            { label: `${trialingCount} trialing`, tone: 'neutral' },
            { label: `${atRiskCount} at risk`, tone: atRiskCount ? 'warning' : 'success' },
          ]}
          description="This is the platform subscription registry, not a tenant billing page. Use it to spot renewals, grace-period risk, and tenants whose plan posture needs intervention."
          eyebrow="Subscription governance"
          title="Track the organisations that are trialing, active, ending soon, or drifting into billing risk."
        />

        <ControlPlaneMetricGrid columns={4}>
          <ControlPlaneMetricCard detail="Currently paying and within normal posture." label="Active" tone="success" value={activeCount} />
          <ControlPlaneMetricCard detail="Still in assisted conversion or onboarding." label="Trialing" tone="neutral" value={trialingCount} />
          <ControlPlaneMetricCard detail="Past-due or suspended subscriptions needing action." label="At risk" tone={atRiskCount ? 'warning' : 'success'} value={atRiskCount} />
          <ControlPlaneMetricCard detail={formatCurrency(openInvoiceTotal, invoices[0]?.currency ?? 'NGN')} label="Open exposure" tone={openInvoiceTotal > 0 ? 'warning' : 'success'} value={endingSoonCount} />
        </ControlPlaneMetricGrid>

        <ControlPlaneSectionShell
          description="Filter the platform subscription registry by plan tier or lifecycle status."
          title="Subscription registry"
        >
          <ControlPlaneToolbarPanel>
            <form className="flex flex-wrap gap-3" method="get">
              <select
                className="rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
                defaultValue={params.plan ?? ''}
                name="plan"
              >
                <option value="">All plans</option>
                {availablePlanTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              <select
                className="rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
                defaultValue={params.status ?? ''}
                name="status"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past due</option>
                <option value="suspended">Suspended</option>
                <option value="terminated">Terminated</option>
              </select>
              <Button type="submit" variant="secondary">
                Apply
              </Button>
            </form>
          </ControlPlaneToolbarPanel>

          <div className="mt-4">
            {filteredSubscriptions.length === 0 ? (
              <ControlPlaneEmptyStateCard
                description="No subscriptions match the current filters."
                title="Nothing in this billing slice"
              />
            ) : (
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current period</TableHead>
                      <TableHead>Renewal posture</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => {
                      const tenant = getTenantLabel(tenantLookup, subscription.tenantId);
                      return (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <Link
                                className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                                href={`/tenants/${subscription.tenantId}`}
                              >
                                {tenant.name}
                              </Link>
                              <p className="text-xs text-slate-500">
                                {tenant.slug} · {tenant.country} · {tenant.status}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{subscription.planName}</p>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                {subscription.planTier} · {subscription.currency}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              tone={
                                subscription.status === 'active'
                                  ? 'success'
                                  : subscription.status === 'trialing'
                                    ? 'neutral'
                                    : ['past_due', 'suspended'].includes(subscription.status)
                                      ? 'warning'
                                      : 'danger'
                              }
                            >
                              {subscription.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(subscription.currentPeriodStart).toLocaleDateString()} to{' '}
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {subscription.cancelAtPeriodEnd ? (
                              <Badge tone="warning">Ending at period close</Badge>
                            ) : (
                              <Badge tone="success">Continuing</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableViewport>
            )}
          </div>

          <div className="mt-4">
            <Text tone="muted">
              {filteredSubscriptions.length} of {subscriptions.length} subscriptions shown.
            </Text>
          </div>
        </ControlPlaneSectionShell>
      </div>
    </ControlPlaneShell>
  );
}
