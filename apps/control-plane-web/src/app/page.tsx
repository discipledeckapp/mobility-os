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
} from '@mobility-os/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { ControlPlaneShell } from '../features/shared/control-plane-shell';
import {
  ControlPlaneDataNotice,
  ControlPlaneEmptyStateCard,
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
  ControlPlaneSectionShell,
} from '../features/shared/control-plane-page-patterns';
import { buildTenantLookup, getTenantLabel } from '../features/shared/tenant-lookup';
import {
  getGovernanceOversight,
  getOperationalOversight,
  listFeatureFlags,
  listInvoices,
  listPlatformWalletLedger,
  listPlatformWallets,
  listSubscriptions,
  listTenants,
} from '../lib/api-control-plane';
import { requirePlatformSession } from '../lib/require-platform-session';

function formatMoney(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active' || status === 'paid') return 'success';
  if (status === 'trialing' || status === 'prospect' || status === 'draft') return 'neutral';
  if (status === 'suspended' || status === 'open' || status === 'past_due') return 'warning';
  if (status === 'terminated' || status === 'void' || status === 'uncollectible') return 'danger';
  return 'neutral';
}

export default async function HomePage() {
  await connection();

  const token = await requirePlatformSession();
  const dataWarnings: string[] = [];
  const [
    tenantsResult,
    subscriptionsResult,
    invoicesResult,
    walletsResult,
    flagsResult,
    ledgerResult,
    operationsOverviewResult,
    governanceOverviewResult,
  ] = await Promise.allSettled([
    listTenants(token),
    listSubscriptions(token),
    listInvoices(token),
    listPlatformWallets(token),
    listFeatureFlags(token),
    listPlatformWalletLedger({ page: 1, limit: 8 }, token),
    getOperationalOversight(token),
    getGovernanceOversight(token),
  ]);

  const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
  const subscriptions = subscriptionsResult.status === 'fulfilled' ? subscriptionsResult.value : [];
  const invoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value : [];
  const wallets = walletsResult.status === 'fulfilled' ? walletsResult.value : [];
  const flags = flagsResult.status === 'fulfilled' ? flagsResult.value : [];
  const ledger = ledgerResult.status === 'fulfilled' ? ledgerResult.value : { data: [] };
  const operationsOverview =
    operationsOverviewResult.status === 'fulfilled' ? operationsOverviewResult.value : null;
  const governanceOverview =
    governanceOverviewResult.status === 'fulfilled' ? governanceOverviewResult.value : null;

  if (tenantsResult.status !== 'fulfilled') dataWarnings.push('Organisation registry could not be loaded.');
  if (subscriptionsResult.status !== 'fulfilled') dataWarnings.push('Subscription posture is temporarily unavailable.');
  if (invoicesResult.status !== 'fulfilled') dataWarnings.push('Invoice exposure could not be loaded.');
  if (walletsResult.status !== 'fulfilled') dataWarnings.push('Platform wallet balances could not be loaded.');
  if (flagsResult.status !== 'fulfilled') dataWarnings.push('Feature flag posture is temporarily unavailable.');
  if (ledgerResult.status !== 'fulfilled') dataWarnings.push('Recent platform wallet transactions could not be loaded.');
  if (operationsOverviewResult.status !== 'fulfilled') dataWarnings.push('Operations oversight is temporarily unavailable.');
  if (governanceOverviewResult.status !== 'fulfilled') dataWarnings.push('Governance oversight is temporarily unavailable.');

  const tenantLookup = buildTenantLookup(tenants);
  const atRiskSubscriptions = subscriptions.filter((item) =>
    ['past_due', 'suspended'].includes(item.status),
  );
  const invoicesNeedingAction = invoices.filter((invoice) =>
    ['open', 'uncollectible'].includes(invoice.status),
  );
  const walletsNeedingAttention = wallets.filter((wallet) => wallet.balanceMinorUnits <= 0);
  const enabledFlags = flags.filter((flag) => flag.isEnabled).length;
  const scopedOverrides = flags.reduce((sum, flag) => sum + flag.overrides.length, 0);
  const highestAttentionTenants = operationsOverview?.tenants.slice(0, 6) ?? [];
  const recentInvoices = invoicesNeedingAction.slice(0, 6);

  return (
    <ControlPlaneShell
      description="Platform staff workspace for tenant oversight, operational intervention, billing posture, and governance controls."
      eyebrow="Platform operations"
      title="Control plane dashboard"
    >
      <div className="space-y-6">
        {dataWarnings.length > 0 ? (
          <ControlPlaneDataNotice
            description={dataWarnings.join(' ')}
            title="Dashboard loaded with partial platform data"
          />
        ) : null}
        <ControlPlaneHeroPanel
          badges={[
            { label: `${tenants.length} organisations`, tone: 'neutral' },
            { label: `${atRiskSubscriptions.length} billing at risk`, tone: atRiskSubscriptions.length ? 'warning' : 'success' },
            { label: `${walletsNeedingAttention.length} wallets need review`, tone: walletsNeedingAttention.length ? 'warning' : 'success' },
          ]}
          description="Work the live platform queues from one place: who is at risk, what is blocked, where billing is exposed, and which governance issues need intervention before tenants escalate."
          eyebrow="Platform operator cockpit"
          title="See the tenants, risks, and interventions that need platform action now."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Activation blockers
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                {operationsOverview?.totals.driversAwaitingActivation ?? 0}
              </p>
              <p className="mt-1 text-sm text-slate-600">Drivers waiting on verification or support help.</p>
            </div>
            <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Privacy and notice pressure
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                {(governanceOverview?.privacy.totals.openRequests ?? 0) +
                  (governanceOverview?.notifications.totals.unreadNotifications ?? 0)}
              </p>
              <p className="mt-1 text-sm text-slate-600">Open privacy requests plus unread governance notices.</p>
            </div>
          </div>
        </ControlPlaneHeroPanel>

        <ControlPlaneMetricGrid columns={4}>
          <ControlPlaneMetricCard
            detail="Organisations currently operating normally."
            label="Active organisations"
            tone="success"
            value={tenants.filter((tenant) => tenant.status === 'active').length}
          />
          <ControlPlaneMetricCard
            detail={`${subscriptions.filter((item) => item.status === 'trialing').length} trialing · ${atRiskSubscriptions.length} at risk`}
            label="Subscription posture"
            tone={atRiskSubscriptions.length ? 'warning' : 'neutral'}
            value={subscriptions.length}
          />
          <ControlPlaneMetricCard
            detail={formatMoney(
              invoicesNeedingAction.reduce((sum, invoice) => sum + invoice.amountDueMinorUnits, 0),
              invoicesNeedingAction[0]?.currency ?? 'NGN',
            )}
            label="Invoice exposure"
            tone={invoicesNeedingAction.length ? 'warning' : 'success'}
            value={invoicesNeedingAction.length}
          />
          <ControlPlaneMetricCard
            detail={`${enabledFlags} enabled · ${scopedOverrides} scoped overrides`}
            label="Rollout controls"
            tone="neutral"
            value={flags.length}
          />
        </ControlPlaneMetricGrid>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <ControlPlaneSectionShell
            description="Prioritise the tenants whose support pressure is highest right now."
            helper={
              <Link href={'/operations' as Route}>
                <Button variant="secondary">Open operations queue</Button>
              </Link>
            }
            title="Tenants needing intervention"
          >
            {highestAttentionTenants.length === 0 ? (
              <ControlPlaneEmptyStateCard
                description="No cross-tenant operational attention is currently being reported."
                title="No intervention queue yet"
              />
            ) : (
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Attention</TableHead>
                      <TableHead>Activation</TableHead>
                      <TableHead>Ops risk</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highestAttentionTenants.map((tenant) => (
                      <TableRow key={tenant.tenantId}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                              href={`/tenants/${tenant.tenantId}`}
                            >
                              {tenant.tenantName}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {tenant.slug} · {tenant.country} · {tenant.tenantStatus}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone={tenant.attentionScore >= 16 ? 'danger' : tenant.attentionScore >= 6 ? 'warning' : 'neutral'}>
                            {tenant.attentionScore}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {tenant.verificationHealth.driversAwaitingActivation} blocked
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {tenant.riskSummary.atRiskAssignmentCount} assignments ·{' '}
                          {tenant.riskSummary.vehiclesAtRiskCount} vehicles
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/tenants/${tenant.tenantId}`}>
                            <Button variant="secondary">Open</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableViewport>
            )}
          </ControlPlaneSectionShell>

          <ControlPlaneSectionShell
            description="Jump directly into the surfaces platform staff use most often."
            title="Control surfaces"
          >
            <div className="grid gap-3">
              {[
                { href: '/tenants', label: 'Organisation oversight', detail: 'Lifecycle, plan posture, and owner context.' },
                { href: '/subscriptions', label: 'Subscriptions and invoices', detail: 'Billing pressure, renewals, and collections.' },
                { href: '/governance', label: 'Governance and notifications', detail: 'Privacy queue, notification load, and delivery posture.' },
                { href: '/operations', label: 'Operations queue', detail: 'Activation blockers, provider retries, and fleet risk across tenants.' },
              ].map((item) => (
                <Link
                  className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 px-4 py-3 transition hover:border-[var(--mobiris-primary-light)] hover:bg-blue-50/40"
                  href={item.href as Route}
                  key={item.href}
                >
                  <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </Link>
              ))}
            </div>
          </ControlPlaneSectionShell>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ControlPlaneSectionShell
            description="Open invoices and failed collections that need platform follow-up."
            helper={
              <Link href={'/billing-operations' as Route}>
                <Button variant="secondary">Open billing ops</Button>
              </Link>
            }
            title="Billing queue"
          >
            {recentInvoices.length === 0 ? (
              <ControlPlaneEmptyStateCard
                description="There are no open or uncollectible invoices right now."
                title="No billing queue"
              />
            ) : (
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount due</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((invoice) => {
                      const tenant = getTenantLabel(tenantLookup, invoice.tenantId);
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <Link
                                className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                                href={`/tenants/${invoice.tenantId}`}
                              >
                                {tenant.name}
                              </Link>
                              <p className="text-xs text-slate-500">{tenant.slug}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            {formatMoney(invoice.amountDueMinorUnits, invoice.currency)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString() : 'No due date'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableViewport>
            )}
          </ControlPlaneSectionShell>

          <ControlPlaneSectionShell
            description="Recent billing ledger movement across platform wallets."
            helper={
              <Link href={'/wallets' as Route}>
                <Button variant="secondary">Open wallets</Button>
              </Link>
            }
            title="Recent wallet ledger"
          >
            {ledger.data.length === 0 ? (
              <ControlPlaneEmptyStateCard
                description="Platform wallet entries will appear here once billing credits and debits are flowing."
                title="No wallet movement yet"
              />
            ) : (
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.data.map((entry) => {
                      const tenant = getTenantLabel(tenantLookup, entry.tenantId);
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <Link
                                className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                                href={`/tenants/${entry.tenantId}`}
                              >
                                {tenant.name}
                              </Link>
                              <p className="text-xs text-slate-500">{tenant.slug}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge tone={entry.type === 'credit' ? 'success' : 'warning'}>{entry.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            {formatMoney(entry.amountMinorUnits, entry.currency)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(entry.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableViewport>
            )}
          </ControlPlaneSectionShell>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
