'use client';

import { getDocumentType } from '@mobility-os/domain-config';
import {
  Badge,
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
  type DriverGuarantorCapacityAssessment,
  type DriverGuarantorInvitationResult,
  type DriverSelfServiceAssignmentRecord,
  type DocumentVerificationRecord,
  type DriverIdentityResolutionResult,
  type DriverRecord,
  type OnboardingStepRecord,
  type RemittanceRecord,
  type UserNotificationRecord,
  acceptDriverSelfServiceAssignment,
  assessDriverSelfServiceGuarantorCapacity,
  createDriverSelfServiceAccount,
  declineDriverSelfServiceAssignment,
  getDriverOnboardingStep,
  getDriverSelfServiceContext,
  initiateDriverKycCheckout,
  initiateDriverVerificationAddonCheckout,
  listDriverSelfServiceNotifications,
  listDriverSelfServiceRemittance,
  listDriverSelfServiceAssignments,
  markDriverSelfServiceNotificationRead,
  loginDriverSelfServiceWithPassword,
  recordDriverSelfServiceRemittance,
  recordDriverSelfServiceVerificationConsent,
  submitDriverSelfServiceGuarantor,
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
    <>
      <SelfServiceBlockingOverlay
        visible={loading}
        title="Checking your code"
        message="Verifying your invitation and restoring your saved onboarding progress."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text tone="muted">
          Enter the 6-character code from your onboarding email to continue, or click the link in
          the email directly.
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
    </>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" x2="23" y1="1" y2="23" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
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
          If an account exists for that email or phone number, a password reset link has been sent.
          Check your inbox or messages.
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
    <>
      <SelfServiceBlockingOverlay
        visible={loading}
        title="Sending your reset link"
        message="Checking your account details and preparing a secure password reset message."
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Text tone="muted">
          Enter the email address or phone number linked to your account and we will send you a
          reset link.
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
    </>
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
    <>
      <SelfServiceBlockingOverlay
        visible={loading}
        title="Signing you in"
        message="Checking your details and restoring your onboarding step."
      />
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
    </>
  );
}

function EntryPage({
  onToken,
  showSavedNotice,
  assignmentId,
}: { onToken: (token: string) => void; showSavedNotice?: boolean; assignmentId?: string | null }) {
  const [view, setView] = useState<'login' | 'otp' | 'forgot'>('login');
  const router = useRouter();

  function handleSuccess(token: string) {
    // Push token into URL so the page can reload from the token if needed.
    const nextUrl = assignmentId
      ? `/driver-self-service?token=${encodeURIComponent(token)}&assignmentId=${encodeURIComponent(assignmentId)}`
      : `/driver-self-service?token=${encodeURIComponent(token)}`;
    router.replace(nextUrl as never);
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
  | 'guarantor'
  | 'manual_review'
  | 'complete';

type DriverAppTab = 'home' | 'assignment' | 'remittance' | 'notifications' | 'profile';

function formatMinorCurrency(amountMinorUnits: number, currency?: string | null): string {
  const divisor = 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency ?? 'NGN',
  }).format(amountMinorUnits / divisor);
}

function formatAssignmentStatus(status: string) {
  if (status === 'driver_action_required' || status === 'pending_driver_confirmation') {
    return 'Driver action required';
  }
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStepLabel(step: FlowStep): string {
  return step.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatVehicleLabel(input: DriverSelfServiceAssignmentRecord['vehicle']) {
  return [input.make, input.model].filter(Boolean).join(' ') || input.tenantVehicleCode || 'Assigned vehicle';
}

function getDriverAssignmentActivationState(
  assignment: DriverSelfServiceAssignmentRecord,
): 'awaiting_confirmation' | 'accepted_ready' | 'active' | 'closed' {
  if (
    ['driver_action_required', 'pending_driver_confirmation', 'created'].includes(assignment.status)
  ) {
    return 'awaiting_confirmation';
  }
  if (assignment.status === 'accepted') {
    return 'accepted_ready';
  }
  if (assignment.status === 'active') {
    return 'active';
  }
  return 'closed';
}

function getDriverAssignmentPaymentModelLabel(assignment: DriverSelfServiceAssignmentRecord): string {
  if (assignment.paymentModel === 'hire_purchase') {
    return 'Hire purchase';
  }
  if (assignment.paymentModel === 'salary') {
    return 'Salary';
  }
  if (assignment.paymentModel === 'commission') {
    return 'Commission';
  }
  return 'Remittance';
}

function assignmentSupportsRemittance(assignment: DriverSelfServiceAssignmentRecord | null): boolean {
  if (!assignment) {
    return false;
  }

  return assignment.paymentModel === 'remittance' || assignment.paymentModel === 'hire_purchase';
}

function amountInputFromMinorUnits(value?: number | null): string {
  if (!value || value < 1) {
    return '';
  }

  const amount = (value / 100).toFixed(2);
  return amount.endsWith('.00') ? amount.slice(0, -3) : amount;
}

function parseAmountInputToMinorUnits(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, '');
  if (!trimmed) {
    return null;
  }
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 100);
}

function formatRemittanceStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function remittanceStatusTone(
  status: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'completed' || status === 'partially_settled') {
    return 'success';
  }
  if (status === 'disputed') {
    return 'danger';
  }
  if (status === 'pending') {
    return 'warning';
  }
  return 'neutral';
}

function mapAssignmentAcceptanceError(message?: string): string {
  const normalized = message?.toLowerCase() ?? '';
  if (
    normalized.includes('too many requests') ||
    normalized.includes('throttlerexception') ||
    normalized.includes('throttl')
  ) {
    return 'We are confirming your acceptance. Please wait a moment and refresh if the status does not update immediately.';
  }
  if (
    normalized.includes("cannot be accepted from status 'accepted'") ||
    normalized.includes("cannot be accepted from status 'active'") ||
    normalized.includes('already accepted')
  ) {
    return 'This assignment was already accepted successfully. Your assignment status has been refreshed.';
  }
  return message ?? 'Unable to accept this assignment right now.';
}

function AssignmentWorkspace({
  token,
  assignment,
  onRefresh,
}: {
  token: string;
  assignment: DriverSelfServiceAssignmentRecord;
  onRefresh: () => Promise<void>;
}) {
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const activationState = getDriverAssignmentActivationState(assignment);
  const supportsRemittance =
    assignment.paymentModel === null ||
    assignment.paymentModel === undefined ||
    assignment.paymentModel === 'remittance' ||
    assignment.paymentModel === 'hire_purchase';

  async function handleAccept() {
    setLoading('accept');
    setError(null);
    setSuccess(null);
    try {
      await acceptDriverSelfServiceAssignment(token, assignment.id);
      setSuccess('Assignment accepted successfully. Your organisation can now move this vehicle into active duty.');
      await onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      const friendlyMessage = mapAssignmentAcceptanceError(message);
      if (friendlyMessage.includes('already accepted')) {
        setSuccess(friendlyMessage);
        await onRefresh();
      } else {
        setError(friendlyMessage);
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading('reject');
    setError(null);
    try {
      await declineDriverSelfServiceAssignment(token, assignment.id);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject this assignment right now.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="border-blue-200 bg-white shadow-[0_30px_80px_-34px_rgba(15,23,42,0.42)]">
      <CardHeader className="space-y-2">
        <CardTitle>Driver activation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          className={`rounded-2xl p-4 ${
            activationState === 'awaiting_confirmation'
              ? 'bg-amber-50 text-amber-950'
              : activationState === 'active'
                ? 'bg-emerald-50 text-emerald-950'
                : activationState === 'closed'
                  ? 'bg-rose-50 text-rose-950'
                  : 'bg-blue-50 text-slate-900'
          }`}
        >
          <Text className="font-semibold text-[var(--mobiris-ink)]">
            You have been assigned a vehicle. Please accept to begin.
          </Text>
          <Text tone="muted">
            Status:{' '}
            {activationState === 'awaiting_confirmation'
              ? 'Awaiting your confirmation'
              : activationState === 'accepted_ready'
                ? 'Accepted and ready to begin'
                : activationState === 'active'
                  ? 'Active'
                  : formatAssignmentStatus(assignment.status)}
          </Text>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {assignment.remittanceAmountMinorUnits ? (
              <div className="rounded-2xl bg-slate-50 p-5">
                <Text tone="muted">
                  {assignment.financialContract?.contractType === 'hire_purchase'
                    ? 'Installment amount'
                    : 'Expected amount'}
                </Text>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {formatMinorCurrency(
                    assignment.remittanceAmountMinorUnits,
                    assignment.remittanceCurrency,
                  )}
                </p>
                {assignment.remittanceFrequency ? (
                  <Text className="font-semibold text-[var(--mobiris-primary-dark)]">
                    {formatAssignmentStatus(assignment.remittanceFrequency)}
                  </Text>
                ) : null}
              </div>
            ) : null}
            {assignment.financialContract ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <Text tone="muted">Contract</Text>
                  <Text className="font-semibold text-[var(--mobiris-ink)]">
                    {assignment.financialContract.contractType === 'hire_purchase'
                      ? 'Hire purchase'
                      : 'Regular hire'}
                  </Text>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <Text tone="muted">Contract status</Text>
                  <Text className="font-semibold text-[var(--mobiris-ink)]">
                    {formatAssignmentStatus(
                      assignment.financialContract.summary.contractStatus ??
                        assignment.contractStatus ??
                        assignment.status,
                    )}
                  </Text>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <Text tone="muted">Next due date</Text>
                  <Text className="font-semibold text-[var(--mobiris-ink)]">
                    {assignment.financialContract.summary.nextDueDate
                      ? formatShortDate(assignment.financialContract.summary.nextDueDate)
                      : 'Awaiting schedule'}
                  </Text>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <Text tone="muted">Remaining balance</Text>
                  <Text className="font-semibold text-[var(--mobiris-ink)]">
                    {assignment.financialContract.summary.outstandingBalanceMinorUnits != null
                      ? formatMinorCurrency(
                          assignment.financialContract.summary.outstandingBalanceMinorUnits,
                          assignment.financialContract.currency,
                        )
                      : 'No outstanding balance'}
                  </Text>
                </div>
                {assignment.financialContract.hirePurchase ? (
                  <>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <Text tone="muted">Asset value</Text>
                      <Text className="font-semibold text-[var(--mobiris-ink)]">
                        {formatMinorCurrency(
                          assignment.financialContract.hirePurchase.totalTargetAmountMinorUnits,
                          assignment.financialContract.currency,
                        )}
                      </Text>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <Text tone="muted">Deposit</Text>
                      <Text className="font-semibold text-[var(--mobiris-ink)]">
                        {assignment.financialContract.hirePurchase.depositAmountMinorUnits != null
                          ? formatMinorCurrency(
                              assignment.financialContract.hirePurchase.depositAmountMinorUnits,
                              assignment.financialContract.currency,
                            )
                          : 'Not recorded'}
                      </Text>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <Text tone="muted">Contract end date</Text>
                      <Text className="font-semibold text-[var(--mobiris-ink)]">
                        {assignment.financialContract.hirePurchase.installmentPlan.contractEndDate
                          ? formatShortDate(
                              assignment.financialContract.hirePurchase.installmentPlan.contractEndDate,
                            )
                          : 'Derived from final installment'}
                      </Text>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <Text tone="muted">Completion</Text>
                      <Text className="font-semibold text-[var(--mobiris-ink)]">
                        {assignment.financialContract.summary.contractCompletionPercentage != null
                          ? `${assignment.financialContract.summary.contractCompletionPercentage}%`
                          : 'In progress'}
                      </Text>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-xl bg-slate-50 p-4">
            <Text tone="muted">Vehicle</Text>
            <Text className="font-semibold text-[var(--mobiris-ink)]">
              {formatVehicleLabel(assignment.vehicle)}
            </Text>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <Text tone="muted">Plate</Text>
            <Text className="font-semibold text-[var(--mobiris-ink)]">
              {assignment.vehicle.plate ?? 'Not recorded'}
            </Text>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <Text tone="muted">Vehicle code</Text>
            <Text className="font-semibold text-[var(--mobiris-ink)]">
              {assignment.vehicle.tenantVehicleCode ?? assignment.vehicle.systemVehicleCode ?? 'Not recorded'}
            </Text>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <Text tone="muted">Payment model</Text>
            <Text className="font-semibold text-[var(--mobiris-ink)]">
              {getDriverAssignmentPaymentModelLabel(assignment)}
            </Text>
          </div>
          {assignment.driverConfirmedAt ? (
            <div className="rounded-xl bg-slate-50 p-4">
              <Text tone="muted">Accepted</Text>
              <Text className="font-semibold text-[var(--mobiris-ink)]">
                {formatNotificationDate(assignment.driverConfirmedAt)}
              </Text>
            </div>
          ) : null}
          </div>
        </div>
        {assignment.notes ? <Text tone="muted">{assignment.notes}</Text> : null}
        {activationState === 'awaiting_confirmation' ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-12 w-full text-base shadow-[0_18px_35px_-18px_rgba(37,99,235,0.75)] sm:w-auto"
              disabled={loading !== null}
              onClick={() => void handleAccept()}
              type="button"
            >
              {loading === 'accept' ? 'Accepting…' : 'Accept assignment'}
            </Button>
            <Button
              className="h-12 w-full border-slate-300 bg-white text-base sm:w-auto"
              disabled={loading !== null}
              onClick={() => void handleReject()}
              type="button"
              variant="secondary"
            >
              {loading === 'reject' ? 'Rejecting…' : 'Reject assignment'}
            </Button>
          </div>
        ) : null}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <Text className="font-semibold text-[var(--mobiris-ink)]">What happens next</Text>
          <Text tone="muted">
            {activationState === 'awaiting_confirmation'
              ? 'Accept this assignment to confirm that you are taking this vehicle. After that, operations can begin.'
              : activationState === 'accepted_ready'
                ? 'Your assignment has been accepted. Your organisation may begin the assignment, and remittance actions will appear once the assignment is active.'
                : activationState === 'active' && supportsRemittance
                  ? 'Your assignment is active. Record remittance whenever required and keep track of your history from the assignment workspace.'
                  : 'Your assignment is active. Use the assignment workspace for the next operational action.'}
          </Text>
        </div>
        {success ? <Text className="text-emerald-700">{success}</Text> : null}
        {error ? <Text tone="danger">{error}</Text> : null}
      </CardContent>
    </Card>
  );
}

function RemittanceWorkspace({
  token,
  assignment,
  remittances,
  onRefresh,
  onOpenAssignment,
}: {
  token: string;
  assignment: DriverSelfServiceAssignmentRecord | null;
  remittances: RemittanceRecord[];
  onRefresh: () => Promise<void>;
  onOpenAssignment: () => void;
}) {
  const [amount, setAmount] = useState(amountInputFromMinorUnits(assignment?.remittanceAmountMinorUnits));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setAmount(amountInputFromMinorUnits(assignment?.remittanceAmountMinorUnits));
  }, [assignment?.id, assignment?.remittanceAmountMinorUnits]);

  if (!assignment) {
    return (
      <Card className="border-slate-200 bg-white shadow-[0_22px_60px_-32px_rgba(15,23,42,0.28)]">
        <CardHeader className="space-y-2">
          <CardTitle>Remittance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <Text className="font-semibold text-[var(--mobiris-ink)]">No active assignment yet</Text>
            <Text tone="muted">
              Remittance becomes available when your assignment is active and your payment model
              requires remittance.
            </Text>
          </div>
          <Button onClick={onOpenAssignment} type="button">
            Go to assignment
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!assignmentSupportsRemittance(assignment)) {
    return (
      <Card className="border-slate-200 bg-white shadow-[0_22px_60px_-32px_rgba(15,23,42,0.28)]">
        <CardHeader className="space-y-2">
          <CardTitle>Remittance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <Text className="font-semibold text-[var(--mobiris-ink)]">
              Remittance is not required for this assignment
            </Text>
            <Text tone="muted">
              This assignment uses the {getDriverAssignmentPaymentModelLabel(assignment)} payment
              model, so there is no remittance action to complete here.
            </Text>
          </div>
          <Button onClick={onOpenAssignment} type="button" variant="secondary">
            View assignment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const remittanceAssignment = assignment;
  const canRecord = assignment.status === 'active';
  const amountMinorUnits = parseAmountInputToMinorUnits(amount);
  const expectedAmountMinorUnits = assignment.remittanceAmountMinorUnits ?? null;
  const amountVarianceMinorUnits =
    amountMinorUnits !== null && expectedAmountMinorUnits ? amountMinorUnits - expectedAmountMinorUnits : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canRecord) {
      setError('Remittance can be recorded after your assignment becomes active.');
      return;
    }

    if (amountMinorUnits === null) {
      setError('Enter a valid remittance amount greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      await recordDriverSelfServiceRemittance(token, {
        assignmentId: remittanceAssignment.id,
        amountMinorUnits,
        ...(remittanceAssignment.remittanceCurrency
          ? { currency: remittanceAssignment.remittanceCurrency }
          : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        submissionSource: 'online',
        syncStatus: 'synced',
        originalCapturedAt: new Date().toISOString(),
      });
      setNotes('');
      setSuccess('Remittance recorded successfully.');
      await onRefresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to record remittance right now.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white shadow-[0_22px_60px_-32px_rgba(15,23,42,0.28)]">
        <CardHeader className="space-y-2">
          <CardTitle>Remittance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <Text tone="muted">Expected amount</Text>
              <p className="text-2xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                {assignment.remittanceAmountMinorUnits
                  ? formatMinorCurrency(
                      assignment.remittanceAmountMinorUnits,
                      assignment.remittanceCurrency,
                    )
                  : 'Not set yet'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <Text tone="muted">Frequency</Text>
              <Text className="font-semibold text-[var(--mobiris-ink)]">
                {assignment.remittanceFrequency
                  ? formatAssignmentStatus(assignment.remittanceFrequency)
                  : 'Not scheduled'}
              </Text>
              <Text tone="muted">
                {canRecord
                  ? 'Your assignment is active. Record each collection here.'
                  : 'Your assignment has not started collecting remittance yet.'}
              </Text>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="remittanceAmount">
                Amount collected
              </label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                disabled={!canRecord || submitting}
                id="remittanceAmount"
                inputMode="decimal"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter amount"
                value={amount}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="remittanceNotes">
                Note
              </label>
              <textarea
                className="min-h-[100px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                disabled={!canRecord || submitting}
                id="remittanceNotes"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional note for this collection"
                value={notes}
              />
            </div>
            {amountVarianceMinorUnits !== null && expectedAmountMinorUnits ? (
              <div
                className={[
                  'rounded-2xl border p-4',
                  amountVarianceMinorUnits < 0
                    ? 'border-amber-200 bg-amber-50'
                    : amountVarianceMinorUnits > 0
                      ? 'border-sky-200 bg-sky-50'
                      : 'border-emerald-200 bg-emerald-50',
                ].join(' ')}
              >
                <Text className="font-semibold text-[var(--mobiris-ink)]">
                  {amountVarianceMinorUnits < 0
                    ? 'Underpayment detected'
                    : amountVarianceMinorUnits > 0
                      ? 'Overpayment detected'
                      : 'Amount matches the expected collection'}
                </Text>
                <Text tone="muted">
                  Expected amount:{' '}
                  {formatMinorCurrency(expectedAmountMinorUnits, assignment.remittanceCurrency)}.
                  {amountVarianceMinorUnits < 0
                    ? ` Outstanding after this payment: ${formatMinorCurrency(
                        Math.abs(amountVarianceMinorUnits),
                        assignment.remittanceCurrency,
                      )}.`
                    : amountVarianceMinorUnits > 0
                      ? ` Excess received: ${formatMinorCurrency(
                          amountVarianceMinorUnits,
                          assignment.remittanceCurrency,
                        )}.`
                      : ' No outstanding balance remains for this period.'}
                </Text>
              </div>
            ) : null}
            {success ? <Text className="text-emerald-700">{success}</Text> : null}
            {error ? <Text tone="danger">{error}</Text> : null}
            <Button
              className="h-12 w-full text-base shadow-[0_18px_35px_-18px_rgba(37,99,235,0.75)]"
              disabled={!canRecord || submitting}
              type="submit"
            >
              {submitting ? 'Recording…' : 'Record remittance'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-[0_22px_60px_-32px_rgba(15,23,42,0.22)]">
        <CardHeader className="space-y-2">
          <CardTitle>Remittance history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {remittances.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <Text className="font-semibold text-[var(--mobiris-ink)]">No remittance recorded yet</Text>
              <Text tone="muted">
                Your submitted remittance will appear here after it is recorded.
              </Text>
            </div>
          ) : (
            remittances.map((remittance) => (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                key={remittance.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Text className="font-semibold text-[var(--mobiris-ink)]">
                      {formatMinorCurrency(remittance.amountMinorUnits, remittance.currency)}
                    </Text>
                    <Text tone="muted">
                      Due {formatShortDate(remittance.dueDate)} · Recorded{' '}
                      {formatNotificationDate(remittance.createdAt)}
                    </Text>
                    {remittance.reconciliation ? (
                      <>
                        <Text tone="muted">
                          Expected{' '}
                          {formatMinorCurrency(
                            remittance.reconciliation.expectedAmountMinorUnits,
                            remittance.currency,
                          )}{' '}
                          · Variance{' '}
                          {remittance.reconciliation.varianceMinorUnits < 0 ? '-' : '+'}
                          {formatMinorCurrency(
                            Math.abs(remittance.reconciliation.varianceMinorUnits),
                            remittance.currency,
                          )}
                        </Text>
                        {(remittance.reconciliation.outstandingBalanceMinorUnits ?? 0) > 0 ? (
                          <Text tone="muted">
                            Outstanding{' '}
                            {formatMinorCurrency(
                              remittance.reconciliation.outstandingBalanceMinorUnits ?? 0,
                              remittance.currency,
                            )}
                          </Text>
                        ) : null}
                      </>
                    ) : null}
                    {remittance.notes ? <Text tone="muted">{remittance.notes}</Text> : null}
                  </div>
                  <Badge tone={remittanceStatusTone(remittance.status)}>
                    {formatRemittanceStatus(remittance.status)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StepProgress({
  currentStep,
  verificationTierComponents,
}: {
  currentStep: FlowStep;
  verificationTierComponents: Array<'identity' | 'guarantor' | 'drivers_license'>;
}) {
  const steps: Array<{ key: FlowStep; label: string }> = [
    { key: 'account', label: 'Sign-in' },
    { key: 'consent', label: 'Consent' },
    { key: 'payment', label: 'Payment' },
    { key: 'identity_verification', label: 'Identity' },
    ...(verificationTierComponents.includes('guarantor')
      ? [{ key: 'guarantor' as const, label: 'Guarantor' }]
      : []),
    ...(verificationTierComponents.includes('drivers_license')
      ? [{ key: 'document_verification' as const, label: "Driver's licence" }]
      : []),
    { key: 'manual_review', label: 'Review' },
    { key: 'profile', label: 'Profile' },
    { key: 'complete', label: 'Complete' },
  ];
  // Map 'profile' step to 'consent' for progress display (profile is auto-populated from NIN)
  const displayStep = currentStep;
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
            <span
              className={index === currentIndex ? 'font-semibold text-[var(--mobiris-ink)]' : ''}
            >
              {step.label}
            </span>
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

function SelfServiceBlockingOverlay({
  visible,
  title,
  message,
}: {
  visible: boolean;
  title: string;
  message: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }

    setProgress((current) => (current > 0 ? current : 10));
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 94) return current;
        if (current < 30) return current + 10;
        if (current < 60) return current + 7;
        return current + 4;
      });
    }, 240);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[var(--mobiris-radius-card)] border border-white/10 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.75)]">
        <div className="space-y-4">
          <div className="space-y-1">
            <Text tone="strong">{title}</Text>
            <Text tone="muted">{message}</Text>
          </div>
          <div className="space-y-2">
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[var(--mobiris-primary)] transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Please keep this page open</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </div>
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
    <>
      <SelfServiceBlockingOverlay
        visible={submitting}
        title="Creating your sign-in account"
        message="Saving your email, securing your password, and connecting your onboarding access."
      />
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
    </>
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
    <>
      <SelfServiceBlockingOverlay
        visible={loading}
        title="Recording your consent"
        message="Saving your agreement, policy version, and verification audit trail."
      />
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
    </>
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
  const verificationTierLabel = driver.verificationTierLabel ?? 'selected verification tier';

  if (alreadyPaid) {
    return (
      <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
        <CardHeader>
          <CardTitle>Payment received</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Text tone="muted">
            {onboardingStep.paymentMessage ??
              `Your payment for ${verificationTierLabel} has been received. You can continue.`}
          </Text>
          <Button onClick={() => void onRefresh()} type="button">
            Continue to verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <SelfServiceBlockingOverlay
        visible={loading}
        title="Preparing your payment"
        message="Saving your progress, linking the checkout to onboarding, and opening the payment flow."
      />
      <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
        <CardHeader className="space-y-2">
          <CardTitle>
            {driver.verificationPayer === 'driver'
              ? 'Verification payment required'
              : 'Covered by your organisation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Text tone="muted">
            {driver.verificationPayer === 'driver'
              ? onboardingStep.paymentMessage ??
                'Complete the verification payment to continue.'
              : `This ${verificationTierLabel} verification will be covered by your organisation.`}
          </Text>
          {driver.organisationName ? (
            <Text tone="muted">
              This onboarding is being completed for {driver.organisationName}.
            </Text>
          ) : null}
          {paymentStatus === 'driver_payment_required' ? (
            <>
              <Text>
                Required amount for {verificationTierLabel}: {amount}
              </Text>
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
            <>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-sm text-emerald-900">
                <p className="font-medium">
                  This verification is covered by your organisation. You can continue.
                </p>
              </div>
              <Button onClick={() => void onRefresh()} type="button">
                Continue to verification
              </Button>
            </>
          )}
          {error ? <Text tone="danger">{error}</Text> : null}
        </CardContent>
      </Card>
    </>
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

function maskNin(value?: string | null): string {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length <= 4) {
    return trimmed || 'Not returned';
  }
  return `${'*'.repeat(Math.max(0, trimmed.length - 4))}${trimmed.slice(-4)}`;
}

function formatProfileValue(value?: string | null): string {
  const trimmed = value?.trim() ?? '';
  return trimmed || 'Not provided';
}

function formatShortDate(value?: string | null): string {
  if (!value) {
    return 'Not provided';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(date);
}

function formatNotificationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

const OPERATIONAL_FIELD_LABELS: Record<string, string> = {
  phoneNumber: 'Phone number',
  address: 'Address',
  town: 'Town',
  localGovernmentArea: 'Local government area',
  state: 'State',
  nextOfKinName: 'Next of kin name',
  nextOfKinPhone: 'Next of kin phone',
  nextOfKinRelationship: 'Next of kin relationship',
  emergencyContactName: 'Emergency contact name',
  emergencyContactPhone: 'Emergency contact phone',
  emergencyContactRelationship: 'Emergency contact relationship',
};

function formatOperationalFieldLabel(field: string): string {
  return OPERATIONAL_FIELD_LABELS[field] ?? field;
}

function notificationAssignmentId(notification: UserNotificationRecord): string | null {
  if (typeof notification.metadata?.assignmentId === 'string') {
    return notification.metadata.assignmentId;
  }

  const actionUrl = notification.actionUrl ?? '';
  const assignmentId =
    actionUrl.match(/[?&]assignmentId=([^&]+)/)?.[1] ??
    actionUrl.match(/\/assignments\/([^/?#]+)/)?.[1] ??
    null;
  return assignmentId ? decodeURIComponent(assignmentId) : null;
}

function Field({
  label,
  value,
  onChange,
  required = true,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string | undefined;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {!required ? <span className="ml-1 text-slate-400">(Optional)</span> : null}
      </label>
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
        }`}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        type="text"
        value={value}
      />
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

function VerificationAddonPaymentCard({
  token,
  driver,
  chargeKey,
  title,
  description,
  paymentOverride,
  onRefresh,
}: {
  token: string;
  driver: DriverRecord;
  chargeKey: 'guarantor_verification' | 'drivers_license_verification';
  title: string;
  description: string;
  paymentOverride?: {
    paymentStatus: 'not_required' | 'ready' | 'driver_payment_required';
    paymentMessage: string;
    amountMinorUnits: number;
    currency: string;
  } | null;
  onRefresh: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentStatus =
    paymentOverride?.paymentStatus ??
    (chargeKey === 'guarantor_verification'
      ? driver.guarantorVerificationPaymentStatus
      : driver.driversLicenseVerificationPaymentStatus);
  const paymentMessage =
    paymentOverride?.paymentMessage ??
    (chargeKey === 'guarantor_verification'
      ? driver.guarantorVerificationPaymentMessage
      : driver.driversLicenseVerificationPaymentMessage);
  const amountMinorUnits =
    paymentOverride?.amountMinorUnits ??
    (chargeKey === 'guarantor_verification'
      ? driver.guarantorVerificationAmountMinorUnits
      : driver.driversLicenseVerificationAmountMinorUnits);
  const currency =
    paymentOverride?.currency ??
    (chargeKey === 'guarantor_verification'
      ? driver.guarantorVerificationCurrency
      : driver.driversLicenseVerificationCurrency);

  if (paymentStatus !== 'driver_payment_required') {
    return null;
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const fallbackReturnUrl = `${window.location.origin}/driver-self-service?token=${encodeURIComponent(token)}`;
      window.sessionStorage.setItem(
        `mobiris_driver_verification_addon_resume_${driver.id}_${chargeKey}`,
        JSON.stringify({
          token,
          returnUrl: fallbackReturnUrl,
          driverId: driver.id,
          chargeKey,
        }),
      );
      const checkout = await initiateDriverVerificationAddonCheckout(
        token,
        chargeKey,
        'paystack',
        fallbackReturnUrl,
      );
      window.location.href = checkout.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start payment right now.');
      setLoading(false);
    }
  }

  return (
    <>
      <SelfServiceBlockingOverlay
        visible={loading}
        title="Preparing your payment"
        message="Opening the verification payment flow and preserving your place in onboarding."
      />
      <Card className="border-amber-200 bg-amber-50/70 shadow-none">
        <CardContent className="space-y-3 px-4 py-4">
          <Text tone="strong">{title}</Text>
          <Text tone="muted">{description}</Text>
          <Text tone="muted">
            {paymentMessage}
            {amountMinorUnits && currency
              ? ` Required amount: ${formatMinorCurrency(amountMinorUnits, currency)}.`
              : ''}
          </Text>
          {error ? <Text tone="danger">{error}</Text> : null}
          <div className="flex flex-wrap gap-3">
            <Button disabled={loading} onClick={() => void handleCheckout()} type="button">
              {loading ? 'Opening payment…' : 'Pay now'}
            </Button>
            <Button onClick={() => void onRefresh()} type="button" variant="secondary">
              I&apos;ve completed payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
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
  const existingLicenceVerification = driver.driverLicenceVerification;
  const selectedDocumentRequiresAddonPayment =
    selectedDocType.trim().toLowerCase() === 'drivers-license' &&
    driver.driversLicenseVerificationPaymentStatus === 'driver_payment_required';

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
    <>
      <SelfServiceBlockingOverlay
        visible={loading}
        title="Verifying your document"
        message="Checking the document number against issuing authority records and updating your onboarding status."
      />
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
              Already verified:{' '}
              {[...verifiedTypes].map((type) => getDocumentLabel(type)).join(', ')}
            </div>
          ) : null}

          {lastResult && lastResult.status !== 'verified' ? (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {lastResult.status === 'provider_unavailable'
                ? "Driver's licence verification is temporarily unavailable."
                : lastResult.reviewDecision === 'approved'
                  ? "Your driver's licence verification has been approved."
                  : lastResult.reviewDecision === 'rejected'
                    ? "Your driver's licence verification was rejected. Please contact your organisation before trying again."
                  : lastResult.reviewDecision === 'request_reverification'
                    ? 'A new driver’s licence verification is required before onboarding can continue.'
                      : (lastResult.failureReason ??
                        'The document number could not be verified automatically. Check the number and try again, or contact your organisation.')}
            </div>
          ) : null}

          {!lastResult && selectedDocType === 'drivers-license' && existingLicenceVerification ? (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {existingLicenceVerification.status === 'verified'
                ? "Your driver's licence verification has been approved."
                : (existingLicenceVerification.failureReason ??
                  'Your previous driver’s licence verification did not complete successfully. You can retry now.')}
            </div>
          ) : null}

          {lastResult ? (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={lastResult.status === 'verified' ? 'success' : 'warning'}>
                  {lastResult.status === 'verified'
                    ? 'Verification passed'
                    : lastResult.status === 'failed'
                      ? 'Verification failed'
                      : lastResult.status === 'provider_unavailable'
                        ? 'Provider unavailable'
                        : 'Verification pending'}
                </Badge>
                {lastResult.providerValidity ? (
                  <Badge tone={lastResult.providerValidity === 'valid' ? 'success' : 'danger'}>
                    Validity: {lastResult.providerValidity}
                  </Badge>
                ) : null}
                <Badge
                  tone={
                    lastResult.linkageDecision === 'auto_pass'
                      ? 'success'
                      : lastResult.linkageDecision === 'fail'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  Linkage: {lastResult.linkageDecision.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Text tone="muted">Licence number</Text>
                  <Text>{lastResult.idNumber}</Text>
                </div>
                {(lastResult.providerFirstName ||
                  lastResult.providerMiddleName ||
                  lastResult.providerLastName) ? (
                  <div className="space-y-1">
                    <Text tone="muted">Holder name</Text>
                    <Text>
                      {[
                        lastResult.providerFirstName,
                        lastResult.providerMiddleName,
                        lastResult.providerLastName,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    </Text>
                  </div>
                ) : null}
                {lastResult.providerDateOfBirth ? (
                  <div className="space-y-1">
                    <Text tone="muted">Holder date of birth</Text>
                    <Text>{lastResult.providerDateOfBirth}</Text>
                  </div>
                ) : null}
                {lastResult.providerGender ? (
                  <div className="space-y-1">
                    <Text tone="muted">Holder gender</Text>
                    <Text>{lastResult.providerGender}</Text>
                  </div>
                ) : null}
                {lastResult.providerExpiryDate ? (
                  <div className="space-y-1">
                    <Text tone="muted">Expiry date</Text>
                    <Text>{lastResult.providerExpiryDate}</Text>
                  </div>
                ) : null}
                {lastResult.providerIssueDate ? (
                  <div className="space-y-1">
                    <Text tone="muted">Issue date</Text>
                    <Text>{lastResult.providerIssueDate}</Text>
                  </div>
                ) : null}
                {lastResult.providerStateOfIssuance ? (
                  <div className="space-y-1">
                    <Text tone="muted">State of issuance</Text>
                    <Text>{lastResult.providerStateOfIssuance}</Text>
                  </div>
                ) : null}
                {lastResult.providerLicenceClass ? (
                  <div className="space-y-1">
                    <Text tone="muted">Licence class</Text>
                    <Text>{lastResult.providerLicenceClass}</Text>
                  </div>
                ) : null}
                {lastResult.overallLinkageScore !== null ? (
                  <div className="space-y-1">
                    <Text tone="muted">Linkage confidence</Text>
                    <Text>{lastResult.overallLinkageScore}%</Text>
                  </div>
                ) : null}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <Text tone="strong">Match against verified identity</Text>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Text tone="muted">Compared fields</Text>
                    <Text>
                      {lastResult.identityComparison.matchedFieldCount}/
                      {lastResult.identityComparison.comparedFieldCount} matched
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Biometric comparison</Text>
                    <Text>
                      {lastResult.identityComparison.biometricMatch === null
                        ? 'Not returned'
                        : lastResult.identityComparison.biometricMatch
                          ? 'Matched'
                          : 'Mismatch'}
                      {lastResult.identityComparison.biometricConfidence !== null
                        ? ` (${lastResult.identityComparison.biometricConfidence}%)`
                        : ''}
                    </Text>
                  </div>
                </div>
                {lastResult.discrepancyFlags.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    <Text tone="muted">Discrepancies detected</Text>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {lastResult.discrepancyFlags.map((flag) => (
                        <li key={flag}>{flag.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <Text tone="muted">{lastResult.riskSummary}</Text>
              {lastResult.linkageReasons.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {lastResult.linkageReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {selectedDocumentRequiresAddonPayment ? (
            <VerificationAddonPaymentCard
              chargeKey="drivers_license_verification"
              description="Driver's licence verification needs a separate payment before we can check this document with the issuing authority."
              driver={driver}
              onRefresh={onComplete}
              title="Driver's licence verification payment required"
              token={token}
            />
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
              <div className="flex flex-wrap gap-3">
                <Button disabled={loading || selectedDocumentRequiresAddonPayment} type="submit">
                  {loading ? 'Verifying…' : 'Verify document'}
                </Button>
              </div>
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
    </>
  );
}

function ManualReviewStep({
  identityStatus,
  reason,
}: {
  identityStatus?: string;
  reason?: string;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader>
        <CardTitle>Verification under review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Text tone="muted">
          {reason
            ? reason
            : identityStatus === 'review_needed'
            ? 'Your verification submission has been received and is currently under manual review. You will be notified once a decision has been made.'
            : 'Your submission is being processed. This can take a short while. Check back if the status has not updated.'}
        </Text>
        <Text tone="muted" className="text-xs">
          You do not need to do anything else right now. Once review is complete, any vehicle
          assignment waiting for you will appear in your assignment workspace for action.
        </Text>
      </CardContent>
    </Card>
  );
}

function GuarantorStep({
  driver,
  token,
  onboardingStep,
  onComplete,
}: {
  driver: DriverRecord;
  token: string;
  onboardingStep: OnboardingStepRecord;
  onComplete: () => Promise<void>;
}) {
  const [name, setName] = useState(onboardingStep.guarantorName ?? '');
  const [phone, setPhone] = useState(onboardingStep.guarantorPhone ?? '');
  const [email, setEmail] = useState(onboardingStep.guarantorEmail ?? '');
  const [countryCode, setCountryCode] = useState(
    onboardingStep.guarantorCountryCode ?? driver.nationality ?? 'NG',
  );
  const [relationship, setRelationship] = useState(onboardingStep.guarantorRelationship ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capacityAssessment, setCapacityAssessment] =
    useState<DriverGuarantorCapacityAssessment | null>(null);
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<{
    tone: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [paymentRequirement, setPaymentRequirement] = useState<{
    paymentStatus: 'not_required' | 'ready' | 'driver_payment_required';
    paymentMessage: string;
    amountMinorUnits: number;
    currency: string;
  } | null>(
    driver.guarantorVerificationPaymentStatus === 'driver_payment_required'
      ? {
          paymentStatus: driver.guarantorVerificationPaymentStatus,
          paymentMessage:
            driver.guarantorVerificationPaymentMessage ??
            'You must complete payment before guarantor verification can continue.',
          amountMinorUnits: driver.guarantorVerificationAmountMinorUnits ?? 0,
          currency: driver.guarantorVerificationCurrency ?? 'NGN',
        }
      : null,
  );
  const [fieldErrors, setFieldErrors] = useState<{
    name: string | undefined;
    phone: string | undefined;
    email: string | undefined;
    countryCode: string | undefined;
  }>({
    name: undefined,
    phone: undefined,
    email: undefined,
    countryCode: undefined,
  });

  const guarantorStatus = onboardingStep.guarantorStatus ?? null;
  const guarantorPending =
    Boolean(onboardingStep.guarantorName?.trim()) &&
    !onboardingStep.guarantorVerified &&
    guarantorStatus !== 'verified';

  function inputClass(hasError: boolean) {
    return `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
    }`;
  }

  function normalizePhoneInput(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    const compact = trimmed.replace(/[\s()-]/g, '');
    return compact.startsWith('+') ? `+${compact.slice(1).replace(/\+/g, '')}` : compact;
  }

  function getInvitationMessage(invitation: DriverGuarantorInvitationResult) {
    if (invitation.status === 'sent' && invitation.destination) {
      return `${invitation.message} Sent to ${invitation.destination}.`;
    }
    return invitation.message;
  }

  useEffect(() => {
    const normalizedPhone = normalizePhoneInput(phone);
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCountryCode = countryCode.trim().toUpperCase();
    const canCheckPhone = normalizedPhone.length > 0 && /^\+?\d{10,15}$/.test(normalizedPhone);
    const canCheckEmail =
      trimmedEmail.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!canCheckPhone && !canCheckEmail) {
      setCapacityAssessment(null);
      setCapacityLoading(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setCapacityLoading(true);
      assessDriverSelfServiceGuarantorCapacity(token, {
        ...(canCheckPhone ? { phone: normalizedPhone } : {}),
        ...(canCheckEmail ? { email: trimmedEmail } : {}),
        ...(trimmedCountryCode ? { countryCode: trimmedCountryCode } : {}),
      })
        .then((assessment) => {
          setCapacityAssessment(assessment);
        })
        .catch(() => {
          setCapacityAssessment(null);
        })
        .finally(() => setCapacityLoading(false));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [countryCode, email, phone, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmissionNotice(null);

    const nextFieldErrors: {
      name: string | undefined;
      phone: string | undefined;
      email: string | undefined;
      countryCode: string | undefined;
    } = {
      name: undefined,
      phone: undefined,
      email: undefined,
      countryCode: undefined,
    };
    const trimmedName = name.trim();
    const normalizedPhone = normalizePhoneInput(phone);
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCountryCode = countryCode.trim().toUpperCase();
    setPaymentRequirement(null);

    if (!trimmedName) {
      nextFieldErrors.name = 'Enter the guarantor name.';
    }
    if (!normalizedPhone) {
      nextFieldErrors.phone = 'Enter the guarantor phone number.';
    } else if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
      nextFieldErrors.phone =
        'Use 10 to 15 digits. Spaces, brackets, and dashes are okay, but they will be removed before saving.';
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextFieldErrors.email = 'Enter a valid email address.';
    }
    if (trimmedCountryCode && !/^[A-Z]{2}$/.test(trimmedCountryCode)) {
      nextFieldErrors.countryCode = 'Use a 2-letter country code such as NG.';
    }

    setFieldErrors(nextFieldErrors);
    if (Object.values(nextFieldErrors).some(Boolean)) {
      setError('Check the highlighted guarantor fields and try again.');
      return;
    }

    if (capacityAssessment && !capacityAssessment.eligible) {
      setError(capacityAssessment.message);
      return;
    }

    setFieldErrors({
      name: undefined,
      phone: undefined,
      email: undefined,
      countryCode: undefined,
    });
    setSaving(true);
    try {
      const result = await submitDriverSelfServiceGuarantor(token, {
        name: trimmedName,
        phone: normalizedPhone,
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
        ...(trimmedCountryCode ? { countryCode: trimmedCountryCode } : {}),
        ...(relationship.trim() ? { relationship: relationship.trim() } : {}),
      });
      setCapacityAssessment(result.capacity);
      setPaymentRequirement(
        result.payment.paymentStatus === 'driver_payment_required'
          ? {
              paymentStatus: result.payment.paymentStatus,
              paymentMessage: result.payment.paymentMessage,
              amountMinorUnits: result.payment.amountMinorUnits,
              currency: result.payment.currency,
            }
          : null,
      );
      setSubmissionNotice({
        tone:
          result.invitation.status === 'failed' ||
          result.invitation.status === 'not_ready'
            ? 'danger'
            : 'success',
        message:
          result.capacity.matched && result.capacity.eligible
            ? `${result.capacity.message} ${getInvitationMessage(result.invitation)}`
            : getInvitationMessage(result.invitation),
      });
      try {
        await onComplete();
      } catch (refreshError) {
        setError(
          refreshError instanceof Error
            ? `${getInvitationMessage(result.invitation)} We could not refresh your onboarding status automatically: ${refreshError.message}`
            : `${getInvitationMessage(result.invitation)} We could not refresh your onboarding status automatically.`,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'We could not save your guarantor details right now.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
      <CardHeader className="space-y-2">
        <CardTitle>Guarantor details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Text tone="muted">
          Your organisation requires a guarantor before activation can continue. Add the person who
          will vouch for you and we&apos;ll guide them into their own verification flow.
        </Text>
        {capacityLoading ? <Text tone="muted">Checking guarantor eligibility…</Text> : null}
        {!capacityLoading && capacityAssessment ? (
          <Card
            className={`shadow-none ${
              capacityAssessment.eligible
                ? 'border-emerald-200 bg-emerald-50/70'
                : 'border-rose-200 bg-rose-50/80'
            }`}
          >
            <CardContent className="space-y-2 px-4 py-4">
              <Text tone={capacityAssessment.eligible ? 'strong' : 'danger'}>
                {capacityAssessment.matched
                  ? 'Existing guarantor found'
                  : 'New guarantor details'}
              </Text>
              <Text tone="muted">{capacityAssessment.message}</Text>
              {capacityAssessment.matched ? (
                <Text tone="muted">
                  {capacityAssessment.guarantorName ?? 'This guarantor'} currently guarantees{' '}
                  {capacityAssessment.activeDriverCount} active driver
                  {capacityAssessment.activeDriverCount === 1 ? '' : 's'} in this organisation.
                  Limit: {capacityAssessment.organisationLimit}.
                </Text>
              ) : (
                <Text tone="muted">
                  Organisation limit: {capacityAssessment.organisationLimit} active driver
                  {capacityAssessment.organisationLimit === 1 ? '' : 's'} per guarantor.
                </Text>
              )}
            </CardContent>
          </Card>
        ) : null}
        {submissionNotice ? <Text tone={submissionNotice.tone}>{submissionNotice.message}</Text> : null}
        {paymentRequirement ? (
          <VerificationAddonPaymentCard
            chargeKey="guarantor_verification"
            description="Your guarantor has been saved, but we need to confirm the guarantor verification payment before their invite can be sent."
            driver={driver}
            onRefresh={onComplete}
            paymentOverride={paymentRequirement}
            title="Guarantor verification payment required"
            token={token}
          />
        ) : null}
        {!submissionNotice && guarantorPending ? (
          <Card className="border-emerald-200 bg-emerald-50/70 shadow-none">
            <CardContent className="space-y-2 px-4 py-4">
              <Text tone="strong">Guarantor saved and awaiting verification</Text>
              <Text tone="muted">
                {onboardingStep.guarantorEmail
                  ? `${onboardingStep.guarantorName ?? 'Your guarantor'} has been saved with ${onboardingStep.guarantorEmail}. They must complete their verification before your onboarding can finish.`
                  : `${onboardingStep.guarantorName ?? 'Your guarantor'} has been saved. Add an email address or contact your operator if a verification link still needs to be sent.`}
              </Text>
            </CardContent>
          </Card>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((current) => ({ ...current, name: undefined }));
                }}
                placeholder="Full name"
                className={inputClass(Boolean(fieldErrors.name))}
              />
              {fieldErrors.name ? <Text tone="danger">{fieldErrors.name}</Text> : null}
            </div>
            <div className="space-y-1">
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFieldErrors((current) => ({ ...current, phone: undefined }));
                }}
                placeholder="Phone number"
                className={inputClass(Boolean(fieldErrors.phone))}
              />
              {fieldErrors.phone ? <Text tone="danger">{fieldErrors.phone}</Text> : null}
            </div>
            <div className="space-y-1">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((current) => ({ ...current, email: undefined }));
                }}
                placeholder="Email address"
                className={inputClass(Boolean(fieldErrors.email))}
              />
              {fieldErrors.email ? <Text tone="danger">{fieldErrors.email}</Text> : null}
            </div>
            <div className="space-y-1">
              <input
                type="text"
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value.toUpperCase());
                  setFieldErrors((current) => ({ ...current, countryCode: undefined }));
                }}
                placeholder="Country code"
                maxLength={2}
                className={`${inputClass(Boolean(fieldErrors.countryCode))} uppercase`}
              />
              {fieldErrors.countryCode ? <Text tone="danger">{fieldErrors.countryCode}</Text> : null}
            </div>
            <div className="space-y-1 md:col-span-2">
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Relationship"
                className={inputClass(false)}
              />
            </div>
          </div>
          <Text tone="muted" className="text-xs">
            If you add an email address, the guarantor verification link will be sent automatically
            once your organisation&apos;s policy allows it.
          </Text>
          {error ? <Text tone="danger">{error}</Text> : null}
          <Button disabled={saving || Boolean(capacityAssessment && !capacityAssessment.eligible)} type="submit">
            {saving ? 'Saving guarantor…' : 'Save guarantor and continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CompletionStep({
  driver,
  onboardingStep,
}: { driver: DriverRecord; onboardingStep: OnboardingStepRecord }) {
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
            Verification tier: {onboardingStep.verificationTierLabel}
          </Text>
          <Text tone="muted">
            {driver.identityStatus === 'verified'
              ? `Your ${onboardingStep.verificationTierLabel} requirements are complete. If a vehicle has been assigned to you, open Assignments to review and accept it.`
              : driver.identityStatus === 'review_needed'
                ? `Your ${onboardingStep.verificationTierLabel} verification has been submitted and is under review. You will be contacted once a decision is made.`
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
              Your organisation requires a guarantor to complete your onboarding. If you added an
              email address for your guarantor, Mobiris will send their verification link and code
              automatically and keep reminding both of you until it is done. If your guarantor has
              still not received anything, ask your organisation to resend it.
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

function OperationalProfileStep({
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
  const operationalProfile = driver.operationalProfile ?? {};
  const [phoneNumber, setPhoneNumber] = useState(
    operationalProfile.phoneNumber ?? driver.phone ?? '',
  );
  const [address, setAddress] = useState(operationalProfile.address ?? '');
  const [town, setTown] = useState(operationalProfile.town ?? '');
  const [localGovernmentArea, setLocalGovernmentArea] = useState(
    operationalProfile.localGovernmentArea ?? '',
  );
  const [stateValue, setStateValue] = useState(operationalProfile.state ?? '');
  const [nextOfKinName, setNextOfKinName] = useState(operationalProfile.nextOfKinName ?? '');
  const [nextOfKinPhone, setNextOfKinPhone] = useState(operationalProfile.nextOfKinPhone ?? '');
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState(
    operationalProfile.nextOfKinRelationship ?? '',
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    operationalProfile.emergencyContactName ?? '',
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    operationalProfile.emergencyContactPhone ?? '',
  );
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(
    operationalProfile.emergencyContactRelationship ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const requiredFieldValues: Record<string, string> = {
    phoneNumber,
    address,
    town,
    localGovernmentArea,
    state: stateValue,
    nextOfKinName,
    nextOfKinPhone,
    emergencyContactName,
    emergencyContactPhone,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    const nextFieldErrors = Object.entries(requiredFieldValues).reduce<Record<string, string>>(
      (acc, [field, value]) => {
        if (!value.trim()) {
          acc[field] = `${formatOperationalFieldLabel(field)} is required.`;
        }
        return acc;
      },
      {},
    );

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError(
        `Complete the required fields before continuing: ${Object.keys(nextFieldErrors)
          .map((field) => formatOperationalFieldLabel(field))
          .join(', ')}.`,
      );
      setSaving(false);
      return;
    }

    try {
      await updateDriverSelfServiceProfile(token, {
        phoneNumber,
        address,
        town,
        localGovernmentArea,
        state: stateValue,
        nextOfKinName,
        nextOfKinPhone,
        nextOfKinRelationship,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
      });
      try {
        await onComplete();
      } catch (err) {
        setError(
          err instanceof Error
            ? `Your details were saved, but we could not refresh onboarding yet. ${err.message}`
            : 'Your details were saved, but we could not refresh onboarding yet. Please try again.',
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your profile right now.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SelfServiceBlockingOverlay
        visible={saving}
        title="Saving your profile"
        message="Updating your contact and operational details so onboarding can continue."
      />
      <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
        <CardHeader className="space-y-2">
          <CardTitle>Complete your profile</CardTitle>
          <Text tone="muted">
            Your verified identity is locked. Add the operational details your organisation needs
            to finish onboarding.
          </Text>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Text tone="strong">Verified identity</Text>
              <Badge tone="success">Provider verified</Badge>
              <Badge tone="neutral">Read only</Badge>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Text tone="muted">Full name</Text>
                <Text>{[driver.firstName, driver.lastName].filter(Boolean).join(' ') || 'Not returned'}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">NIN</Text>
                <Text>{maskNin(driver.identityProfile?.ninIdNumber)}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Date of birth</Text>
                <Text>{driver.dateOfBirth ?? 'Not returned'}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Gender</Text>
                <Text>{driver.gender ?? 'Not returned'}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Nationality</Text>
                <Text>{driver.nationality ?? 'Not returned'}</Text>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-wrap items-center gap-2">
              <Text tone="strong">Contact and operational details</Text>
              <Badge tone="warning">You can edit these</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                error={fieldErrors.phoneNumber}
                label="Phone number"
                value={phoneNumber}
                onChange={setPhoneNumber}
              />
              <Field error={fieldErrors.address} label="Address" value={address} onChange={setAddress} />
              <Field error={fieldErrors.town} label="Town" value={town} onChange={setTown} />
              <Field
                error={fieldErrors.localGovernmentArea}
                label="LGA"
                value={localGovernmentArea}
                onChange={setLocalGovernmentArea}
              />
              <Field error={fieldErrors.state} label="State" value={stateValue} onChange={setStateValue} />
              <Field
                error={fieldErrors.nextOfKinName}
                label="Next of kin name"
                value={nextOfKinName}
                onChange={setNextOfKinName}
              />
              <Field
                error={fieldErrors.nextOfKinPhone}
                label="Next of kin phone"
                value={nextOfKinPhone}
                onChange={setNextOfKinPhone}
              />
              <Field
                label="Next of kin relationship"
                value={nextOfKinRelationship}
                onChange={setNextOfKinRelationship}
                required={false}
              />
              <Field
                error={fieldErrors.emergencyContactName}
                label="Emergency contact name"
                value={emergencyContactName}
                onChange={setEmergencyContactName}
              />
              <Field
                error={fieldErrors.emergencyContactPhone}
                label="Emergency contact phone"
                value={emergencyContactPhone}
                onChange={setEmergencyContactPhone}
              />
              <Field
                label="Emergency contact relationship"
                value={emergencyContactRelationship}
                onChange={setEmergencyContactRelationship}
                required={false}
              />
            </div>
            {onboardingStep.missingOperationalFields?.length ? (
              <Text tone="muted">
                Required before continuing:{' '}
                {onboardingStep.missingOperationalFields
                  .map((field) => formatOperationalFieldLabel(field))
                  .join(', ')}
                .
              </Text>
            ) : null}
            {error ? <Text tone="danger">{error}</Text> : null}
            <Button disabled={saving} type="submit">
              {saving ? 'Saving…' : 'Save and continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main flow orchestrator — backend-driven
// ---------------------------------------------------------------------------

function DriverVerificationFlow({
  token,
  initialAssignmentId,
}: {
  token: string;
  initialAssignmentId?: string | null;
}) {
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStepRecord | null>(null);
  const [assignments, setAssignments] = useState<DriverSelfServiceAssignmentRecord[]>([]);
  const [remittances, setRemittances] = useState<RemittanceRecord[]>([]);
  const [notifications, setNotifications] = useState<UserNotificationRecord[]>([]);
  const [activeTab, setActiveTab] = useState<DriverAppTab>('home');
  const [state, setState] = useState<'loading' | 'expired' | 'error' | 'ready'>('loading');
  const [refreshingAfterVerification, setRefreshingAfterVerification] = useState(false);
  const [postSubmitRefreshError, setPostSubmitRefreshError] = useState<string | null>(null);
  const [lastVerificationResult, setLastVerificationResult] =
    useState<DriverIdentityResolutionResult | null>(null);
  // Incremented after each verification attempt. Used as a React key on
  // DriverIdentityVerification to force a full remount (resetting all useActionState
  // and camera state) whether the step changes or not.
  const [verificationKey, setVerificationKey] = useState(0);
  const loaded = useRef(false);

  const refreshContext = useCallback(async () => {
    const [nextDriver, nextStep, nextAssignments, nextNotifications, nextRemittances] =
      await Promise.all([
      getDriverSelfServiceContext(token),
      getDriverOnboardingStep(token),
      listDriverSelfServiceAssignments(token),
      listDriverSelfServiceNotifications(token).catch(() => []),
      listDriverSelfServiceRemittance(token).catch(() => []),
    ]);
    setDriver(nextDriver);
    setOnboardingStep(nextStep);
    setAssignments(nextAssignments);
    setNotifications(nextNotifications);
    setRemittances(nextRemittances);
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

  const currentAssignment =
    assignments.find((assignment) =>
      ['driver_action_required', 'pending_driver_confirmation', 'accepted', 'active'].includes(
        assignment.status,
      ),
    ) ?? null;
  const currentAssignmentId = currentAssignment?.id ?? null;
  const currentAssignmentStatus = currentAssignment?.status ?? null;
  const activeAssignmentSupportsRemittance =
    currentAssignmentStatus === 'active' && currentAssignment
      ? assignmentSupportsRemittance(currentAssignment)
      : false;

  useEffect(() => {
    if (!driver || !onboardingStep) {
      return;
    }

    if (initialAssignmentId && currentAssignmentId === initialAssignmentId) {
      setActiveTab('assignment');
      return;
    }

    if (currentAssignmentStatus === 'driver_action_required') {
      setActiveTab('assignment');
      return;
    }

    if (activeAssignmentSupportsRemittance) {
      setActiveTab((current) => (current === 'home' ? 'home' : current));
    }
  }, [
    activeAssignmentSupportsRemittance,
    currentAssignmentId,
    currentAssignmentStatus,
    driver,
    initialAssignmentId,
    onboardingStep,
  ]);

  if (state === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)] px-4">
        <div className="mx-auto w-full max-w-sm space-y-6 text-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
              Mobiris
            </p>
            <p className="text-lg font-semibold text-[var(--mobiris-ink)]">
              Loading your driver workspace
            </p>
            <p className="text-sm text-slate-500">
              Fetching your current assignment, verification, and account state.
            </p>
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
    async function handleRetryLoad() {
      setState('loading');
      try {
        await refreshContext();
        setState('ready');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message.toLowerCase() : '';
        setState(msg.includes('expired') || msg.includes('invalid') ? 'expired' : 'error');
      }
    }

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
              <button
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                onClick={() => void handleRetryLoad()}
                type="button"
              >
                Try again
              </button>
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
  const organisationName = driver.organisationName?.trim() || 'Mobiris operator';
  const tierComponents = onboardingStep.verificationTierComponents ?? ['identity'];
  const tierIncludes = [
    'identity verification',
    ...(tierComponents.includes('guarantor') ? ['guarantor verification'] : []),
    ...(tierComponents.includes('drivers_license') ? ["driver's licence verification"] : []),
  ];
  const tierRequires = [
    'consent',
    ...(driver.verificationPaymentState !== 'not_required' ? ['payment when applicable'] : []),
    'liveness and NIN verification',
    ...(tierComponents.includes('guarantor') ? ['a verified guarantor'] : []),
    ...(tierComponents.includes('drivers_license') ? ["a verified driver's licence"] : []),
    'contact and operational details',
  ];
  const onboardingIncomplete = currentStep !== 'complete';
  const unreadNotifications = notifications.filter((item) => !item.readAt).length;

  async function handleNotificationOpen(notification: UserNotificationRecord) {
    try {
      if (!notification.readAt) {
        const updated = await markDriverSelfServiceNotificationRead(token, notification.id);
        setNotifications((current) =>
          current.map((item) => (item.id === notification.id ? updated : item)),
        );
      }
    } catch {
      // Keep the action available even if mark-read fails.
    }

    const assignmentId = notificationAssignmentId(notification);
    if (assignmentId && currentAssignment?.id === assignmentId) {
      setActiveTab('assignment');
      requestAnimationFrame(() => {
        document.getElementById('assignment-workspace')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }
  const homeStatusTone =
    onboardingIncomplete
      ? 'warning'
      : currentAssignment?.status === 'driver_action_required'
        ? 'warning'
        : currentAssignment?.status === 'active'
          ? 'success'
          : 'neutral';

  const onboardingPanel =
    currentStep === 'account' ? (
      <AccountSetupStep driver={driver} onComplete={refreshContext} token={token} />
    ) : currentStep === 'profile' ? (
      <OperationalProfileStep
        driver={driver}
        onboardingStep={onboardingStep}
        onComplete={refreshContext}
        token={token}
      />
    ) : currentStep === 'consent' ? (
      <ConsentStep token={token} onComplete={refreshContext} />
    ) : currentStep === 'payment' ? (
      <PaymentStep
        driver={driver}
        token={token}
        onboardingStep={onboardingStep}
        onRefresh={refreshContext}
      />
    ) : currentStep === 'identity_verification' ? (
      <DriverIdentityVerification
        defaultCountryCode={driver.nationality ?? null}
        driver={driver}
        key={verificationKey}
        mode="self_service"
        onVerificationSubmitted={(result) => {
          setLastVerificationResult(result);
          setRefreshingAfterVerification(true);
          setPostSubmitRefreshError(null);
          void refreshContext()
            .then(() => {
              setVerificationKey((k) => k + 1);
            })
            .catch((error: unknown) => {
              setPostSubmitRefreshError(
                error instanceof Error
                  ? error.message
                  : 'Unable to refresh onboarding status right now.',
              );
            })
            .finally(() => setRefreshingAfterVerification(false));
        }}
        selfServiceToken={token}
        {...(driver.enabledDriverIdentifierTypes
          ? { enabledIdentifierTypes: driver.enabledDriverIdentifierTypes }
          : {})}
        {...(driver.requiredDriverIdentifierTypes
          ? { requiredIdentifierTypes: driver.requiredDriverIdentifierTypes }
          : {})}
      />
    ) : currentStep === 'document_verification' ? (
      <DocumentVerificationStep
        driver={driver}
        token={token}
        onboardingStep={onboardingStep}
        onComplete={refreshContext}
      />
    ) : currentStep === 'guarantor' ? (
      <GuarantorStep
        driver={driver}
        token={token}
        onboardingStep={onboardingStep}
        onComplete={refreshContext}
      />
    ) : currentStep === 'manual_review' ? (
      <ManualReviewStep
        {...(onboardingStep.identityStatus
          ? { identityStatus: onboardingStep.identityStatus }
          : {})}
        {...(onboardingStep.reason ? { reason: onboardingStep.reason } : {})}
      />
    ) : (
      <CompletionStep driver={driver} onboardingStep={onboardingStep} />
    );

  const tabs: Array<{
    key: DriverAppTab;
    label: string;
    enabled: boolean;
    badge?: number;
  }> = [
    { key: 'home', label: 'Home', enabled: true },
    { key: 'assignment', label: 'Assignment', enabled: true },
    { key: 'remittance', label: 'Remittance', enabled: true },
    {
      key: 'notifications',
      label: 'Alerts',
      enabled: true,
      ...(unreadNotifications > 0 ? { badge: unreadNotifications } : {}),
    },
    { key: 'profile', label: 'Profile', enabled: true },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_26%,#f8fbff_58%,#ffffff_100%)] pb-28 lg:pb-10">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pt-5 lg:px-6">
        <header className="sticky top-0 z-20 -mx-4 border-b border-white/70 bg-white/90 px-4 pb-4 pt-2 backdrop-blur lg:mx-0 lg:rounded-[var(--mobiris-radius-card)] lg:border lg:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
                Mobiris Fleet OS
              </Text>
              <Heading size="h3">{driverDisplayName}</Heading>
              <Text tone="muted">{organisationName}</Text>
            </div>
            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              href="/driver-self-service?saved=1"
            >
              Sign out
            </a>
          </div>
        </header>

        <div className="flex-1 py-4">
          <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
            <aside className="hidden lg:sticky lg:top-28 lg:block">
              <Card className="border-slate-200 bg-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.25)]">
                <CardContent className="space-y-3 p-4">
                  <div className="space-y-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
                      Driver workspace
                    </Text>
                    <Text className="font-semibold text-[var(--mobiris-ink)]">{driverDisplayName}</Text>
                    <Text tone="muted">{organisationName}</Text>
                  </div>
                  <div className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        className={`relative flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                          activeTab === tab.key
                            ? 'bg-[var(--mobiris-primary)] text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.8)]'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        type="button"
                      >
                        <span>{tab.label}</span>
                        {tab.badge ? (
                          <span
                            className={`min-w-[22px] rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>

            <div className="space-y-4">
          <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_30px_80px_-38px_rgba(15,23,42,0.38)]">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={homeStatusTone}>
                  {onboardingIncomplete
                    ? 'Onboarding in progress'
                    : currentAssignment?.status === 'driver_action_required'
                      ? 'Assignment action needed'
                      : currentAssignment?.status === 'accepted'
                        ? 'Assignment accepted'
                        : currentAssignment?.status === 'active'
                          ? 'Operational'
                          : 'Ready and waiting'}
                </Badge>
                {!onboardingIncomplete ? (
                  <Badge tone="neutral">{onboardingStep.verificationTierLabel}</Badge>
                ) : null}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {onboardingIncomplete
                    ? 'Finish your onboarding'
                    : currentAssignment?.status === 'driver_action_required'
                      ? 'Review your vehicle assignment'
                      : currentAssignment?.status === 'accepted'
                        ? 'You are ready to begin'
                        : currentAssignment?.status === 'active'
                          ? 'Your workday is active'
                          : 'You are ready for assignment'}
                </p>
                <Text tone="muted">
                  {onboardingIncomplete
                    ? `Next step: ${formatStepLabel(currentStep)}. Complete the required checks for ${onboardingStep.verificationTierLabel}.`
                    : currentAssignment?.status === 'driver_action_required'
                      ? 'You have been assigned a vehicle. Review the details and accept or reject it.'
                      : currentAssignment?.status === 'accepted'
                        ? 'Your assignment has been accepted. Your organisation can begin operations when ready.'
                        : currentAssignment?.status === 'active'
                          ? 'Check your assignment, record remittance when needed, and keep up with alerts.'
                    : 'Your verification is complete. We will show your next assignment here as soon as it is ready.'}
                </Text>
              </div>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <Text tone="muted">Current assignment</Text>
                  <Text className="font-semibold text-[var(--mobiris-ink)]">
                    {currentAssignment ? formatVehicleLabel(currentAssignment.vehicle) : 'Waiting'}
                  </Text>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <Text tone="muted">Expected amount</Text>
                  <Text className="font-semibold text-[var(--mobiris-ink)]">
                    {currentAssignment?.remittanceAmountMinorUnits
                      ? formatMinorCurrency(
                          currentAssignment.remittanceAmountMinorUnits,
                          currentAssignment.remittanceCurrency,
                        )
                      : 'Not due'}
                  </Text>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-12 w-full text-base shadow-[0_18px_35px_-18px_rgba(37,99,235,0.75)] sm:flex-1"
                  onClick={() =>
                    setActiveTab(
                      onboardingIncomplete
                        ? 'home'
                        : currentAssignment
                          ? 'assignment'
                          : 'profile',
                    )
                  }
                  type="button"
                >
                  {onboardingIncomplete
                    ? `Continue ${formatStepLabel(currentStep)}`
                    : currentAssignment
                      ? 'Open assignment'
                      : 'View profile'}
                </Button>
                {activeAssignmentSupportsRemittance ? (
                  <Button
                    className="h-11 w-full sm:w-auto"
                    onClick={() => setActiveTab('remittance')}
                    type="button"
                    variant="secondary"
                  >
                    Open remittance
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {postSubmitRefreshError ? (
            <Card className="border-amber-200 bg-amber-50/70">
              <CardContent className="space-y-3 pt-5 pb-4">
                <Text className="font-semibold text-[var(--mobiris-ink)]">
                  Verification result saved
                </Text>
                <Text tone="muted">
                  We received your verification result, but we still need to refresh your next step.
                </Text>
                {lastVerificationResult?.verifiedProfile?.fullName ? (
                  <Text tone="muted">
                    Latest returned identity: {lastVerificationResult.verifiedProfile.fullName}
                  </Text>
                ) : null}
                <Text tone="muted">{postSubmitRefreshError}</Text>
                <Button
                  disabled={refreshingAfterVerification}
                  onClick={() => {
                    setRefreshingAfterVerification(true);
                    setPostSubmitRefreshError(null);
                    void refreshContext()
                      .then(() => {
                        setVerificationKey((current) => current + 1);
                      })
                      .catch((error: unknown) => {
                        setPostSubmitRefreshError(
                          error instanceof Error
                            ? error.message
                            : 'Unable to refresh onboarding status right now.',
                        );
                      })
                      .finally(() => setRefreshingAfterVerification(false));
                  }}
                  type="button"
                >
                  {refreshingAfterVerification ? 'Refreshing status…' : 'Refresh status'}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {activeTab === 'home' ? (
            <div className="space-y-4">
              {onboardingIncomplete ? (
                <>
                  <Card className="border-slate-200 bg-white shadow-[0_18px_48px_-26px_rgba(15,23,42,0.28)]">
                    <CardHeader className="space-y-2">
                      <CardTitle>Onboarding tasks</CardTitle>
                      <Text tone="muted">
                        {onboardingStep.verificationTierLabel} for {organisationName}
                      </Text>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
                        <Text className="font-semibold text-[var(--mobiris-ink)]">
                          You are being verified using {onboardingStep.verificationTierLabel}
                        </Text>
                        <Text tone="muted">{onboardingStep.verificationTierDescription}</Text>
                        <Text tone="muted">Included: {tierIncludes.join(', ')}.</Text>
                        <Text tone="muted">Required: {tierRequires.join(', ')}.</Text>
                      </div>
                      {!currentAssignment ? (
                        <StepProgress
                          currentStep={currentStep}
                          verificationTierComponents={onboardingStep.verificationTierComponents}
                        />
                      ) : null}
                    </CardContent>
                  </Card>
                  {onboardingPanel}
                </>
              ) : currentAssignment?.status === 'driver_action_required' ? (
                <div id="assignment-workspace">
                  <AssignmentWorkspace
                    assignment={currentAssignment}
                    onRefresh={refreshContext}
                    token={token}
                  />
                </div>
              ) : currentAssignment?.status === 'active' || currentAssignment?.status === 'accepted' ? (
                <div className="space-y-4">
                  <Card className="border-slate-200 bg-white shadow-[0_18px_48px_-26px_rgba(15,23,42,0.28)]">
                    <CardHeader className="space-y-2">
                      <CardTitle>Today&apos;s overview</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <Text tone="muted">Vehicle</Text>
                        <Text className="font-semibold text-[var(--mobiris-ink)]">
                          {formatVehicleLabel(currentAssignment.vehicle)}
                        </Text>
                        <Text tone="muted">
                          Plate {currentAssignment.vehicle.plate ?? 'Not recorded'}
                        </Text>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <Text tone="muted">Payment model</Text>
                        <Text className="font-semibold text-[var(--mobiris-ink)]">
                          {getDriverAssignmentPaymentModelLabel(currentAssignment)}
                        </Text>
                      </div>
                    </CardContent>
                  </Card>
                  {activeAssignmentSupportsRemittance ? (
                    <RemittanceWorkspace
                      assignment={currentAssignment}
                      onOpenAssignment={() => setActiveTab('assignment')}
                      onRefresh={refreshContext}
                      remittances={remittances}
                      token={token}
                    />
                  ) : null}
                </div>
              ) : (
                <CompletionStep driver={driver} onboardingStep={onboardingStep} />
              )}
            </div>
          ) : null}

          {activeTab === 'assignment' ? (
            currentAssignment ? (
              <div className="space-y-4" id="assignment-workspace">
                <AssignmentWorkspace
                  assignment={currentAssignment}
                  onRefresh={refreshContext}
                  token={token}
                />
                {currentAssignment.status === 'active' && assignmentSupportsRemittance(currentAssignment) ? (
                  <Button
                    className="h-12 w-full"
                    onClick={() => setActiveTab('remittance')}
                    type="button"
                  >
                    Record remittance
                  </Button>
                ) : null}
              </div>
            ) : (
              <Card className="border-slate-200 bg-white shadow-[0_18px_48px_-26px_rgba(15,23,42,0.28)]">
                <CardHeader className="space-y-2">
                  <CardTitle>Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Text className="font-semibold text-[var(--mobiris-ink)]">
                    No assignment yet
                  </Text>
                  <Text tone="muted">
                    Your assignment will appear here as soon as your organisation assigns a vehicle.
                  </Text>
                </CardContent>
              </Card>
            )
          ) : null}

          {activeTab === 'remittance' ? (
            <RemittanceWorkspace
              assignment={currentAssignment?.status === 'active' ? currentAssignment : currentAssignment}
              onOpenAssignment={() => setActiveTab('assignment')}
              onRefresh={refreshContext}
              remittances={remittances}
              token={token}
            />
          ) : null}

          {activeTab === 'notifications' ? (
            <Card className="border-slate-200 bg-white shadow-[0_18px_48px_-26px_rgba(15,23,42,0.28)]">
              <CardHeader className="space-y-2">
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <Text className="font-semibold text-[var(--mobiris-ink)]">No notifications yet</Text>
                    <Text tone="muted">
                      Assignment changes, verification updates, and remittance reminders will appear here.
                    </Text>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                      key={notification.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Text className="font-semibold text-[var(--mobiris-ink)]">
                              {notification.title}
                            </Text>
                            {!notification.readAt ? <Badge tone="success">New</Badge> : null}
                          </div>
                          <Text tone="muted">{notification.body}</Text>
                          <Text tone="muted">{formatNotificationDate(notification.createdAt)}</Text>
                        </div>
                        <Button
                          onClick={() => void handleNotificationOpen(notification)}
                          type="button"
                          variant="secondary"
                        >
                          {notificationAssignmentId(notification) ? 'Open' : 'Mark read'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : null}

          {activeTab === 'profile' ? (
            <div className="space-y-4">
              <Card className="border-slate-200 bg-white shadow-[0_18px_48px_-26px_rgba(15,23,42,0.28)]">
                <CardHeader className="space-y-2">
                  <CardTitle>Your profile</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                  <div className="space-y-1">
                    <Text tone="muted">Full name</Text>
                    <Text>{driverDisplayName}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Phone</Text>
                    <Text>{formatProfileValue(driver.phone)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Email</Text>
                    <Text>{formatProfileValue(driver.email)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Date of birth</Text>
                    <Text>{formatShortDate(driver.dateOfBirth)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Nationality</Text>
                    <Text>{formatProfileValue(driver.nationality)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">NIN</Text>
                    <Text>{maskNin(driver.identityProfile?.ninIdNumber)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Address</Text>
                    <Text>{formatProfileValue(driver.operationalProfile?.address)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">State</Text>
                    <Text>{formatProfileValue(driver.operationalProfile?.state)}</Text>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <Text className="font-semibold text-[var(--mobiris-ink)]">
                      Verified identity
                    </Text>
                    <Text tone="muted">
                      {onboardingStep.verificationTierLabel} · {driver.verificationStatus ?? driver.identityStatus}
                    </Text>
                    <Text tone="muted">
                      Included checks: {tierIncludes.join(', ')}.
                    </Text>
                  </div>
                </CardContent>
              </Card>

              {onboardingIncomplete && currentStep === 'profile' ? onboardingPanel : null}
            </div>
          ) : null}
            </div>
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-2">
            {tabs.map((tab) => (
              <button
                className={`relative flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-2 py-2 text-center text-xs font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-[var(--mobiris-primary)] text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.8)]'
                    : 'bg-slate-50 text-slate-600'
                }`}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="absolute right-2 top-2 min-w-[18px] rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </nav>
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
  const assignmentId = searchParams?.get('assignmentId') ?? null;

  if (!token) {
    return (
      <EntryPage
        assignmentId={assignmentId}
        onToken={setTokenOverride}
        showSavedNotice={saved}
      />
    );
  }

  return <DriverVerificationFlow initialAssignmentId={assignmentId} token={token} />;
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
