import {
  Badge,
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
  Text,
} from '@mobility-os/ui';
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

function formatMoney(amountMinorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatLifecycleStage(stage?: 'active' | 'grace' | 'expired') {
  if (stage === 'grace') return 'Grace period';
  if (stage === 'expired') return 'Expired';
  return 'Active';
}

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
        : 'Unable to load subscription and plan limits right now.';
  }

  return (
    <TenantAppShell
      description="Subscription controls scale: plan status, usage caps, invoices, and upgrade paths."
      eyebrow="Subscription"
      title="Plan and limits"
    >
      <Card>
        <CardHeader>
          <CardTitle>Subscription overview</CardTitle>
          <CardDescription>
            Subscription tiers control company scale only: driver limits, vehicle limits, seats,
            and platform features. Verification tier and wallet funding are managed separately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {billingError ? (
            <Text>{billingError}</Text>
          ) : !billingSummary ? (
            <Text>Subscription context is not available yet.</Text>
          ) : (
            <>
              {billingSummary.subscription.enforcement?.stage === 'grace' ? (
                <div className="rounded-[var(--mobiris-radius-card)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">
                    Subscription expired. Renew within{' '}
                    {billingSummary.subscription.enforcement.graceDaysRemaining} day(s).
                  </p>
                  <p className="mt-1 text-amber-800">
                    Existing operations continue during grace, but new drivers and new vehicles are
                    blocked until renewal.
                  </p>
                </div>
              ) : null}
              {billingSummary.subscription.enforcement?.stage === 'expired' ? (
                <div className="rounded-[var(--mobiris-radius-card)] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                  <p className="font-semibold">
                    Subscription expired. Workspace is in degraded mode.
                  </p>
                  <p className="mt-1 text-rose-800">
                    Drivers can still log in, view assignments, and log remittance. New drivers,
                    new vehicles, and new assignments are blocked until you upgrade.
                  </p>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-white/70 bg-white/95 shadow-none">
                  <CardContent className="p-4">
                    <Text tone="muted">Current plan</Text>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                      {billingSummary.subscription.planName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {billingSummary.subscription.planTier} · {billingSummary.subscription.currency}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-white/70 bg-[var(--mobiris-primary-tint)] shadow-none">
                  <CardContent className="p-4">
                    <Text tone="muted">Subscription status</Text>
                    <div className="mt-2">
                      <Badge
                        tone={
                          billingSummary.subscription.status === 'active'
                            ? 'success'
                            : billingSummary.subscription.enforcement?.stage === 'expired'
                              ? 'danger'
                              : ['past_due', 'grace_period'].includes(
                                    billingSummary.subscription.status,
                                  )
                                ? 'warning'
                                : 'neutral'
                        }
                      >
                        {formatLifecycleStage(billingSummary.subscription.enforcement?.stage)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {billingSummary.subscription.enforcement?.stage === 'grace'
                        ? `Grace ends ${formatDate(
                            billingSummary.subscription.enforcement.graceEndsAt ??
                              billingSummary.subscription.currentPeriodEnd,
                            locale,
                          )}`
                        : billingSummary.subscription.cancelAtPeriodEnd
                          ? 'Cancels at period close'
                          : billingSummary.subscription.trialEndsAt
                            ? `Trial ends ${formatDate(billingSummary.subscription.trialEndsAt, locale)}`
                            : `Renews ${formatDate(billingSummary.subscription.currentPeriodEnd, locale)}`}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-white/70 bg-white/95 shadow-none">
                  <CardContent className="p-4">
                    <Text tone="muted">Open invoices</Text>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                      {billingSummary.usage.openInvoiceCount}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {billingSummary.outstandingInvoice
                        ? `${formatMoney(
                            billingSummary.outstandingInvoice.amountDueMinorUnits -
                              billingSummary.outstandingInvoice.amountPaidMinorUnits,
                            billingSummary.outstandingInvoice.currency,
                            locale,
                          )} currently outstanding`
                        : 'No overdue subscription invoice right now'}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-white/70 bg-[var(--mobiris-primary-tint)] shadow-none">
                  <CardContent className="p-4">
                    <Text tone="muted">Plan features</Text>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                      {billingSummary.usage.seatCap == null ? 'Custom' : 'Metered'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Limits here affect scale, not verification depth.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-white/70 bg-white/95 shadow-none">
                <CardHeader>
                  <CardTitle>Usage and plan capacity</CardTitle>
                  <CardDescription>
                    Company usage compared against subscription limits. Verification pricing stays
                    under Settings → Drivers and Wallet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
                    <Text tone="muted">Drivers</Text>
                    <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                      {billingSummary.usage.driverCount}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Max drivers:{' '}
                      {billingSummary.usage.driverCap == null
                        ? 'Unlimited'
                        : billingSummary.usage.driverCap}
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
                    <Text tone="muted">Vehicles</Text>
                    <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                      {billingSummary.usage.vehicleCount}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Max vehicles:{' '}
                      {billingSummary.usage.vehicleCap == null
                        ? 'Unlimited'
                        : billingSummary.usage.vehicleCap}
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
                    <Text tone="muted">Operator seats</Text>
                    <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                      {billingSummary.usage.operatorSeatCount}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Max seats:{' '}
                      {billingSummary.usage.seatCap == null
                        ? 'Unlimited'
                        : billingSummary.usage.seatCap}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <SubscriptionManagementPanel plans={plans} summary={billingSummary} />

              <Card className="border-white/70 bg-white/95 shadow-none">
                <CardHeader>
                  <CardTitle>Subscription invoices</CardTitle>
                  <CardDescription>
                    Review billing periods, due dates, and payment status for this organisation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {billingSummary.invoices.length === 0 ? (
                    <Text>No subscription invoices have been generated yet.</Text>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount due</TableHead>
                          <TableHead>Amount paid</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Due</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingSummary.invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              <Badge
                                tone={
                                  invoice.status === 'paid'
                                    ? 'success'
                                    : invoice.status === 'open'
                                      ? 'warning'
                                      : 'neutral'
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatMoney(invoice.amountDueMinorUnits, invoice.currency, locale)}
                            </TableCell>
                            <TableCell>
                              {formatMoney(invoice.amountPaidMinorUnits, invoice.currency, locale)}
                            </TableCell>
                            <TableCell>
                              {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
                                new Date(invoice.periodStart),
                              )}{' '}
                              to{' '}
                              {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
                                new Date(invoice.periodEnd),
                              )}
                            </TableCell>
                            <TableCell>
                              {invoice.dueAt ? formatDate(invoice.dueAt, locale) : 'Not scheduled'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}
