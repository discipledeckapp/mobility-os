'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Heading, Text } from '@mobility-os/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  createGuarantorSelfServiceAccount,
  disconnectGuarantorSelfService,
  exchangeGuarantorSelfServiceOtp,
  getGuarantorSelfServiceContext,
  recordGuarantorSelfServiceVerificationConsent,
} from '../../lib/api-core';
import { SelfServiceSignOutButton } from '../../components/self-service-sign-out-button';
import { AuthSplitShell } from '../(auth)/auth-split-shell';
import { DriverIdentityVerification } from '../drivers/driver-identity-verification';

type GuarantorContext = Awaited<ReturnType<typeof getGuarantorSelfServiceContext>>;
type GuarantorFlowStep = 'preview' | 'consent' | 'account' | 'verification' | 'complete';

const GUARANTOR_DECLINE_REASONS = [
  "I don't know this person",
  'Wrong contact',
  'Suspicious request',
] as const;

function getGuarantorIdentityImageSources(
  context: GuarantorContext,
  selfServiceToken?: string | null,
): {
  selfie: string | null;
  provider: string | null;
} {
  const proxiedSelfieUrl =
    selfServiceToken && context.guarantorSelfieImageUrl
      ? `/api/guarantor-self-service/identity-image/selfie?token=${encodeURIComponent(selfServiceToken)}`
      : null;
  const proxiedProviderUrl =
    selfServiceToken && context.guarantorProviderImageUrl
      ? `/api/guarantor-self-service/identity-image/provider?token=${encodeURIComponent(selfServiceToken)}`
      : null;

  return {
    selfie: proxiedSelfieUrl ?? context.guarantorSelfieImageUrl ?? null,
    provider: proxiedProviderUrl ?? context.guarantorProviderImageUrl ?? null,
  };
}

function GuarantorOtpEntryForm({ onToken }: { onToken: (token: string) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { token } = await exchangeGuarantorSelfServiceOtp(code.trim().toUpperCase());
      router.replace(`/guarantor-self-service?token=${encodeURIComponent(token)}` as never);
      onToken(token);
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
    <AuthSplitShell
      accentClassName="text-amber-200"
      brandCaption="Guarantor Self-Service Portal"
      brandLabel="Mobiris Guarantor"
      eyebrow="Guarantor access"
      footerText={`© ${new Date().getFullYear()} Mobiris. Guarantor access secured by Growth Figures Limited.`}
      heroBullets={[
        'Review the invitation first',
        'Accept before identity verification begins',
        'Create your sign-in account after verification',
      ]}
      heroDescription="Enter your invitation code to review the request and continue step by step."
      heroTitle={
        <>
          Review the request.
          <br />
          Confirm when ready. <span className="text-amber-200">Continue securely.</span>
        </>
      }
      mobileBrandLabel="Mobiris Guarantor"
      panelClassName="bg-[linear-gradient(135deg,#78350f_0%,#d97706_52%,#f59e0b_100%)]"
      subtitle="Use the 6-character code from your invite email."
      title="Enter invitation code"
    >
      <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              autoComplete="one-time-code"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] uppercase focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              inputMode="text"
              maxLength={6}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="A3B7C9"
              type="text"
              value={code}
            />
            {error ? <Text tone="danger">{error}</Text> : null}
            <button
              className="w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
              disabled={loading || code.trim().length < 6}
              type="submit"
            >
              {loading ? 'Checking code…' : 'Continue'}
            </button>
          </form>
        </CardContent>
      </Card>
    </AuthSplitShell>
  );
}

function ExpiredLinkCard() {
  return (
    <AuthSplitShell
      accentClassName="text-amber-200"
      brandCaption="Guarantor Self-Service Portal"
      brandLabel="Mobiris Guarantor"
      eyebrow="Guarantor onboarding"
      footerText={`© ${new Date().getFullYear()} Mobiris. Guarantor access secured by Growth Figures Limited.`}
      heroDescription="Return with a fresh invite or your code to resume this guarantor request."
      heroTitle={
        <>
          This link expired.
          <br />
          Your access did not. <span className="text-amber-200">Pick up again.</span>
        </>
      }
      mobileBrandLabel="Mobiris Guarantor"
      panelClassName="bg-[linear-gradient(135deg,#78350f_0%,#d97706_52%,#f59e0b_100%)]"
      subtitle="Use a fresh link, your invitation code, or sign in if you already created an account."
      title="Invitation expired"
    >
      <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
        <CardContent className="space-y-3 pt-6">
          <Text tone="muted">
            This link is no longer valid. You can still continue with your code or sign in if you
            already created an account.
          </Text>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-3 text-sm font-medium text-white hover:bg-amber-700"
              href="/login"
            >
              Sign in
            </a>
            <a
              className="inline-flex items-center justify-center rounded-2xl border border-amber-200 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-50"
              href="/guarantor-self-service"
            >
              Enter invitation code
            </a>
          </div>
        </CardContent>
      </Card>
    </AuthSplitShell>
  );
}

function StepBadge({
  currentStep,
}: {
  currentStep: GuarantorFlowStep;
}) {
  const steps: Array<{ key: GuarantorFlowStep; label: string }> = [
    { key: 'preview', label: 'Driver' },
    { key: 'consent', label: 'Consent' },
    { key: 'account', label: 'Account' },
    { key: 'verification', label: 'Liveness + NIN' },
    { key: 'complete', label: 'Done' },
  ];
  const activeIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const active = index === activeIndex;
        const complete = index < activeIndex;
        return (
          <span
            key={step.key}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              active
                ? 'bg-amber-600 text-white'
                : complete
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-white text-slate-500'
            }`}
          >
            {step.label}
          </span>
        );
      })}
    </div>
  );
}

function IdentityImageCard({
  src,
  alt,
  title,
  fallback,
}: {
  src: string | null;
  alt: string;
  title: string;
  fallback: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="space-y-2 rounded-3xl border border-slate-200 bg-white p-4">
      <Text className="font-semibold text-[var(--mobiris-ink)]">{title}</Text>
      {src && !failed ? (
        <img
          alt={alt}
          className="h-56 w-full rounded-2xl border border-slate-200 bg-slate-100 object-cover"
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
          <Text tone="muted">{fallback}</Text>
        </div>
      )}
    </div>
  );
}

function GuarantorIdentityImages({
  context,
  token,
}: {
  context: GuarantorContext;
  token: string;
}) {
  const images = getGuarantorIdentityImageSources(context, token);

  return (
    <div className="grid gap-4">
      <IdentityImageCard
        alt="Guarantor live selfie"
        fallback="No live selfie is available yet."
        src={images.selfie}
        title="Live selfie"
      />
      <IdentityImageCard
        alt="Guarantor government identity image"
        fallback="No government image was returned yet."
        src={images.provider}
        title="Government image"
      />
    </div>
  );
}

function GuarantorPreviewStep({
  token,
  context,
  onContinue,
}: {
  token: string;
  context: GuarantorContext;
  onContinue: () => void;
}) {
  const [declined, setDeclined] = useState(false);
  const [declineReason, setDeclineReason] =
    useState<(typeof GUARANTOR_DECLINE_REASONS)[number]>(GUARANTOR_DECLINE_REASONS[0]);
  const [declineSubmitting, setDeclineSubmitting] = useState(false);
  const [declineComplete, setDeclineComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const driverPreviewImageUrl =
    context.driverPreviewImageAvailable
      ? `/api/guarantor-self-service/driver-preview-image?token=${encodeURIComponent(token)}`
      : null;

  async function handleDecline() {
    setDeclineSubmitting(true);
    setError(null);

    try {
      await disconnectGuarantorSelfService(token, declineReason);
      setDeclineComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit your decline right now.');
    } finally {
      setDeclineSubmitting(false);
    }
  }

  if (declineComplete) {
    return (
      <Card className="border-rose-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.25)]">
        <CardHeader className="space-y-2">
          <CardTitle>Request declined</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Text tone="muted">
            Your decline was recorded and {context.organisationName ?? 'the organisation'} has been
            notified for follow-up.
          </Text>
          <a
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
            href="/guarantor-self-service"
          >
            Exit
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.25)]">
      <CardHeader className="space-y-2">
        <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Step 1
        </Text>
        <CardTitle>Identify the driver request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
          <Text className="font-medium text-amber-900">
            You can review enough to decide, but sensitive driver data stays protected until you accept.
          </Text>
        </div>

        <IdentityImageCard
          alt="Driver preview selfie"
          fallback="No driver preview image is available."
          src={driverPreviewImageUrl}
          title="Driver preview image"
        />

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Driver
              </Text>
              <Text>{context.driverName}</Text>
            </div>
            <div>
              <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Organisation
              </Text>
              <Text>{context.organisationName ?? 'Not provided'}</Text>
            </div>
            <div>
              <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Driver phone
              </Text>
              <Text>{context.driverMaskedPhone ?? 'Not available'}</Text>
            </div>
            <div>
              <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Driver email
              </Text>
              <Text>{context.driverMaskedEmail ?? 'Not available'}</Text>
            </div>
            <div className="sm:col-span-2">
              <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                You were invited as
              </Text>
              <Text>
                {context.guarantorName}
                {context.guarantorEmail ? ` • ${context.guarantorEmail}` : ''}
              </Text>
            </div>
          </dl>
        </div>

        {declined ? (
          <div className="space-y-3 rounded-3xl border border-rose-200 bg-rose-50 p-4">
            <Text className="font-medium text-rose-900">Why are you declining?</Text>
            <div className="space-y-2">
              {GUARANTOR_DECLINE_REASONS.map((reason) => (
                <label key={reason} className="flex items-start gap-3 rounded-2xl bg-white p-3">
                  <input
                    checked={declineReason === reason}
                    className="mt-1 accent-rose-600"
                    name="decline-reason"
                    onChange={() => setDeclineReason(reason)}
                    type="radio"
                  />
                  <span className="text-sm text-slate-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <Text tone="danger">{error}</Text> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          {declined ? (
            <>
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setDeclined(false)}
                type="button"
              >
                Back
              </button>
              <button
                className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                disabled={declineSubmitting}
                onClick={() => {
                  void handleDecline();
                }}
                type="button"
              >
                {declineSubmitting ? 'Submitting…' : 'Decline request'}
              </button>
            </>
          ) : (
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setDeclined(true)}
              type="button"
            >
              Decline request
            </button>
          )}
          <button
            className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            disabled={declined}
            onClick={onContinue}
            type="button"
          >
            Continue
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function GuarantorConsentStep({
  context,
  onBack,
  onAccept,
}: {
  context: GuarantorContext;
  onBack: () => void;
  onAccept: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setSubmitting(true);
    setError(null);

    try {
      await onAccept();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your response right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.25)]">
      <CardHeader className="space-y-2">
        <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Step 2
        </Text>
        <CardTitle>Consent to be a guarantor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
          <Text className="font-medium text-amber-900">
            You are being asked to act as guarantor for {context.driverName}.
          </Text>
          <Text className="mt-1 text-sm text-amber-900/80">
            If you accept, you will create your sign-in account next, then complete liveness and NIN verification.
          </Text>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <dl className="grid gap-4">
            <div>
              <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Organisation
              </Text>
              <Text>{context.organisationName ?? 'Not provided'}</Text>
            </div>
            <div>
              <Text className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Driver
              </Text>
              <Text>{context.driverName}</Text>
            </div>
          </dl>
        </div>

        {error ? <Text tone="danger">{error}</Text> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onBack}
            type="button"
          >
            Back
          </button>
          <button
            className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            disabled={submitting}
            onClick={() => {
              void handleAccept();
            }}
            type="button"
          >
            {submitting ? 'Saving…' : 'Accept guarantor request'}
          </button>
        </div>
      </CardContent>
    </Card>
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Step 3
        </Text>
        <CardTitle>Create your sign-in account</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Text tone="muted">Create a password so you can sign back in before liveness and NIN verification.</Text>
          <input
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
          <div className="relative">
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-24 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-amber-700"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="relative">
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-24 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-amber-700"
              onClick={() => setShowConfirmPassword((current) => !current)}
              type="button"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {error ? <Text tone="danger">{error}</Text> : null}
          <Button disabled={submitting} type="submit">
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function GuarantorCompletionCard() {
  return (
    <Card className="border-emerald-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.25)]">
      <CardHeader className="space-y-2">
        <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Guarantor onboarding
        </Text>
        <CardTitle>You&apos;re all set</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Text tone="muted">
          Your guarantor onboarding is complete. You can sign in later to check your status.
        </Text>
        <a
          className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-3 text-sm font-medium text-white hover:bg-amber-700"
          href="/login"
        >
          Sign in later
        </a>
      </CardContent>
    </Card>
  );
}

function getFlowStep(context: GuarantorContext): GuarantorFlowStep {
  if (!context.guarantorResponsibilityAcceptedAt) {
    return 'preview';
  }
  if (!context.hasSelfServiceAccess) {
    return 'account';
  }
  if (!context.guarantorPersonId) {
    return 'verification';
  }
  return 'complete';
}

function GuarantorVerificationFlow({ token }: { token: string }) {
  const [context, setContext] = useState<GuarantorContext | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'expired' | 'error'>('loading');
  const [currentStep, setCurrentStep] = useState<GuarantorFlowStep>('preview');
  const [preAcceptanceStep, setPreAcceptanceStep] = useState<'preview' | 'consent'>('preview');
  const displayedStep =
    currentStep === 'preview' && preAcceptanceStep === 'consent' ? 'consent' : currentStep;

  const refreshContext = async () => {
    const nextContext = await getGuarantorSelfServiceContext(token);
    setContext(nextContext);
    const derivedStep = getFlowStep(nextContext);
    setCurrentStep(derivedStep);
    if (derivedStep !== 'preview') {
      setPreAcceptanceStep('preview');
    }
  };

  useEffect(() => {
    let active = true;
    setState('loading');
    setContext(null);

    refreshContext()
      .then(() => {
        if (active) {
          setState('ready');
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message.toLowerCase() : '';
        if (active) {
          setState(message.includes('expired') || message.includes('invalid') ? 'expired' : 'error');
        }
      });

    return () => {
      active = false;
    };
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
        <Text tone="muted">Loading your guarantor workspace…</Text>
      </main>
    );
  }

  if (state === 'expired') {
    return <ExpiredLinkCard />;
  }

  if (state === 'error' || !context || !driverProxy) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fffbeb_0%,#fef3c7_100%)] px-4 py-10">
        <div className="mx-auto max-w-xl">
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fffbeb_28%,#fefce8_62%,#ffffff_100%)] px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-xl space-y-5">
        <section className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                Mobiris guarantor onboarding
              </Text>
              <Heading size="h1">Guarantor request</Heading>
              <Text tone="muted">
                Review the request for <span className="font-semibold text-slate-700">{context.driverName}</span> from{' '}
                {context.organisationName ?? 'the organisation'}.
              </Text>
            </div>
            <SelfServiceSignOutButton
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-amber-200 px-4 text-sm font-medium text-amber-800 hover:bg-amber-50"
              href="/guarantor-self-service"
            />
          </div>
          <StepBadge currentStep={displayedStep} />
        </section>

        {currentStep === 'preview' && preAcceptanceStep === 'preview' ? (
          <GuarantorPreviewStep
            context={context}
            token={token}
            onContinue={() => setPreAcceptanceStep('consent')}
          />
        ) : null}

        {currentStep === 'preview' && preAcceptanceStep === 'consent' ? (
          <GuarantorConsentStep
            context={context}
            onBack={() => setPreAcceptanceStep('preview')}
            onAccept={async () => {
              await recordGuarantorSelfServiceVerificationConsent(token);
              await refreshContext();
            }}
          />
        ) : null}

        {currentStep === 'verification' ? (
          <>
            <Card className="border-amber-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.25)]">
              <CardHeader className="space-y-2">
                <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  Step 4
                </Text>
                <CardTitle>Complete liveness and NIN verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Text tone="muted">
                  Complete live selfie and identity verification to continue this guarantor request.
                </Text>
                <GuarantorIdentityImages context={context} token={token} />
              </CardContent>
            </Card>
            <DriverIdentityVerification
              defaultCountryCode={context.guarantorCountryCode}
              driver={driverProxy}
              mode="guarantor_self_service"
              onVerificationSubmitted={() => {
                void refreshContext();
              }}
              selfServiceToken={token}
            />
          </>
        ) : null}

        {currentStep === 'account' ? (
          <GuarantorAccountStep context={context} onComplete={refreshContext} token={token} />
        ) : null}

        {currentStep === 'complete' ? <GuarantorCompletionCard /> : null}
      </div>
    </main>
  );
}

function GuarantorSelfServiceInner() {
  const searchParams = useSearchParams();
  const [tokenOverride, setTokenOverride] = useState<string | null>(null);
  const token = tokenOverride ?? searchParams?.get('token') ?? null;

  if (!token) {
    return <GuarantorOtpEntryForm onToken={setTokenOverride} />;
  }

  return <GuarantorVerificationFlow key={token} token={token} />;
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
