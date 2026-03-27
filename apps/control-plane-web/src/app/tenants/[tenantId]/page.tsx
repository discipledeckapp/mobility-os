import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
  Text,
} from '@mobility-os/ui';
import { ControlPlaneShell } from '../../../features/shared/control-plane-shell';
import {
  getTenantDetail,
  getTenantPlatformWalletBalance,
  listFeatureFlags,
  listPlans,
  listTenantPlatformWalletEntries,
} from '../../../lib/api-control-plane';
import type {
  FeatureFlagRecord,
  PlatformWalletBalanceRecord,
} from '../../../lib/api-control-plane';
import { TenantFeatureRolloutCard } from './tenant-feature-rollout-card';
import { TenantPlanCard } from './tenant-plan-card';
import { TransitionTenantCard } from './transition-tenant-card';
import { TenantWalletCard } from './tenant-wallet-card';

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active' || status === 'paid') return 'success';
  if (status === 'suspended' || status === 'past_due' || status === 'open') return 'warning';
  if (status === 'terminated' || status === 'uncollectible') return 'danger';
  return 'neutral';
}

function resolveFeatureSource(
  flag: FeatureFlagRecord,
  tenantId: string,
  planTier?: string | null,
  countryCode?: string | null,
): {
  effectiveEnabled: boolean;
  source: 'tenant_override' | 'plan_default' | 'country_default' | 'global_default';
  tenantOverrideId?: string;
} {
  const tenantOverride = flag.overrides.find((override) => override.tenantId === tenantId);
  if (tenantOverride) {
    return {
      effectiveEnabled: tenantOverride.isEnabled,
      source: 'tenant_override',
      tenantOverrideId: tenantOverride.id,
    };
  }

  const planOverride = planTier
    ? flag.overrides.find((override) => override.planTier === planTier)
    : null;
  if (planOverride) {
    return {
      effectiveEnabled: planOverride.isEnabled,
      source: 'plan_default',
    };
  }

  const countryOverride = countryCode
    ? flag.overrides.find((override) => override.countryCode === countryCode)
    : null;
  if (countryOverride) {
    return {
      effectiveEnabled: countryOverride.isEnabled,
      source: 'country_default',
    };
  }

  return {
    effectiveEnabled: flag.isEnabled,
    source: 'global_default',
  };
}

function formatCurrency(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const [tenant, plans, flags] = await Promise.all([
    getTenantDetail(tenantId),
    listPlans().catch(() => []),
    listFeatureFlags().catch(() => []),
  ]);

  let walletBalance: PlatformWalletBalanceRecord | null = null;
  let walletEntries: Awaited<ReturnType<typeof listTenantPlatformWalletEntries>> = [];
  try {
    [walletBalance, walletEntries] = await Promise.all([
      getTenantPlatformWalletBalance(tenantId),
      listTenantPlatformWalletEntries(tenantId),
    ]);
  } catch {
    walletBalance = null;
    walletEntries = [];
  }

  const effectiveFlags = flags.map((flag) => ({
    key: flag.key,
    ...(flag.description !== undefined ? { description: flag.description } : {}),
    ...resolveFeatureSource(flag, tenant.id, tenant.subscription?.planTier, tenant.country),
  }));
  const openInvoices = tenant.invoices.filter((invoice) => invoice.status === 'open');

  return (
    <ControlPlaneShell
      description="Operate the organisation governance record directly from the control plane: plan posture, lifecycle, wallet, invoices, and rollout."
      eyebrow="Organisation governance"
      title={tenant.name}
    >
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <Card className="border-slate-200/80">
            <CardHeader>
              <Text tone="muted">Lifecycle</Text>
              <CardTitle>{tenant.status}</CardTitle>
              <Badge tone={statusTone(tenant.status)}>{tenant.status}</Badge>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <Text tone="muted">Subscription posture</Text>
              <CardTitle>{tenant.subscription?.status ?? 'missing'}</CardTitle>
              <Text tone="muted">
                {tenant.subscription
                  ? `${tenant.subscription.planName} · ${tenant.subscription.planTier}`
                  : 'Assign a plan to attach billing posture.'}
              </Text>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <Text tone="muted">Invoices needing action</Text>
              <CardTitle>{openInvoices.length}</CardTitle>
              <Text tone="muted">
                {formatCurrency(
                  openInvoices.reduce((sum, invoice) => sum + invoice.amountDueMinorUnits, 0),
                  openInvoices[0]?.currency ?? tenant.subscription?.currency ?? 'NGN',
                )}{' '}
                outstanding
              </Text>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <Text tone="muted">Platform wallet</Text>
              <CardTitle>
                {walletBalance
                  ? formatCurrency(walletBalance.balanceMinorUnits, walletBalance.currency)
                  : 'Unavailable'}
              </CardTitle>
              <Text tone="muted">
                {walletEntries.length} ledger entries recorded for platform billing posture.
              </Text>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Text tone="muted">Organisation name</Text>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{tenant.name}</p>
                </div>
                <div>
                  <Text tone="muted">Slug</Text>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{tenant.slug}</p>
                </div>
                <div>
                  <Text tone="muted">Country</Text>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{tenant.country}</p>
                </div>
                <div>
                  <Text tone="muted">Created</Text>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <TenantPlanCard plans={plans} tenant={tenant} />

            <Card>
              <CardHeader>
                <CardTitle>Invoice posture</CardTitle>
              </CardHeader>
              <CardContent>
                <TableViewport>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount due</TableHead>
                        <TableHead>Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenant.invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.id}</TableCell>
                          <TableCell>
                            <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(invoice.amountDueMinorUnits, invoice.currency)}</TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(invoice.periodStart).toLocaleDateString()} to{' '}
                            {new Date(invoice.periodEnd).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableViewport>
                {tenant.invoices.length === 0 ? (
                  <Text className="pt-4">No invoices have been recorded for this organisation yet.</Text>
                ) : null}
              </CardContent>
            </Card>

            <TenantWalletCard tenantId={tenant.id} walletBalance={walletBalance} />

            <Card>
              <CardHeader>
                <CardTitle>Platform wallet ledger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {walletEntries.length === 0 ? (
                  <Text>No platform wallet entries recorded for this organisation yet.</Text>
                ) : (
                  walletEntries.slice(0, 8).map((entry) => (
                    <div className="rounded-2xl border border-slate-200 px-4 py-3" key={entry.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {entry.referenceType ?? 'manual_adjustment'}
                          </p>
                          <Text tone="muted">
                            {entry.description ?? 'No description'} · {new Date(entry.createdAt).toLocaleString()}
                          </Text>
                        </div>
                        <Badge tone={entry.type === 'credit' ? 'success' : 'warning'}>
                          {formatCurrency(entry.amountMinorUnits, entry.currency)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <TransitionTenantCard tenantId={tenant.id} currentStatus={tenant.status} />
            <TenantFeatureRolloutCard effectiveFlags={effectiveFlags} tenantId={tenant.id} />

            <Card>
              <CardHeader>
                <CardTitle>Lifecycle activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tenant.lifecycleEvents.length === 0 ? (
                  <Text>No lifecycle events recorded yet.</Text>
                ) : (
                  tenant.lifecycleEvents.map((event) => (
                    <div className="rounded-2xl border border-slate-200 px-4 py-3" key={event.id}>
                      <p className="text-sm font-semibold text-slate-900">
                        {event.fromStatus ?? 'Unknown'} → {event.toStatus}
                      </p>
                      <Text tone="muted">
                        {new Date(event.occurredAt).toLocaleString()}
                        {event.reason ? ` · ${event.reason}` : ''}
                      </Text>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Governance notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Text tone="muted">
                  This page is intentionally platform-scoped. It manages control-plane lifecycle,
                  plan, billing, wallet, and rollout posture without leaking into tenant daily operations.
                </Text>
                <Text tone="muted">
                  Owner/admin references are not yet exposed by the control-plane tenant contract.
                </Text>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
