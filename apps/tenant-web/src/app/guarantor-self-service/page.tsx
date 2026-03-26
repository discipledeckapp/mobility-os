'use client';

import { Card, CardContent, CardHeader, CardTitle, Heading, Text } from '@mobility-os/ui';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────
// Guarantor agreement contract
// ─────────────────────────────────────────────────────────────

function GuarantorAgreementCard({
  guarantorName,
  driverName,
  organisationName,
  onAccept,
}: {
  guarantorName: string;
  driverName: string;
  organisationName: string | null;
  onAccept: () => void;
}) {
  const [accepted, setAccepted] = useState(false);
  const org = organisationName ?? 'the operator';
  const today = new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.25)]">
      <CardHeader className="space-y-2 border-b border-amber-100 pb-4">
        <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Guarantor agreement
        </Text>
        <CardTitle>Review and accept before continuing</CardTitle>
        <Text tone="muted">
          Read the agreement below carefully. You will need to confirm that you understand and accept
          your responsibilities as a guarantor before completing identity verification.
        </Text>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Contract document */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed text-slate-700">
          <div className="mb-6 border-b border-slate-200 pb-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Mobiris Fleet Platform</p>
            <p className="mt-1 text-base font-bold text-slate-900">Driver Guarantor Agreement</p>
            <p className="mt-1 text-xs text-slate-500">Date: {today}</p>
          </div>

          <p className="mb-4">
            This agreement is made between <strong className="text-slate-900">{guarantorName}</strong>{' '}
            (&ldquo;Guarantor&rdquo;) and <strong className="text-slate-900">{org}</strong>{' '}
            (&ldquo;Operator&rdquo;) in connection with the engagement of{' '}
            <strong className="text-slate-900">{driverName}</strong> (&ldquo;Driver&rdquo;) on the Mobiris platform.
          </p>

          <div className="space-y-3">
            <div>
              <p className="font-semibold text-slate-900">1. Role of the Guarantor</p>
              <p className="mt-1">
                The Guarantor voluntarily accepts the role of guarantor for the Driver named above. The
                Guarantor confirms that they personally know the Driver and that the information provided
                about the Driver is true to the best of their knowledge.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900">2. Remittance obligations</p>
              <p className="mt-1">
                In the event that the Driver fails to meet remittance obligations owed to the Operator
                (for example, daily or weekly payments for the use of a vehicle), the Operator may
                contact the Guarantor to assist in recovering those outstanding amounts. The Guarantor
                agrees to make reasonable efforts to encourage the Driver to fulfil their obligations.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900">3. No liability for vehicle damage</p>
              <p className="mt-1">
                The Guarantor&rsquo;s responsibility is limited to remittance obligations only. This
                agreement does not make the Guarantor liable for physical damage to any vehicle, road
                traffic violations, or criminal acts committed by the Driver.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900">4. Identity verification</p>
              <p className="mt-1">
                The Guarantor agrees to complete an identity verification step (live selfie and
                government-issued ID check) to confirm their identity. This is required to activate
                the guarantor relationship and to comply with the Operator&rsquo;s onboarding policy.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900">5. Duration</p>
              <p className="mt-1">
                This agreement remains in effect for as long as the Driver is actively engaged with
                the Operator on the Mobiris platform. Either party may request a formal discharge in
                writing to the Operator.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900">6. Consent</p>
              <p className="mt-1">
                By completing the identity verification below, the Guarantor confirms that they have
                read, understood, and voluntarily agreed to the terms set out in this document.
              </p>
            </div>
          </div>
        </div>

        {/* Accept checkbox */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
          />
          <span className="text-sm leading-relaxed text-slate-700">
            I, <strong className="text-slate-900">{guarantorName}</strong>, confirm that I have read the
            Guarantor Agreement above, understand my responsibilities, and voluntarily accept the role of
            guarantor for <strong className="text-slate-900">{driverName}</strong>.
          </span>
        </label>

        <button
          type="button"
          disabled={!accepted}
          onClick={onAccept}
          className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to identity verification
        </button>
      </CardContent>
    </Card>
  );
}
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
  const [agreementAccepted, setAgreementAccepted] = useState(false);
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
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="space-y-2">
          <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Mobiris guarantor verification
          </Text>
          <Heading size="h1">{context.guarantorName}</Heading>
          <Text tone="muted">
            {context.organisationName ?? 'An operator'} has requested you to act as guarantor for{' '}
            <span className="font-semibold text-slate-700">{context.driverName}</span>.
          </Text>
        </section>

        {!agreementAccepted ? (
          <GuarantorAgreementCard
            guarantorName={context.guarantorName}
            driverName={context.driverName}
            organisationName={context.organisationName}
            onAccept={() => setAgreementAccepted(true)}
          />
        ) : (
          <>
            <Card className="border-emerald-200 bg-emerald-50/60">
              <CardContent className="py-3 px-5">
                <Text className="text-sm text-emerald-800">
                  ✓ You have accepted the Guarantor Agreement for{' '}
                  <strong>{context.driverName}</strong>.
                </Text>
              </CardContent>
            </Card>

            <DriverIdentityVerification
              defaultCountryCode={context.guarantorCountryCode}
              driver={driverProxy}
              mode="guarantor_self_service"
              selfServiceToken={token}
            />
          </>
        )}
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
