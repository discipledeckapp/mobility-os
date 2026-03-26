'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Text,
} from '@mobility-os/ui';
import { type ChangeEvent, useActionState, useEffect, useState } from 'react';
import { SelectField } from '../../features/shared/select-field';
import type { TenantBillingSummaryRecord } from '../../lib/api-core';
import {
  changePlanAction,
  type WalletCheckoutActionState,
  initializeOutstandingInvoiceCheckoutAction,
  initializeVerificationWalletTopUpAction,
} from './actions';
import type { TenantBillingPlanRecord } from '../../lib/api-core';

const initialState: WalletCheckoutActionState = {};

export function PaymentActionPanel({
  summary,
  plans,
  currencyMinorUnit,
}: {
  summary: TenantBillingSummaryRecord;
  plans: TenantBillingPlanRecord[];
  currencyMinorUnit: number;
}) {
  const [provider, setProvider] = useState<'paystack' | 'flutterwave'>('paystack');
  const [amountInput, setAmountInput] = useState('');
  const [walletState, walletAction, walletPending] = useActionState(
    initializeVerificationWalletTopUpAction,
    initialState,
  );
  const [invoiceState, invoiceAction, invoicePending] = useActionState(
    initializeOutstandingInvoiceCheckoutAction,
    initialState,
  );
  const [planState, planAction, planPending] = useActionState(changePlanAction, initialState);

  // Redirect to payment provider when checkout URL is returned from server action
  useEffect(() => {
    if (walletState.checkoutUrl) {
      window.location.href = walletState.checkoutUrl;
    }
  }, [walletState.checkoutUrl]);

  useEffect(() => {
    if (invoiceState.checkoutUrl) {
      window.location.href = invoiceState.checkoutUrl;
    }
  }, [invoiceState.checkoutUrl]);

  const factor = 10 ** currencyMinorUnit;
  const amountMinorUnits = amountInput ? Math.round(Number(amountInput) * factor) : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="border-slate-200/80">
        <CardHeader>
          <CardTitle>Fund verification wallet</CardTitle>
          <CardDescription>
            Add funds to the platform verification wallet used for identity checks and other billed
            platform services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={walletAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-provider">Payment provider</Label>
              <SelectField
                id="wallet-provider"
                name="provider"
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setProvider(event.target.value as 'paystack' | 'flutterwave')
                }
                value={provider}
              >
                <option value="paystack">Paystack</option>
                <option value="flutterwave">Flutterwave</option>
              </SelectField>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-amount">Amount ({summary.verificationWallet.currency})</Label>
              <Input
                id="wallet-amount"
                inputMode="decimal"
                min="0"
                onChange={(event) => setAmountInput(event.target.value)}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={amountInput}
              />
              <input
                name="amountMinorUnits"
                type="hidden"
                value={amountMinorUnits > 0 ? String(amountMinorUnits) : ''}
              />
              <Text className="text-xs text-slate-500">
                The amount is converted to minor units before checkout.
              </Text>
            </div>
            <Button disabled={walletPending || Boolean(walletState.checkoutUrl)} type="submit">
              {walletPending || walletState.checkoutUrl ? 'Redirecting to payment...' : 'Fund wallet'}
            </Button>
            {walletState.error ? <Text className="text-rose-700">{walletState.error}</Text> : null}
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80">
        <CardHeader>
          <CardTitle>Subscription plan</CardTitle>
          <CardDescription>
            Your current plan and available upgrades. Upgrading takes effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current plan badge */}
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
            {/* Limits snapshot */}
            {(() => {
              const f = summary.subscription as unknown as { features?: Record<string, unknown> };
              const features = f.features ?? {};
              const vehicleCap = typeof features.vehicleCap === 'number' ? features.vehicleCap : null;
              const driverCap = typeof features.driverCap === 'number' ? features.driverCap : null;
              const seatLimit = typeof features.seatLimit === 'number' ? features.seatLimit : null;
              if (!vehicleCap && !driverCap && !seatLimit) return null;
              return (
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                  {vehicleCap !== null ? (
                    <span className="rounded-md bg-white/80 border border-slate-200 px-2 py-1">
                      Up to <strong>{vehicleCap}</strong> vehicles
                    </span>
                  ) : null}
                  {driverCap !== null ? (
                    <span className="rounded-md bg-white/80 border border-slate-200 px-2 py-1">
                      Up to <strong>{driverCap}</strong> drivers
                    </span>
                  ) : null}
                  {seatLimit !== null ? (
                    <span className="rounded-md bg-white/80 border border-slate-200 px-2 py-1">
                      Up to <strong>{seatLimit}</strong> operator seats
                    </span>
                  ) : null}
                </div>
              );
            })()}
          </div>

          {/* Plan picker */}
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Available plans
          </p>
          <div className="space-y-2">
            {plans.map((plan) => {
              const isCurrent = plan.id === summary.subscription.planId;
              const f = plan.features;
              const vehicleCap = typeof f.vehicleCap === 'number' ? f.vehicleCap : null;
              const driverCap = typeof f.driverCap === 'number' ? f.driverCap : null;
              const verificationEnabled = f.verificationEnabled === true;
              const walletEnabled = f.walletEnabled === true;
              const price = (plan.basePriceMinorUnits / 100).toLocaleString('en-NG');
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
                      <p className="text-xs text-slate-500 mt-0.5">
                        {plan.currency} {price} / {plan.billingInterval}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {vehicleCap !== null ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            {vehicleCap} vehicles
                          </span>
                        ) : null}
                        {driverCap !== null ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            {driverCap} drivers
                          </span>
                        ) : null}
                        {verificationEnabled ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">
                            Identity verification
                          </span>
                        ) : null}
                        {walletEnabled ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">
                            Verification wallet
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <Button
                      className="shrink-0"
                      disabled={planPending || isCurrent}
                      type="submit"
                      variant={isCurrent ? 'secondary' : 'default'}
                    >
                      {isCurrent ? 'Current' : 'Upgrade'}
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
          <CardTitle>Pay outstanding invoice</CardTitle>
          <CardDescription>
            Settle the current subscription invoice if your organisation already has an open billing
            obligation.
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
              <Button disabled={invoicePending || Boolean(invoiceState.checkoutUrl)} type="submit" variant="secondary">
                {invoicePending || invoiceState.checkoutUrl ? 'Redirecting to payment...' : 'Pay invoice'}
              </Button>
              {invoiceState.error ? (
                <Text className="text-rose-700">{invoiceState.error}</Text>
              ) : null}
            </form>
          ) : (
            <Text>No open subscription invoice needs payment right now.</Text>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
