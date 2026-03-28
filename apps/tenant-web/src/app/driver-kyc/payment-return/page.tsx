'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ProcessingStateCard,
  Text,
} from '@mobility-os/ui';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

type DriverKycResumePayload = {
  token?: string;
  returnUrl?: string;
  driverId?: string;
};

function getDriverKycNextUrl({
  token,
  returnUrl,
}: {
  token: string | null;
  returnUrl: string | null;
}) {
  return (
    returnUrl ??
    (token
      ? `/driver-self-service?token=${encodeURIComponent(token)}`
      : '/driver-self-service/continue')
  );
}

function mapDriverSafeError(message?: string) {
  const normalized = message?.toLowerCase() ?? '';
  if (normalized.includes('already_applied') || normalized.includes('already applied')) {
    return 'Your payment was already confirmed. Continue onboarding.';
  }
  if (
    normalized.includes('pending') ||
    normalized.includes('temporar') ||
    normalized.includes('unavailable') ||
    normalized.includes('timeout') ||
    normalized.includes('failed')
  ) {
    return 'We could not finish confirming your payment yet. Retry verification now.';
  }
  return 'We could not finish confirming your payment yet. Retry verification now.';
}

function DriverKycPaymentReturnInner() {
  const params = useSearchParams();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [resumeContext, setResumeContext] = useState<DriverKycResumePayload | null>(null);
  const called = useRef(false);

  const provider = params?.get('provider') ?? null;
  const tokenFromParams = params?.get('token') ?? null;
  const reference = params?.get('reference') ?? params?.get('trxref') ?? null;
  const returnUrlFromParams = params?.get('returnUrl') ?? null;

  useEffect(() => {
    if (tokenFromParams && returnUrlFromParams) {
      setResumeContext({
        token: tokenFromParams,
        returnUrl: returnUrlFromParams,
      });
      return;
    }

    const storage = window.sessionStorage;
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith('mobiris_driver_kyc_resume_')) {
        continue;
      }

      try {
        const parsed = JSON.parse(storage.getItem(key) ?? '{}') as DriverKycResumePayload;
        if (parsed.token || parsed.returnUrl) {
          setResumeContext(parsed);
          return;
        }
      } catch {
        // Ignore malformed browser state and keep scanning.
      }
    }
  }, [returnUrlFromParams, tokenFromParams]);

  const token = tokenFromParams ?? resumeContext?.token ?? null;
  const returnUrl = returnUrlFromParams ?? resumeContext?.returnUrl ?? null;

  useEffect(() => {
    if (called.current || !provider || !token || !reference) {
      if (!provider || !token || !reference) {
        setState('error');
        setErrorMsg(
          'Missing payment parameters. Return to onboarding and retry payment confirmation.',
        );
      }
      return;
    }
    called.current = true;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

    fetch(`${apiUrl}/driver-self-service/verify-kyc-payment`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, provider, reference }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(body.message ?? `Payment verification failed (${res.status})`);
        }
        if (resumeContext?.driverId) {
          window.sessionStorage.removeItem(`mobiris_driver_kyc_resume_${resumeContext.driverId}`);
        }
        setState('success');
      })
      .catch((err: unknown) => {
        setState('error');
        setErrorMsg(mapDriverSafeError(err instanceof Error ? err.message : undefined));
      });
  }, [provider, reference, resumeContext?.driverId, token]);

  useEffect(() => {
    if (state !== 'success') {
      return;
    }

    const nextUrl = getDriverKycNextUrl({ token, returnUrl });

    const timeout = window.setTimeout(() => {
      if (nextUrl.startsWith('mobiris://')) {
        window.location.href = nextUrl;
        return;
      }
      window.location.href = nextUrl;
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [returnUrl, state, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eff6ff_0%,#f1f5f9_100%)] px-4 py-10">
      <div className="w-full max-w-md">
        {state === 'loading' ? (
          <ProcessingStateCard
            activeStep={1}
            message="We are confirming your transaction, recording the payment, and unlocking the next onboarding step."
            progressLabel="Verifying your payment"
            steps={[
              'Confirming transaction status',
              'Recording payment against onboarding',
              'Returning you to verification',
            ]}
            tips={[
              'Payment confirmation keeps your verification step unlocked across devices.',
              'Recorded verification payments prevent duplicate charges.',
            ]}
            title="Confirming your payment"
            variant="payment"
          />
        ) : state === 'success' ? (
          <Card className="border-emerald-200 bg-white">
            <CardHeader className="space-y-2">
              <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Payment confirmed
              </Text>
              <CardTitle>Your KYC payment is verified</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Text tone="muted">
                Your verification payment has been confirmed. We are taking you back to the next
                onboarding step now.
              </Text>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <Text className="text-sm font-semibold text-emerald-800">
                  ✓ Payment reference: {reference}
                </Text>
              </div>
              <Button
                onClick={() => {
                  const nextUrl = getDriverKycNextUrl({ token, returnUrl });
                  if (nextUrl.startsWith('mobiris://')) {
                    window.location.href = nextUrl;
                    return;
                  }
                  window.location.href = nextUrl;
                }}
              >
                Continue onboarding
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-rose-200 bg-white">
            <CardHeader className="space-y-2">
              <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
                Verification failed
              </Text>
              <CardTitle>Payment could not be verified</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Text tone="muted">{errorMsg}</Text>
              <Button type="button" onClick={() => window.location.reload()}>
                Retry verification
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const nextUrl = getDriverKycNextUrl({ token, returnUrl });
                  window.location.href = nextUrl;
                }}
              >
                Return to onboarding
              </Button>
              {reference ? (
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <Text className="text-sm text-slate-600">
                    Payment reference: <strong className="text-slate-900">{reference}</strong>
                  </Text>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

export default function DriverKycPaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eff6ff_0%,#f1f5f9_100%)]">
          <div className="w-full max-w-md px-4">
            <ProcessingStateCard
              compact
              message="Preparing the payment callback and recovering your onboarding session."
              title="Loading payment status"
              variant="payment"
            />
          </div>
        </main>
      }
    >
      <DriverKycPaymentReturnInner />
    </Suspense>
  );
}
