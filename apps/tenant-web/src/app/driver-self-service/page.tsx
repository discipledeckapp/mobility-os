'use client';

import { Card, CardContent, CardHeader, CardTitle, Heading, Text } from '@mobility-os/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
  getDriverSelfServiceContext,
  listDriverSelfServiceDocuments,
  updateDriverSelfServiceProfile,
} from '../../lib/api-core';
import { DriverIdentityVerification } from '../drivers/driver-identity-verification';
import { DriverDocumentsPanel } from '../drivers/driver-documents-panel';

// ─────────────────────────────────────────────────────────────
// OTP entry form (shown when no token in URL)
// ─────────────────────────────────────────────────────────────

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
              {error && (
                <Text tone="danger" className="text-sm">
                  {error}
                </Text>
              )}
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

// ─────────────────────────────────────────────────────────────
// Expired / invalid link card
// ─────────────────────────────────────────────────────────────

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
              This onboarding link is no longer valid. Ask your organisation
              operator to send you a fresh link, or enter your 6-character code
              below if you have one.
            </Text>
            <a
              href="/driver-self-service"
              className="inline-block rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
// Profile completion step (shown when driver has no name yet)
// ─────────────────────────────────────────────────────────────

function ProfileCompletionStep({
  token,
  onComplete,
}: {
  token: string;
  onComplete: (firstName: string, lastName: string) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateDriverSelfServiceProfile(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(dateOfBirth.trim() ? { dateOfBirth: dateOfBirth.trim() } : {}),
      });
      onComplete(firstName.trim(), lastName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mobiris-primary)] text-xs font-bold text-white">1</div>
          <CardTitle>Complete your profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Text tone="muted">
            Enter your details below. This information will be linked to your
            driver record.
          </Text>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="ss-firstName" className="text-sm font-medium text-slate-700">
                First name <span className="text-rose-500">*</span>
              </label>
              <input
                id="ss-firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Emeka"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ss-lastName" className="text-sm font-medium text-slate-700">
                Last name <span className="text-rose-500">*</span>
              </label>
              <input
                id="ss-lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Okonkwo"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ss-dob" className="text-sm font-medium text-slate-700">
                Date of birth <span className="text-rose-500">*</span>
              </label>
              <input
                id="ss-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {error ? (
            <Text tone="danger" className="text-sm">
              {error}
            </Text>
          ) : null}

          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim() || !dateOfBirth.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Main flow (token-based)
// ─────────────────────────────────────────────────────────────

function DriverVerificationFlow({ token }: { token: string }) {
  type DriverRecord = Awaited<ReturnType<typeof getDriverSelfServiceContext>>;
  type DocumentRecord = Awaited<ReturnType<typeof listDriverSelfServiceDocuments>>[number];

  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [state, setState] = useState<'loading' | 'profile' | 'verify' | 'expired' | 'error'>('loading');
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    Promise.all([
      getDriverSelfServiceContext(token),
      listDriverSelfServiceDocuments(token).catch(() => [] as DocumentRecord[]),
    ])
      .then(([d, docs]) => {
        setDriver(d);
        setDocuments(docs);
        // If driver has no name yet, show profile completion first
        setState(!d.firstName || !d.lastName ? 'profile' : 'verify');
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
                We could not load your onboarding details. Please try clicking
                the link in your email again.
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

  if (state === 'profile') {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_28%,#f8fbff_62%,#ffffff_100%)] px-4 py-10">
        <div className="mx-auto max-w-xl space-y-6">
          <section className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
              Mobiris driver onboarding
            </Text>
            <Heading size="h1">Set up your profile</Heading>
            <Text tone="muted">
              Your operator has invited you to complete your driver registration.
              Start by entering your personal details.
            </Text>
          </section>

          {/* Step progress */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="rounded-full bg-[var(--mobiris-primary)] px-2.5 py-0.5 text-white">Step 1 of 3</span>
            <span>Profile</span>
            <span className="text-slate-300">→</span>
            <span>Identity verification</span>
            <span className="text-slate-300">→</span>
            <span>Documents</span>
          </div>

          <ProfileCompletionStep
            token={token}
            onComplete={(firstName, lastName) => {
              setDriver((current) => current ? { ...current, firstName, lastName } : current);
              setState('verify');
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_28%,#f8fbff_62%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="space-y-3">
          <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
            Mobiris driver onboarding
          </Text>
          <div className="space-y-2">
            <Heading size="h1">{driverDisplayName}</Heading>
            <Text tone="muted">
              Complete your identity verification below. Your organisation will
              receive the result automatically.
            </Text>
          </div>
        </section>

        {/* Step progress */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-white">✓ Profile</span>
          <span className="text-slate-300">→</span>
          <span className="rounded-full bg-[var(--mobiris-primary)] px-2.5 py-0.5 text-white">Step 2 of 3</span>
          <span>Identity verification</span>
          <span className="text-slate-300">→</span>
          <span>Documents</span>
        </div>

        <DriverIdentityVerification
          defaultCountryCode={driver.nationality ?? null}
          driver={driver}
          mode="self_service"
          selfServiceToken={token}
        />
        <DriverDocumentsPanel
          countryCode={driver.nationality}
          documents={documents}
          driverId={driver.id}
          mode="self_service"
          selfServiceToken={token}
        />
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Page entry point
// ─────────────────────────────────────────────────────────────

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
