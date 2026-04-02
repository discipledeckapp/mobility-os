'use client';

import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ProcessingStateCard,
  Text,
} from '@mobility-os/ui';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { verifyAndApplyTenantPayment } from '../../../lib/api-core';

type PaymentVerificationResult = {
  status: string;
  provider: string;
  purpose: string;
  reference: string;
  invoiceId?: string;
  receiptDocumentNumber?: string;
  receiptEmailSentTo?: string[];
  paymentMethod?: {
    last4?: string | null;
    brand?: string | null;
  };
};

function mapSubscriptionSafeError(message?: string) {
  const normalized = message?.toLowerCase() ?? '';

  if (normalized.includes('already_applied') || normalized.includes('already applied')) {
    return 'This payment outcome was already confirmed and applied to subscription billing.';
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('not successful') ||
    normalized.includes('temporar') ||
    normalized.includes('unavailable') ||
    normalized.includes('timeout') ||
    normalized.includes('gateway') ||
    normalized.includes('bad request')
  ) {
    return 'We could not finish confirming this billing payment yet. Retry verification now or refresh the page in a moment.';
  }

  return 'We could not finish confirming this billing payment yet. Retry verification now or refresh the page in a moment.';
}

function PaymentReturnInner() {
  const params = useSearchParams();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [result, setResult] = useState<PaymentVerificationResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  const provider = params?.get('provider') ?? null;
  const purpose = params?.get('purpose') ?? null;
  const invoiceId = params?.get('invoiceId') ?? null;
  const status = params?.get('status') ?? null;
  const reference =
    params?.get('reference') ??
    params?.get('tx_ref') ??
    params?.get('trxref') ??
    null;

  useEffect(() => {
    if (!provider || !purpose || !reference) {
      setState('error');
      setError('This billing return is incomplete. Please restart the billing flow and try again.');
      return;
    }

    if (status === 'cancelled') {
      setState('error');
      setError('The checkout was cancelled before payment completed.');
      return;
    }

    const resolvedProvider = provider;
    const resolvedPurpose = purpose;
    const resolvedReference = reference;

    let cancelled = false;

    async function verifyPayment(currentAttempt: number) {
      try {
        const response = await verifyAndApplyTenantPayment({
          provider: resolvedProvider,
          purpose: resolvedPurpose,
          reference: resolvedReference,
          ...(invoiceId ? { invoiceId } : {}),
        });

        if (cancelled) {
          return;
        }

        setResult({
          status: response.status,
          provider: response.provider,
          purpose: response.purpose,
          reference: response.reference,
          ...(response.invoiceId ? { invoiceId: response.invoiceId } : {}),
          ...(response.receiptDocumentNumber
            ? { receiptDocumentNumber: response.receiptDocumentNumber }
            : {}),
          ...(response.receiptEmailSentTo ? { receiptEmailSentTo: response.receiptEmailSentTo } : {}),
          ...(response.paymentMethod
            ? {
                paymentMethod: {
                  ...(response.paymentMethod.last4 ? { last4: response.paymentMethod.last4 } : {}),
                  ...(response.paymentMethod.brand ? { brand: response.paymentMethod.brand } : {}),
                },
              }
            : {}),
        });
        setState('success');
      } catch (verificationError) {
        if (cancelled) {
          return;
        }

        const message =
          verificationError instanceof Error ? verificationError.message : undefined;
        const normalized = message?.toLowerCase() ?? '';
        const shouldRetry =
          currentAttempt < 3 &&
          (normalized.includes('pending') ||
            normalized.includes('not successful') ||
            normalized.includes('temporar') ||
            normalized.includes('unavailable') ||
            normalized.includes('timeout') ||
            normalized.includes('gateway'));

        if (shouldRetry) {
          window.setTimeout(() => {
            if (!cancelled) {
              setAttempt(currentAttempt + 1);
            }
          }, 2000);
          return;
        }

        setState('error');
        setError(mapSubscriptionSafeError(message));
      }
    }

    void verifyPayment(attempt);

    return () => {
      cancelled = true;
    };
  }, [attempt, invoiceId, provider, purpose, reference, status]);

  const isBillingMethodSetup = result?.purpose === 'subscription_billing_setup' || purpose === 'subscription_billing_setup';

  return (
    <TenantAppShell
      description="Confirm the subscription billing payment outcome and return to the subscription page."
      eyebrow="Subscription"
      title="Billing return"
    >
      <div className="max-w-3xl">
        {state === 'loading' ? (
          <ProcessingStateCard
            activeStep={1}
            message="We are confirming the provider response, applying it to the right subscription billing purpose, and refreshing your billing state."
            progressLabel="Verifying your billing payment"
            steps={[
              'Confirming transaction status',
              'Applying payment to the correct billing purpose',
              'Returning you to subscription billing',
            ]}
            tips={[
              'Provider callbacks can take a moment to settle after checkout closes.',
              'Saved billing cards and invoice settlements refresh on the subscription page automatically.',
            ]}
            title="Confirming your billing payment"
            variant="payment"
          />
        ) : state === 'success' && result ? (
          <Card className="border-emerald-200 bg-white">
            <CardHeader className="space-y-2">
              <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Payment confirmed
              </Text>
              <CardTitle>
                {isBillingMethodSetup ? 'Billing payment method updated' : 'Subscription invoice settled'}
              </CardTitle>
              <CardDescription>
                The provider response was confirmed and applied to the correct subscription billing purpose.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge tone={result.status === 'applied' ? 'success' : 'warning'}>
                {result.status}
              </Badge>
              <div className="space-y-2 text-sm text-slate-600">
                <Text>Provider: {result.provider}</Text>
                <Text>Purpose: {result.purpose.replace(/_/g, ' ')}</Text>
                <Text>Reference: {result.reference}</Text>
                {result.invoiceId ? <Text>Invoice: {result.invoiceId}</Text> : null}
                {result.receiptDocumentNumber ? (
                  <Text>Receipt: {result.receiptDocumentNumber}</Text>
                ) : null}
                {result.receiptEmailSentTo?.length ? (
                  <Text>Receipt emailed to: {result.receiptEmailSentTo.join(', ')}</Text>
                ) : null}
                {isBillingMethodSetup ? (
                  <Text>
                    Billing card:{' '}
                    {result.paymentMethod?.brand && result.paymentMethod?.last4
                      ? `${result.paymentMethod.brand} ending in ${result.paymentMethod.last4}`
                      : 'Payment method saved'}
                  </Text>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all hover:bg-[var(--mobiris-primary-dark)]"
                  href={'/billing' as Route}
                >
                  Return to billing
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200 bg-white">
            <CardHeader className="space-y-2">
              <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                Verification pending
              </Text>
              <CardTitle>Payment could not be confirmed yet</CardTitle>
              <CardDescription>
                This usually means the gateway callback or webhook has not settled yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Text tone="muted">{error}</Text>
              {reference ? (
                <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <Text className="text-sm text-slate-600">
                    Payment reference: <strong className="text-slate-900">{reference}</strong>
                  </Text>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    setAttempt(0);
                    setError('');
                    setResult(null);
                    setState('loading');
                  }}
                  type="button"
                >
                  Retry verification
                </Button>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                  href={'/billing' as Route}
                >
                  Return to billing
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TenantAppShell>
  );
}

export default function SubscriptionPaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <TenantAppShell
          description="Confirm the subscription billing payment outcome and return to the subscription page."
          eyebrow="Subscription"
          title="Billing return"
        >
          <div className="max-w-3xl">
            <ProcessingStateCard
              activeStep={1}
              message="We are opening your billing confirmation details."
              progressLabel="Preparing payment confirmation"
              steps={[
                'Loading return context',
                'Preparing verification state',
                'Opening the subscription result',
              ]}
              title="Preparing billing confirmation"
              variant="payment"
            />
          </div>
        </TenantAppShell>
      }
    >
      <PaymentReturnInner />
    </Suspense>
  );
}
