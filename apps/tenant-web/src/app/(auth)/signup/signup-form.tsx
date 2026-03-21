'use client';

import { Button, Input, Label, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { type SignupState, registerOrganisationAction, verifyOtpAction } from './actions';

// ── Supported options ──────────────────────────────────────────────────────────
// Only NG is currently registered in domain-config.
const COUNTRIES = [{ code: 'NG', name: 'Nigeria' }];

const BUSINESS_MODELS = [
  { slug: 'hire-purchase', label: 'Hire Purchase' },
  { slug: 'lease', label: 'Lease' },
  { slug: 'owner-operator', label: 'Owner Operator' },
  { slug: 'rental', label: 'Rental' },
];

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={`step-${i + 1}`} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              i + 1 === current
                ? 'bg-[var(--mobiris-primary)] text-white'
                : i + 1 < current
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400'
            }`}
          >
            {i + 1 < current ? (
              <svg
                aria-hidden="true"
                fill="none"
                focusable="false"
                height="12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 12 12"
                width="12"
              >
                <path d="M2 6l3 3 5-5" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div className={`h-px w-8 ${i + 1 < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-slate-400">
        Step {current} of {total}
      </span>
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

// ── Main component ─────────────────────────────────────────────────────────────
export function SignupForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — org details
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('NG');
  const [businessModel, setBusinessModel] = useState('');

  // Step 2 — admin account
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3 — OTP verification
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  const [registerState, registerAction, isRegistering] = useActionState<SignupState, FormData>(
    registerOrganisationAction,
    {},
  );

  const [isPending, startTransition] = useTransition();

  // Advance to OTP step once the server action returns a userId
  useEffect(() => {
    if (registerState.userId) {
      setStep(3);
    }
  }, [registerState.userId]);

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName || !slug || !country || !businessModel) return;
    setStep(2);
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpError('Enter the 6-digit code from your email.');
      return;
    }
    setOtpError('');
    startTransition(async () => {
      const result = await verifyOtpAction(adminEmail, adminPassword, otpCode.trim());
      if (result?.error) {
        setOtpError(result.error);
      }
    });
  }

  // ── Step 1: Organisation details ──────────────────────────────────────────
  if (step === 1) {
    return (
      <div>
        <StepIndicator current={1} total={3} />
        <form className="space-y-5" onSubmit={handleStep1Submit}>
          <div className="space-y-1.5">
            <Label htmlFor="orgName">Organisation name</Label>
            <Input
              id="orgName"
              onChange={(e) => {
                setOrgName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              placeholder="Acme Transport Ltd"
              required
              type="text"
              value={orgName}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Organisation slug</Label>
            <Input
              id="slug"
              onChange={(e) => setSlug(slugify(e.target.value))}
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              placeholder="acme-transport"
              required
              type="text"
              value={slug}
            />
            <p className="text-xs text-slate-400">
              URL-safe identifier — lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <select
              className="flex h-10 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
              id="country"
              onChange={(e) => setCountry(e.target.value)}
              required
              value={country}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessModel">Business model</Label>
            <select
              className="flex h-10 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
              id="businessModel"
              onChange={(e) => setBusinessModel(e.target.value)}
              required
              value={businessModel}
            >
              <option value="">Select a model…</option>
              {BUSINESS_MODELS.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <Button className="w-full" type="submit">
            Continue →
          </Button>

          <p className="text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link
              className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    );
  }

  // ── Step 2: Admin account ─────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div>
        <StepIndicator current={2} total={3} />
        <form action={registerAction} className="space-y-5">
          {/* Hidden org fields */}
          <input name="orgName" type="hidden" value={orgName} />
          <input name="slug" type="hidden" value={slug} />
          <input name="country" type="hidden" value={country} />
          <input name="businessModel" type="hidden" value={businessModel} />

          <div className="space-y-1.5">
            <Label htmlFor="adminName">Your full name</Label>
            <Input
              autoComplete="name"
              id="adminName"
              name="adminName"
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Adaeze Okonkwo"
              required
              type="text"
              value={adminName}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adminEmail">Work email</Label>
            <Input
              autoComplete="email"
              id="adminEmail"
              name="adminEmail"
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="you@organisation.com"
              required
              type="email"
              value={adminEmail}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adminPhone">Phone number (optional)</Label>
            <Input
              autoComplete="tel"
              id="adminPhone"
              name="adminPhone"
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="+2348012345678"
              type="tel"
              value={adminPhone}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adminPassword">Password</Label>
            <Input
              autoComplete="new-password"
              id="adminPassword"
              minLength={8}
              name="adminPassword"
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              type="password"
              value={adminPassword}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              autoComplete="new-password"
              id="confirmPassword"
              name="confirmPassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              type="password"
              value={confirmPassword}
            />
          </div>

          {registerState.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <Text tone="danger">{registerState.error}</Text>
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button onClick={() => setStep(1)} type="button" variant="secondary">
              ← Back
            </Button>
            <Button className="flex-1" disabled={isRegistering} type="submit">
              {isRegistering ? 'Creating account…' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ── Step 3: OTP verification ───────────────────────────────────────────────
  return (
    <div>
      <StepIndicator current={3} total={3} />
      <form className="space-y-5" onSubmit={handleVerifyOtp}>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">
          <p className="text-sm font-semibold text-blue-800">Check your email</p>
          <p className="mt-1 text-sm text-blue-700">
            We sent a 6-digit verification code to <strong>{adminEmail}</strong>. Enter it below to
            activate your account.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="otpCode">Verification code</Label>
          <Input
            autoComplete="one-time-code"
            id="otpCode"
            inputMode="numeric"
            maxLength={6}
            minLength={6}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            pattern="\d{6}"
            placeholder="000000"
            required
            type="text"
            value={otpCode}
          />
          <p className="text-xs text-slate-400">
            The code expires in 15 minutes. Check your spam folder if you don't see it.
          </p>
        </div>

        {otpError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <Text tone="danger">{otpError}</Text>
          </div>
        ) : null}

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? 'Verifying…' : 'Verify and sign in'}
        </Button>
      </form>
    </div>
  );
}
