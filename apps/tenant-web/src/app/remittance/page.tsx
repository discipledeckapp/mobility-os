import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getTenantApiToken,
  getTenantMe,
  listFleets,
  listDrivers,
  listAssignments,
  listOperationalDisputes,
  listOperationalDocuments,
  listRemittances,
  listVehicles,
  type AssignmentRecord,
  type DriverRecord,
  type RecordDisputeRecord,
  type RecordDocumentRecord,
  type FleetRecord,
  type RemittanceRecord,
  type VehicleRecord,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';
import { CreateRemittanceForm } from './create-remittance-form';
import { RemittanceRecordsPanel } from './remittance-records-panel';

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

export default async function RemittancePage() {
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

  const expectedTodayMinorUnits = assignments
    .filter((assignment) => assignment.status === 'active')
    .reduce((sum, assignment) => sum + (assignment.remittanceAmountMinorUnits ?? 0), 0);
  const operatingCurrency =
    assignments.find((assignment) => assignment.remittanceCurrency)?.remittanceCurrency ??
    remittances[0]?.currency ??
    'NGN';
  const receivedMinorUnits = remittances
    .filter((remittance) => ['completed', 'partially_settled'].includes(remittance.status))
    .reduce((sum, remittance) => sum + remittance.amountMinorUnits, 0);
  const typicalMinorUnits =
    remittances.length > 0
      ? Math.round(remittances.reduce((sum, remittance) => sum + remittance.amountMinorUnits, 0) / remittances.length)
      : 0;
  const leakageMinorUnits = Math.max(0, expectedTodayMinorUnits - receivedMinorUnits);
  const flaggedDrivers = drivers.filter((driver) => driver.enforcementStatus && driver.enforcementStatus !== 'clear').length;
  const recentDisputes = disputes.slice(0, 6);
  const recentDocuments = documents.slice(0, 6);

  return (
    <TenantAppShell
      description="Daily collections recording and reconciliation for transport operators."
      eyebrow="Collections"
      title="Remittance"
    >
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Text tone="strong">Export remittance history</Text>
            <Text tone="muted">
              Download the current remittance ledger as CSV for reconciliation, finance review, or external reporting.
            </Text>
          </div>
          <a
            className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
            href="/api/download/remittance-export"
          >
            Export remittance CSV
          </a>
        </CardContent>
      </Card>

      <CreateRemittanceForm
        fleetError={fleetError}
        fleets={fleets}
        activeAssignments={assignments.filter(
          (assignment) => assignment.status === 'active',
        )}
        drivers={drivers}
        vehicles={vehicles}
        helperNote={helperNote}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total expected', value: formatAmount(expectedTodayMinorUnits, operatingCurrency, locale), note: 'Live target from current assignment terms' },
          { label: 'Total received', value: formatAmount(receivedMinorUnits, operatingCurrency, locale), note: 'Completed collections so far' },
          { label: 'Leakage', value: formatAmount(leakageMinorUnits, operatingCurrency, locale), note: 'Gap between target and settled cash' },
          { label: 'Flagged drivers', value: String(flaggedDrivers), note: `Today vs average ${formatAmount(typicalMinorUnits, operatingCurrency, locale)}` },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-1 py-5">
              <Text tone="muted">{item.label}</Text>
              <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">{item.value}</p>
              <Text tone="muted">{item.note}</Text>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Remittance records</CardTitle>
          <CardDescription>
            All remittance records for this tenant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage ? (
            <Text>{errorMessage}</Text>
          ) : remittances.length === 0 ? (
            <Text>No remittance records found for this tenant yet.</Text>
          ) : (
            <RemittanceRecordsPanel
              assignments={assignments}
              drivers={drivers}
              locale={locale}
              remittances={remittances}
              vehicles={vehicles}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dispute registry</CardTitle>
            <CardDescription>
              Formal remittance disputes, with status and timeline-backed claim references.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDisputes.length === 0 ? (
              <Text>No remittance disputes have been opened yet.</Text>
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receipts and documents</CardTitle>
            <CardDescription>
              Fingerprinted remittance receipts and dispute outputs linked back to source records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <Text>No remittance documents have been issued yet.</Text>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </TenantAppShell>
  );
}
