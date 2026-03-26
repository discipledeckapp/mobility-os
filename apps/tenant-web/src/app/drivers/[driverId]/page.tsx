import Link from 'next/link';
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
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  getDriver,
  getDriverGuarantor,
  getDriverMobileAccess,
  listDriverDocuments,
  getTenantMe,
  listAssignments,
  listFleets,
  listRemittances,
  listVehicles,
  type AssignmentRecord,
  type FleetRecord,
  type RemittanceRecord,
  type VehicleRecord,
} from '../../../lib/api-core';
import {
  getDriverIdentityLabel,
  getDriverIdentityTone,
} from '../../../lib/driver-identity';
import { getFormattingLocale } from '../../../lib/locale';
import { getVehiclePrimaryLabel } from '../../../lib/vehicle-display';
import { DriverIdentityVerification } from '../driver-identity-verification';
import { DriverGuarantorPanel } from '../driver-guarantor-panel';
import { DriverMobileAccessPanel } from '../driver-mobile-access-panel';
import { DriverDocumentsPanel } from '../driver-documents-panel';
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

function getGuarantorTone(status: string | null | undefined): 'success' | 'warning' | 'danger' {
  if (status === 'active') return 'success';
  if (status === 'disconnected') return 'warning';
  return 'danger';
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

export default async function DriverDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{ tab?: string; walletWarning?: string }>;
}) {
  const { driverId } = await params;
  const { tab, walletWarning } = await searchParams;

  const [driver, assignments, remittances, vehicles, fleets, tenant, documents, guarantor, mobileAccess] = await Promise.all([
    getDriver(driverId),
    listAssignments({ limit: 200 }).then((result) => result.data).catch(() => [] as AssignmentRecord[]),
    listRemittances({ limit: 200 }).then((result) => result.data).catch(() => [] as RemittanceRecord[]),
    listVehicles({ limit: 200 }).then((result) => result.data).catch(() => [] as VehicleRecord[]),
    listFleets().catch(() => [] as FleetRecord[]),
    getTenantMe().catch(() => null),
    listDriverDocuments(driverId).catch(() => []),
    getDriverGuarantor(driverId).catch(() => null),
    getDriverMobileAccess(driverId).catch(() => ({ linkedUser: null, suggestedUsers: [] })),
  ]);
  const locale = getFormattingLocale(tenant?.country);

  const fleetName =
    fleets.find((fleet) => fleet.id === driver.fleetId)?.name ?? driver.fleetId;
  const driverAssignments = assignments.filter((a) => a.driverId === driver.id);
  const driverRemittances = remittances.filter((r) => r.driverId === driver.id);
  const activeAssignments = driverAssignments.filter((a) => a.status === 'active');
  const outstandingRemittances = driverRemittances.filter(
    (r) => r.status === 'due' || r.status === 'overdue',
  );
  const totalCollectedMinorUnits = driverRemittances
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.amountMinorUnits, 0);
  const latestAssignment = [...driverAssignments].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  )[0];
  const vehicleLabels = new Map(vehicles.map((v) => [v.id, getVehiclePrimaryLabel(v)]));
  const identityTone = getDriverIdentityTone(driver.identityStatus);
  const identityLabel = getDriverIdentityLabel(driver.identityStatus);
  return (
    <TenantAppShell
      description="Identity, verification, risk signals, guarantor, documents, and operational history."
      eyebrow="Operators"
      title={`${driver.firstName} ${driver.lastName}`}
    >
      {/* Wallet warning banner */}
      {walletWarning === '1' ? (
        <Card className="border-amber-300 bg-amber-50/80">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <svg aria-hidden="true" className="mt-0.5 shrink-0 text-amber-600" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">Verification wallet balance is low</p>
                <p className="text-sm text-amber-800">
                  Your organisation wallet may not have enough funds to cover identity verification for this driver.{' '}
                  <a className="font-semibold underline hover:no-underline" href="/billing">Fund the wallet</a>{' '}
                  before starting verification, or switch to driver-pays mode in{' '}
                  <a className="font-semibold underline hover:no-underline" href="/settings">Settings</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Always-visible hero card */}
      <Card className="border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Heading size="h2">{`${driver.firstName} ${driver.lastName}`}</Heading>
                <Badge tone={getDriverStatusTone(driver.status)}>{driver.status}</Badge>
                <Badge tone={identityTone}>{identityLabel}</Badge>
                {driver.guarantorIsAlsoDriver ? (
                  <Badge tone="danger">Cross-role conflict</Badge>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 16 16" width="14">
                    <path d="M1 10V8.5L3.5 4h9L15 8.5V10" />
                    <path d="M1 10h14" />
                    <circle cx="4" cy="12.5" r="1.5" />
                    <circle cx="12" cy="12.5" r="1.5" />
                  </svg>
                  {fleetName}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 16 16" width="14">
                    <rect height="9" rx="1.5" width="14" x="1" y="4" />
                    <circle cx="8" cy="8.5" r="2" />
                    <path d="M4 6.5v4M12 6.5v4" />
                  </svg>
                  {driver.phone}
                </span>
                {driver.email ? (
                  <span>{driver.email}</span>
                ) : null}
                <span className="flex items-center gap-1.5">
                  <span className="text-slate-400">Guarantor:</span>
                  <Badge tone={getGuarantorTone(driver.guarantorStatus)} >
                    {driver.guarantorStatus === 'active'
                      ? 'Linked'
                      : driver.guarantorStatus === 'disconnected'
                        ? 'Disconnected'
                        : 'Missing'}
                  </Badge>
                </span>
                {driver.riskBand ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-400">Risk:</span>
                    <Badge
                      tone={
                        driver.riskBand === 'critical'
                          ? 'danger'
                          : driver.riskBand === 'high' || driver.riskBand === 'medium' || driver.isWatchlisted
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {driver.isWatchlisted ? `${driver.riskBand} · watchlist` : driver.riskBand}
                    </Badge>
                  </span>
                ) : null}
              </div>
            </div>
            <DriverStatusActions driver={driver} />
          </div>
        </CardContent>
      </Card>

      {/* Tab layout */}
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
                    <Text>{`${driver.firstName} ${driver.lastName}`}</Text>
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
                            ? 'Check verification status →'
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
                    <Text>{driver.hasResolvedIdentity ? 'Linked to person record' : 'Not linked yet'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Identity record</Text>
                    <Text>{driver.hasResolvedIdentity ? 'Verified identity exists' : 'No verified identity yet'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Risk score</Text>
                    <Text>{driver.globalRiskScore ?? 'Not available'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Watchlist</Text>
                    <Text>{driver.isWatchlisted ? 'Watchlist review active' : 'No watchlist signal'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Duplicate identity</Text>
                    <Text>{driver.duplicateIdentityFlag ? 'Under duplicate-identity review' : 'No duplicate signal'}</Text>
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
                  <p className="text-xl font-semibold tracking-tight text-[var(--mobiris-ink)]">{driver.pendingDocumentCount}</p>
                </div>
                <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                  <Text tone="muted">Rejected documents</Text>
                  <p className="text-xl font-semibold tracking-tight text-[var(--mobiris-ink)]">{driver.rejectedDocumentCount}</p>
                </div>
                <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                  <Text tone="muted">Active assignments</Text>
                  <p className="text-xl font-semibold tracking-tight text-[var(--mobiris-ink)]">{activeAssignments.length}</p>
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
                </div>
                <DriverIdentityVerification
                  defaultCountryCode={tenant?.country ?? null}
                  driver={driver}
                  orgDriverPaysKyc={tenant?.driverPaysKyc ?? false}
                />
              </CardContent>
            </Card>

            <Card className="border-sky-200 bg-sky-50/60">
              <CardHeader>
                <CardTitle>Derived identity signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex h-40 items-center justify-center rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-[var(--mobiris-border)] bg-[linear-gradient(135deg,rgba(37,99,235,0.06),rgba(15,23,42,0.03))] p-6 text-center">
                  <div className="space-y-1">
                    <Text tone="strong">Canonical identity attributes stay in the intelligence plane</Text>
                    <Text tone="muted">
                      Operators see decision, confidence, watchlist, duplicate-identity, and review signals here instead of raw canonical profile data.
                    </Text>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
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
                    <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">{documents.length}</p>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-amber-100 bg-amber-50/60 p-4 space-y-1">
                    <Text tone="muted">Pending review</Text>
                    <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">{driver.pendingDocumentCount}</p>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-rose-100 bg-rose-50/60 p-4 space-y-1">
                    <Text tone="muted">Rejected</Text>
                    <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">{driver.rejectedDocumentCount}</p>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-orange-100 bg-orange-50/60 p-4 space-y-1">
                    <Text tone="muted">Expired</Text>
                    <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">{driver.expiredDocumentCount}</p>
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
                    <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">{driverAssignments.length}</p>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-100 bg-emerald-50/60 p-4 space-y-1">
                    <Text tone="muted">Active assignments</Text>
                    <p className="text-2xl font-semibold tracking-tight text-[var(--mobiris-ink)]">{activeAssignments.length}</p>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-slate-50/70 p-4 space-y-1">
                    <Text tone="muted">Latest assignment</Text>
                    <p className="text-sm font-medium text-[var(--mobiris-ink)]">{latestAssignment?.id ?? 'None yet'}</p>
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
                        ? formatAmount(totalCollectedMinorUnits, driverRemittances[0].currency, locale)
                        : 'No confirmed collections yet'}
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        }
      />
    </TenantAppShell>
  );
}
