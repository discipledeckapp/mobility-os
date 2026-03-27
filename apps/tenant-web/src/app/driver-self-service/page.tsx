'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from '@mobility-os/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  createDriverSelfServiceAccount,
  getDriverOnboardingStep,
  getDriverSelfServiceContext,
  initiateDriverKycCheckout,
  loginDriverSelfServiceWithPassword,
  recordDriverSelfServiceVerificationConsent,
  updateDriverSelfServiceContact,
  updateDriverSelfServiceProfile,
  verifyDriverDocumentId,
  type DocumentVerificationRecord,
  type DriverRecord,
  type OnboardingStepRecord,
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
        Enter the 6-character code from your onboarding email to continue,
        or click the link in the email directly.
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

function PasswordLoginForm({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
        err instanceof Error
          ? err.message
          : 'Sign in failed. Check your details and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Text tone="muted">
        Already set up your account? Sign in with your email or phone number and password.
      </Text>
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email or phone number"
        autoComplete="username"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      {error ? <Text tone="danger">{error}</Text> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in to continue'}
      </button>
    </form>
  );
}

function EntryPage({ onToken }: { onToken: (token: string) => void }) {
  const [view, setView] = useState<'otp' | 'login'>('otp');
  const router = useRouter();

  function handleSuccess(token: string) {
    // Push token into URL so the page can reload from the token if needed.
    router.replace(`/driver-self-service?token=${encodeURIComponent(token)}`);
    onToken(token);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
          <CardHeader className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
              Driver onboarding
            </Text>
            <CardTitle>
              {view === 'otp' ? 'Enter your verification code' : 'Sign in to continue'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            ) : (
              <>
                <PasswordLoginForm onSuccess={handleSuccess} />
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
    { key: 'account', label: 'Sign-in account' },
    { key: 'profile', label: 'Profile' },
    { key: 'consent', label: 'Consent' },
    { key: 'payment', label: 'Payment' },
    { key: 'identity_verification', label: 'Live verification' },
    { key: 'document_verification', label: 'Documents' },
    { key: 'manual_review', label: 'Review' },
    { key: 'complete', label: 'Complete' },
  ];
  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
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
            {index < currentIndex ? '✓' : `Step ${index + 1}`}
          </span>
          <span>{step.label}</span>
        </div>
      ))}
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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

function ProfileCompletionStep({
  token,
  driver,
  onComplete,
}: {
  token: string;
  driver: DriverRecord;
  onComplete: () => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(driver.firstName ?? '');
  const [lastName, setLastName] = useState(driver.lastName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(driver.dateOfBirth ?? '');
  const [phone, setPhone] = useState(driver.phone ?? '');
  const [email, setEmail] = useState(driver.email ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth.trim()) {
      setError('First name, last name, and date of birth are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        updateDriverSelfServiceProfile(token, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth: dateOfBirth.trim(),
        }),
        updateDriverSelfServiceContact(token, {
          ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      ]);
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-2">
        <CardTitle>Complete your profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Text tone="muted">
            Save the missing profile details. Your onboarding progress is saved after each step.
          </Text>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {error ? <Text tone="danger">{error}</Text> : null}
          <Button disabled={loading} type="submit">
            {loading ? 'Saving…' : 'Save and continue'}
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
      const checkout = await initiateDriverKycCheckout(
        token,
        'paystack',
        `${window.location.origin}/driver-self-service?token=${encodeURIComponent(token)}`,
      );
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
              <a className="font-semibold text-[var(--mobiris-primary)] underline" href="/terms" rel="noreferrer" target="_blank">
                Terms of Use
              </a>{' '}
              and{' '}
              <a className="font-semibold text-[var(--mobiris-primary)] underline" href="/privacy" rel="noreferrer" target="_blank">
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
        firstName: driver.firstName ?? undefined,
        lastName: driver.lastName ?? undefined,
        dateOfBirth: driver.dateOfBirth ?? undefined,
      });
      setLastResult(result);
      if (result.status === 'verified') {
        await onComplete();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Verification could not be completed. Please try again.',
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
          Verify your identity documents using your document number. No upload is required —
          we verify directly with the issuing authority.
        </Text>

        {verifiedTypes.size > 0 ? (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            Already verified:{' '}
            {[...verifiedTypes]
              .map((t) => DOCUMENT_TYPE_LABELS[t.toUpperCase()] ?? t)
              .join(', ')}
          </div>
        ) : null}

        {lastResult && lastResult.status !== 'verified' ? (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            {lastResult.status === 'manual_review'
              ? 'Your document has been submitted for manual review. You may continue while the review is in progress.'
              : lastResult.failureReason ??
                'The document number could not be verified automatically. Check the number and try again, or contact your organisation.'}
          </div>
        ) : null}

        {pendingTypes.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Document type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {pendingTypes.map((type) => (
                  <option key={type} value={type}>
                    {DOCUMENT_TYPE_LABELS[type.toUpperCase()] ?? type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Document number
              </label>
              <input
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

function CompletionStep({ driver }: { driver: DriverRecord }) {
  const statusLabel =
    driver.identityStatus === 'verified'
      ? 'Verification complete'
      : driver.identityStatus === 'review_needed'
        ? 'Verification under review'
        : driver.identityStatus === 'failed'
          ? 'Verification needs another attempt'
          : 'Verification submitted';

  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-2">
        <CardTitle>{statusLabel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Text tone="muted">
          {driver.identityStatus === 'verified'
            ? 'Your verification and required onboarding steps are complete. Your organisation will contact you about your assignment.'
            : driver.identityStatus === 'review_needed'
              ? 'Your verification has been submitted and is now under review.'
              : driver.identityStatus === 'failed'
                ? 'We could not complete verification yet. Review the required steps and try again.'
                : 'Your verification has been submitted successfully.'}
        </Text>
        {!driver.hasMobileAccess ? (
          <Text tone="muted">
            Your sign-in account is not set up yet. Complete the app access step to sign in later.
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main flow orchestrator — backend-driven
// ---------------------------------------------------------------------------

function DriverVerificationFlow({ token }: { token: string }) {
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStepRecord | null>(null);
  const [state, setState] = useState<'loading' | 'expired' | 'error' | 'ready'>('loading');
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
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)]">
        <Text tone="muted">Loading your onboarding…</Text>
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
                We could not load your onboarding details. Please try the link in your email
                again, or sign in if you already have an account.
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
      : driver.email ?? 'Welcome';
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
                href="/driver-self-service"
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
          <ProfileCompletionStep driver={driver} onComplete={refreshContext} token={token} />
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
            mode="self_service"
            onVerificationSubmitted={() => {
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
          <ManualReviewStep identityStatus={onboardingStep.identityStatus} />
        ) : null}

        {currentStep === 'complete' ? <CompletionStep driver={driver} /> : null}
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

  if (!token) {
    return <EntryPage onToken={setTokenOverride} />;
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
