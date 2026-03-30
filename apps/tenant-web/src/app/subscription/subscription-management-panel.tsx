'use client';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Text } from '@mobility-os/ui';
import { useActionState, useEffect } from 'react';
import type { TenantBillingPlanRecord, TenantBillingSummaryRecord } from '../../lib/api-core';
import {
  changePlanAction,
  initializeOutstandingInvoiceCheckoutAction,
  initializeSubscriptionBillingSetupAction,
  type SubscriptionActionState,
} from './actions';
import { SelectField } from '../../features/shared/select-field';

const initialState: SubscriptionActionState = {};

function formatMajorAmount(amountMinorUnits: number): string {
  return (amountMinorUnits / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isCustomPlan(plan: TenantBillingPlanRecord): boolean {
  return plan.tier === 'enterprise' || Boolean(plan.customTerms);
}

function getPlanNumericFeature(
  plan: TenantBillingPlanRecord,
  key: string,
): number | null {
  const value = plan.features[key];
  return typeof value === 'number' ? value : null;
}

function getPlanBooleanFeature(
  plan: TenantBillingPlanRecord,
  key: string,
): boolean {
  return plan.features[key] === true;
}

function getPlanStringFeature(
  plan: TenantBillingPlanRecord,
  key: string,
): string | null {
  const value = plan.features[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function formatCap(value: number | null, suffix: string): string {
  return value === null ? `Unlimited ${suffix}` : `${value} ${suffix}`;
}

function getPlanHighlights(plan: TenantBillingPlanRecord): string[] {
  const highlights = [
    formatCap(getPlanNumericFeature(plan, 'operatingUnitCap'), 'operating units'),
    formatCap(getPlanNumericFeature(plan, 'driverCap'), 'drivers'),
    formatCap(getPlanNumericFeature(plan, 'vehicleCap'), 'vehicles'),
    formatCap(getPlanNumericFeature(plan, 'seatLimit'), 'seats'),
  ];

  const assignmentsCap = getPlanNumericFeature(plan, 'assignmentCap');
  highlights.push(assignmentsCap === null ? 'Assignments included' : `${assignmentsCap} assignments`);

  if (getPlanBooleanFeature(plan, 'verificationEnabled')) {
    const included = getPlanNumericFeature(plan, 'verificationsIncluded');
    highlights.push(
      included === null
        ? 'Verification available'
        : `${included} verifications included`,
    );
  } else {
    highlights.push('Verification setup on upgrade');
  }

  highlights.push(
    getPlanBooleanFeature(plan, 'intelligenceEnabled')
      ? 'Analytics and operational insights'
      : 'Core fleet operations only',
  );

  const supportTier = getPlanStringFeature(plan, 'supportTier');
  if (supportTier) {
    highlights.push(`Support: ${supportTier.replaceAll('_', ' / ')}`);
  }

  return highlights;
}

function getPlanPriceLabel(plan: TenantBillingPlanRecord): string {
  if (isCustomPlan(plan)) {
    return 'Custom pricing';
  }

  return `${plan.currency} ${formatMajorAmount(plan.basePriceMinorUnits)} / ${plan.billingInterval}`;
}

export function SubscriptionManagementPanel({
  summary,
  plans,
}: {
  summary: TenantBillingSummaryRecord;
  plans: TenantBillingPlanRecord[];
}) {
  const [invoiceState, invoiceAction, invoicePending] = useActionState(
    initializeOutstandingInvoiceCheckoutAction,
    initialState,
  );
  const [planState, planAction, planPending] = useActionState(changePlanAction, initialState);
  const [billingMethodState, billingMethodAction, billingMethodPending] = useActionState(
    initializeSubscriptionBillingSetupAction,
    initialState,
  );
  const enforcement = summary.subscription.enforcement;
  const currentPlanPrice = plans.find((plan) => plan.id === summary.subscription.planId)?.basePriceMinorUnits;
  const currentPlan = plans.find((plan) => plan.id === summary.subscription.planId) ?? null;
  const availablePlans = [...plans].sort((left, right) => left.basePriceMinorUnits - right.basePriceMinorUnits);

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
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="overflow-hidden border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.28)]">
        <CardHeader>
          <CardTitle>Plan management</CardTitle>
          <CardDescription>
            Subscription controls scale only: driver capacity, vehicle capacity, operator seats,
            and access to plan-level features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {enforcement?.stage === 'grace' || enforcement?.stage === 'expired' ? (
            <div
              className={`rounded-[var(--mobiris-radius-card)] border p-3 text-sm ${
                enforcement.stage === 'grace'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              <p className="font-semibold">
                {enforcement.stage === 'grace'
                  ? `Grace period active. Renew within ${enforcement.graceDaysRemaining} day(s).`
                  : 'Degraded mode active until the subscription is renewed.'}
              </p>
              <p className="mt-1">
                Blocked growth actions: {enforcement.blockedFeatures.join(', ').replaceAll('_', ' ')}.
              </p>
            </div>
          ) : null}

          <div className="rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-primary-light)] bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(219,234,254,0.72))] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">Current plan</Badge>
              <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                {summary.subscription.planName}
              </p>
              <p className="ml-auto text-sm text-slate-600">
                {currentPlan
                  ? `${currentPlan.currency} ${formatMajorAmount(currentPlan.basePriceMinorUnits)} / ${currentPlan.billingInterval}`
                  : summary.subscription.currency}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.4rem)] bg-white/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Drivers
                </p>
                <p className="mt-1 text-base font-semibold text-slate-950">
                  {summary.usage.driverCap == null ? 'Unlimited' : summary.usage.driverCap}
                </p>
              </div>
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.4rem)] bg-white/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Vehicles
                </p>
                <p className="mt-1 text-base font-semibold text-slate-950">
                  {summary.usage.vehicleCap == null ? 'Unlimited' : summary.usage.vehicleCap}
                </p>
              </div>
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.4rem)] bg-white/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Operator seats
                </p>
                <p className="mt-1 text-base font-semibold text-slate-950">
                  {summary.usage.seatCap == null ? 'Unlimited' : summary.usage.seatCap}
                </p>
              </div>
            </div>
            {summary.subscription.trialEndsAt ? (
              <p className="mt-4 text-xs text-amber-700">
                Free trial ends{' '}
                {new Date(summary.subscription.trialEndsAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                . Your card will be charged when the trial ends.
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Available plans
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Choose the right scale for your fleet. Verification pricing stays separate.
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            {availablePlans.map((plan) => {
              const isCurrent = plan.id === summary.subscription.planId;
              const customPlan = isCustomPlan(plan);
              const planHighlights = getPlanHighlights(plan);
              const isUpgrade =
                currentPlanPrice != null && plan.basePriceMinorUnits > currentPlanPrice;
              const actionLabel = isCurrent
                ? 'Current plan'
                : customPlan
                  ? 'Talk to support'
                  : isUpgrade
                    ? 'Upgrade'
                    : 'Switch plan';

              return (
                <form
                  action={planAction}
                  className={`rounded-[var(--mobiris-radius-card)] border p-4 transition-all ${
                    isCurrent
                      ? 'border-[var(--mobiris-primary-light)] bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(255,255,255,0.98))] shadow-[0_18px_36px_-28px_rgba(37,99,235,0.65)]'
                      : 'border-slate-200/80 bg-white hover:border-[var(--mobiris-primary-light)] hover:bg-blue-50/30 hover:shadow-[0_18px_36px_-28px_rgba(37,99,235,0.35)]'
                  }`}
                  key={plan.id}
                >
                  <input name="planId" type="hidden" value={plan.id} />
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold tracking-[-0.03em] text-slate-950">
                            {plan.name}
                          </p>
                          <Badge tone={isCurrent || !isUpgrade ? 'neutral' : 'success'}>
                            {isCurrent
                              ? 'Active'
                              : customPlan
                                ? 'Assisted plan'
                                : isUpgrade
                                  ? 'Upgrade option'
                                  : 'Alternative'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {getPlanPriceLabel(plan)}
                        </p>
                        {customPlan ? (
                          <p className="mt-2 text-xs text-slate-500">
                            Enterprise onboarding is handled with custom commercial terms and platform support.
                          </p>
                        ) : null}
                      </div>
                      <Button
                        className="shrink-0"
                        disabled={planPending || isCurrent || customPlan}
                        type="submit"
                        variant={isCurrent ? 'secondary' : isUpgrade ? 'primary' : 'secondary'}
                      >
                        {actionLabel}
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {planHighlights.map((highlight) => (
                        <div
                          className="rounded-[calc(var(--mobiris-radius-card)-0.45rem)] border border-slate-200/80 bg-slate-50/75 px-3 py-2 text-sm text-slate-700"
                          key={`${plan.id}-${highlight}`}
                        >
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              );
            })}
          </div>
          {planState.error ? <Text className="text-rose-700">{planState.error}</Text> : null}
          {planState.success ? <Text className="text-emerald-700">{planState.success}</Text> : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.2)]">
        <CardHeader>
          <CardTitle>Subscription invoice</CardTitle>
          <CardDescription>
            Settle the current SaaS invoice. Verification funding stays on the wallet page and does
            not change your plan limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.outstandingInvoice ? (
            <form action={invoiceAction} className="space-y-4">
              <input name="invoiceId" type="hidden" value={summary.outstandingInvoice.id} />
              <div className="space-y-2">
                <Label htmlFor="invoice-provider">Payment provider</Label>
                <SelectField id="invoice-provider" name="provider" defaultValue="paystack">
                  <option value="paystack">Paystack</option>
                  <option value="flutterwave">Flutterwave</option>
                </SelectField>
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 p-4 text-sm text-slate-600">
                Open invoice:{' '}
                <span className="font-medium text-slate-900">{summary.outstandingInvoice.id}</span>
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

      <Card className="border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.2)] xl:col-span-2">
        <CardHeader>
          <CardTitle>Billing payment method</CardTitle>
          <CardDescription>
            Save a card specifically for subscription billing. This payment method is separate from
            verification funding and will be used for future billing collections once autopay is enabled.
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
                <p>
                  Provider: {summary.billingPaymentMethod.provider}. Added on{' '}
                  {new Date(summary.billingPaymentMethod.createdAt).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  .
                </p>
              </div>
            ) : (
              <Text className="text-sm text-slate-600">
                No billing payment method has been saved yet. Subscription invoices can still be paid
                manually until a billing card is added.
              </Text>
            )}
          </div>
          <form action={billingMethodAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billing-method-provider">Payment provider</Label>
              <SelectField
                defaultValue="paystack"
                id="billing-method-provider"
                name="provider"
              >
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
    </div>
  );
}
