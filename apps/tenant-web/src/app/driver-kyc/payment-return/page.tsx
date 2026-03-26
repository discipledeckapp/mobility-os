'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';

function DriverKycPaymentReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const called = useRef(false);

  const provider = params?.get('provider') ?? null;
  const token = params?.get('token') ?? null;
  const reference = params?.get('reference') ?? params?.get('trxref') ?? null;

  useEffect(() => {
    if (called.current || !provider || !token || !reference) {
      if (!provider || !token || !reference) {
        setState('error');
        setErrorMsg('Missing payment parameters. Please return to the app and try again.');
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
        setState('success');
      })
      .catch((err: unknown) => {
        setState('error');
        setErrorMsg(err instanceof Error ? err.message : 'Payment verification failed.');
      });
  }, [provider, token, reference]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eff6ff_0%,#f1f5f9_100%)] px-4 py-10">
      <div className="w-full max-w-md">
        {state === 'loading' ? (
          <Card className="border-slate-200 bg-white">
            <CardContent className="py-10 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <Text className="text-slate-600">Verifying your payment…</Text>
            </CardContent>
          </Card>
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
                Your ₦5,000 identity verification payment has been confirmed. You can now return to
                the Mobiris app to complete your identity verification.
              </Text>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <Text className="text-sm font-semibold text-emerald-800">
                  ✓ Payment reference: {reference}
                </Text>
              </div>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Return to app
              </button>
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
              <Text tone="muted">
                If you completed the payment, please contact your fleet manager or our support team
                with your payment reference.
              </Text>
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
          <Text tone="muted">Loading…</Text>
        </main>
      }
    >
      <DriverKycPaymentReturnInner />
    </Suspense>
  );
}
