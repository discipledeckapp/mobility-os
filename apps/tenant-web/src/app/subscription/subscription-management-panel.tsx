'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Text,
} from '@mobility-os/ui';
import { useActionState, useEffect, useState } from 'react';
import type { TenantBillingPlanRecord, TenantBillingSummaryRecord } from '../../lib/api-core';
import { SelectField } from '../../features/shared/select-field';
import { PaymentActionPanel } from '../wallet/payment-action-panel';
import {
  changePlanAction,
  initializeOutstandingInvoiceCheckoutAction,
  initializeSubscriptionBillingSetupAction,
  type SubscriptionActionState,
} from './actions';

const initialState: SubscriptionActionState = {};

function formatMoney(
  amountMinorUnits: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

function isCustomPlan(plan: TenantBillingPlanRecord): boolean {
  return plan.tier === 'enterprise' || Boolean(plan.customTerms);
}

function getPlanNumericFeature(plan: TenantBillingPlanRecord, key: string): number | null {
  const value = plan.features[key];
  return typeof value === 'number' ? value : null;
}

function getPlanBooleanFeature(plan: TenantBillingPlanRecord, key: string): boolean {
  return plan.features[key] === true;
}

function getSupportLabel(plan: TenantBillingPlanRecord): string {
  const supportTier = plan.features.supportTier;
  if (supportTier === 'dedicated') return 'Dedicated onboarding and support';
  if (supportTier === 'whatsapp_email') return 'WhatsApp and email support';
  return 'Email support';
}

function getPlanCapabilities(plan: TenantBillingPlanRecord): string[] {
  const vehicleCap = getPlanNumericFeature(plan, 'vehicleCap');
  const assignmentCap = getPlanNumericFeature(plan, 'assignmentCap');
  const seatLimit = getPlanNumericFeature(plan, 'seatLimit');

  const capabilities = [
    vehicleCap == null ? 'Unlimited vehicles' : `Up to ${vehicleCap} vehicles`,
    assignmentCap == null
      ? 'Unlimited active assignments'
      : `Up to ${assignmentCap} active assignments`,
    seatLimit == null ? 'Unlimited operator seats' : `Up to ${seatLimit} operator seats`,
  ];

  if (getPlanBooleanFeature(plan, 'verificationEnabled')) {
    capabilities.push('Driver verification workflows enabled');
  } else {
    capabilities.push('Core operations only');
  }

  if (getPlanBooleanFeature(plan, 'walletEnabled')) {
    capabilities.push('Billing wallet and payment method setup');
  }

  if (getPlanBooleanFeature(plan, 'intelligenceEnabled')) {
    capabilities.push('Operational insights and risk visibility');
  }

  if (getPlanBooleanFeature(plan, 'bulkAssignmentsEnabled')) {
    capabilities.push('Bulk assignment tools');
  }

  if (getPlanBooleanFeature(plan, 'exportsEnabled')) {
    capabilities.push('Operational exports');
  }

  if (getPlanBooleanFeature(plan, 'whiteLabelAvailable')) {
    capabilities.push('White-label and enterprise controls');
  }

  if (getPlanBooleanFeature(plan, 'ssoAvailable')) {
    capabilities.push('SSO support');
  }

  capabilities.push(getSupportLabel(plan));

  return capabilities;
}

function getLifecycleTone(
  stage?: 'active' | 'grace' | 'expired',
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (stage === 'grace') return 'warning';
  if (stage === 'expired') return 'danger';
  return 'success';
}

function getLifecycleLabel(stage?: 'active' | 'grace' | 'expired'): string {
  if (stage === 'grace') return 'Grace period';
  if (stage === 'expired') return 'Expired';
  return 'Active';
}

function formatUsage(current: number, limit: number | null, label: string): string {
  if (limit == null) {
    return `${current} ${label} in use`;
  }
  return `${current} of ${limit} ${label}`;
}

function getAvailableIntervals(plans: TenantBillingPlanRecord[]): Array<'monthly' | 'annual'> {
  const intervals = new Set(
    plans
      .map((plan) => plan.billingInterval)
      .filter((interval): interval is 'monthly' | 'annual' => interval === 'monthly' || interval === 'annual'),
  );

  return (['monthly', 'annual'] as const).filter((interval) => intervals.has(interval)) as Array<
    'monthly' | 'annual'
  >;
}

function normalizeInterval(interval: string): 'monthly' | 'annual' {
  return interval === 'annual' ? 'annual' : 'monthly';
}

function getDisplayCurrency(
  plans: TenantBillingPlanRecord[],
  summary: TenantBillingSummaryRecord,
): string {
  const currentCurrency = summary.subscription.currency;
  if (plans.some((plan) => plan.currency === currentCurrency)) {
    return currentCurrency;
  }

  const preferredPlan = plans.find((plan) => plan.isPreferredCurrency);
  return preferredPlan?.currency ?? currentCurrency;
}

function getVerificationDecision(summary: TenantBillingSummaryRecord, locale: string) {
  const available = summary.verificationSpend.availableSpendMinorUnits;
  const currency = summary.verificationSpend.currency;
  const savedCardActive = summary.verificationSpend.savedCard?.active ?? false;

  if (available > 0) {
    return {
      tone: 'success' as const,
      title: 'You can verify 1 driver now',
      detail: `${formatMoney(available, currency, locale)} is available for company-paid verification.`,
    };
  }

  if (savedCardActive) {
    return {
      tone: 'warning' as const,
      title: 'You need more verification credit to continue',
      detail: `Add funds to restore available spend. Current available spend is ${formatMoney(available, currency, locale)}.`,
    };
  }

  return {
    tone: 'warning' as const,
    title: 'You need funding before you can continue',
    detail: `Add verification credit or save a payment method to unlock company-paid verification.`,
  };
}

function getLedgerEntryTone(type: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (type === 'credit') return 'success';
  if (type === 'debit') return 'warning';
  if (type === 'reversal') return 'danger';
  return 'neutral';
}

export function SubscriptionManagementPanel({
  summary,
  plans,
  locale,
}: {
  summary: TenantBillingSummaryRecord;
  plans: TenantBillingPlanRecord[];
  locale: string;
}) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>(
    normalizeInterval(summary.subscription.billingInterval),
  );
  const [invoiceState, invoiceAction, invoicePending] = useActionState(
    initializeOutstandingInvoiceCheckoutAction,
    initialState,
  );
  const [planState, planAction, planPending] = useActionState(changePlanAction, initialState);
  const [billingMethodState, billingMethodAction, billingMethodPending] = useActionState(
    initializeSubscriptionBillingSetupAction,
    initialState,
  );

  const availableIntervals = getAvailableIntervals(plans);
  const displayCurrency = getDisplayCurrency(plans, summary);
  const currentPlan =
    plans.find((plan) => plan.id === summary.subscription.planId) ?? null;
  const currentPlanCapabilities = currentPlan ? getPlanCapabilities(currentPlan) : [];
  const verificationDecision = getVerificationDecision(summary, locale);
  const filteredPlans = plans
    .filter(
      (plan) => plan.isActive && plan.currency === displayCurrency && plan.billingInterval === billingInterval,
    )
    .sort((left, right) => {
      const tierOrder = { starter: 0, growth: 1, enterprise: 2 };
      return tierOrder[left.tier as keyof typeof tierOrder] - tierOrder[right.tier as keyof typeof tierOrder];
    });
  const uniquePlans = filteredPlans.filter(
    (plan, index, collection) =>
      collection.findIndex((candidate) => candidate.tier === plan.tier) === index,
  );
  const upgradeOptions = uniquePlans.filter((plan) => plan.id !== summary.subscription.planId);

  useEffect(() => {
    if (invoiceState.checkoutUrl) {
      window.location.href = invoiceState.checkoutUrl;
    }
  }, [invoiceState.checkoutUrl]);

  useEffect(() => {
    if (billingMethodState.checkoutUrl) {
      window.location.href = billingMethodState.checkoutUrl;
    }
  }, [billingMethodState.checkoutUrl]);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-primary-light)] bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(239,246,255,0.98)_42%,rgba(219,234,254,0.86))] p-5 shadow-[0_28px_60px_-40px_rgba(37,99,235,0.55)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
                Current plan
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
                {summary.subscription.planName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {formatMoney(
                  summary.subscription.basePriceMinorUnits,
                  summary.subscription.currency,
                  locale,
                )}{' '}
                / {summary.subscription.billingInterval}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="neutral">{summary.subscription.planTier}</Badge>
                <Badge tone={getLifecycleTone(summary.subscription.enforcement?.stage)}>
                  {getLifecycleLabel(summary.subscription.enforcement?.stage)}
                </Badge>
                <Badge tone="neutral">{summary.subscription.currency}</Badge>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[28rem]">
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.4rem)] border border-white/70 bg-white/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Renewal
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {summary.subscription.trialEndsAt
                    ? `Trial ends ${formatDate(summary.subscription.trialEndsAt, locale)}`
                    : formatDate(summary.subscription.currentPeriodEnd, locale)}
                </p>
              </div>
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.4rem)] border border-white/70 bg-slate-950 p-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100/70">
                  What you get
                </p>
                <p className="mt-2 text-base font-semibold">
                  {currentPlanCapabilities[0] ?? 'Fleet operations access'}
                </p>
                <p className="mt-1 text-sm text-blue-100/80">
                  Drivers are not capped on any plan.
                </p>
              </div>
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.4rem)] border border-white/70 bg-white/85 p-4 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Verification credit
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={verificationDecision.tone}>{verificationDecision.title}</Badge>
                  <Badge tone="neutral">
                    {formatMoney(
                      summary.verificationSpend.availableSpendMinorUnits,
                      summary.verificationSpend.currency,
                      locale,
                    )}{' '}
                    available
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{verificationDecision.detail}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {currentPlanCapabilities.slice(0, 4).map((capability) => (
              <div
                className="rounded-[calc(var(--mobiris-radius-card)-0.45rem)] bg-white/85 px-3 py-2 text-sm text-slate-700"
                key={capability}
              >
                {capability}
              </div>
            ))}
          </div>
        </div>

        {summary.subscription.enforcement?.stage === 'grace' ? (
          <div className="rounded-[var(--mobiris-radius-card)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Renew within {summary.subscription.enforcement.graceDaysRemaining} day(s) to keep adding
            vehicles and assignments without restrictions.
          </div>
        ) : null}

        {summary.subscription.enforcement?.stage === 'expired' ? (
          <div className="rounded-[var(--mobiris-radius-card)] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            Your workspace is in degraded mode. Existing drivers can still work, but new vehicles and
            new assignments stay blocked until billing is fixed.
          </div>
        ) : null}
      </section>

      <section>
        <Card className="border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle>Usage vs limits</CardTitle>
            <CardDescription>
              Plans scale by vehicles, assignments, and operator seats. Drivers are always uncapped.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
              <Text tone="muted">Vehicles</Text>
              <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                {summary.usage.vehicleCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatUsage(summary.usage.vehicleCount, summary.usage.vehicleCap ?? null, 'vehicles')}
              </p>
            </div>
            <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
              <Text tone="muted">Active assignments</Text>
              <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                {summary.usage.assignmentCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatUsage(
                  summary.usage.assignmentCount,
                  summary.usage.assignmentCap ?? null,
                  'assignments',
                )}
              </p>
            </div>
            <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
              <Text tone="muted">Operator seats</Text>
              <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                {summary.usage.operatorSeatCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatUsage(
                  summary.usage.operatorSeatCount,
                  summary.usage.seatCap ?? null,
                  'operator seats',
                )}
              </p>
            </div>
            <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
              <Text tone="muted">Drivers</Text>
              <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                {summary.usage.driverCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Drivers are uncapped on every plan.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Upgrade options</CardTitle>
                <CardDescription>
                  Compare plans once by the billing interval you want. No duplicate cards. No mixed billing noise.
                </CardDescription>
              </div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                {(['monthly', 'annual'] as const).map((interval) => {
                  const enabled = availableIntervals.includes(interval);
                  return (
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        billingInterval === interval
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-500'
                      } ${enabled ? '' : 'cursor-not-allowed opacity-40'}`}
                      disabled={!enabled}
                      key={interval}
                      onClick={() => enabled && setBillingInterval(interval)}
                      type="button"
                    >
                      {interval === 'monthly' ? 'Monthly' : 'Annual'}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
              Showing {displayCurrency} plans for the {billingInterval} billing cycle.
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {uniquePlans.map((plan) => {
                const isCurrent = plan.id === summary.subscription.planId;
                const capabilities = getPlanCapabilities(plan);
                const actionLabel = isCurrent
                  ? 'Current plan'
                  : isCustomPlan(plan)
                    ? 'Talk to support'
                    : 'Switch plan';

                return (
                  <form
                    action={planAction}
                    className={`rounded-[var(--mobiris-radius-card)] border p-4 ${
                      isCurrent
                        ? 'border-[var(--mobiris-primary-light)] bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(255,255,255,0.98))]'
                        : 'border-slate-200/80 bg-white'
                    }`}
                    key={plan.id}
                  >
                    <input name="planId" type="hidden" value={plan.id} />
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                            {plan.name}
                          </p>
                          {isCurrent ? <Badge tone="neutral">Current</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {isCustomPlan(plan)
                            ? 'Custom pricing'
                            : `${formatMoney(plan.basePriceMinorUnits, plan.currency, locale)} / ${plan.billingInterval}`}
                        </p>
                      </div>
                      <Button
                        className="shrink-0"
                        disabled={planPending || isCurrent || isCustomPlan(plan)}
                        type="submit"
                        variant={isCurrent ? 'secondary' : 'primary'}
                      >
                        {actionLabel}
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {capabilities.map((capability) => (
                        <div
                          className="rounded-[calc(var(--mobiris-radius-card)-0.45rem)] border border-slate-200/80 bg-slate-50/75 px-3 py-2 text-sm text-slate-700"
                          key={`${plan.id}-${capability}`}
                        >
                          {capability}
                        </div>
                      ))}
                    </div>
                  </form>
                );
              })}
            </div>

            {upgradeOptions.length === 0 ? (
              <Text className="text-sm text-slate-500">
                No other plans are available in this billing interval for your currency right now.
              </Text>
            ) : null}
            {planState.error ? <Text className="text-rose-700">{planState.error}</Text> : null}
            {planState.success ? <Text className="text-emerald-700">{planState.success}</Text> : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>
              Keep your subscription current and keep new vehicles and assignments flowing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.outstandingInvoice ? (
              <form action={invoiceAction} className="space-y-4">
                <input name="invoiceId" type="hidden" value={summary.outstandingInvoice.id} />
                <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">
                    {formatMoney(
                      summary.outstandingInvoice.amountDueMinorUnits -
                        summary.outstandingInvoice.amountPaidMinorUnits,
                      summary.outstandingInvoice.currency,
                      locale,
                    )}
                  </p>
                  <p className="mt-1">
                    Invoice {summary.outstandingInvoice.id}
                    {summary.outstandingInvoice.dueAt
                      ? ` · due ${formatDate(summary.outstandingInvoice.dueAt, locale)}`
                      : ''}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-provider">Payment provider</Label>
                  <SelectField id="invoice-provider" name="provider" defaultValue="paystack">
                    <option value="paystack">Paystack</option>
                    <option value="flutterwave">Flutterwave</option>
                  </SelectField>
                </div>
                <Button
                  disabled={invoicePending || Boolean(invoiceState.checkoutUrl)}
                  type="submit"
                  variant="secondary"
                >
                  {invoicePending || invoiceState.checkoutUrl ? 'Redirecting to payment...' : 'Pay invoice'}
                </Button>
                {invoiceState.error ? <Text className="text-rose-700">{invoiceState.error}</Text> : null}
              </form>
            ) : (
              <Text>No open subscription invoice needs payment right now.</Text>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle>Billing payment method</CardTitle>
            <CardDescription>
              Save or replace the card used for future subscription billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 p-4">
              {summary.billingPaymentMethod ? (
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={summary.billingPaymentMethod.active ? 'success' : 'warning'}>
                      {summary.billingPaymentMethod.active ? 'Active' : summary.billingPaymentMethod.status}
                    </Badge>
                    <Badge tone="neutral">
                      {summary.billingPaymentMethod.autopayEnabled ? 'Autopay enabled' : 'Autopay not enabled'}
                    </Badge>
                  </div>
                  <p className="font-medium text-slate-900">
                    {summary.billingPaymentMethod.brand} ending in {summary.billingPaymentMethod.last4}
                  </p>
                  <p>Provider: {summary.billingPaymentMethod.provider}</p>
                </div>
              ) : (
                <Text className="text-sm text-slate-600">
                  No billing payment method has been saved yet.
                </Text>
              )}
            </div>

            <form action={billingMethodAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billing-method-provider">Payment provider</Label>
                <SelectField defaultValue="paystack" id="billing-method-provider" name="provider">
                  <option value="paystack">Paystack</option>
                  <option value="flutterwave">Flutterwave</option>
                </SelectField>
              </div>
              <Button
                disabled={billingMethodPending || Boolean(billingMethodState.checkoutUrl)}
                type="submit"
              >
                {billingMethodPending || billingMethodState.checkoutUrl
                  ? 'Redirecting to provider...'
                  : summary.billingPaymentMethod
                    ? 'Replace billing payment method'
                    : 'Add billing payment method'}
              </Button>
              {billingMethodState.error ? (
                <Text className="text-rose-700">{billingMethodState.error}</Text>
              ) : null}
              {billingMethodState.success ? (
                <Text className="text-emerald-700">{billingMethodState.success}</Text>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <Card className="border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle>Verification credit</CardTitle>
            <CardDescription>
              See available credit, decide if you can verify now, and add funds or a payment method.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
                <Text tone="muted">Available credit</Text>
                <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                  {formatMoney(
                    summary.verificationSpend.availableSpendMinorUnits,
                    summary.verificationSpend.currency,
                    locale,
                  )}
                </p>
              </div>
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
                <Text tone="muted">Wallet balance</Text>
                <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                  {formatMoney(
                    summary.verificationSpend.walletBalanceMinorUnits,
                    summary.verificationSpend.currency,
                    locale,
                  )}
                </p>
              </div>
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/80 p-4">
                <Text tone="muted">Credit limit</Text>
                <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                  {formatMoney(
                    summary.verificationSpend.creditLimitMinorUnits,
                    summary.verificationSpend.currency,
                    locale,
                  )}
                </p>
              </div>
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-950 bg-slate-950 p-4 text-white">
                <Text className="text-blue-100/70">Saved payment method</Text>
                <p className="mt-2 text-base font-semibold">
                  {summary.verificationSpend.savedCard
                    ? `${summary.verificationSpend.savedCard.brand} •••• ${summary.verificationSpend.savedCard.last4}`
                    : 'Not set up'}
                </p>
                <p className="mt-1 text-sm text-blue-100/80">
                  {summary.verificationSpend.savedCard?.active ? 'Active' : 'Add one for card-backed credit'}
                </p>
              </div>
            </div>

            <div
              className={`rounded-[var(--mobiris-radius-card)] border p-4 ${
                verificationDecision.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <p className="text-sm font-semibold">{verificationDecision.title}</p>
              <p className="mt-1 text-sm">{verificationDecision.detail}</p>
            </div>

            <PaymentActionPanel
              currencyMinorUnit={2}
              locale={locale}
              summary={summary}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              One ledger for verification credit activity. Subscription invoices stay above in Billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.verificationWallet.entries.length > 0 ? (
              summary.verificationWallet.entries.map((entry) => (
                <div
                  className="flex flex-col gap-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between"
                  key={entry.id}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Text tone="strong">
                        {entry.description || `${entry.referenceType ?? 'Billing'} activity`}
                      </Text>
                      <Badge tone={getLedgerEntryTone(entry.type)}>{entry.type}</Badge>
                    </div>
                    <Text tone="muted">
                      {formatDate(entry.createdAt, locale)}
                      {entry.referenceId ? ` · ${entry.referenceId}` : ''}
                    </Text>
                  </div>
                  <Text tone="strong">
                    {formatMoney(entry.amountMinorUnits, summary.verificationWallet.currency, locale)}
                  </Text>
                </div>
              ))
            ) : (
              <Text className="text-sm text-slate-500">
                No verification credit transactions yet.
              </Text>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
