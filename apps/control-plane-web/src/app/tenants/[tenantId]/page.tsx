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
  getTenantGovernanceSummary,
  getTenantOperationalSummary,
  getTenantPlatformWalletBalance,
  listFeatureFlags,
  listPlans,
  listTenantPlatformWalletEntries,
} from '../../../lib/api-control-plane';
import { requirePlatformSession } from '../../../lib/require-platform-session';
import type {
  FeatureFlagRecord,
  PlatformWalletBalanceRecord,
} from '../../../lib/api-control-plane';
import { TenantFeatureRolloutCard } from './tenant-feature-rollout-card';
import { TenantPlanCard } from './tenant-plan-card';
import { TenantWalletCard } from './tenant-wallet-card';
import { TransitionTenantCard } from './transition-tenant-card';

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

function attentionTone(score: number): 'success' | 'warning' | 'danger' | 'neutral' {
  if (score >= 16) return 'danger';
  if (score >= 6) return 'warning';
  if (score > 0) return 'neutral';
  return 'success';
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const token = await requirePlatformSession();
  const [tenant, plans, flags, operationalSummary, governanceSummary] = await Promise.all([
    getTenantDetail(tenantId, token),
    listPlans(token).catch(() => []),
    listFeatureFlags(token).catch(() => []),
    getTenantOperationalSummary(tenantId, token).catch(() => null),
    getTenantGovernanceSummary(tenantId, token).catch(() => null),
  ]);

  let walletBalance: PlatformWalletBalanceRecord | null = null;
  let walletEntries: Awaited<ReturnType<typeof listTenantPlatformWalletEntries>> = [];
  try {
    [walletBalance, walletEntries] = await Promise.all([
      getTenantPlatformWalletBalance(tenantId, token),
      listTenantPlatformWalletEntries(tenantId, token),
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
  const openPrivacyRequests =
    (governanceSummary?.privacy.totals.openRequests ?? 0) +
    (governanceSummary?.privacy.totals.pendingReviewRequests ?? 0);

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

        {operationalSummary ? (
          <div className="grid gap-4 xl:grid-cols-5">
            <Card className="border-slate-200/80">
              <CardHeader>
                <Text tone="muted">Operational attention</Text>
                <CardTitle>{operationalSummary.attentionScore}</CardTitle>
                <Badge tone={attentionTone(operationalSummary.attentionScore)}>
                  {operationalSummary.attentionScore === 0 ? 'Stable' : 'Needs attention'}
                </Badge>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <Text tone="muted">Activation blockers</Text>
                <CardTitle>
                  {operationalSummary.verificationHealth.driversAwaitingActivation}
                </CardTitle>
                <Text tone="muted">
                  {operationalSummary.driverActivity.activeUnverified} active but unverified
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <Text tone="muted">Licence verification issues</Text>
                <CardTitle>
                  {operationalSummary.verificationHealth.licenceVerificationIssueCount}
                </CardTitle>
                <Text tone="muted">
                  {operationalSummary.verificationHealth.providerRetryRequiredCount} provider retry
                  cases
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <Text tone="muted">At-risk assignments</Text>
                <CardTitle>{operationalSummary.riskSummary.atRiskAssignmentCount}</CardTitle>
                <Text tone="muted">
                  {operationalSummary.riskSummary.vehiclesAtRiskCount} vehicles at risk
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <Text tone="muted">Inspection compliance</Text>
                <CardTitle>
                  {operationalSummary.riskSummary.inspectionComplianceRate.toFixed(2)}%
                </CardTitle>
                <Text tone="muted">
                  {operationalSummary.riskSummary.criticalMaintenanceCount} critical maintenance
                  items
                </Text>
              </CardHeader>
            </Card>
          </div>
        ) : null}

        {governanceSummary ? (
          <div className="grid gap-4 xl:grid-cols-4">
            <Card className="border-slate-200/80">
              <CardHeader>
                <Text tone="muted">Privacy queue</Text>
                <CardTitle>{openPrivacyRequests}</CardTitle>
                <Text tone="muted">
                  {governanceSummary.privacy.totals.closedRequests} closed ·{' '}
                  {governanceSummary.privacy.totals.consentEventsLast30Days} consent events in the
                  last 30 days
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <Text tone="muted">Notification health</Text>
                <CardTitle>{governanceSummary.notifications.totals.unreadNotifications}</CardTitle>
                <Text tone="muted">
                  {governanceSummary.notifications.totals.notificationsLast30Days} sent in the last
                  30 days
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <Text tone="muted">Push posture</Text>
                <CardTitle>{governanceSummary.notifications.totals.pushDevices}</CardTitle>
                <Text tone="muted">
                  {governanceSummary.notifications.totals.pushEnabledUsers} reachable users with
                  registered devices
                </Text>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <Text tone="muted">Canonical intelligence</Text>
                <CardTitle>Cross-tenant</CardTitle>
                <Text tone="muted">
                  Canonical people, watchlists, and review cases stay in the intelligence plane.
                </Text>
              </CardHeader>
            </Card>
          </div>
        ) : null}

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
                <div>
                  <Text tone="muted">Primary owner</Text>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {tenant.ownerSummary?.ownerName ?? 'Not projected yet'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tenant.ownerSummary?.ownerEmail ?? 'No owner email available'}
                  </p>
                </div>
                <div>
                  <Text tone="muted">Owner access</Text>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {tenant.ownerSummary?.ownerRole ?? 'Unspecified'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tenant.ownerSummary?.ownerIsActive ? 'Active' : 'Inactive or unavailable'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff and ownership context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tenant.ownerSummary?.adminContacts?.length ? (
                  tenant.ownerSummary.adminContacts.map((contact) => (
                    <div
                      className="rounded-2xl border border-slate-200 px-4 py-3"
                      key={contact.userId}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                          <p className="text-sm text-slate-600">{contact.email}</p>
                          <p className="text-xs text-slate-500">
                            {contact.phone ?? 'No phone on file'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge tone={contact.isActive ? 'success' : 'warning'}>
                            {contact.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                            {contact.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <Text>
                    No tenant owner or admin contacts have been projected into the control plane
                    yet.
                  </Text>
                )}
              </CardContent>
            </Card>

            <TenantPlanCard plans={plans} tenant={tenant} />

            {operationalSummary ? (
              <Card>
                <CardHeader>
                  <CardTitle>Operational support view</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 px-4 py-3">
                      <Text tone="muted">Driver activity</Text>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {operationalSummary.driverActivity.activeVerified} verified active ·{' '}
                        {operationalSummary.driverActivity.activeUnverified} unverified active
                      </p>
                      <p className="text-xs text-slate-500">
                        {operationalSummary.driverActivity.onboardingPool} in onboarding pool
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 px-4 py-3">
                      <Text tone="muted">Licence pressure</Text>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {operationalSummary.verificationHealth.expiredLicencesCount} expired ·{' '}
                        {operationalSummary.verificationHealth.expiringLicencesSoonCount} due soon
                      </p>
                      <p className="text-xs text-slate-500">
                        {operationalSummary.verificationHealth.licenceVerificationIssueCount}{' '}
                        failed verification cases
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 px-4 py-3">
                      <Text tone="muted">Operational risk</Text>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {operationalSummary.riskSummary.atRiskAssignmentCount} at-risk assignments
                      </p>
                      <p className="text-xs text-slate-500">
                        {operationalSummary.riskSummary.vehiclesAtRiskCount} vehicles at risk
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-3">
                      <Text tone="muted">Top driver issues</Text>
                      {operationalSummary.topDriverIssues.length === 0 ? (
                        <Text>
                          No driver blockers are currently projected for platform support.
                        </Text>
                      ) : (
                        operationalSummary.topDriverIssues.map((driver) => (
                          <div
                            className="rounded-2xl border border-slate-200 px-4 py-3"
                            key={driver.driverId}
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {driver.fullName}
                            </p>
                            <p className="text-xs text-slate-500">
                              Fleet {driver.fleetId} · activation {driver.activationReadiness} ·
                              assignment {driver.assignmentReadiness}
                            </p>
                            <p className="mt-2 text-sm text-slate-700">
                              {driver.activationReadinessReasons[0] ??
                                driver.remittanceRiskReason ??
                                'Needs operational review.'}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="space-y-3">
                      <Text tone="muted">Top vehicle issues</Text>
                      {operationalSummary.topVehicleIssues.length === 0 ? (
                        <Text>
                          No fleet-risk blockers are currently projected for platform support.
                        </Text>
                      ) : (
                        operationalSummary.topVehicleIssues.map((vehicle) => (
                          <div
                            className="rounded-2xl border border-slate-200 px-4 py-3"
                            key={vehicle.vehicleId}
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {vehicle.primaryLabel}
                            </p>
                            <p className="text-xs text-slate-500">
                              Fleet {vehicle.fleetId} · status {vehicle.status}
                            </p>
                            <p className="mt-2 text-sm text-slate-700">
                              {vehicle.remittanceRiskReason ?? vehicle.maintenanceSummary}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Text tone="muted">Upcoming licence expiries</Text>
                    {operationalSummary.topLicenceExpiries.length === 0 ? (
                      <Text>
                        No approved licence expiries are currently projected for this tenant.
                      </Text>
                    ) : (
                      operationalSummary.topLicenceExpiries.map((item) => (
                        <div
                          className="rounded-2xl border border-slate-200 px-4 py-3"
                          key={item.driverId}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {item.fullName}
                              </p>
                              <p className="text-xs text-slate-500">
                                Fleet {item.fleetId} · expires{' '}
                                {new Date(item.expiresAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              tone={
                                item.daysUntilExpiry < 0
                                  ? 'danger'
                                  : item.daysUntilExpiry <= 30
                                    ? 'warning'
                                    : 'neutral'
                              }
                            >
                              {item.daysUntilExpiry < 0
                                ? `${Math.abs(item.daysUntilExpiry)} days overdue`
                                : `${item.daysUntilExpiry} days`}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {governanceSummary ? (
              <Card>
                <CardHeader>
                  <CardTitle>Governance and compliance view</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 px-4 py-3">
                      <Text tone="muted">Privacy support contact</Text>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {governanceSummary.privacy.support.supportEmail}
                      </p>
                      <p className="text-xs text-slate-500">
                        Policy v{governanceSummary.privacy.support.privacyPolicyVersion} · Terms v
                        {governanceSummary.privacy.support.termsVersion}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 px-4 py-3">
                      <Text tone="muted">Notification mix</Text>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {governanceSummary.notifications.totals.verificationNotifications}{' '}
                        verification ·{' '}
                        {governanceSummary.notifications.totals.assignmentNotifications} assignment
                      </p>
                      <p className="text-xs text-slate-500">
                        {governanceSummary.notifications.totals.remittanceNotifications} remittance
                        · {governanceSummary.notifications.totals.complianceRiskNotifications}{' '}
                        compliance
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                      <Text tone="muted">Recent privacy activity</Text>
                      {governanceSummary.privacy.requests.slice(0, 4).map((request) => (
                        <div
                          className="rounded-2xl border border-slate-200 px-4 py-3"
                          key={request.id}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {request.requestType}
                              </p>
                              <p className="text-xs text-slate-500">
                                {request.subjectType} · {request.contactEmail ?? 'No contact email'}
                              </p>
                            </div>
                            <Badge tone={request.status === 'closed' ? 'success' : 'warning'}>
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Text tone="muted">Recent notification activity</Text>
                      {governanceSummary.notifications.notifications
                        .slice(0, 4)
                        .map((notification) => (
                          <div
                            className="rounded-2xl border border-slate-200 px-4 py-3"
                            key={notification.id}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {notification.user?.email ?? 'Unknown recipient'} ·{' '}
                                  {notification.topic}
                                </p>
                              </div>
                              <Badge tone={notification.readAt ? 'success' : 'warning'}>
                                {notification.readAt ? 'Read' : 'Unread'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

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
                          <TableCell>
                            {formatCurrency(invoice.amountDueMinorUnits, invoice.currency)}
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
                {tenant.invoices.length === 0 ? (
                  <Text className="pt-4">
                    No invoices have been recorded for this organisation yet.
                  </Text>
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
                            {entry.description ?? 'No description'} ·{' '}
                            {new Date(entry.createdAt).toLocaleString()}
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
                  plan, billing, wallet, and rollout posture without leaking into tenant daily
                  operations.
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
