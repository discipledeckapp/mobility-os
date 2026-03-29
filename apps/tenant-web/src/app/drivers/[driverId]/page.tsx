import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@mobility-os/ui';
import Link from 'next/link';
import { Suspense } from 'react';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  type AssignmentRecord,
  type FleetRecord,
  type RemittanceRecord,
  type VehicleRecord,
  getDriver,
  getDriverGuarantor,
  getDriverMobileAccess,
  getTenantApiToken,
  getTenantMe,
  listAssignments,
  listDriverDocuments,
  listFleets,
  listRemittances,
  listVehicles,
} from '../../../lib/api-core';
import { getDriverIdentityLabel, getDriverIdentityTone } from '../../../lib/driver-identity';
import { getFormattingLocale } from '../../../lib/locale';
import { getVehiclePrimaryLabel } from '../../../lib/vehicle-display';
import { DriverAdminOverridePanel } from '../driver-admin-override-panel';
import { DriverDocumentsPanel } from '../driver-documents-panel';
import { DriverGuarantorPanel } from '../driver-guarantor-panel';
import { DriverIdentityVerification } from '../driver-identity-verification';
import { DriverMobileAccessPanel } from '../driver-mobile-access-panel';
import { DriverStatusActions } from '../driver-status-actions';
import { DriverDetailTabs } from './driver-detail-tabs';

function formatAmount(amountMinorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

function getDriverStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'warning';
  if (status === 'terminated') return 'danger';
  return 'neutral';
}

function getIdentityCardClass(tone: 'success' | 'warning' | 'danger' | 'neutral'): string {
  if (tone === 'success') return 'border-emerald-200 bg-emerald-50/55';
  if (tone === 'warning') return 'border-amber-200 bg-amber-50/55';
  if (tone === 'danger') return 'border-rose-200 bg-rose-50/60';
  return 'border-slate-200 bg-slate-50/65';
}

function getReadinessTone(status: string): 'success' | 'warning' | 'danger' {
  if (status === 'ready') return 'success';
  if (status === 'partially_ready') return 'warning';
  return 'danger';
}

function getReadinessLabel(status: string): string {
  if (status === 'ready') return 'Ready';
  if (status === 'partially_ready') return 'Partially ready';
  return 'Not ready';
}

function getVerificationFeeLabel(driver: {
  verificationPayer?: 'driver' | 'organisation';
  verificationPaymentMessage?: string | null;
}) {
  return driver.verificationPayer === 'driver'
    ? 'Driver pays verification fee'
    : 'Organisation covers verification fee';
}

function getVerificationStepSummary(driver: {
  identityStatus: string;
  hasApprovedLicence: boolean;
  hasGuarantor: boolean;
  status: string;
}) {
  return [
    {
      label: 'Verification',
      value:
        driver.identityStatus === 'verified'
          ? 'Complete'
          : driver.identityStatus === 'pending_verification'
            ? 'Pending'
            : driver.identityStatus === 'review_needed'
              ? 'In review'
              : 'Not started',
      tone: getDriverIdentityTone(driver.identityStatus),
    },
    {
      label: 'Guarantor',
      value: driver.hasGuarantor ? 'Linked' : 'Pending',
      tone: driver.hasGuarantor ? 'success' : 'warning',
    },
    {
      label: 'Activation',
      value: driver.status === 'active' ? 'Active' : 'Pending',
      tone: driver.status === 'active' ? 'success' : 'warning',
    },
  ] as const;
}

function getDriverDisplayName(input: {
  firstName?: string | null;
  lastName?: string | null;
  identityStatus?: string | null;
}): string {
  const fullName = `${input.firstName ?? ''} ${input.lastName ?? ''}`.trim();
  if (fullName) {
    return fullName;
  }
  return input.identityStatus === 'unverified' ? 'Onboarding in progress' : 'New Driver';
}

function getSafeIdentityValue(value: string | null | undefined): string {
  return value?.trim() ? value.trim() : 'Not returned';
}

function maskSensitiveValue(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length <= 4) {
    return trimmed || 'Not returned';
  }
  return `${'*'.repeat(Math.max(0, trimmed.length - 4))}${trimmed.slice(-4)}`;
}

function getDriverIdentityProfile(driver: {
  identityProfile?: Record<string, unknown> | null;
  selfieImageUrl?: string | null;
  providerImageUrl?: string | null;
  identitySignatureImageUrl?: string | null;
}) {
  const profile = driver.identityProfile ?? {};
  const read = (key: string): string | null => {
    const value = profile[key];
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  };

  return {
    fullName: (() => {
      const explicit = read('fullName');
      if (explicit) {
        return explicit;
      }
      const fallback = [read('firstName'), read('middleName'), read('lastName')]
        .filter(Boolean)
        .join(' ')
        .trim();
      return fallback.length > 0 ? fallback : null;
    })(),
    firstName: read('firstName'),
    middleName: read('middleName'),
    lastName: read('lastName'),
    ninIdNumber: read('ninIdNumber'),
    dateOfBirth: read('dateOfBirth'),
    gender: read('gender'),
    nationality: read('nationality'),
    selfieImageUrl: read('selfieImageUrl') ?? driver.selfieImageUrl ?? null,
    providerImageUrl: read('providerImageUrl') ?? driver.providerImageUrl ?? null,
    signatureImageUrl: read('signatureImageUrl') ?? driver.identitySignatureImageUrl ?? null,
  };
}

function getDriverOperationalProfile(driver: {
  operationalProfile?: Record<string, unknown> | null;
  phone?: string | null;
  email?: string | null;
}) {
  const profile = driver.operationalProfile ?? {};
  const read = (key: string): string | null => {
    const value = profile[key];
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  };

  return {
    phoneNumber: read('phoneNumber') ?? driver.phone ?? null,
    emailAddress: driver.email ?? null,
    address: read('address'),
    town: read('town'),
    localGovernmentArea: read('localGovernmentArea'),
    state: read('state'),
    nextOfKinName: read('nextOfKinName'),
    nextOfKinPhone: read('nextOfKinPhone'),
    nextOfKinRelationship: read('nextOfKinRelationship'),
    emergencyContactName: read('emergencyContactName'),
    emergencyContactPhone: read('emergencyContactPhone'),
    emergencyContactRelationship: read('emergencyContactRelationship'),
  };
}

export default async function DriverDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{
    tab?: string;
    walletWarning?: string;
    created?: string;
    invite?: string;
  }>;
}) {
  const { driverId } = await params;
  const { tab, walletWarning, created, invite } = await searchParams;
  const token = await getTenantApiToken().catch(() => undefined);

  const [
    driver,
    assignments,
    remittances,
    vehicles,
    fleets,
    tenant,
    documents,
    guarantor,
    mobileAccess,
  ] = await Promise.all([
    getDriver(driverId, token),
    listAssignments({ driverId, limit: 50 }, token)
      .then((result) => result.data)
      .catch(() => [] as AssignmentRecord[]),
    listRemittances({ driverId, limit: 100 }, token)
      .then((result) => result.data)
      .catch(() => [] as RemittanceRecord[]),
    listVehicles({ limit: 200 }, token)
      .then((result) => result.data)
      .catch(() => [] as VehicleRecord[]),
    listFleets(token).catch(() => [] as FleetRecord[]),
    getTenantMe(token).catch(() => null),
    listDriverDocuments(driverId, token).catch(() => []),
    getDriverGuarantor(driverId, token).catch(() => null),
    getDriverMobileAccess(driverId, token).catch(() => ({ linkedUser: null, suggestedUsers: [] })),
  ]);
  const locale = getFormattingLocale(tenant?.country);

  const fleetName = fleets.find((fleet) => fleet.id === driver.fleetId)?.name ?? driver.fleetId;
  const driverAssignments = assignments.filter((a) => a.driverId === driver.id);
  const driverRemittances = remittances.filter((r) => r.driverId === driver.id);
  const activeAssignments = driverAssignments.filter((a) => a.status === 'active');
  const outstandingRemittances = driverRemittances.filter(
    (r) => r.status === 'due' || r.status === 'overdue',
  );
  const totalCollectedMinorUnits = driverRemittances
    .filter((r) => r.status === 'completed' || r.status === 'partially_settled')
    .reduce((sum, r) => sum + r.amountMinorUnits, 0);
  const latestAssignment = [...driverAssignments].sort((a, b) =>
    (b.startedAt ?? b.createdAt).localeCompare(a.startedAt ?? a.createdAt),
  )[0];
  const vehicleLabels = new Map(vehicles.map((v) => [v.id, getVehiclePrimaryLabel(v)]));
  const identityTone = getDriverIdentityTone(driver.identityStatus);
  const identityLabel = getDriverIdentityLabel(driver.identityStatus);
  const driverDisplayName = getDriverDisplayName(driver);
  const identityProfile = getDriverIdentityProfile(driver);
  const operationalProfile = getDriverOperationalProfile(driver);
  const driverLicenceVerification = driver.driverLicenceVerification ?? null;
  const isUnverifiedDriver = driver.identityStatus !== 'verified';
  const verificationSteps = getVerificationStepSummary(driver);
  return (
    <TenantAppShell
      description="Driver readiness, verification, payment posture, risk, documents, and assignment context."
      eyebrow="Operators"
      title="Driver readiness"
    >
      {/* Driver created success banner */}
      {created === '1' ? (
        <Card className="border-emerald-300 bg-emerald-50/80">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <svg
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-emerald-600"
                fill="none"
                height="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="18"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div className="space-y-1">
                {(() => {
                  const driverPays = tenant?.driverPaysKyc ?? true;
                  const requiresVerification =
                    tenant?.requireIdentityVerificationForActivation ?? true;
                  const inviteStatus =
                    invite === 'sent' || invite === 'failed' || invite === 'skipped'
                      ? invite
                      : null;
                  const linkSent = inviteStatus === 'sent';
                  const heading = linkSent ? 'Driver created — invitation sent' : 'Driver created';
                  const linkCopy = linkSent
                    ? "A self-service verification link was sent to the driver's email address."
                    : inviteStatus === 'failed'
                      ? 'The driver was created, but Mobiris could not send the self-service verification link automatically.'
                      : 'No self-service verification link was sent automatically for this driver.';
                  const paymentCopy = !requiresVerification
                    ? 'Identity verification is not required for activation under the current policy.'
                    : driverPays
                      ? 'The driver pays the verification fee during self-service onboarding.'
                      : 'Your organisation wallet covers the verification fee for this driver.';
                  return (
                    <>
                      <p className="text-sm font-semibold text-emerald-900">{heading}</p>
                      <p className="text-sm text-emerald-800">
                        {linkCopy} <strong>{paymentCopy}</strong>{' '}
                        <a
                          className="font-semibold underline hover:no-underline"
                          href="/settings?section=drivers"
                        >
                          Adjust in Settings → Drivers
                        </a>
                        {requiresVerification && !linkSent
                          ? ' or request the driver to self-verify below.'
                          : '.'}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Wallet warning banner */}
      {walletWarning === '1' ? (
        <Card className="border-amber-300 bg-amber-50/80">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <svg
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-amber-600"
                fill="none"
                height="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="18"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">
                  Verification wallet balance is low
                </p>
                <p className="text-sm text-amber-800">
                  Your organisation wallet may not have enough funds to cover identity verification
                  for this driver.{' '}
                  <a className="font-semibold underline hover:no-underline" href="/billing">
                    Fund the wallet
                  </a>{' '}
                  before starting verification, or switch to driver-pays mode in{' '}
                  <a className="font-semibold underline hover:no-underline" href="/settings">
                    Settings
                  </a>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Always-visible hero card */}
      <Card className="border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <CardContent className="pt-6">
          <div className="grid gap-5 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--mobiris-primary)]/10 ring-2 ring-white shadow-sm">
                {(driver.providerImageUrl ?? driver.selfieImageUrl ?? driver.photoUrl) ? (
                  <img
                    alt={driverDisplayName}
                    className="h-14 w-14 rounded-full object-cover"
                    src={driver.providerImageUrl ?? driver.selfieImageUrl ?? driver.photoUrl ?? ''}
                  />
                ) : (
                  <span className="text-lg font-bold tracking-tight text-[var(--mobiris-primary)]">
                    {(driver.firstName ?? 'D')[0]}
                    {(driver.lastName ?? 'R')[0]}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Heading size="h2">{driverDisplayName}</Heading>
                    <Badge tone={getDriverStatusTone(driver.status)}>{driver.status}</Badge>
                    <Badge tone={identityTone}>{identityLabel}</Badge>
                    {isUnverifiedDriver ? (
                      <Badge tone="warning">
                        {driver.status === 'active' && (driver.adminAssignmentOverride ?? false)
                          ? 'Active (Unverified)'
                          : 'Unverified Driver'}
                      </Badge>
                    ) : null}
                    {driver.guarantorIsAlsoDriver ? (
                      <Badge tone="danger">Cross-role conflict</Badge>
                    ) : null}
                  </div>
                  <Text tone="muted">
                    {driver.email ?? 'Email pending'} · {driver.phone ?? 'Phone pending'} ·{' '}
                    {fleetName}
                  </Text>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {verificationSteps.map((step) => (
                    <div
                      key={step.label}
                      className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-white/90 p-3"
                    >
                      <Text tone="muted">{step.label}</Text>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge tone={step.tone}>{step.value}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-white/90 p-3">
                    <Text tone="muted">Risk posture</Text>
                    <div className="mt-2">
                      {driver.riskBand ? (
                        <Badge
                          tone={
                            driver.riskBand === 'critical'
                              ? 'danger'
                              : driver.riskBand === 'high' ||
                                  driver.riskBand === 'medium' ||
                                  driver.isWatchlisted
                                ? 'warning'
                                : 'success'
                          }
                        >
                          {driver.isWatchlisted
                            ? `${driver.riskBand} · watchlist`
                            : driver.riskBand}
                        </Badge>
                      ) : (
                        <Badge tone="neutral">
                          {driver.identityStatus === 'verified' ? 'No signal' : 'Insufficient data'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-white/90 p-3">
                    <Text tone="muted">Verification fee</Text>
                    <div className="mt-2 space-y-1">
                      <Badge tone={driver.verificationPayer === 'driver' ? 'warning' : 'neutral'}>
                        {getVerificationFeeLabel(driver)}
                      </Badge>
                      {driver.verificationPaymentMessage ? (
                        <Text tone="muted">{driver.verificationPaymentMessage}</Text>
                      ) : null}
                    </div>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-white/90 p-3">
                    <Text tone="muted">Current next step</Text>
                    <Text className="mt-2">
                      {driver.activationReadiness === 'ready'
                        ? 'Activate driver and continue with assignment acceptance.'
                        : (driver.activationReadinessReasons[0] ?? 'Continue onboarding.')}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Card className="border-slate-200 bg-white/90 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle>Action rail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DriverStatusActions driver={driver} />
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800"
                      href={`/drivers/${driverId}?tab=verification`}
                    >
                      Open verification
                    </Link>
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      href={`/drivers/${driverId}?tab=documents`}
                    >
                      Review documents
                    </Link>
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      href={`/drivers/${driverId}?tab=overview`}
                    >
                      Open readiness
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {driver.activationReadinessReasons.length > 0 ? (
                <Card className="border-amber-200 bg-amber-50/70 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle>Activation blockers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {driver.activationReadinessReasons.slice(0, 3).map((reason) => (
                      <Text key={reason}>{reason}</Text>
                    ))}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {isUnverifiedDriver ? (
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="pt-5 pb-4">
            <Text className="font-semibold text-[var(--mobiris-ink)]">Unverified Driver</Text>
            <Text tone="muted">
              This driver has not completed identity verification. Risk is higher. Complete
              verification to reduce risk.
            </Text>
            <Text tone="muted">
              Assignment acceptance is still required before remittance can start, even if an admin
              override is used.
            </Text>
          </CardContent>
        </Card>
      ) : null}

      {/* Tab layout */}
      <Suspense>
        <DriverDetailTabs
          defaultTab={tab === 'verification' ? 'verification' : 'overview'}
          overview={
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Text tone="muted">Full name</Text>
                      <Text>{driverDisplayName}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Phone</Text>
                      <Text>{driver.phone}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Email</Text>
                      <Text>{driver.email ?? 'Not recorded'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Date of birth</Text>
                      <Text>{formatDate(driver.dateOfBirth, locale)}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Nationality</Text>
                      <Text>{driver.nationality ?? 'Not recorded'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Fleet</Text>
                      <Text>{fleetName}</Text>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle>Identity summary</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Text tone="muted">Identity status</Text>
                      <Badge tone={identityTone}>{identityLabel}</Badge>
                      <div>
                        <Link
                          className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/drivers/${driverId}?tab=verification`}
                        >
                          {driver.identityStatus === 'verified'
                            ? 'View verification details →'
                            : driver.identityStatus === 'pending_verification'
                              ? 'Refresh verification status →'
                              : driver.identityStatus === 'review_needed'
                                ? 'Review case open — see verification →'
                                : driver.identityStatus === 'failed'
                                  ? 'Retry verification →'
                                  : 'Start verification →'}
                        </Link>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Resolved</Text>
                      <Text>
                        {driver.hasResolvedIdentity ? 'Linked to person record' : 'Not linked yet'}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Identity record</Text>
                      <Text>
                        {driver.hasResolvedIdentity
                          ? 'Verified identity exists'
                          : 'Verification not started'}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Risk score</Text>
                      <Text>{driver.globalRiskScore ?? 'Not available'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Watchlist</Text>
                      <Text>
                        {driver.isWatchlisted ? 'Watchlist review active' : 'No watchlist signal'}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Duplicate identity</Text>
                      <Text>
                        {driver.duplicateIdentityFlag
                          ? 'Under duplicate-identity review'
                          : 'No duplicate signal'}
                      </Text>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DriverMobileAccessPanel driverId={driver.id} mobileAccess={mobileAccess} />

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle>Operational readiness</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <Text tone="muted">Activation readiness</Text>
                    <Badge tone={getReadinessTone(driver.activationReadiness)}>
                      {getReadinessLabel(driver.activationReadiness)}
                    </Badge>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <Text tone="muted">Assignment readiness</Text>
                    <Badge tone={getReadinessTone(driver.assignmentReadiness)}>
                      {getReadinessLabel(driver.assignmentReadiness)}
                    </Badge>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <Text tone="muted">Driver licence</Text>
                    <Badge tone={driver.hasApprovedLicence ? 'success' : 'warning'}>
                      {driver.hasApprovedLicence ? 'Approved' : 'Pending review'}
                    </Badge>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <Text tone="muted">Pending documents</Text>
                    <p className="text-xl font-semibold tracking-tight text-[var(--mobiris-ink)]">
                      {driver.pendingDocumentCount}
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <Text tone="muted">Rejected documents</Text>
                    <p className="text-xl font-semibold tracking-tight text-[var(--mobiris-ink)]">
                      {driver.rejectedDocumentCount}
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <Text tone="muted">Active assignments</Text>
                    <p className="text-xl font-semibold tracking-tight text-[var(--mobiris-ink)]">
                      {activeAssignments.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              {driver.activationReadinessReasons.length > 0 ? (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardHeader>
                    <CardTitle>Readiness blockers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {driver.activationReadinessReasons.map((reason) => (
                      <Text key={reason}>{reason}</Text>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              {driver.enforcementActions?.length ? (
                <Card className="border-rose-200 bg-rose-50/40">
                  <CardHeader>
                    <CardTitle>Active policy actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Text tone="muted">Enforcement status</Text>
                      <Badge
                        tone={driver.enforcementStatus === 'restricted' ? 'danger' : 'warning'}
                      >
                        {driver.enforcementStatus ?? 'flagged'}
                      </Badge>
                    </div>
                    {driver.enforcementActions.map((action) => (
                      <div
                        key={action.id}
                        className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-rose-100 bg-white/70 p-3"
                      >
                        <Text tone="strong">{action.actionType.replace(/_/g, ' ')}</Text>
                        <Text>{action.reason}</Text>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              <DriverAdminOverridePanel
                adminAssignmentOverride={driver.adminAssignmentOverride ?? false}
                allowAdminAssignmentOverride={tenant?.allowAdminAssignmentOverride ?? true}
                driverId={driverId}
                hasFraudFlag={
                  Boolean(driver.isWatchlisted) ||
                  Boolean(driver.duplicateIdentityFlag) ||
                  driver.riskBand === 'high' ||
                  driver.riskBand === 'critical'
                }
              />
            </>
          }
          verification={
            <>
              <Card className={getIdentityCardClass(identityTone)} id="verification">
                <CardHeader>
                  <CardTitle>Verification status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <Text tone="muted">Current state</Text>
                      <Badge tone={identityTone}>{identityLabel}</Badge>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Last decision</Text>
                      <Text>{driver.identityLastDecision ?? 'No decision recorded yet'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Confidence</Text>
                      <Text>{driver.identityVerificationConfidence ?? 'Not provided'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Last verified</Text>
                      <Text>{formatDate(driver.identityLastVerifiedAt, locale)}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Liveness passed</Text>
                      <Text>
                        {driver.identityLivenessPassed === true
                          ? 'Yes'
                          : driver.identityLivenessPassed === false
                            ? 'No'
                            : 'No liveness result recorded yet'}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Liveness confidence</Text>
                      <Text>{driver.identityLivenessConfidence ?? 'Not returned yet'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Liveness provider</Text>
                      <Text>{driver.identityLivenessProvider ?? 'Not returned yet'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Liveness note</Text>
                      <Text>{driver.identityLivenessReason ?? 'No provider note recorded.'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Match result</Text>
                      <Text>
                        {driver.identityStatus === 'verified'
                          ? 'Face and identity record matched successfully.'
                          : driver.identityStatus === 'failed'
                            ? 'The live selfie and submitted identity record did not verify successfully.'
                            : driver.identityStatus === 'review_needed'
                              ? 'Verification requires a manual decision.'
                              : 'Verification result is still being processed.'}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Match score</Text>
                      <Text>
                        {driver.identityVerificationMetadata &&
                        typeof driver.identityVerificationMetadata.matchScore === 'number'
                          ? `${driver.identityVerificationMetadata.matchScore}%`
                          : 'Not returned'}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Risk score</Text>
                      <Text>
                        {driver.identityVerificationMetadata &&
                        typeof driver.identityVerificationMetadata.riskScore === 'number'
                          ? `${driver.identityVerificationMetadata.riskScore}%`
                          : 'Not returned'}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Document validity</Text>
                      <Text>
                        {typeof driver.identityVerificationMetadata?.validity === 'string'
                          ? driver.identityVerificationMetadata.validity
                          : 'Not returned'}
                      </Text>
                    </div>
                  </div>
                  <DriverIdentityVerification
                    defaultCountryCode={tenant?.country ?? null}
                    driver={driver}
                    orgDriverPaysKyc={tenant?.driverPaysKyc ?? true}
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>Verified identity</CardTitle>
                    <Badge tone="success">Provider verified</Badge>
                    <Badge tone="neutral">Read only</Badge>
                  </div>
                  <Text tone="muted">
                    Source-of-truth fields returned from NIN and provider verification. These are
                    not editable inline.
                  </Text>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <Text tone="muted">Full name</Text>
                    <Text>
                      {getSafeIdentityValue(identityProfile.fullName ?? driverDisplayName)}
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">NIN ID number</Text>
                    <Text>{maskSensitiveValue(identityProfile.ninIdNumber)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Date of birth</Text>
                    <Text>
                      {getSafeIdentityValue(identityProfile.dateOfBirth ?? driver.dateOfBirth)}
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Gender</Text>
                    <Text>{getSafeIdentityValue(identityProfile.gender ?? driver.gender)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Nationality</Text>
                    <Text>
                      {getSafeIdentityValue(identityProfile.nationality ?? driver.nationality)}
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Verification outcome</Text>
                    <Text>{driver.identityLastDecision ?? 'Not returned'}</Text>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle>Identity images</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-3">
                    <Text tone="muted">Live Selfie</Text>
                    <div className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50">
                      {(identityProfile.selfieImageUrl ?? driver.photoUrl) ? (
                        <img
                          alt={`${driver.firstName} ${driver.lastName} live selfie`}
                          className="aspect-[4/3] w-full object-cover"
                          src={identityProfile.selfieImageUrl ?? driver.photoUrl ?? ''}
                        />
                      ) : (
                        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <svg
                              aria-hidden="true"
                              fill="none"
                              height="28"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                              viewBox="0 0 24 24"
                              width="28"
                            >
                              <path d="M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              <path d="M4 18a8 8 0 0 1 16 0" />
                            </svg>
                          </div>
                          <Text tone="muted">No live selfie captured yet.</Text>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Text tone="muted">Government record image</Text>
                    <div className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50">
                      {identityProfile.providerImageUrl ? (
                        <img
                          alt={`${driver.firstName} ${driver.lastName} government record`}
                          className="aspect-[4/3] w-full object-cover"
                          src={identityProfile.providerImageUrl}
                        />
                      ) : (
                        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <svg
                              aria-hidden="true"
                              fill="none"
                              height="28"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                              viewBox="0 0 24 24"
                              width="28"
                            >
                              <rect height="14" rx="2" width="18" x="3" y="5" />
                              <path d="M7 9h10M7 13h6" />
                            </svg>
                          </div>
                          <Text tone="muted">No reference identity image is stored yet.</Text>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Text tone="muted">Signature image</Text>
                    <div className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50">
                      {identityProfile.signatureImageUrl ? (
                        <img
                          alt={`${driver.firstName} ${driver.lastName} signature`}
                          className="aspect-[4/3] w-full object-contain bg-white"
                          src={identityProfile.signatureImageUrl}
                        />
                      ) : (
                        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6 text-center">
                          <Text tone="muted">Not returned.</Text>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle>Driver&apos;s licence verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {driverLicenceVerification ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          tone={
                            driverLicenceVerification.status === 'verified'
                              ? 'success'
                              : driverLicenceVerification.status === 'failed'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          {driverLicenceVerification.status.replace(/_/g, ' ')}
                        </Badge>
                        <Badge
                          tone={
                            driverLicenceVerification.validity === 'valid'
                              ? 'success'
                              : driverLicenceVerification.validity === 'invalid'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          Validity: {driverLicenceVerification.validity ?? 'unknown'}
                        </Badge>
                        <Badge
                          tone={
                            driverLicenceVerification.linkageStatus === 'matched'
                              ? 'success'
                              : driverLicenceVerification.linkageStatus === 'mismatch'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          Linkage: {driverLicenceVerification.linkageStatus.replace(/_/g, ' ')}
                        </Badge>
                        <Badge
                          tone={
                            driverLicenceVerification.linkageDecision === 'auto_pass'
                              ? 'success'
                              : driverLicenceVerification.linkageDecision === 'fail'
                                ? 'danger'
                                : 'warning'
                          }
                        >
                          Decision: {driverLicenceVerification.linkageDecision.replace(/_/g, ' ')}
                        </Badge>
                        <Badge
                          tone={
                            driverLicenceVerification.riskImpact === 'low'
                              ? 'success'
                              : driverLicenceVerification.riskImpact === 'medium'
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          Risk impact: {driverLicenceVerification.riskImpact}
                        </Badge>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                          <Text tone="muted">Licence number</Text>
                          <Text>{driverLicenceVerification.maskedLicenceNumber}</Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Issue date</Text>
                          <Text>{getSafeIdentityValue(driverLicenceVerification.issueDate)}</Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Expiry date</Text>
                          <Text>{getSafeIdentityValue(driverLicenceVerification.expiryDate)}</Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">State of issuance</Text>
                          <Text>
                            {getSafeIdentityValue(driverLicenceVerification.stateOfIssuance)}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Licence class / type</Text>
                          <Text>
                            {getSafeIdentityValue(driverLicenceVerification.licenceClass)}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Verified at</Text>
                          <Text>{getSafeIdentityValue(driverLicenceVerification.verifiedAt)}</Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Holder name</Text>
                          <Text>
                            {getSafeIdentityValue(driverLicenceVerification.holderFullName)}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Holder first name</Text>
                          <Text>
                            {getSafeIdentityValue(driverLicenceVerification.holderFirstName)}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Holder middle name</Text>
                          <Text>
                            {getSafeIdentityValue(driverLicenceVerification.holderMiddleName)}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Holder last name</Text>
                          <Text>
                            {getSafeIdentityValue(driverLicenceVerification.holderLastName)}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Holder date of birth</Text>
                          <Text>
                            {getSafeIdentityValue(driverLicenceVerification.holderDateOfBirth)}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Holder gender</Text>
                          <Text>
                            {getSafeIdentityValue(driverLicenceVerification.holderGender)}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Demographic match</Text>
                          <Text>
                            {driverLicenceVerification.demographicMatchScore !== null
                              ? `${driverLicenceVerification.demographicMatchScore}%`
                              : 'Not returned'}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Biometric match</Text>
                          <Text>
                            {driverLicenceVerification.biometricMatchScore !== null
                              ? `${driverLicenceVerification.biometricMatchScore}%`
                              : 'Not returned'}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Overall linkage confidence</Text>
                          <Text>
                            {driverLicenceVerification.overallLinkageScore !== null
                              ? `${driverLicenceVerification.overallLinkageScore}%`
                              : 'Not returned'}
                          </Text>
                        </div>
                        <div className="space-y-1">
                          <Text tone="muted">Review case</Text>
                          <Text>
                            {getSafeIdentityValue(driverLicenceVerification.reviewCaseId)}
                          </Text>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-3">
                          <Text tone="muted">Live selfie</Text>
                          <div className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50">
                            {identityProfile.selfieImageUrl ? (
                              <img
                                alt={`${driverDisplayName} live selfie`}
                                className="aspect-[4/3] w-full object-cover"
                                src={identityProfile.selfieImageUrl}
                              />
                            ) : (
                              <div className="flex aspect-[4/3] items-center justify-center p-6 text-center">
                                <Text tone="muted">Not returned.</Text>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Text tone="muted">NIN portrait</Text>
                          <div className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50">
                            {identityProfile.providerImageUrl ? (
                              <img
                                alt={`${driverDisplayName} NIN portrait`}
                                className="aspect-[4/3] w-full object-cover"
                                src={identityProfile.providerImageUrl}
                              />
                            ) : (
                              <div className="flex aspect-[4/3] items-center justify-center p-6 text-center">
                                <Text tone="muted">Not returned.</Text>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Text tone="muted">Licence portrait</Text>
                          <div className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50">
                            {driverLicenceVerification.portraitUrl ? (
                              <img
                                alt={`${driverDisplayName} driver's licence portrait`}
                                className="aspect-[4/3] w-full object-cover"
                                src={driverLicenceVerification.portraitUrl}
                              />
                            ) : (
                              <div className="flex aspect-[4/3] items-center justify-center p-6 text-center">
                                <Text tone="muted">Not returned.</Text>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <Text tone="muted">Operational risk summary</Text>
                          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/70 p-4">
                            <Text>{driverLicenceVerification.riskSummary}</Text>
                            {driverLicenceVerification.failureReason ? (
                              <Text tone="danger" className="mt-3">
                                {driverLicenceVerification.failureReason}
                              </Text>
                            ) : null}
                            {driverLicenceVerification.expiresSoon &&
                            !driverLicenceVerification.isExpired ? (
                              <Text tone="accent" className="mt-3">
                                This licence is close to expiry and should be renewed soon.
                              </Text>
                            ) : null}
                            {driverLicenceVerification.isExpired ? (
                              <Text tone="danger" className="mt-3">
                                This licence is expired and should block driver readiness until
                                renewed.
                              </Text>
                            ) : null}
                            {driverLicenceVerification.linkageReasons.length > 0 ? (
                              <div className="mt-3 space-y-1">
                                <Text tone="muted">Linkage notes</Text>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                                  {driverLicenceVerification.linkageReasons.map((reason) => (
                                    <li key={reason}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            {driverLicenceVerification.reviewNotes ? (
                              <Text tone="muted" className="mt-3">
                                Review note: {driverLicenceVerification.reviewNotes}
                              </Text>
                            ) : null}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Text tone="muted">Identity comparison</Text>
                          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/70 p-4">
                            <Text>
                              {driverLicenceVerification.identityComparison.matchedFieldCount}/
                              {driverLicenceVerification.identityComparison.comparedFieldCount}{' '}
                              foundational fields matched the verified identity record.
                            </Text>
                            <Text className="mt-2">
                              Biometric comparison:{' '}
                              {driverLicenceVerification.identityComparison.biometricMatch === null
                                ? 'not returned'
                                : driverLicenceVerification.identityComparison.biometricMatch
                                  ? 'matched'
                                  : 'mismatch'}
                              {driverLicenceVerification.identityComparison.biometricConfidence !==
                              null
                                ? ` (${driverLicenceVerification.identityComparison.biometricConfidence}%)`
                                : ''}
                            </Text>
                            {driverLicenceVerification.discrepancyFlags.length > 0 ? (
                              <div className="mt-3 space-y-1">
                                <Text tone="muted">Discrepancy flags</Text>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                                  {driverLicenceVerification.discrepancyFlags.map((flag) => (
                                    <li key={flag}>{flag.replace(/_/g, ' ')}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <Text tone="muted" className="mt-3">
                                No discrepancy flags were raised against the verified identity.
                              </Text>
                            )}
                            <div className="mt-4">
                              <Link
                                className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                                href={`/drivers/${driver.id}/review`}
                              >
                                Open evidence view
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Text tone="muted">
                      Driver&apos;s licence verification has not been requested for this driver yet.
                    </Text>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>Contact &amp; operational details</CardTitle>
                    <Badge tone="warning">Driver supplied</Badge>
                    <Badge tone="neutral">Editable profile data</Badge>
                  </div>
                  <Text tone="muted">
                    Operational fields collected after verification so dispatch, support, and
                    compliance teams can work from driver-supplied data without changing verified
                    identity records.
                  </Text>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <Text tone="muted">Mobile number</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.phoneNumber)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Email</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.emailAddress)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Address</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.address)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Town</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.town)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">LGA</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.localGovernmentArea)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">State</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.state)}</Text>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>Emergency &amp; next of kin</CardTitle>
                    <Badge tone="warning">Driver supplied</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <Text tone="muted">Next of kin</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.nextOfKinName)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Next of kin phone</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.nextOfKinPhone)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Next of kin relationship</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.nextOfKinRelationship)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Emergency contact</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.emergencyContactName)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Emergency phone</Text>
                    <Text>{getSafeIdentityValue(operationalProfile.emergencyContactPhone)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Emergency relationship</Text>
                    <Text>
                      {getSafeIdentityValue(operationalProfile.emergencyContactRelationship)}
                    </Text>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-sky-200 bg-sky-50/60">
                <CardHeader>
                  <CardTitle>Derived identity signals</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <Text tone="muted">Face verification status</Text>
                    <Text>{driver.verificationStatus ?? 'Not returned yet'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Verification provider</Text>
                    <Text>{driver.verificationProvider ?? 'Not returned yet'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Verification country</Text>
                    <Text>{driver.verificationCountryCode ?? 'Not returned yet'}</Text>
                  </div>
                </CardContent>
              </Card>

              {driver.identityReviewCaseId ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Review case</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Text>
                      Review case {driver.identityReviewCaseId} is currently{' '}
                      {driver.identityReviewStatus ?? 'open'}.
                    </Text>
                    <Text tone="muted">
                      This driver remains blocked until the review team resolves the case and a new
                      identity decision is returned.
                    </Text>
                    <Link
                      className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                      href={`/drivers/${driver.id}/review`}
                    >
                      Open review guidance →
                    </Link>
                  </CardContent>
                </Card>
              ) : null}
            </>
          }
          guarantor={
            <>
              {driver.guarantorIsAlsoDriver ? (
                <Card className="border-rose-300 bg-rose-50/70">
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>Cross-role conflict detected</CardTitle>
                      <Badge tone="danger">Action required</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Text>
                      The guarantor linked to this driver is also registered as a driver at this
                      tenant. A cross-role conflict risk signal has been raised on their canonical
                      person record. Review both records before activating this driver.
                    </Text>
                  </CardContent>
                </Card>
              ) : null}

              <DriverGuarantorPanel
                defaultCountryCode={tenant?.country ?? driver.nationality ?? null}
                driverId={driver.id}
                guarantor={guarantor}
              />

              {driver.hasGuarantor ? (
                <Card className="border-slate-200 bg-white">
                  <CardHeader>
                    <CardTitle>Guarantor risk signals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {driver.guarantorPersonId ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-1">
                            <Text tone="muted">Guarantor risk band</Text>
                            {driver.guarantorRiskBand ? (
                              <Badge
                                tone={
                                  driver.guarantorRiskBand === 'critical'
                                    ? 'danger'
                                    : driver.guarantorRiskBand === 'high' ||
                                        driver.guarantorRiskBand === 'medium' ||
                                        driver.guarantorIsWatchlisted
                                      ? 'warning'
                                      : 'success'
                                }
                              >
                                {driver.guarantorIsWatchlisted
                                  ? `${driver.guarantorRiskBand} · watchlist match`
                                  : driver.guarantorRiskBand}
                              </Badge>
                            ) : (
                              <Text tone="muted">No risk signal returned yet.</Text>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Text tone="muted">Watchlist</Text>
                            <Text>
                              {driver.guarantorIsWatchlisted
                                ? 'Potential watchlist match flagged.'
                                : 'No watchlist signal returned.'}
                            </Text>
                          </div>
                          {driver.guarantorIsAlsoDriver ? (
                            <div className="space-y-1">
                              <Text tone="muted">Cross-role status</Text>
                              <Badge tone="danger">Also registered as a driver</Badge>
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <Text tone="muted">
                        Guarantor identity has not been resolved yet. Risk signals will appear here
                        once identity resolution is complete.
                      </Text>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              <Card className="border-rose-200 bg-rose-50/60">
                <CardHeader>
                  <CardTitle>Driver risk signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Text tone="muted">Risk band</Text>
                      {driver.riskBand ? (
                        <Badge
                          tone={
                            driver.riskBand === 'critical'
                              ? 'danger'
                              : driver.riskBand === 'high' ||
                                  driver.riskBand === 'medium' ||
                                  driver.isWatchlisted
                                ? 'warning'
                                : 'success'
                          }
                        >
                          {driver.isWatchlisted
                            ? `${driver.riskBand} · watchlist match`
                            : driver.riskBand}
                        </Badge>
                      ) : (
                        <Text tone="muted">No risk signal returned yet.</Text>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Watchlist</Text>
                      <Text>
                        {driver.isWatchlisted
                          ? 'Potential watchlist match flagged for this driver.'
                          : 'No watchlist signal returned.'}
                      </Text>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          }
          documents={
            <>
              <DriverDocumentsPanel
                countryCode={driver.nationality}
                documents={documents}
                driverId={driver.id}
              />
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle>Document summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-1">
                      <Text tone="muted">Total</Text>
                      <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">
                        {documents.length}
                      </p>
                    </div>
                    <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-amber-100 bg-amber-50/60 p-4 space-y-1">
                      <Text tone="muted">Pending review</Text>
                      <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">
                        {driver.pendingDocumentCount}
                      </p>
                    </div>
                    <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-rose-100 bg-rose-50/60 p-4 space-y-1">
                      <Text tone="muted">Rejected</Text>
                      <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">
                        {driver.rejectedDocumentCount}
                      </p>
                    </div>
                    <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-orange-100 bg-orange-50/60 p-4 space-y-1">
                      <Text tone="muted">Expired</Text>
                      <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">
                        {driver.expiredDocumentCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          }
          activity={
            <>
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle>Assignment history</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-1">
                      <Text tone="muted">Total assignments</Text>
                      <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">
                        {driverAssignments.length}
                      </p>
                    </div>
                    <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-100 bg-emerald-50/60 p-4 space-y-1">
                      <Text tone="muted">Active assignments</Text>
                      <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">
                        {activeAssignments.length}
                      </p>
                    </div>
                    <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-1">
                      <Text tone="muted">Latest assignment</Text>
                      <p className="text-sm font-medium text-[var(--mobiris-ink)]">
                        {latestAssignment?.id ?? 'None yet'}
                      </p>
                    </div>
                  </div>
                  {driverAssignments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Started</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {driverAssignments.slice(0, 8).map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell>
                              <Link
                                className="font-medium text-[var(--mobiris-primary-dark)] hover:underline"
                                href={`/assignments/${assignment.id}`}
                              >
                                {assignment.id}
                              </Link>
                            </TableCell>
                            <TableCell>
                              {vehicleLabels.get(assignment.vehicleId) ?? assignment.vehicleId}
                            </TableCell>
                            <TableCell>{assignment.status}</TableCell>
                            <TableCell>{formatDate(assignment.startedAt, locale)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Text tone="muted">No assignments have been linked to this driver yet.</Text>
                  )}
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-emerald-50/60">
                <CardHeader>
                  <CardTitle>Remittance summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <Text tone="muted">Total records</Text>
                      <Heading size="h3">{driverRemittances.length}</Heading>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Outstanding</Text>
                      <Heading size="h3">{outstandingRemittances.length}</Heading>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Confirmed collections</Text>
                      <Text>
                        {driverRemittances[0]
                          ? formatAmount(
                              totalCollectedMinorUnits,
                              driverRemittances[0].currency,
                              locale,
                            )
                          : 'No confirmed collections yet'}
                      </Text>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          }
        />
      </Suspense>
    </TenantAppShell>
  );
}
