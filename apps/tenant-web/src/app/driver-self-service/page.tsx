'use client';

import { getDocumentType } from '@mobility-os/domain-config';
import { Button, Card, CardContent, CardHeader, CardTitle, Heading, Text } from '@mobility-os/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  type DocumentVerificationRecord,
  type DriverRecord,
  type OnboardingStepRecord,
  createDriverSelfServiceAccount,
  getDriverOnboardingStep,
  getDriverSelfServiceContext,
  initiateDriverKycCheckout,
  loginDriverSelfServiceWithPassword,
  recordDriverSelfServiceVerificationConsent,
  updateDriverSelfServiceContact,
  updateDriverSelfServiceProfile,
  verifyDriverDocumentId,
} from '../../lib/api-core';
import { DriverIdentityVerification } from '../drivers/driver-identity-verification';

// ---------------------------------------------------------------------------
// Entry screens (no token)
// ---------------------------------------------------------------------------

function OtpEntryForm({ onSuccess }: { onSuccess: (token: string) => void }) {
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
        `${process.env.NEXT_PUBLIC_API_URL}/driver-self-service/exchange-otp`,
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
      onSuccess(token);
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Text tone="muted">
        Enter the 6-character code from your onboarding email to continue, or click the link in the
        email directly.
      </Text>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="e.g. A3B7C9"
        maxLength={6}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        autoComplete="one-time-code"
        inputMode="text"
      />
      {error ? <Text tone="danger">{error}</Text> : null}
      <button
        type="submit"
        disabled={loading || code.trim().length < 6}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Verifying…' : 'Continue'}
      </button>
    </form>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" x2="23" y1="1" y2="23" />
    </svg>
  ) : (
    <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError('Enter the email or phone number linked to your account.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/password-reset/request`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim() }),
        },
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setError(body.message ?? 'Unable to send reset link. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          If an account exists for that email or phone number, a password reset link has been sent. Check your inbox or messages.
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-blue-600 underline hover:text-blue-700"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Text tone="muted">
        Enter the email address or phone number linked to your account and we will send you a reset link.
      </Text>
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email or phone number"
        autoComplete="username"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      {error ? <Text tone="danger">{error}</Text> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending reset link…' : 'Send reset link'}
      </button>
      <p className="text-center text-sm text-slate-500">
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-blue-600 underline hover:text-blue-700"
        >
          Back to sign in
        </button>
      </p>
    </form>
  );
}

function PasswordLoginForm({
  onSuccess,
  onForgotPassword,
}: {
  onSuccess: (token: string) => void;
  onForgotPassword: () => void;
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password.trim()) {
      setError('Enter your email or phone and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await loginDriverSelfServiceWithPassword(identifier.trim(), password);
      onSuccess(result.token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Sign in failed. Check your details and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Text tone="muted">
        Sign in with the email or phone number and password you set during account setup.
      </Text>
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email or phone number"
        autoComplete="username"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
          onClick={() => setShowPassword((v) => !v)}
          type="button"
        >
          <EyeIcon show={showPassword} />
        </button>
      </div>
      {error ? <Text tone="danger">{error}</Text> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in to continue'}
      </button>
      <p className="text-center text-sm text-slate-500">
        <button
          type="button"
          onClick={onForgotPassword}
          className="font-medium text-blue-600 underline hover:text-blue-700"
        >
          Forgot your password?
        </button>
      </p>
    </form>
  );
}

function EntryPage({ onToken, showSavedNotice }: { onToken: (token: string) => void; showSavedNotice?: boolean }) {
  const [view, setView] = useState<'login' | 'otp' | 'forgot'>('login');
  const router = useRouter();

  function handleSuccess(token: string) {
    // Push token into URL so the page can reload from the token if needed.
    router.replace(`/driver-self-service?token=${encodeURIComponent(token)}`);
    onToken(token);
  }

  const titles: Record<typeof view, string> = {
    login: 'Sign in to continue',
    otp: 'Enter your verification code',
    forgot: 'Reset your password',
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,#dbeafe_0%,#eff6ff_40%,#f8fbff_70%,#ffffff_100%)] px-4 py-12">
      <div className="mx-auto max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
            Mobiris
          </p>
          <p className="text-sm text-slate-500">Driver onboarding portal</p>
        </div>

        <Card className="border-slate-200 bg-white shadow-[0_32px_80px_-30px_rgba(15,23,42,0.28)]">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl">{titles[view]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSavedNotice ? (
              <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Your progress has been saved. Sign in below to continue where you left off.
              </div>
            ) : null}

            {view === 'otp' ? (
              <>
                <OtpEntryForm onSuccess={handleSuccess} />
                <p className="text-center text-sm text-slate-500">
                  Already set up your account?{' '}
                  <button
                    type="button"
                    className="font-medium text-blue-600 underline hover:text-blue-700"
                    onClick={() => setView('login')}
                  >
                    Sign in instead
                  </button>
                </p>
              </>
            ) : view === 'forgot' ? (
              <ForgotPasswordForm onBack={() => setView('login')} />
            ) : (
              <>
                <PasswordLoginForm
                  onSuccess={handleSuccess}
                  onForgotPassword={() => setView('forgot')}
                />
                <p className="text-center text-sm text-slate-500">
                  New driver with a code?{' '}
                  <button
                    type="button"
                    className="font-medium text-blue-600 underline hover:text-blue-700"
                    onClick={() => setView('otp')}
                  >
                    Enter verification code
                  </button>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Secured by Mobiris · Powered by Growth Figures Limited
        </p>
      </div>
    </main>
  );
}

function ExpiredLinkCard() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
          <CardHeader className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
              Driver onboarding
            </Text>
            <CardTitle>Onboarding link expired</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Text tone="muted">
              This onboarding link is no longer valid. If you already created your sign-in account,
              use the sign in option below to continue onboarding. Otherwise ask your organisation
              to send a fresh link, or enter your 6-character code instead.
            </Text>
            <div className="flex flex-wrap gap-3">
              <a
                href="/driver-self-service"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign in or enter code
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Flow step helpers
// ---------------------------------------------------------------------------

type FlowStep =
  | 'account'
  | 'profile'
  | 'consent'
  | 'payment'
  | 'identity_verification'
  | 'document_verification'
  | 'manual_review'
  | 'complete';

function formatMinorCurrency(amountMinorUnits: number, currency?: string | null): string {
  const divisor = 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency ?? 'NGN',
  }).format(amountMinorUnits / divisor);
}

function StepProgress({ currentStep }: { currentStep: FlowStep }) {
  const steps: Array<{ key: FlowStep; label: string }> = [
    { key: 'account', label: 'Sign-in' },
    { key: 'consent', label: 'Consent' },
    { key: 'payment', label: 'Payment' },
    { key: 'identity_verification', label: 'Verification' },
    { key: 'document_verification', label: 'Documents' },
    { key: 'manual_review', label: 'Review' },
    { key: 'complete', label: 'Complete' },
  ];
  // Map 'profile' step to 'consent' for progress display (profile is auto-populated from NIN)
  const displayStep = currentStep === 'profile' ? 'consent' : currentStep;
  const currentIndex = steps.findIndex((step) => step.key === displayStep);

  const pct = steps.length > 1 ? Math.round((currentIndex / (steps.length - 1)) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        {steps.map((step, index) => (
          <div className="flex items-center gap-2" key={step.key}>
            <span
              className={`rounded-full px-2.5 py-0.5 ${
                index < currentIndex
                  ? 'bg-emerald-500 text-white'
                  : index === currentIndex
                    ? 'bg-[var(--mobiris-primary)] text-white'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              {index < currentIndex ? '✓' : `${index + 1}`}
            </span>
            <span className={index === currentIndex ? 'font-semibold text-[var(--mobiris-ink)]' : ''}>{step.label}</span>
          </div>
        ))}
      </div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--mobiris-primary)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">{pct}% complete</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual step components
// ---------------------------------------------------------------------------


function AccountSetupStep({
  token,
  driver,
  onComplete,
}: {
  token: string;
  driver: DriverRecord;
  onComplete: () => Promise<void>;
}) {
  const [email, setEmail] = useState(driver.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
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
      await createDriverSelfServiceAccount(token, {
        email: normalizedEmail,
        password,
      });
      if (normalizedEmail !== (driver.email ?? '').toLowerCase()) {
        await updateDriverSelfServiceContact(token, { email: normalizedEmail });
      }
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your sign-in account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-2">
        <CardTitle>Create your app sign-in</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Text tone="muted">
            Create your app access now. Sign-in access is separate from activation and assignment
            approval.
          </Text>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 8 characters)"
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword((v) => !v)}
              type="button"
            >
              <EyeIcon show={showPassword} />
            </button>
          </div>
          {password.length > 0 && password.length < 8 ? (
            <p className="text-xs text-amber-600">Use at least 8 characters.</p>
          ) : null}
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              onClick={() => setShowConfirm((v) => !v)}
              type="button"
            >
              <EyeIcon show={showConfirm} />
            </button>
          </div>
          {error ? <Text tone="danger">{error}</Text> : null}
          <Button disabled={submitting} type="submit">
            {submitting ? 'Setting up your account…' : 'Create sign-in account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


function ConsentStep({
  token,
  onComplete,
}: {
  token: string;
  onComplete: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConsent() {
    setLoading(true);
    setError(null);
    try {
      await recordDriverSelfServiceVerificationConsent(token);
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record consent. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-2">
        <CardTitle>Verification consent required</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Text tone="muted">
          Before we can verify your identity, we need your consent to process your personal and
          sensitive identification data.
        </Text>
        <Text tone="muted">
          By continuing you agree to the{' '}
          <a
            className="font-semibold text-[var(--mobiris-primary)] underline"
            href="/terms"
            rel="noreferrer"
            target="_blank"
          >
            Terms of Use
          </a>{' '}
          and{' '}
          <a
            className="font-semibold text-[var(--mobiris-primary)] underline"
            href="/privacy"
            rel="noreferrer"
            target="_blank"
          >
            Privacy Policy
          </a>
          , including the processing of your government ID information for identity verification
          purposes.
        </Text>
        {error ? <Text tone="danger">{error}</Text> : null}
        <Button disabled={loading} onClick={() => void handleConsent()} type="button">
          {loading ? 'Recording consent…' : 'I agree — continue to verification'}
        </Button>
      </CardContent>
    </Card>
  );
}

function PaymentStep({
  driver,
  token,
  onboardingStep,
  onRefresh,
}: {
  driver: DriverRecord;
  token: string;
  onboardingStep: OnboardingStepRecord;
  onRefresh: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentResumeStorageKey = `mobiris_driver_kyc_resume_${driver.id}`;

  // Do not re-prompt payment if the driver has already paid.
  const alreadyPaid =
    driver.verificationPaymentStatus === 'ready' ||
    driver.verificationEntitlementState === 'paid' ||
    driver.verificationEntitlementState === 'reserved';

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      // Capture consent before redirecting to payment gateway.
      await recordDriverSelfServiceVerificationConsent(token);
      const fallbackReturnUrl = `${window.location.origin}/driver-self-service?token=${encodeURIComponent(token)}`;
      window.sessionStorage.setItem(
        paymentResumeStorageKey,
        JSON.stringify({
          token,
          returnUrl: fallbackReturnUrl,
          driverId: driver.id,
        }),
      );
      const checkout = await initiateDriverKycCheckout(token, 'paystack', fallbackReturnUrl);
      window.location.href = checkout.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start payment right now.');
      setLoading(false);
    }
  }

  const amount = formatMinorCurrency(
    driver.verificationAmountMinorUnits ?? 0,
    driver.verificationCurrency,
  );
  const paymentStatus = onboardingStep.paymentStatus ?? driver.verificationPaymentStatus;

  if (alreadyPaid) {
    return (
      <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
        <CardHeader>
          <CardTitle>Payment received</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Text tone="muted">
            {onboardingStep.paymentMessage ??
              'Your verification payment has been received. You can continue.'}
          </Text>
          <Button onClick={() => void onRefresh()} type="button">
            Continue to verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-2">
        <CardTitle>
          {driver.verificationPayer === 'driver'
            ? 'Verification payment required'
            : 'Verification waiting on company funding'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Text tone="muted">
          {onboardingStep.paymentMessage ??
            'Verification cannot continue until the payment requirement is resolved.'}
        </Text>
        {driver.organisationName ? (
          <Text tone="muted">
            This onboarding is being completed for {driver.organisationName}.
          </Text>
        ) : null}
        {paymentStatus === 'driver_payment_required' ? (
          <>
            <Text>Required amount: {amount}</Text>
            <Text tone="muted" className="text-xs">
              By paying you agree to the{' '}
              <a
                className="font-semibold text-[var(--mobiris-primary)] underline"
                href="/terms"
                rel="noreferrer"
                target="_blank"
              >
                Terms of Use
              </a>{' '}
              and{' '}
              <a
                className="font-semibold text-[var(--mobiris-primary)] underline"
                href="/privacy"
                rel="noreferrer"
                target="_blank"
              >
                Privacy Policy
              </a>
              .
            </Text>
            <div className="flex flex-wrap gap-3">
              <Button disabled={loading} onClick={() => void handleCheckout()} type="button">
                {loading ? 'Opening payment…' : 'Pay now'}
              </Button>
              <Button onClick={() => void onRefresh()} type="button" variant="secondary">
                I&apos;ve completed payment
              </Button>
            </div>
          </>
        ) : (
          // wallet_missing or insufficient_balance — org pays but wallet not ready
          <Button onClick={() => void onRefresh()} type="button" variant="secondary">
            Refresh company funding status
          </Button>
        )}
        {error ? <Text tone="danger">{error}</Text> : null}
      </CardContent>
    </Card>
  );
}

// Document type display names (country-agnostic slugs)
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  NATIONAL_ID: 'National ID (NIN)',
  DRIVERS_LICENSE: "Driver's Licence",
  PASSPORT: 'International Passport',
  VOTERS_CARD: "Voter's Card",
  BVN: 'Bank Verification Number (BVN)',
  BANK_ID: 'Bank Verification Number (BVN)',
};

function getDocumentLabel(documentType: string): string {
  const normalized = documentType.trim();
  if (normalized.includes('-')) {
    try {
      return getDocumentType(normalized).name;
    } catch {
      return normalized;
    }
  }

  return DOCUMENT_TYPE_LABELS[normalized.toUpperCase()] ?? normalized;
}

function DocumentVerificationStep({
  token,
  driver,
  onboardingStep,
  onComplete,
}: {
  token: string;
  driver: DriverRecord;
  onboardingStep: OnboardingStepRecord;
  onComplete: () => Promise<void>;
}) {
  const requiredTypes = onboardingStep.requiredDocumentTypes ?? [];
  const verifiedTypes = new Set(onboardingStep.verifiedDocumentTypes ?? []);
  const pendingTypes = requiredTypes.filter((t) => !verifiedTypes.has(t.toLowerCase()));

  const [selectedDocType, setSelectedDocType] = useState(pendingTypes[0] ?? '');
  const [idNumber, setIdNumber] = useState('');
  const [countryCode] = useState(driver.nationality ?? 'NG');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<DocumentVerificationRecord | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedDocType || !idNumber.trim()) {
      setError('Select a document type and enter the document number.');
      return;
    }
    setLoading(true);
    try {
      const result = await verifyDriverDocumentId(token, {
        documentType: selectedDocType,
        idNumber: idNumber.trim(),
        countryCode,
        ...(driver.firstName ? { firstName: driver.firstName } : {}),
        ...(driver.lastName ? { lastName: driver.lastName } : {}),
        ...(driver.dateOfBirth ? { dateOfBirth: driver.dateOfBirth } : {}),
      });
      setLastResult(result);
      if (result.status === 'verified') {
        await onComplete();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Verification could not be completed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-2">
        <CardTitle>Document verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Text tone="muted">
          Verify your identity documents using your document number. No upload is required — we
          verify directly with the issuing authority.
        </Text>

        {verifiedTypes.size > 0 ? (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            Already verified: {[...verifiedTypes].map((type) => getDocumentLabel(type)).join(', ')}
          </div>
        ) : null}

        {lastResult && lastResult.status !== 'verified' ? (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            {lastResult.status === 'manual_review'
              ? 'Your document has been submitted for manual review. You may continue while the review is in progress.'
              : (lastResult.failureReason ??
                'The document number could not be verified automatically. Check the number and try again, or contact your organisation.')}
          </div>
        ) : null}

        {pendingTypes.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="driver-document-type"
              >
                Document type
              </label>
              <select
                id="driver-document-type"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {pendingTypes.map((type) => (
                  <option key={type} value={type}>
                    {getDocumentLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor="driver-document-number"
              >
                Document number
              </label>
              <input
                id="driver-document-number"
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter document number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {error ? <Text tone="danger">{error}</Text> : null}
            <Button disabled={loading} type="submit">
              {loading ? 'Verifying…' : 'Verify document'}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <Text tone="success">All required documents have been verified.</Text>
            <Button onClick={() => void onComplete()} type="button">
              Continue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ManualReviewStep({ identityStatus }: { identityStatus?: string }) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader>
        <CardTitle>Verification under review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Text tone="muted">
          {identityStatus === 'review_needed'
            ? 'Your verification submission has been received and is currently under manual review. You will be notified once a decision has been made.'
            : 'Your submission is being processed. This can take a short while. Check back if the status has not updated.'}
        </Text>
        <Text tone="muted" className="text-xs">
          You do not need to do anything else right now. Your organisation will contact you with
          next steps once the review is complete.
        </Text>
      </CardContent>
    </Card>
  );
}

function CompletionStep({ driver, onboardingStep }: { driver: DriverRecord; onboardingStep: OnboardingStepRecord }) {
  const statusLabel =
    driver.identityStatus === 'verified'
      ? 'Verification complete'
      : driver.identityStatus === 'review_needed'
        ? 'Verification under review'
        : driver.identityStatus === 'failed'
          ? 'Verification needs another attempt'
          : 'Verification submitted';

  const requiresGuarantor = onboardingStep.requiresGuarantor ?? false;
  const guarantorVerified = onboardingStep.guarantorVerified ?? false;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
        <CardHeader className="space-y-2">
          <CardTitle>{statusLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Text tone="muted">
            {driver.identityStatus === 'verified'
              ? 'Your identity verification and required onboarding steps are complete. Your organisation will contact you about your vehicle assignment.'
              : driver.identityStatus === 'review_needed'
                ? 'Your verification has been submitted and is under review. You will be contacted once a decision is made.'
                : driver.identityStatus === 'failed'
                  ? 'We could not complete verification yet. Review the required steps and try again.'
                  : 'Your verification is complete.'}
          </Text>
          {!driver.hasMobileAccess ? (
            <Text tone="muted">
              You can also sign in to the Mobiris driver app using your email and password.
            </Text>
          ) : null}
        </CardContent>
      </Card>

      {requiresGuarantor && !guarantorVerified ? (
        <Card className="border-amber-200 bg-amber-50/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.15)]">
          <CardHeader className="space-y-1">
            <CardTitle>Guarantor verification required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Text tone="muted">
              Your organisation requires a guarantor to complete your onboarding. Your organisation
              will send your guarantor a verification link separately. If your guarantor has not
              received their link, ask your organisation to resend it.
            </Text>
            <Text tone="muted" className="text-xs">
              A guarantor is someone who vouches for you and agrees to be responsible if needed.
              They must complete their own identity check.
            </Text>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

// Auto-advances past the profile step — profile data is populated from NIN.
// If the driver already has name and DOB, skip straight through.
function AutoAdvanceProfileStep({
  token,
  driver,
  onComplete,
}: {
  token: string;
  driver: DriverRecord;
  onComplete: () => Promise<void>;
}) {
  const advanced = useRef(false);
  useEffect(() => {
    if (advanced.current) return;
    advanced.current = true;
    updateDriverSelfServiceProfile(token, {
      firstName: driver.firstName ?? '',
      lastName: driver.lastName ?? '',
      dateOfBirth: driver.dateOfBirth ?? '',
    })
      .catch(() => {
        // Best-effort — continue even if profile update fails
      })
      .finally(() => {
        void onComplete();
      });
  }, [token, driver, onComplete]);

  return (
    <main className="flex min-h-[40vh] items-center justify-center">
      <Text tone="muted">Continuing your onboarding…</Text>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Main flow orchestrator — backend-driven
// ---------------------------------------------------------------------------

function DriverVerificationFlow({ token }: { token: string }) {
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStepRecord | null>(null);
  const [state, setState] = useState<'loading' | 'expired' | 'error' | 'ready'>('loading');
  // Incremented after each verification attempt. Used as a React key on
  // DriverIdentityVerification to force a full remount (resetting all useActionState
  // and camera state) whether the step changes or not.
  const [verificationKey, setVerificationKey] = useState(0);
  const loaded = useRef(false);

  const refreshContext = useCallback(async () => {
    const [nextDriver, nextStep] = await Promise.all([
      getDriverSelfServiceContext(token),
      getDriverOnboardingStep(token),
    ]);
    setDriver(nextDriver);
    setOnboardingStep(nextStep);
  }, [token]);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    refreshContext()
      .then(() => setState('ready'))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message.toLowerCase() : '';
        setState(msg.includes('expired') || msg.includes('invalid') ? 'expired' : 'error');
      });
  }, [refreshContext]);

  if (state === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)] px-4">
        <div className="mx-auto w-full max-w-sm space-y-6 text-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
              Mobiris
            </p>
            <p className="text-lg font-semibold text-[var(--mobiris-ink)]">Loading your onboarding</p>
            <p className="text-sm text-slate-500">Fetching your progress — this only takes a moment.</p>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="absolute inset-y-0 left-0 w-1/3 animate-[loading-bar_1.4s_ease-in-out_infinite] rounded-full bg-[var(--mobiris-primary)]" />
          </div>
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { left: -33%; width: 33%; }
            50% { left: 50%; width: 33%; }
            100% { left: 100%; width: 33%; }
          }
        `}</style>
      </main>
    );
  }

  if (state === 'expired') return <ExpiredLinkCard />;

  if (state === 'error' || !driver || !onboardingStep) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Text tone="muted">
                We could not load your onboarding details. Please try the link in your email again,
                or sign in if you already have an account.
              </Text>
              <a
                href="/driver-self-service"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Try again
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const currentStep = onboardingStep.step;
  const driverDisplayName =
    driver.firstName && driver.lastName
      ? `${driver.firstName} ${driver.lastName}`
      : (driver.email ?? 'Welcome');
  const organisationName = driver.organisationName ?? 'your organisation';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_28%,#f8fbff_62%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="space-y-3">
          <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
            Mobiris driver onboarding
          </Text>
          <div className="flex flex-wrap items-start justify-between gap-3 space-y-2">
            <div className="space-y-2">
              <Heading size="h1">{driverDisplayName}</Heading>
              <Text tone="muted">
                Complete the remaining onboarding steps for {organisationName}. Your progress is
                saved as you go.
              </Text>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                href={`/driver-self-service?saved=1`}
              >
                Save and exit
              </a>
              {driver.hasMobileAccess ? (
                <a
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
                  href="/login"
                >
                  Sign in later
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <StepProgress currentStep={currentStep} />

        {currentStep === 'account' ? (
          <AccountSetupStep driver={driver} onComplete={refreshContext} token={token} />
        ) : null}

        {currentStep === 'profile' ? (
          <AutoAdvanceProfileStep driver={driver} onComplete={refreshContext} token={token} />
        ) : null}

        {currentStep === 'consent' ? (
          <ConsentStep token={token} onComplete={refreshContext} />
        ) : null}

        {currentStep === 'payment' ? (
          <PaymentStep
            driver={driver}
            token={token}
            onboardingStep={onboardingStep}
            onRefresh={refreshContext}
          />
        ) : null}

        {currentStep === 'identity_verification' ? (
          <DriverIdentityVerification
            defaultCountryCode={driver.nationality ?? null}
            driver={driver}
            key={verificationKey}
            mode="self_service"
            onVerificationSubmitted={() => {
              // Increment key so the next attempt (if step stays identity_verification)
              // starts with a completely fresh component and camera state.
              setVerificationKey((k) => k + 1);
              void refreshContext();
            }}
            selfServiceToken={token}
            {...(driver.enabledDriverIdentifierTypes
              ? { enabledIdentifierTypes: driver.enabledDriverIdentifierTypes }
              : {})}
            {...(driver.requiredDriverIdentifierTypes
              ? { requiredIdentifierTypes: driver.requiredDriverIdentifierTypes }
              : {})}
          />
        ) : null}

        {currentStep === 'document_verification' ? (
          <DocumentVerificationStep
            driver={driver}
            token={token}
            onboardingStep={onboardingStep}
            onComplete={refreshContext}
          />
        ) : null}

        {currentStep === 'manual_review' ? (
          <ManualReviewStep
            {...(onboardingStep.identityStatus
              ? { identityStatus: onboardingStep.identityStatus }
              : {})}
          />
        ) : null}

        {currentStep === 'complete' ? <CompletionStep driver={driver} onboardingStep={onboardingStep} /> : null}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

function DriverSelfServiceInner() {
  const searchParams = useSearchParams();
  const [tokenOverride, setTokenOverride] = useState<string | null>(null);

  const token = tokenOverride ?? searchParams?.get('token') ?? null;
  const saved = searchParams?.get('saved') === '1';

  if (!token) {
    return <EntryPage onToken={setTokenOverride} showSavedNotice={saved} />;
  }

  return <DriverVerificationFlow token={token} />;
}

export default function DriverSelfServicePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)]">
          <Text tone="muted">Loading…</Text>
        </main>
      }
    >
      <DriverSelfServiceInner />
    </Suspense>
  );
}
