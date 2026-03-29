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
  initializeCardSetupCheckoutAction,
  type WalletCheckoutActionState,
  initializeVerificationWalletTopUpAction,
} from './actions';

const initialState: WalletCheckoutActionState = {};

export function PaymentActionPanel({
  summary,
  currencyMinorUnit,
}: {
  summary: TenantBillingSummaryRecord;
  currencyMinorUnit: number;
}) {
  const [provider, setProvider] = useState<'paystack' | 'flutterwave'>('paystack');
  const [amountInput, setAmountInput] = useState('');
  const [walletState, walletAction, walletPending] = useActionState(
    initializeVerificationWalletTopUpAction,
    initialState,
  );
  const [cardState, cardAction, cardPending] = useActionState(
    initializeCardSetupCheckoutAction,
    initialState,
  );

  // Redirect to payment provider when checkout URL is returned from server action
  useEffect(() => {
    if (walletState.checkoutUrl) {
      window.location.href = walletState.checkoutUrl;
    }
  }, [walletState.checkoutUrl]);

  useEffect(() => {
    if (cardState.checkoutUrl) {
      window.location.href = cardState.checkoutUrl;
    }
  }, [cardState.checkoutUrl]);

  const factor = 10 ** currencyMinorUnit;
  const normalizedAmount = amountInput.replace(/,/g, '').trim();
  const enteredAmount = normalizedAmount ? Number(normalizedAmount) : Number.NaN;
  const amountMinorUnits = Number.isFinite(enteredAmount)
    ? Math.round(enteredAmount * factor)
    : 0;
  const amountInvalid =
    amountInput.length > 0 && (!Number.isFinite(enteredAmount) || amountMinorUnits <= 0);
  const walletSubmitDisabled =
    walletPending || Boolean(walletState.checkoutUrl) || amountMinorUnits <= 0 || amountInvalid;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-slate-200/80">
        <CardHeader>
          <CardTitle>Add active card</CardTitle>
          <CardDescription>
            Save a reusable card with a small provider-hosted authorization. We only keep masked
            card details plus the provider authorization token.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={cardAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-provider">Payment provider</Label>
              <SelectField
                id="card-provider"
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
            <input name="amountMinorUnits" type="hidden" value="10000" />
            <Text className="text-xs text-slate-500">
              A small NGN 100 authorization will be processed through the hosted modal. Successful
              setups also count as wallet credit.
            </Text>
            <Button disabled={cardPending || Boolean(cardState.checkoutUrl)} type="submit">
              {cardPending || cardState.checkoutUrl ? 'Opening provider modal...' : 'Add card'}
            </Button>
            {cardState.error ? <Text className="text-rose-700">{cardState.error}</Text> : null}
          </form>
        </CardContent>
      </Card>

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
                min={factor === 1 ? '1' : '0.01'}
                name="amount"
                onChange={(event) => setAmountInput(event.target.value)}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={amountInput}
              />
              <input name="currencyMinorUnit" type="hidden" value={String(currencyMinorUnit)} />
              <Text className="text-xs text-slate-500">
                Enter the amount you want to fund. Checkout will use this exact amount.
              </Text>
              {amountInvalid ? (
                <Text className="text-xs text-rose-700">
                  Enter an amount greater than zero before starting payment.
                </Text>
              ) : null}
            </div>
            <Button disabled={walletSubmitDisabled} type="submit">
              {walletPending || walletState.checkoutUrl ? 'Redirecting to payment...' : 'Fund wallet'}
            </Button>
            {walletState.error ? <Text className="text-rose-700">{walletState.error}</Text> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
