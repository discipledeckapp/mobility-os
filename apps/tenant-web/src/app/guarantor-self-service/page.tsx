'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Heading, Text } from '@mobility-os/ui';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  createGuarantorSelfServiceAccount,
  exchangeGuarantorSelfServiceOtp,
  getGuarantorSelfServiceContext,
} from '../../lib/api-core';
import { DriverIdentityVerification } from '../drivers/driver-identity-verification';

type GuarantorContext = Awaited<ReturnType<typeof getGuarantorSelfServiceContext>>;
type GuarantorFlowStep = 'account' | 'agreement' | 'verification' | 'complete';

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
      const { token } = await exchangeGuarantorSelfServiceOtp(code.trim().toUpperCase());
      window.location.href = `/guarantor-self-service?token=${encodeURIComponent(token)}`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'That code is invalid or has expired. Please try again.',
      );
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
              Guarantor onboarding
            </Text>
            <CardTitle>Enter your invitation code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Text tone="muted">
              Enter the 6-character code from your onboarding email to continue, or use the link in
              that email directly.
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
              {error ? <Text tone="danger">{error}</Text> : null}
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

function ExpiredLinkCard() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
          <CardHeader className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              Guarantor onboarding
            </Text>
            <CardTitle>Onboarding link expired</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Text tone="muted">
              This onboarding link is no longer valid. If you already created your sign-in account,
              use sign in to continue onboarding. Otherwise ask the operator to send a fresh link or
              enter your 6-character code.
            </Text>
            <div className="flex flex-wrap gap-3">
              <a
                href="/login"
                className="inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Sign in to continue
              </a>
              <a
                href="/guarantor-self-service"
                className="inline-block rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
              >
                Enter invitation code
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function GuarantorAccountStep({
  token,
  context,
  onComplete,
}: {
  token: string;
  context: GuarantorContext;
  onComplete: () => Promise<void>;
}) {
  const [email, setEmail] = useState(context.guarantorEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setError(null);

    if (!normalizedEmail) {
      setError('Enter the email address you will use to sign in.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await createGuarantorSelfServiceAccount(token, {
        email: normalizedEmail,
        password,
      });
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your sign-in account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-2">
        <CardTitle>Create your sign-in account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Text tone="muted">
            Create your account first so you can sign back in later and continue this guarantor
            onboarding flow even if the invitation link expires.
          </Text>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          {error ? <Text tone="danger">{error}</Text> : null}
          <Button disabled={submitting} type="submit">
            {submitting ? 'Creating account…' : 'Create sign-in account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function GuarantorAgreementCard({
  context,
  onAccept,
}: {
  context: GuarantorContext;
  onAccept: () => void;
}) {
  const [accepted, setAccepted] = useState(false);
  const org = context.organisationName ?? 'the operator';
  const today = new Date().toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.25)]">
      <CardHeader className="space-y-2 border-b border-amber-100 pb-4">
        <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Guarantor agreement
        </Text>
        <CardTitle>Review and accept before continuing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed text-slate-700">
          <div className="mb-6 border-b border-slate-200 pb-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Mobiris Fleet Platform
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">Driver Guarantor Agreement</p>
            <p className="mt-1 text-xs text-slate-500">Date: {today}</p>
          </div>

          <p className="mb-4">
            This agreement is made between{' '}
            <strong className="text-slate-900">{context.guarantorName}</strong> and{' '}
            <strong className="text-slate-900">{org}</strong> in connection with the engagement of{' '}
            <strong className="text-slate-900">{context.driverName}</strong>.
          </p>

          <div className="space-y-3">
            <p>
              You agree to act as guarantor for the driver named above and confirm that you know the
              driver personally.
            </p>
            <p>
              Your responsibilities relate to remittance-recovery support only. This agreement does
              not make you liable for physical vehicle damage or criminal conduct by the driver.
            </p>
            <p>
              You must complete live identity verification so the operator can activate this
              guarantor linkage.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
          />
          <span className="text-sm leading-relaxed text-slate-700">
            I have read, understood, and accept this guarantor agreement for{' '}
            <strong className="text-slate-900">{context.driverName}</strong>.
          </span>
        </label>

        <button
          type="button"
          disabled={!accepted}
          onClick={onAccept}
          className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to live verification
        </button>
      </CardContent>
    </Card>
  );
}

function GuarantorCompletionCard({ context }: { context: GuarantorContext }) {
  const statusLabel =
    context.guarantorPersonId || context.guarantorStatus === 'active'
      ? 'Verification submitted'
      : 'Onboarding complete';

  return (
    <Card className="border-emerald-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.25)]">
      <CardHeader className="space-y-2">
        <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Guarantor onboarding
        </Text>
        <CardTitle>{statusLabel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Text tone="muted">
          Your guarantor onboarding has been submitted for {context.driverName}. If your operator
          needs anything else, they will contact you directly.
        </Text>
        <a
          href="/login"
          className="inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Sign in later to check status
        </a>
      </CardContent>
    </Card>
  );
}

function getFlowStep(context: GuarantorContext): GuarantorFlowStep {
  if (!context.hasSelfServiceAccess) {
    return 'account';
  }
  if (context.guarantorPersonId) {
    return 'complete';
  }
  return 'agreement';
}

function GuarantorVerificationFlow({ token }: { token: string }) {
  const [context, setContext] = useState<GuarantorContext | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'expired' | 'error'>('loading');
  const [currentStep, setCurrentStep] = useState<GuarantorFlowStep>('account');
  const loaded = useRef(false);

  const refreshContext = async () => {
    const nextContext = await getGuarantorSelfServiceContext(token);
    setContext(nextContext);
    setCurrentStep(getFlowStep(nextContext));
  };

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    refreshContext()
      .then(() => setState('ready'))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message.toLowerCase() : '';
        setState(msg.includes('expired') || msg.includes('invalid') ? 'expired' : 'error');
      });
  }, [token]);

  const driverProxy = useMemo(() => {
    if (!context) {
      return null;
    }
    return {
      id: context.driverId,
      tenantId: context.tenantId,
      firstName: context.guarantorName.split(' ')[0] ?? context.guarantorName,
      lastName: context.guarantorName.split(' ').slice(1).join(' ') || '',
      phone: context.guarantorPhone,
      email: context.guarantorEmail,
      nationality: context.guarantorCountryCode,
      identityStatus: context.guarantorPersonId ? 'verified' : 'unverified',
    } as Parameters<typeof DriverIdentityVerification>[0]['driver'];
  }, [context]);

  if (state === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)]">
        <Text tone="muted">Loading your onboarding…</Text>
      </main>
    );
  }

  if (state === 'expired') {
    return <ExpiredLinkCard />;
  }

  if (state === 'error' || !context || !driverProxy) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <Text tone="muted">
                We could not load your guarantor onboarding details. Please try the link in your
                email again.
              </Text>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fffbeb_28%,#fefce8_62%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="space-y-2">
          <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Mobiris guarantor onboarding
          </Text>
          <Heading size="h1">{context.guarantorName}</Heading>
          <Text tone="muted">
            {context.organisationName ?? 'An operator'} has requested you to act as guarantor for{' '}
            <span className="font-semibold text-slate-700">{context.driverName}</span>.
          </Text>
        </section>

        {currentStep === 'account' ? (
          <GuarantorAccountStep token={token} context={context} onComplete={refreshContext} />
        ) : null}

        {currentStep === 'agreement' ? (
          <GuarantorAgreementCard
            context={context}
            onAccept={() => setCurrentStep('verification')}
          />
        ) : null}

        {currentStep === 'verification' ? (
          <DriverIdentityVerification
            defaultCountryCode={context.guarantorCountryCode}
            driver={driverProxy}
            mode="guarantor_self_service"
            onVerificationSubmitted={() => {
              void refreshContext();
            }}
            selfServiceToken={token}
          />
        ) : null}

        {currentStep === 'complete' ? <GuarantorCompletionCard context={context} /> : null}
      </div>
    </main>
  );
}

function GuarantorSelfServiceInner() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? null;

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
