'use client';

import {
  Badge,
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
import { useActionState, useEffect, useState, type ChangeEvent } from 'react';
import type { TenantBillingSummaryRecord } from '../../lib/api-core';
import { SelectField } from '../../features/shared/select-field';
import {
  initializeCardSetupCheckoutAction,
  initializeVerificationWalletTopUpAction,
  type WalletCheckoutActionState,
} from './actions';

const initialState: WalletCheckoutActionState = {};

function parseFundingAmount(amountRaw: string, currencyMinorUnit: number) {
  const normalized = amountRaw.replace(/,/g, '').trim();
  if (!normalized) {
    return { minorUnits: 0, error: 'Enter an amount to continue.' };
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { minorUnits: 0, error: 'Use numbers only, for example 5000 or 5000.50.' };
  }

  const [wholePart = '0', fractionalPart = ''] = normalized.split('.');
  if (fractionalPart.length > currencyMinorUnit) {
    return {
      minorUnits: 0,
      error: `Use no more than ${currencyMinorUnit} decimal place${currencyMinorUnit === 1 ? '' : 's'}.`,
    };
  }
  if (wholePart.length > 12) {
    return {
      minorUnits: 0,
      error: 'Enter a realistic funding amount for one checkout.',
    };
  }

  const paddedFraction = `${fractionalPart}${'0'.repeat(currencyMinorUnit)}`.slice(
    0,
    currencyMinorUnit,
  );
  const combinedDigits = `${wholePart}${paddedFraction}`.replace(/^0+(?=\d)/, '');
  if (!/^\d+$/.test(combinedDigits || '0')) {
    return { minorUnits: 0, error: 'Use numbers only, for example 5000 or 5000.50.' };
  }

  const minorUnits = Number.parseInt(combinedDigits || '0', 10);

  if (!Number.isSafeInteger(minorUnits) || minorUnits <= 0) {
    return { minorUnits: 0, error: 'Enter an amount greater than zero.' };
  }

  return { minorUnits, error: null };
}

function formatMoney(amountMinorUnits: number, currency: string, locale = 'en-NG') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

export function PaymentActionPanel({
  summary,
  currencyMinorUnit,
  locale = 'en-NG',
}: {
  summary: TenantBillingSummaryRecord;
  currencyMinorUnit: number;
  locale?: string;
}) {
  const [walletProvider, setWalletProvider] = useState<'paystack' | 'flutterwave'>('paystack');
  const [cardProvider, setCardProvider] = useState<'paystack' | 'flutterwave'>('paystack');
  const [amountInput, setAmountInput] = useState('');
  const [walletState, walletAction, walletPending] = useActionState(
    initializeVerificationWalletTopUpAction,
    initialState,
  );
  const [cardState, cardAction, cardPending] = useActionState(
    initializeCardSetupCheckoutAction,
    initialState,
  );

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

  useEffect(() => {
    if (walletState.recommendedProvider) {
      setWalletProvider(walletState.recommendedProvider);
    }
  }, [walletState.recommendedProvider]);

  const amountState = parseFundingAmount(amountInput, currencyMinorUnit);
  const fundingDisabled =
    walletPending ||
    Boolean(walletState.checkoutUrl) ||
    amountState.minorUnits <= 0 ||
    Boolean(amountState.error);
  const canVerifyNow = summary.verificationSpend.availableSpendMinorUnits > 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Add verification credit</CardTitle>
          <CardDescription>Enter an amount, confirm the formatted total, and continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label>Choose a funding gateway</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { id: 'paystack', label: 'Paystack', hint: 'Recommended default' },
                { id: 'flutterwave', label: 'Flutterwave', hint: 'Use if you prefer an alternate gateway' },
              ] as const).map((option) => (
                <button
                  className={`rounded-[var(--mobiris-radius-card)] border p-4 text-left transition ${
                    walletProvider === option.id
                      ? 'border-[var(--mobiris-primary)] bg-[var(--mobiris-primary-tint)]'
                      : 'border-slate-200 bg-white hover:border-[var(--mobiris-primary-light)]'
                  }`}
                  key={option.id}
                  onClick={() => setWalletProvider(option.id)}
                  type="button"
                >
                  <Text tone="strong">{option.label}</Text>
                  <Text tone="muted">{option.hint}</Text>
                </button>
              ))}
            </div>
          </div>

          <form action={walletAction} className="space-y-4">
            <input name="provider" type="hidden" value={walletProvider} />
            <input name="currencyMinorUnit" type="hidden" value={String(currencyMinorUnit)} />

            <div className="space-y-2">
              <Label htmlFor="wallet-amount">
                Amount ({summary.verificationWallet.currency})
              </Label>
              <Input
                id="wallet-amount"
                inputMode="decimal"
                name="amount"
                onChange={(event) => setAmountInput(event.target.value)}
                placeholder="5000"
                type="text"
                value={amountInput}
              />
              <Text className="text-xs text-slate-500">
                This exact amount will be sent to checkout.
              </Text>
              {amountState.error ? (
                <Text className="text-xs text-rose-700">{amountState.error}</Text>
              ) : amountState.minorUnits > 0 ? (
                <Text className="text-xs text-emerald-700">
                  You are about to fund{' '}
                  {formatMoney(amountState.minorUnits, summary.verificationWallet.currency, locale)}.
                </Text>
              ) : null}
            </div>

            <Button disabled={fundingDisabled} type="submit">
              {walletPending || walletState.checkoutUrl ? 'Redirecting to checkout...' : 'Continue to funding'}
            </Button>

            {walletState.error ? (
              <div className="rounded-[var(--mobiris-radius-card)] border border-amber-200 bg-amber-50 p-3">
                <Text className="text-sm text-amber-900">{walletState.error}</Text>
                {walletState.recommendedProvider ? (
                  <Text className="mt-1 text-xs text-amber-700">
                    The gateway has been switched to {walletState.recommendedProvider} for your next attempt.
                  </Text>
                ) : null}
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Saved payment method</CardTitle>
          <CardDescription>
            Add one reusable payment method for card-backed verification credit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <Text tone="strong">
                  {summary.verificationSpend.savedCard
                    ? `${summary.verificationSpend.savedCard.brand} ending in ${summary.verificationSpend.savedCard.last4}`
                    : 'No saved payment method'}
                </Text>
                <Text tone="muted">
                  {summary.verificationSpend.savedCard
                    ? `Status: ${summary.verificationSpend.savedCard.status}`
                    : 'Add one to unlock card-backed verification credit for higher tiers.'}
                </Text>
              </div>
              <Badge tone={summary.verificationSpend.savedCard?.active ? 'success' : 'warning'}>
                {summary.verificationSpend.savedCard?.active ? 'Active' : 'Not set up'}
              </Badge>
            </div>
          </div>

          <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-4">
            <Text tone="strong">What you can do next</Text>
            <Text tone="muted">
              {canVerifyNow
                ? 'You already have spend available for company-paid verification. Add a saved payment method only if you want more flexibility later.'
                : 'If available spend is too low, either fund the wallet now or add a saved payment method to unlock card-backed credit.'}
            </Text>
          </div>
          <div className="rounded-[var(--mobiris-radius-card)] border border-blue-100 bg-blue-50/80 p-4">
            <Text tone="strong">Before you continue</Text>
            <Text tone="muted">
              Verification credit payment methods are separate from subscription billing cards. A small {formatMoney(10_000, summary.verificationWallet.currency, locale)} authorization may be used to confirm the card before future charges.
            </Text>
          </div>

          <form action={cardAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-card-provider">Payment provider</Label>
              <SelectField
                id="verification-card-provider"
                name="provider"
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setCardProvider(event.currentTarget.value as 'paystack' | 'flutterwave')
                }
                value={cardProvider}
              >
                <option value="paystack">Paystack</option>
                <option value="flutterwave">Flutterwave</option>
              </SelectField>
            </div>
            <Button disabled={cardPending || Boolean(cardState.checkoutUrl)} type="submit" variant="secondary">
              {cardPending || cardState.checkoutUrl ? 'Opening setup...' : summary.verificationSpend.savedCard ? 'Replace payment method' : 'Add payment method'}
            </Button>
          </form>

          {cardState.error ? (
            <div className="rounded-[var(--mobiris-radius-card)] border border-amber-200 bg-amber-50 p-3">
              <Text className="text-sm text-amber-900">{cardState.error}</Text>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
