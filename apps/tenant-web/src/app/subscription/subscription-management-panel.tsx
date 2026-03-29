'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Text } from '@mobility-os/ui';
import { useActionState, useEffect } from 'react';
import type { TenantBillingPlanRecord, TenantBillingSummaryRecord } from '../../lib/api-core';
import {
  changePlanAction,
  initializeOutstandingInvoiceCheckoutAction,
  type WalletCheckoutActionState,
} from '../wallet/actions';
import { SelectField } from '../../features/shared/select-field';

const initialState: WalletCheckoutActionState = {};

function formatMajorAmount(amountMinorUnits: number): string {
  return (amountMinorUnits / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
  const enforcement = summary.subscription.enforcement;

  useEffect(() => {
    if (invoiceState.checkoutUrl) {
      window.location.href = invoiceState.checkoutUrl;
    }
  }, [invoiceState.checkoutUrl]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-slate-200/80">
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

          <div className="rounded-[var(--mobiris-radius-card)] border border-blue-200/80 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              <p className="text-sm font-semibold text-slate-900">{summary.subscription.planName}</p>
              <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                Active plan
              </span>
            </div>
            {summary.subscription.trialEndsAt ? (
              <p className="mt-2 text-xs text-amber-700">
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

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Available plans
          </p>
          <div className="space-y-2">
            {plans.map((plan) => {
              const isCurrent = plan.id === summary.subscription.planId;
              const features = plan.features;
              const maxVehicles =
                typeof features.vehicleCap === 'number' ? features.vehicleCap : null;
              const maxDrivers =
                typeof features.driverCap === 'number' ? features.driverCap : null;
              const maxSeats =
                typeof features.seatLimit === 'number' ? features.seatLimit : null;
              const price = formatMajorAmount(plan.basePriceMinorUnits);

              return (
                <form
                  action={planAction}
                  className={`rounded-[var(--mobiris-radius-card)] border p-4 transition-colors ${
                    isCurrent
                      ? 'border-blue-200 bg-blue-50/50'
                      : 'border-slate-200/80 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
                  key={plan.id}
                >
                  <input name="planId" type="hidden" value={plan.id} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {plan.currency} {price} / {plan.billingInterval}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {maxDrivers === null ? 'Unlimited' : maxDrivers} drivers
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {maxVehicles === null ? 'Unlimited' : maxVehicles} vehicles
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                          {maxSeats === null ? 'Unlimited' : maxSeats} seats
                        </span>
                      </div>
                    </div>
                    <Button
                      className="shrink-0"
                      disabled={planPending || isCurrent}
                      type="submit"
                      variant={isCurrent ? 'secondary' : 'primary'}
                    >
                      {isCurrent ? 'Current' : 'Change plan'}
                    </Button>
                  </div>
                </form>
              );
            })}
          </div>
          {planState.error ? <Text className="text-rose-700">{planState.error}</Text> : null}
          {planState.success ? <Text className="text-emerald-700">{planState.success}</Text> : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80">
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
    </div>
  );
}
