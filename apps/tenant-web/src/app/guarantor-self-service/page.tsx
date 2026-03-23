'use client';

import { Card, CardContent, CardHeader, CardTitle, Heading, Text } from '@mobility-os/ui';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { getGuarantorSelfServiceContext } from '../../lib/api-core';
import { DriverIdentityVerification } from '../drivers/driver-identity-verification';

type GuarantorContext = Awaited<ReturnType<typeof getGuarantorSelfServiceContext>>;

// ─────────────────────────────────────────────────────────────
// OTP entry form
// ─────────────────────────────────────────────────────────────

function GuarantorOtpEntryForm() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/guarantor-self-service/exchange-otp`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ otpCode: code.trim().toUpperCase() }),
        },
      );

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setError(body.message ?? 'That code is invalid or has expired. Please try again.');
        return;
      }

      const { token } = (await res.json()) as { token: string };
      window.location.href = `/guarantor-self-service?token=${encodeURIComponent(token)}`;
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
          <CardHeader className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              Guarantor verification
            </Text>
            <CardTitle>Enter your verification code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Text tone="muted">
              Enter the 6-character code from your verification email to continue, or click the
              link in the email directly.
            </Text>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3B7C9"
                maxLength={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] uppercase focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                autoComplete="one-time-code"
                inputMode="text"
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || code.trim().length < 6}
                className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Continue'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Expired card
// ─────────────────────────────────────────────────────────────

function ExpiredLinkCard() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
          <CardHeader className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              Guarantor verification
            </Text>
            <CardTitle>Verification link expired</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Text tone="muted">
              This verification link is no longer valid. Ask the operator to send you a fresh link,
              or enter your 6-character code below if you have one.
            </Text>
            <a
              href="/guarantor-self-service"
              className="inline-block rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
            >
              Enter verification code instead
            </a>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Guarantor verification flow
// ─────────────────────────────────────────────────────────────

function GuarantorVerificationFlow({ token }: { token: string }) {
  const [context, setContext] = useState<GuarantorContext | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'expired' | 'error'>('loading');
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    getGuarantorSelfServiceContext(token)
      .then((ctx) => {
        setContext(ctx);
        setState('ready');
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : '';
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
          setState('expired');
        } else {
          setState('error');
        }
      });
  }, [token]);

  if (state === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)]">
        <Text tone="muted">Loading your verification…</Text>
      </main>
    );
  }

  if (state === 'expired') return <ExpiredLinkCard />;

  if (state === 'error' || !context) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader><CardTitle>Something went wrong</CardTitle></CardHeader>
            <CardContent>
              <Text tone="muted">
                We could not load your verification details. Please try clicking the link in your
                email again.
              </Text>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Build a minimal driver-like object to pass to DriverIdentityVerification
  const driverProxy = {
    id: context.driverId,
    tenantId: context.tenantId,
    firstName: context.guarantorName.split(' ')[0] ?? context.guarantorName,
    lastName: context.guarantorName.split(' ').slice(1).join(' ') || '',
    phone: context.guarantorPhone,
    email: context.guarantorEmail,
    nationality: context.guarantorCountryCode,
    identityStatus: context.guarantorPersonId ? 'verified' : 'unverified',
  } as Parameters<typeof DriverIdentityVerification>[0]['driver'];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fffbeb_28%,#fefce8_62%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="space-y-3">
          <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Mobiris guarantor verification
          </Text>
          <div className="space-y-2">
            <Heading size="h1">{context.guarantorName}</Heading>
            <Text tone="muted">
              You are completing identity verification as a guarantor for{' '}
              <span className="font-semibold text-slate-700">{context.driverName}</span>.
              Complete the live selfie and submit your identification details below.
            </Text>
          </div>
        </section>

        <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle>Driver you are guaranteeing</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-lg font-semibold">{context.driverName}</Text>
            {context.guarantorRelationship && (
              <Text tone="muted" className="mt-1">
                Relationship: {context.guarantorRelationship}
              </Text>
            )}
          </CardContent>
        </Card>

        <DriverIdentityVerification
          defaultCountryCode={context.guarantorCountryCode}
          driver={driverProxy}
          mode="guarantor_self_service"
          selfServiceToken={token}
        />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Page entry point
// ─────────────────────────────────────────────────────────────

function GuarantorSelfServiceInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return <GuarantorOtpEntryForm />;
  }

  return <GuarantorVerificationFlow token={token} />;
}

export default function GuarantorSelfServicePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)]">
          <Text tone="muted">Loading…</Text>
        </main>
      }
    >
      <GuarantorSelfServiceInner />
    </Suspense>
  );
}
