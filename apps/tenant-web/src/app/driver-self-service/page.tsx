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
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createDriverSelfServiceAccount,
  getDriverSelfServiceContext,
  initiateDriverKycCheckout,
  listDriverSelfServiceDocuments,
  recordDriverSelfServiceVerificationConsent,
  updateDriverSelfServiceContact,
  updateDriverSelfServiceProfile,
  type DriverDocumentRecord,
  type DriverRecord,
} from '../../lib/api-core';
import { DriverIdentityVerification } from '../drivers/driver-identity-verification';
import { DriverDocumentsPanel } from '../drivers/driver-documents-panel';

function OtpEntryForm() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      router.push(`/driver-self-service?token=${encodeURIComponent(token)}`);
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
          <CardHeader className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
              Driver onboarding
            </Text>
            <CardTitle>Enter your verification code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Text tone="muted">
              Enter the 6-character code from your onboarding email to continue,
              or click the link in the email directly.
            </Text>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              use sign in to continue onboarding. Otherwise ask your organisation operator to send a
              fresh link, or enter your 6-character code instead.
            </Text>
            <div className="flex flex-wrap gap-3">
              <a
                href="/login"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign in to continue
              </a>
              <a
                href="/driver-self-service"
                className="inline-block rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Enter verification code
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

type FlowStep = 'account' | 'profile' | 'payment' | 'verification' | 'documents' | 'complete';

function isIdentitySubmitted(driver: DriverRecord): boolean {
  if (driver.identityStatus === 'verified' || driver.identityStatus === 'review_needed') {
    return true;
  }

  if (driver.identityStatus !== 'pending_verification') {
    return false;
  }

  return Boolean(driver.identityLastVerifiedAt || driver.identityLastDecision);
}

function getMissingRequiredDocumentSlugs(
  driver: DriverRecord,
  documents: DriverDocumentRecord[],
): string[] {
  const uploadedTypes = new Set(documents.map((document) => document.documentType));
  return (driver.requiredDriverDocumentSlugs ?? []).filter((slug) => !uploadedTypes.has(slug));
}

function getFlowStep(driver: DriverRecord, documents: DriverDocumentRecord[]): FlowStep {
  if (!driver.hasMobileAccess) {
    return 'account';
  }
  if (!driver.firstName || !driver.lastName || !driver.dateOfBirth) {
    return 'profile';
  }
  if (driver.verificationPaymentStatus === 'driver_payment_required') {
    return 'payment';
  }
  if (
    driver.verificationPaymentStatus === 'wallet_missing' ||
    driver.verificationPaymentStatus === 'insufficient_balance'
  ) {
    return 'payment';
  }
  if (
    driver.requireIdentityVerificationForActivation !== false &&
    !isIdentitySubmitted(driver)
  ) {
    return 'verification';
  }
  if (getMissingRequiredDocumentSlugs(driver, documents).length > 0) {
    return 'documents';
  }
  return 'complete';
}

function formatMinorCurrency(amountMinorUnits: number, currency?: string | null): string {
  const divisor = currency === 'NGN' ? 100 : 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency ?? 'NGN',
  }).format(amountMinorUnits / divisor);
}

function StepProgress({ currentStep }: { currentStep: FlowStep }) {
  const steps: Array<{ key: FlowStep; label: string }> = [
    { key: 'account', label: 'Sign-in account' },
    { key: 'profile', label: 'Profile' },
    { key: 'payment', label: 'Payment' },
    { key: 'verification', label: 'Live verification' },
    { key: 'documents', label: 'Documents' },
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
            Save the missing profile details now. Your onboarding progress is persisted after each step.
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
            Create your app access now. Sign-in access is separate from activation and assignment approval.
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

function PaymentStep({
  driver,
  token,
  onRefresh,
}: {
  driver: DriverRecord;
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
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
          {driver.verificationPaymentMessage ??
            'Verification cannot continue until the payment requirement is resolved.'}
        </Text>
        <Text tone="muted">
          By continuing you agree to the{' '}
          <a className="font-semibold text-[var(--mobiris-primary)] underline" href="/terms" rel="noreferrer" target="_blank">
            Terms of Use
          </a>{' '}
          and{' '}
          <a className="font-semibold text-[var(--mobiris-primary)] underline" href="/privacy" rel="noreferrer" target="_blank">
            Privacy Policy
          </a>
          .
        </Text>
        {driver.organisationName ? (
          <Text tone="muted">
            This onboarding is being completed for {driver.organisationName}.
          </Text>
        ) : null}
        {driver.verificationPayer === 'driver' ? (
          <>
            <Text>Required amount: {amount}</Text>
            <div className="flex flex-wrap gap-3">
              <Button disabled={loading} onClick={() => void handleCheckout()} type="button">
                {loading ? 'Opening payment…' : 'Pay now'}
              </Button>
              <Button onClick={() => void onRefresh()} type="button" variant="secondary">
                I’ve completed payment
              </Button>
            </div>
          </>
        ) : (
          <Button onClick={() => void onRefresh()} type="button" variant="secondary">
            Refresh company funding status
          </Button>
        )}
        {error ? <Text tone="danger">{error}</Text> : null}
      </CardContent>
    </Card>
  );
}

function CompletionStep({ driver, documents }: { driver: DriverRecord; documents: DriverDocumentRecord[] }) {
  const missingDocuments = getMissingRequiredDocumentSlugs(driver, documents);
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
            ? 'Your verification and required onboarding steps are complete.'
            : driver.identityStatus === 'review_needed'
              ? 'Your verification has been submitted and is now under review.'
              : driver.identityStatus === 'failed'
                ? 'We could not complete verification yet. Review the required steps and try again.'
                : 'Your verification has been submitted successfully.'}
        </Text>
        {missingDocuments.length > 0 ? (
          <Text tone="muted">
            Remaining required documents: {missingDocuments.join(', ')}.
          </Text>
        ) : null}
        {!driver.hasMobileAccess ? (
          <Text tone="muted">
            Your sign-in account is not set up yet. Complete the app access step to sign in later.
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DriverVerificationFlow({ token }: { token: string }) {
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [documents, setDocuments] = useState<DriverDocumentRecord[]>([]);
  const [state, setState] = useState<'loading' | 'expired' | 'error' | 'ready'>('loading');
  const [currentStep, setCurrentStep] = useState<FlowStep>('account');
  const loaded = useRef(false);

  const refreshContext = useCallback(async () => {
    const [nextDriver, nextDocuments] = await Promise.all([
      getDriverSelfServiceContext(token),
      listDriverSelfServiceDocuments(token).catch(() => [] as DriverDocumentRecord[]),
    ]);
    setDriver(nextDriver);
    setDocuments(nextDocuments);
    setCurrentStep(getFlowStep(nextDriver, nextDocuments));
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

  const missingDocumentSlugs = useMemo(
    () => (driver ? getMissingRequiredDocumentSlugs(driver, documents) : []),
    [documents, driver],
  );

  if (state === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)]">
        <Text tone="muted">Loading your onboarding…</Text>
      </main>
    );
  }

  if (state === 'expired') return <ExpiredLinkCard />;

  if (state === 'error' || !driver) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <Text tone="muted">
                We could not load your onboarding details. Please try the link in your email again.
              </Text>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const driverDisplayName =
    driver.firstName && driver.lastName
      ? `${driver.firstName} ${driver.lastName}`
      : driver.email ?? 'Welcome';
  const organisationName = driver.organisationName ?? 'your organisation';
  const hasOptionalDocumentStep = documents.length > 0 || (driver.requiredDriverDocumentSlugs?.length ?? 0) === 0;

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
              Complete the remaining onboarding steps for {organisationName}. Your progress is saved as you go, so you can safely leave and continue later.
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
          <AccountSetupStep
            driver={driver}
            onComplete={refreshContext}
            token={token}
          />
        ) : null}

        {currentStep === 'profile' ? (
          <ProfileCompletionStep driver={driver} token={token} onComplete={refreshContext} />
        ) : null}

        {currentStep === 'payment' ? (
          <PaymentStep driver={driver} token={token} onRefresh={refreshContext} />
        ) : null}

        {currentStep === 'verification' ? (
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

        {currentStep === 'documents' ? (
          <>
            <DriverDocumentsPanel
              countryCode={driver.nationality}
              documents={documents}
              driverId={driver.id}
              mode="self_service"
              onUploadSuccess={() => {
                void refreshContext();
              }}
              requiredDocumentSlugs={driver.requiredDriverDocumentSlugs}
              selfServiceToken={token}
            />
            {missingDocumentSlugs.length === 0 ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="space-y-3 pt-6">
                  <Text tone="success">
                    {hasOptionalDocumentStep
                      ? 'All required documents are complete. You can finish onboarding now or upload any optional documents first.'
                      : 'No documents are required for this onboarding flow.'}
                  </Text>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setCurrentStep(!driver.hasMobileAccess ? 'account' : 'complete')}
                      type="button"
                    >
                      Finish onboarding
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(!driver.hasMobileAccess ? 'account' : 'complete')}
                      type="button"
                      variant="secondary"
                    >
                      Skip optional documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}

        {currentStep === 'complete' ? (
          <CompletionStep documents={documents} driver={driver} />
        ) : null}
      </div>
    </main>
  );
}

function DriverSelfServiceInner() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? null;

  if (!token) {
    return <OtpEntryForm />;
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
