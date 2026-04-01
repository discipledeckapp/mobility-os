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
  receiptDocumentNumber?: string;
  receiptEmailSentTo?: string[];
  paymentMethod?: {
    last4?: string | null;
    brand?: string | null;
  };
};

function mapFundingSafeError(message?: string) {
  const normalized = message?.toLowerCase() ?? '';

  if (normalized.includes('already_applied') || normalized.includes('already applied')) {
    return 'Your payment was already confirmed and applied to verification funding.';
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
    return 'We could not finish confirming this payment yet. Retry verification now or refresh the page in a moment.';
  }

  if (normalized.includes('method not allowed')) {
    return 'This payment gateway did not complete the return flow correctly. Please restart the funding flow and try the alternate gateway if needed.';
  }

  return 'We could not finish confirming this payment yet. Retry verification now or refresh the page in a moment.';
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
      setError('This checkout return is incomplete. Please restart the funding flow and try again.');
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

        const paymentMethod = response.paymentMethod
          ? {
              ...(response.paymentMethod.last4 ? { last4: response.paymentMethod.last4 } : {}),
              ...(response.paymentMethod.brand ? { brand: response.paymentMethod.brand } : {}),
            }
          : undefined;

        setResult({
          status: response.status,
          provider: response.provider,
          purpose: response.purpose,
          reference: response.reference,
          ...(response.receiptDocumentNumber
            ? { receiptDocumentNumber: response.receiptDocumentNumber }
            : {}),
          ...(response.receiptEmailSentTo ? { receiptEmailSentTo: response.receiptEmailSentTo } : {}),
          ...(paymentMethod ? { paymentMethod } : {}),
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
        setError(mapFundingSafeError(message));
      }
    }

    void verifyPayment(attempt);

    return () => {
      cancelled = true;
    };
  }, [attempt, invoiceId, provider, purpose, reference, status]);

  return (
    <TenantAppShell
      description="Confirm the verification funding outcome and return to the verification funding page."
      eyebrow="Verification Funding"
      title="Funding return"
    >
      <div className="max-w-3xl">
        {state === 'loading' ? (
          <ProcessingStateCard
            activeStep={1}
            message="We are confirming the provider response, applying the payment to verification funding, and refreshing the funding state."
            progressLabel="Verifying your payment"
            steps={[
              'Confirming transaction status',
              'Applying payment to the correct billing purpose',
              'Returning you to verification funding',
            ]}
            tips={[
              'Provider callbacks can take a moment to settle after checkout closes.',
              'Applied payments update verification funding and saved card state automatically.',
            ]}
            title="Confirming your payment"
            variant="payment"
          />
        ) : state === 'success' && result ? (
          <Card className="border-emerald-200 bg-white">
            <CardHeader className="space-y-2">
              <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Payment confirmed
              </Text>
              <CardTitle>Verification funding updated</CardTitle>
              <CardDescription>
                The provider response was confirmed and applied to the correct billing purpose.
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
                {result.receiptDocumentNumber ? (
                  <Text>Receipt: {result.receiptDocumentNumber}</Text>
                ) : null}
                {result.receiptEmailSentTo?.length ? (
                  <Text>Receipt emailed to: {result.receiptEmailSentTo.join(', ')}</Text>
                ) : null}
                {result.purpose === 'card_authorization_setup' ? (
                  <Text>
                    Saved card:{' '}
                    {result.paymentMethod?.brand && result.paymentMethod?.last4
                      ? `${result.paymentMethod.brand} ending in ${result.paymentMethod.last4}`
                      : 'Card activated'}
                  </Text>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all hover:bg-[var(--mobiris-primary-dark)]"
                  href={'/verification-funding' as Route}
                >
                  Return to verification funding
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
                <Link href={'/verification-funding' as Route}>
                  <Button type="button" variant="secondary">
                    Return to verification funding
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TenantAppShell>
  );
}

export default function VerificationFundingPaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <TenantAppShell
          description="Confirm the verification funding outcome and return to the verification funding page."
          eyebrow="Verification Funding"
          title="Funding return"
        >
          <div className="max-w-3xl">
            <ProcessingStateCard
              compact
              message="Preparing the payment callback and loading the latest provider response."
              title="Loading payment status"
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
