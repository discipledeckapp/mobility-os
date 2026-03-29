import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
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
import type { Route } from 'next';
import Link from 'next/link';
import { ControlPlaneShell } from '../features/shared/control-plane-shell';
import {
  getGovernanceOversight,
  getOperationalOversight,
  getPlatformApiToken,
  listFeatureFlags,
  listInvoices,
  listPlatformWalletLedger,
  listPlatformWallets,
  listSubscriptions,
  listTenants,
} from '../lib/api-control-plane';

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
  const token = await getPlatformApiToken().catch(() => undefined);
  const [tenants, subscriptions, invoices, wallets, flags, ledger] = await Promise.all([
    listTenants(token),
    listSubscriptions(token),
    listInvoices(token),
    listPlatformWallets(token),
    listFeatureFlags(token),
    listPlatformWalletLedger({ page: 1, limit: 8 }, token),
  ]);
  const operationsOverview = await getOperationalOversight(token).catch(() => null);
  const governanceOverview = await getGovernanceOversight(token).catch(() => null);

  const tenantStatusCounts = tenants.reduce<Record<string, number>>((acc, tenant) => {
    acc[tenant.status] = (acc[tenant.status] ?? 0) + 1;
    return acc;
  }, {});
  const subscriptionStatusCounts = subscriptions.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
  const invoicesNeedingAction = invoices.filter((invoice) =>
    ['open', 'uncollectible'].includes(invoice.status),
  );
  const walletsNeedingAttention = wallets.filter((wallet) => wallet.balanceMinorUnits <= 0);
  const enabledFlags = flags.filter((flag) => flag.isEnabled).length;
  const scopedOverrides = flags.reduce((sum, flag) => sum + flag.overrides.length, 0);

  return (
    <ControlPlaneShell
      description="Run tenant governance, plan posture, wallet oversight, rollout controls, and staff access from one real internal console."
      eyebrow="Platform operations"
      title="Control plane dashboard"
    >
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Active tenants</CardDescription>
              <CardTitle>{tenantStatusCounts.active ?? 0}</CardTitle>
              <Text tone="muted">Platform organisations currently operating normally.</Text>
            </CardHeader>
            <CardContent>
              <Link href="/tenants">
                <Button variant="secondary">Open organisations</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Subscription posture</CardDescription>
              <CardTitle>{subscriptions.length}</CardTitle>
              <Text tone="muted">
                {subscriptionStatusCounts.trialing ?? 0} trialing ·{' '}
                {subscriptionStatusCounts.active ?? 0} active ·{' '}
                {(subscriptionStatusCounts.suspended ?? 0) +
                  (subscriptionStatusCounts.past_due ?? 0)}{' '}
                at risk
              </Text>
            </CardHeader>
            <CardContent>
              <Link href="/subscriptions">
                <Button variant="secondary">Open subscriptions</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Invoices needing action</CardDescription>
              <CardTitle>{invoicesNeedingAction.length}</CardTitle>
              <Text tone="muted">
                {formatMoney(
                  invoicesNeedingAction.reduce(
                    (sum, invoice) => sum + invoice.amountDueMinorUnits,
                    0,
                  ),
                  invoicesNeedingAction[0]?.currency ?? 'NGN',
                )}{' '}
                outstanding
              </Text>
            </CardHeader>
            <CardContent>
              <Link href="/billing-operations">
                <Button variant="secondary">Run billing ops</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Wallets needing attention</CardDescription>
              <CardTitle>{walletsNeedingAttention.length}</CardTitle>
              <Text tone="muted">
                {wallets.length - walletsNeedingAttention.length} funded ·{' '}
                {walletsNeedingAttention.length} need review
              </Text>
            </CardHeader>
            <CardContent>
              <Link href="/platform-wallets">
                <Button variant="secondary">Open platform wallets</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {operationsOverview ? (
          <div className="grid gap-4 xl:grid-cols-4">
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Activation blockers</CardDescription>
                <CardTitle>{operationsOverview.totals.driversAwaitingActivation}</CardTitle>
                <Text tone="muted">
                  Drivers waiting on verification, documents, guarantor, or activation readiness.
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Licence review queue</CardDescription>
                <CardTitle>{operationsOverview.totals.pendingLicenceReviews}</CardTitle>
                <Text tone="muted">
                  {operationsOverview.totals.providerRetryRequired} provider retry cases still need
                  support visibility.
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>At-risk operations</CardDescription>
                <CardTitle>{operationsOverview.totals.atRiskAssignments}</CardTitle>
                <Text tone="muted">
                  {operationsOverview.totals.vehiclesAtRisk} vehicles at risk across tenants.
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Expiry pressure</CardDescription>
                <CardTitle>
                  {operationsOverview.totals.expiredLicences +
                    operationsOverview.totals.expiringLicencesSoon}
                </CardTitle>
                <Text tone="muted">
                  {operationsOverview.totals.expiredLicences} expired ·{' '}
                  {operationsOverview.totals.expiringLicencesSoon} due soon
                </Text>
              </CardHeader>
              <CardContent>
                <Link href={'/operations' as Route}>
                  <Button variant="secondary">Open operations queue</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {governanceOverview ? (
          <div className="grid gap-4 xl:grid-cols-4">
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Privacy requests</CardDescription>
                <CardTitle>
                  {governanceOverview.privacy.totals.openRequests +
                    governanceOverview.privacy.totals.pendingReviewRequests}
                </CardTitle>
                <Text tone="muted">
                  {governanceOverview.privacy.totals.closedRequests} closed recently across tenant
                  privacy workflows.
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Consent activity</CardDescription>
                <CardTitle>{governanceOverview.privacy.totals.consentEventsLast30Days}</CardTitle>
                <Text tone="muted">
                  {governanceOverview.privacy.totals.tenantsWithOpenPrivacyRequests} tenants with
                  active privacy requests.
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Unread notifications</CardDescription>
                <CardTitle>{governanceOverview.notifications.totals.unreadNotifications}</CardTitle>
                <Text tone="muted">
                  {governanceOverview.notifications.totals.notificationsLast30Days} notifications
                  sent in the last 30 days.
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Push delivery posture</CardDescription>
                <CardTitle>{governanceOverview.notifications.totals.pushDevices}</CardTitle>
                <Text tone="muted">
                  {governanceOverview.notifications.totals.pushEnabledUsers} push-enabled users are
                  currently reachable.
                </Text>
              </CardHeader>
              <CardContent>
                <Link href={'/governance' as Route}>
                  <Button variant="secondary">Open governance</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle>Tenants by lifecycle status</CardTitle>
              <CardDescription>
                Real platform posture across prospect, trialing, active, suspended, and terminated
                organisations.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {['prospect', 'trialing', 'active', 'suspended', 'terminated', 'archived'].map(
                (status) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    key={status}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge tone={statusTone(status)}>{status}</Badge>
                      <p className="text-xl font-semibold text-slate-900">
                        {tenantStatusCounts[status] ?? 0}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle>Feature rollout summary</CardTitle>
              <CardDescription>
                Track how much of the platform is running on global defaults versus scoped
                overrides.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <Text tone="muted">Flags enabled globally</Text>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{enabledFlags}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <Text tone="muted">Scoped overrides</Text>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{scopedOverrides}</p>
              </div>
              <Link href="/feature-flags">
                <Button variant="secondary">Open feature flags</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle>Invoices needing action</CardTitle>
              <CardDescription>
                Use billing operations for open or recoverability-risk invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount due</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesNeedingAction.slice(0, 6).map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Link
                            className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                            href={`/tenants/${invoice.tenantId}`}
                          >
                            {invoice.tenantId}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {formatMoney(invoice.amountDueMinorUnits, invoice.currency)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(invoice.periodStart).toLocaleDateString()} to{' '}
                          {new Date(invoice.periodEnd).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableViewport>
              {invoicesNeedingAction.length === 0 ? (
                <Text className="pt-4">No invoices currently need staff action.</Text>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle>Recent platform actions</CardTitle>
              <CardDescription>
                Most recent platform wallet ledger activity across organisations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ledger.data.map((entry) => (
                <div className="rounded-2xl border border-slate-200 px-4 py-3" key={entry.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Link
                        className="text-sm font-semibold text-slate-900 hover:text-[var(--mobiris-primary)]"
                        href={`/tenants/${entry.tenantId}`}
                      >
                        {entry.tenantId}
                      </Link>
                      <Text tone="muted">
                        {entry.referenceType ?? 'manual_adjustment'} ·{' '}
                        {new Date(entry.createdAt).toLocaleString()}
                      </Text>
                    </div>
                    <Badge tone={entry.type === 'credit' ? 'success' : 'warning'}>
                      {entry.type}
                    </Badge>
                  </div>
                </div>
              ))}
              <Link href="/platform-wallets">
                <Button variant="secondary">Open wallet ledger</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href={'/operations' as Route}>
            <Card className="border-slate-200/80 transition hover:border-[var(--mobiris-primary-light)]">
              <CardHeader>
                <CardTitle>Operational oversight</CardTitle>
                <CardDescription>
                  Monitor activation blockers, verification pressure, licence expiry, and fleet risk
                  across tenants.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/tenants">
            <Card className="border-slate-200/80 transition hover:border-[var(--mobiris-primary-light)]">
              <CardHeader>
                <CardTitle>Organisation registry</CardTitle>
                <CardDescription>
                  Open an organisation detail page and act on lifecycle, plan, and wallet posture.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/feature-flags">
            <Card className="border-slate-200/80 transition hover:border-[var(--mobiris-primary-light)]">
              <CardHeader>
                <CardTitle>Feature rollout controls</CardTitle>
                <CardDescription>
                  Override rollout by tenant, country, or plan without leaving the control plane.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/staff">
            <Card className="border-slate-200/80 transition hover:border-[var(--mobiris-primary-light)]">
              <CardHeader>
                <CardTitle>Staff access</CardTitle>
                <CardDescription>
                  Invite platform staff properly and keep operator access governed.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
