import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  TenantEmptyStateCard,
  TenantInlineSummary,
  TenantMetricCard,
  TenantMetricGrid,
  TenantSurfaceCard,
} from '../../features/shared/tenant-page-patterns';
import {
  getTenantApiToken,
  getTenantMe,
  listAssignments,
  listDrivers,
  listFleets,
  listOperationalDisputes,
  listOperationalDocuments,
  listRemittances,
  listVehicles,
  type AssignmentRecord,
  type DriverRecord,
  type FleetRecord,
  type RecordDisputeRecord,
  type RecordDocumentRecord,
  type RemittanceRecord,
  type VehicleRecord,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';
import { CreateRemittanceForm } from './create-remittance-form';
import { RemittanceRecordsPanel } from './remittance-records-panel';
import {
  getFriendlyRemittanceErrorMessage,
  summarizeRemittanceAttention,
  supportsRemittance,
} from './view-helpers';

function formatAmount(amountMinorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatTimestamp(value: string, locale: string): string {
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? value : timestamp.toLocaleString(locale);
}

function getDisputeTone(status: string): 'danger' | 'warning' | 'success' | 'neutral' {
  if (['open', 'under_review', 'awaiting_evidence', 'escalated'].includes(status)) return 'warning';
  if (status === 'resolved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

export default async function RemittancePage({
  searchParams,
}: {
  searchParams?: Promise<{ assignmentId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const preselectedAssignmentId = resolvedSearchParams?.assignmentId ?? null;
  let remittances: RemittanceRecord[] = [];
  let assignments: AssignmentRecord[] = [];
  let drivers: DriverRecord[] = [];
  let vehicles: VehicleRecord[] = [];
  let fleets: FleetRecord[] = [];
  let disputes: RecordDisputeRecord[] = [];
  let documents: RecordDocumentRecord[] = [];
  let errorMessage: string | null = null;
  let helperNote: string | null = null;
  let fleetError: string | null = null;
  let locale = 'en-US';
  const token = await getTenantApiToken().catch(() => undefined);

  try {
    const tenant = await getTenantMe(token);
    locale = getFormattingLocale(tenant.country);
  } catch {
    locale = 'en-US';
  }

  try {
    const [remittancesResult, disputesResult, documentsResult] = await Promise.all([
      listRemittances({ limit: 200 }, token),
      listOperationalDisputes({ relatedEntityType: 'remittance' }, token),
      listOperationalDocuments({ relatedEntityType: 'remittance' }, token),
    ]);
    remittances = remittancesResult.data;
    disputes = disputesResult;
    documents = documentsResult;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Unable to load remittance.';
  }

  const assignmentsResult = await Promise.resolve()
    .then(() => listAssignments({ limit: 200 }, token))
    .catch((error) => error);

  if (assignmentsResult instanceof Error) {
    helperNote =
      'Assignment quick-picks are unavailable because live assignment data could not be loaded.';
  } else {
    assignments = assignmentsResult.data;
  }

  const [driversResult, vehiclesResult, fleetsResult] = await Promise.allSettled([
    (async () => listDrivers({ limit: 200 }, token))(),
    (async () => listVehicles({ limit: 200 }, token))(),
    (async () => listFleets(token))(),
  ]);

  if (driversResult.status === 'fulfilled') {
    drivers = driversResult.value.data;
  } else {
    const driverNote =
      'Driver labels are unavailable because live driver data could not be loaded.';
    helperNote = helperNote ? `${helperNote} ${driverNote}` : driverNote;
  }

  if (vehiclesResult.status === 'fulfilled') {
    vehicles = vehiclesResult.value.data;
  } else {
    const vehicleNote =
      'Vehicle labels are unavailable because live vehicle data could not be loaded.';
    helperNote = helperNote ? `${helperNote} ${vehicleNote}` : vehicleNote;
  }

  if (fleetsResult.status === 'fulfilled') {
    fleets = fleetsResult.value;
  } else {
    fleetError =
      fleetsResult.reason instanceof Error
        ? fleetsResult.reason.message
        : 'Live fleet data could not be loaded.';
  }

  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === 'active' && supportsRemittance(assignment.paymentModel),
  );
  const assignmentContextUnavailable = assignmentsResult instanceof Error;
  const remittanceLoadError = getFriendlyRemittanceErrorMessage(errorMessage);
  const showSummaryCards =
    !remittanceLoadError && activeAssignments.length > 0;
  const showExportCard = remittances.length > 0;
  const showSecondarySections =
    disputes.length > 0 || documents.length > 0;
  const preselectedAssignment =
    (preselectedAssignmentId
      ? activeAssignments.find((assignment) => assignment.id === preselectedAssignmentId)
      : null) ?? null;

  const expectedTodayMinorUnits = activeAssignments.reduce(
    (sum, assignment) => sum + (assignment.remittanceAmountMinorUnits ?? 0),
    0,
  );
  const operatingCurrency =
    activeAssignments.find((assignment) => assignment.remittanceCurrency)?.remittanceCurrency ??
    remittances[0]?.currency ??
    'NGN';
  const receivedMinorUnits = remittances
    .filter((remittance) => ['completed', 'partially_settled'].includes(remittance.status))
    .reduce((sum, remittance) => sum + remittance.amountMinorUnits, 0);
  const leakageMinorUnits = Math.max(0, expectedTodayMinorUnits - receivedMinorUnits);
  const todayIso = new Date().toISOString().slice(0, 10);
  const { overdueCount, partiallySettledCount, outstandingMinorUnits } =
    summarizeRemittanceAttention(remittances, todayIso);
  const recentDisputes = disputes.slice(0, 6);
  const recentDocuments = documents.slice(0, 6);

  return (
    <TenantAppShell
      description="Daily collections recording and reconciliation for transport operators."
      eyebrow="Collections"
      title="Remittance"
    >
      <section className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Collections
            </p>
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Collections needing attention
            </h2>
          </div>
          {showExportCard ? (
            <a
              className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_18px_32px_-18px_rgba(37,99,235,0.72)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
              href="/api/download/remittance-export"
            >
              Export remittance CSV
            </a>
          ) : null}
        </div>
        <TenantInlineSummary
          items={[
            { label: 'active', value: activeAssignments.length, tone: activeAssignments.length > 0 ? 'success' : 'neutral' },
            { label: 'records', value: remittances.length, tone: 'neutral' },
            {
              label: 'overdue',
              value: overdueCount,
              tone: overdueCount > 0 ? 'warning' : 'neutral',
            },
          ]}
        />
      </section>

      <TenantSurfaceCard
        className="mb-6"
        contentClassName="py-4"
        description="Pending collections, disputes, and reconciliation issues"
        title="Needs attention"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Pending</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--mobiris-ink)]">
              {remittances.filter((record) => record.status === 'pending').length}
            </p>
          </div>
          <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Overdue</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--mobiris-ink)]">{overdueCount}</p>
          </div>
          <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Disputes</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--mobiris-ink)]">{disputes.length}</p>
          </div>
        </div>
      </TenantSurfaceCard>

      {assignmentContextUnavailable ? (
        <div className="mb-6">
          <TenantEmptyStateCard
            actions={
              <a
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
                href="/assignments"
              >
                Go to Assignments
              </a>
            }
            description="We could not load the active assignments needed to record remittance right now. Please try again shortly or open Assignments to confirm the current assignment status."
            title="Assignment context is temporarily unavailable"
            tone="warning"
          />
        </div>
      ) : null}

      {!assignmentContextUnavailable ? (
        <CreateRemittanceForm
          activeAssignments={activeAssignments}
          drivers={drivers}
          fleetError={fleetError}
          fleets={fleets}
          helperNote={helperNote}
          initialAssignmentId={preselectedAssignment?.id ?? null}
          initialFleetId={preselectedAssignment?.fleetId ?? null}
          vehicles={vehicles}
        />
      ) : null}

      {showSummaryCards ? (
        <TenantMetricGrid className="mb-6">
          <TenantMetricCard
            accent="primary"
            label="Total expected"
            note="Live target from active assignment terms"
            value={formatAmount(expectedTodayMinorUnits, operatingCurrency, locale)}
          />
          <TenantMetricCard
            accent="success"
            label="Total received"
            note="Completed collections so far"
            value={formatAmount(receivedMinorUnits, operatingCurrency, locale)}
          />
          <TenantMetricCard
            accent="warning"
            label="Leakage"
            note="Gap between target and settled cash"
            value={formatAmount(leakageMinorUnits, operatingCurrency, locale)}
          />
          <TenantMetricCard
            accent="violet"
            label="Outstanding"
            note={`${overdueCount} overdue · ${partiallySettledCount} partially settled`}
            value={formatAmount(outstandingMinorUnits, operatingCurrency, locale)}
          />
        </TenantMetricGrid>
      ) : null}

      <TenantSurfaceCard
        contentClassName="space-y-4"
        description="Collections that have already been recorded against assignment-linked remittance schedules."
        title="Remittance history"
      >
          {remittanceLoadError ? (
            <TenantEmptyStateCard
              description={remittanceLoadError}
              title="We could not load remittance records right now"
              tone="warning"
            />
          ) : remittances.length === 0 ? (
            <TenantEmptyStateCard
              description={
                activeAssignments.length > 0
                  ? 'Select an active assignment above to record the first remittance for this period.'
                  : 'Records will appear here after a remittance is logged against an active assignment.'
              }
              title="No remittance records yet"
            />
          ) : (
      <RemittanceRecordsPanel
        assignments={assignments}
        description="Review the full collection ledger."
        drivers={drivers}
        locale={locale}
        remittances={remittances}
        title="All remittance records"
        vehicles={vehicles}
      />
          )}
      </TenantSurfaceCard>

      {showSecondarySections ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {recentDisputes.length > 0 ? (
            <TenantSurfaceCard
              description="Formal remittance disputes, with status and timeline-backed claim references."
              title="Dispute registry"
            >
                <TableViewport>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dispute</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDisputes.map((dispute) => (
                        <TableRow key={dispute.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-[var(--mobiris-ink)]">{dispute.title}</p>
                              <p className="text-xs text-slate-500">{dispute.disputeCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge tone={getDisputeTone(dispute.status)}>{dispute.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{dispute.reasonCode}</TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {formatTimestamp(dispute.updatedAt, locale)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableViewport>
            </TenantSurfaceCard>
          ) : null}

          {recentDocuments.length > 0 ? (
            <TenantSurfaceCard
              description="Fingerprinted remittance receipts and dispute outputs linked back to source records."
              title="Receipts and documents"
            >
                <TableViewport>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Fingerprint</TableHead>
                        <TableHead>Download</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDocuments.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-[var(--mobiris-ink)]">{document.documentNumber}</p>
                              <p className="text-xs text-slate-500">{formatTimestamp(document.createdAt, locale)}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{document.documentType}</TableCell>
                          <TableCell className="font-mono text-xs text-slate-500">
                            {document.fingerprint.slice(0, 16)}...
                          </TableCell>
                          <TableCell>
                            <a
                              className="text-sm font-medium text-[var(--mobiris-primary-dark)] hover:underline"
                              href={`/api/records/documents/${document.id}/content`}
                            >
                              Download
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableViewport>
            </TenantSurfaceCard>
          ) : null}
        </div>
      ) : null}
    </TenantAppShell>
  );
}
