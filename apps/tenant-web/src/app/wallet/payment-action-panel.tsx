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
import { type ChangeEvent, useActionState, useState } from 'react';
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
            <Button disabled={walletPending} type="submit">
              {walletPending ? 'Redirecting...' : 'Fund wallet'}
            </Button>
            {walletState.error ? <Text className="text-rose-700">{walletState.error}</Text> : null}
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80">
        <CardHeader>
          <CardTitle>Company plan</CardTitle>
          <CardDescription>
            Review plan limits and upgrade the company subscription when you need more vehicles,
            more operators, or verification features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">{summary.subscription.planName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {summary.subscription.trialEndsAt
                ? `Free trial ends ${new Date(summary.subscription.trialEndsAt).toLocaleDateString()}`
                : `${summary.subscription.status.replace(/_/g, ' ')} plan`}
            </p>
          </div>
          <div className="space-y-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === summary.subscription.planId;
              return (
                <form
                  action={planAction}
                  className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-white p-4"
                  key={plan.id}
                >
                  <input name="planId" type="hidden" value={plan.id} />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                      <p className="text-sm text-slate-500">
                        {plan.currency} {(plan.basePriceMinorUnits / 100).toLocaleString()} /{' '}
                        {plan.billingInterval}
                      </p>
                    </div>
                    <Button disabled={planPending || isCurrent} type="submit" variant="secondary">
                      {isCurrent ? 'Current plan' : 'Switch plan'}
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
              <Button disabled={invoicePending} type="submit" variant="secondary">
                {invoicePending ? 'Redirecting...' : 'Pay invoice'}
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
