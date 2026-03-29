import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  type TenantBillingPlanRecord,
  type TenantBillingInvoiceRecord,
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

function formatDateOnly(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function formatLifecycleStage(stage?: 'active' | 'grace' | 'expired') {
  if (stage === 'grace') return 'Grace period';
  if (stage === 'expired') return 'Expired';
  return 'Active';
}

function getDaysUntil(dateValue: string): number {
  const diffMs = new Date(dateValue).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getPlanFeatureCount(plan: TenantBillingPlanRecord): number {
  return Object.entries(plan.features).filter(([key, value]) => {
    if (['driverCap', 'vehicleCap', 'seatLimit', 'assignmentCap'].includes(key)) {
      return false;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return value != null;
  }).length;
}

function getInvoiceTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'paid') return 'success';
  if (status === 'open' || status === 'pending') return 'warning';
  if (status === 'overdue' || status === 'failed') return 'danger';
  return 'neutral';
}

function getUpcomingInvoices(invoices: TenantBillingInvoiceRecord[]): TenantBillingInvoiceRecord[] {
  return [...invoices]
    .sort((left, right) => {
      const leftDate = new Date(left.dueAt ?? left.periodEnd).getTime();
      const rightDate = new Date(right.dueAt ?? right.periodEnd).getTime();
      return leftDate - rightDate;
    })
    .slice(0, 3);
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
              {(() => {
                const daysRemaining = getDaysUntil(billingSummary.subscription.currentPeriodEnd);
                const activePlans = [...plans]
                  .filter((plan) => plan.isActive)
                  .sort((left, right) => left.basePriceMinorUnits - right.basePriceMinorUnits);
                const currentPlan =
                  activePlans.find((plan) => plan.id === billingSummary.subscription.planId) ?? null;

                return (
                  <>
                    <section className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)+0.25rem)] border border-[var(--mobiris-primary-light)] bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(239,246,255,0.98)_42%,rgba(219,234,254,0.86))] p-5 shadow-[0_28px_60px_-40px_rgba(37,99,235,0.55)]">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
                            Your subscription
                          </p>
                          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
                            Keep your fleet moving with the right plan for your current scale.
                          </h2>
                          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                            Subscription tiers control platform scale, seats, and feature access.
                            Verification requirements and verification funding stay separate.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge tone="neutral">{billingSummary.subscription.planName}</Badge>
                            <Badge
                              tone={
                                billingSummary.subscription.enforcement?.stage === 'expired'
                                  ? 'danger'
                                  : billingSummary.subscription.enforcement?.stage === 'grace'
                                    ? 'warning'
                                    : 'success'
                              }
                            >
                              {formatLifecycleStage(billingSummary.subscription.enforcement?.stage)}
                            </Badge>
                            <Badge tone="neutral">
                              {currentPlan
                                ? `${formatMoney(
                                    currentPlan.basePriceMinorUnits,
                                    currentPlan.currency,
                                    locale,
                                  )} / ${currentPlan.billingInterval}`
                                : billingSummary.subscription.currency}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid w-full max-w-sm gap-3 sm:grid-cols-2 lg:w-[22rem] lg:grid-cols-1">
                          <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/80 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Days remaining
                            </p>
                            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                              {daysRemaining}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Current period ends {formatDateOnly(billingSummary.subscription.currentPeriodEnd, locale)}
                            </p>
                          </div>
                          <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-slate-950 p-4 text-white">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100/70">
                              Upcoming invoice
                            </p>
                            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                              {billingSummary.outstandingInvoice
                                ? formatMoney(
                                    billingSummary.outstandingInvoice.amountDueMinorUnits -
                                      billingSummary.outstandingInvoice.amountPaidMinorUnits,
                                    billingSummary.outstandingInvoice.currency,
                                    locale,
                                  )
                                : 'On track'}
                            </p>
                            <p className="mt-1 text-sm text-blue-100/80">
                              {billingSummary.outstandingInvoice?.dueAt
                                ? `Due ${formatDateOnly(billingSummary.outstandingInvoice.dueAt, locale)}`
                                : `Next renewal ${formatDateOnly(billingSummary.subscription.currentPeriodEnd, locale)}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

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

                    <section className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                            Available subscription tiers
                          </h3>
                          <p className="text-sm text-slate-500">
                            Compare every active tier before you upgrade.
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {activePlans.map((plan) => {
                          const driverCap =
                            typeof plan.features.driverCap === 'number' ? plan.features.driverCap : null;
                          const vehicleCap =
                            typeof plan.features.vehicleCap === 'number' ? plan.features.vehicleCap : null;
                          const assignmentCap =
                            typeof plan.features.assignmentCap === 'number'
                              ? plan.features.assignmentCap
                              : null;
                          return (
                            <div
                              className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-white/95 p-4 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.35)]"
                              key={plan.id}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                                  {plan.name}
                                </p>
                                {plan.id === billingSummary.subscription.planId ? (
                                  <Badge tone="neutral">Current</Badge>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm text-slate-500">
                                {formatMoney(plan.basePriceMinorUnits, plan.currency, locale)} / {plan.billingInterval}
                              </p>
                              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                                <div className="rounded-[calc(var(--mobiris-radius-card)-0.45rem)] bg-slate-50 px-3 py-2">
                                  {driverCap == null ? 'Unlimited drivers' : `${driverCap} drivers`}
                                </div>
                                <div className="rounded-[calc(var(--mobiris-radius-card)-0.45rem)] bg-slate-50 px-3 py-2">
                                  {vehicleCap == null ? 'Unlimited vehicles' : `${vehicleCap} vehicles`}
                                </div>
                                <div className="rounded-[calc(var(--mobiris-radius-card)-0.45rem)] bg-slate-50 px-3 py-2">
                                  {assignmentCap == null ? 'Assignments included' : `${assignmentCap} assignments`}
                                </div>
                                <div className="rounded-[calc(var(--mobiris-radius-card)-0.45rem)] bg-slate-50 px-3 py-2">
                                  {getPlanFeatureCount(plan)} feature areas included
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </>
                );
              })()}
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
                  <CardTitle>Upcoming invoices</CardTitle>
                  <CardDescription>
                    Upcoming billing checkpoints and recent invoices for the current subscription.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {billingSummary.invoices.length === 0 ? (
                    <Text>No subscription invoices have been generated yet.</Text>
                  ) : (
                    getUpcomingInvoices(billingSummary.invoices).map((invoice) => (
                      <div
                        className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/65 p-4"
                        key={invoice.id}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{invoice.id}</p>
                            <p className="text-xs text-slate-500">
                              {formatDateOnly(invoice.periodStart, locale)} to{' '}
                              {formatDateOnly(invoice.periodEnd, locale)}
                            </p>
                          </div>
                          <Badge tone={getInvoiceTone(invoice.status)}>{invoice.status}</Badge>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Amount due
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">
                              {formatMoney(invoice.amountDueMinorUnits, invoice.currency, locale)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Paid so far
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">
                              {formatMoney(invoice.amountPaidMinorUnits, invoice.currency, locale)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Due date
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-950">
                              {invoice.dueAt ? formatDateOnly(invoice.dueAt, locale) : 'Not scheduled'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
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
