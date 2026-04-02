import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  type AssignmentRecord,
  type AuditLogRecord,
  type DriverRecord,
  type RecordDisputeRecord,
  type RecordDocumentRecord,
  type RemittanceRecord,
  type VehicleRecord,
  getOperationalReadinessReport,
  getTenantApiToken,
  getTenantMe,
  listAssignments,
  listAuditLog,
  listDrivers,
  listOperationalDisputes,
  listOperationalDocuments,
  listRemittances,
  listVehicles,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatMoney(amountMinorUnits: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatStatus(value: string) {
  return value.replaceAll('_', ' ');
}

function getAuditActionLabel(action: string) {
  return action.replaceAll('.', ' ').replaceAll('_', ' ');
}

function normalizeDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getDriverLabel(driver: DriverRecord | undefined) {
  if (!driver) return 'Driver';
  return `${driver.firstName} ${driver.lastName}`.trim() || 'Driver';
}

function getVehicleLabel(vehicle: VehicleRecord | undefined) {
  if (!vehicle) return 'Vehicle';
  return [vehicle.plate, vehicle.make, vehicle.model].filter(Boolean).join(' · ') || 'Vehicle';
}

function isCompletedRemittance(status: string) {
  return status === 'completed' || status === 'confirmed';
}

function getEvidenceHref(document: RecordDocumentRecord): Route {
  return `/api/records/documents/${document.id}/content` as Route;
}

function getAuditHref(event: AuditLogRecord): Route | null {
  const metadataVehicleId =
    event.metadata && typeof event.metadata.vehicleId === 'string' ? event.metadata.vehicleId : null;

  switch (event.entityType) {
    case 'driver':
      return `/drivers/${event.entityId}` as Route;
    case 'vehicle':
      return `/vehicles/${event.entityId}` as Route;
    case 'assignment':
      return `/assignments/${event.entityId}` as Route;
    case 'remittance':
      return '/remittance' as Route;
    case 'document':
    case 'dispute':
      return '/operations' as Route;
    case 'work_order':
      return metadataVehicleId ? (`/vehicles/${metadataVehicleId}?tab=maintenance` as Route) : ('/vehicles/health' as Route);
    case 'inspection':
      return metadataVehicleId ? (`/vehicles/${metadataVehicleId}?tab=history` as Route) : ('/vehicles/health' as Route);
    default:
      return null;
  }
}

function AlertItem({
  title,
  description,
  tone,
  href,
  ctaLabel,
}: {
  title: string;
  description: string;
  tone: 'danger' | 'warning';
  href: Route;
  ctaLabel: string;
}) {
  return (
    <div
      className={`rounded-[var(--mobiris-radius-card)] border p-4 ${
        tone === 'danger' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Text tone="strong">{title}</Text>
          <Text>{description}</Text>
        </div>
        <Link href={href}>
          <Button size="sm" variant="secondary">
            {ctaLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default async function OperationsPage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const [
    tenant,
    readinessReport,
    assignmentsPage,
    driversPage,
    vehiclesPage,
    remittancesPage,
    documents,
    disputes,
    auditPage,
  ] = await Promise.all([
    getTenantMe(token).catch(() => null),
    getOperationalReadinessReport(token).catch(() => ({ drivers: [], vehicles: [] })),
    listAssignments({ limit: 200 }, token).catch(() => ({ data: [] as AssignmentRecord[] })),
    listDrivers({ limit: 200 }, token).catch(() => ({ data: [] as DriverRecord[] })),
    listVehicles({ limit: 200 }, token).catch(() => ({ data: [] as VehicleRecord[] })),
    listRemittances({ limit: 200 }, token).catch(() => ({ data: [] as RemittanceRecord[] })),
    listOperationalDocuments({}, token).catch(() => [] as RecordDocumentRecord[]),
    listOperationalDisputes({}, token).catch(() => [] as RecordDisputeRecord[]),
    listAuditLog({ limit: 40 }, token).catch(() => ({ data: [] as AuditLogRecord[] })),
  ]);

  const locale = getFormattingLocale(tenant?.country);
  const today = startOfDay();
  const assignments = assignmentsPage.data;
  const drivers = driversPage.data;
  const vehicles = vehiclesPage.data;
  const remittances = remittancesPage.data;
  const auditEvents = auditPage.data;

  const driverById = new Map(drivers.map((driver) => [driver.id, driver]));
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

  const overdueRemittances = remittances
    .filter((remittance) => !isCompletedRemittance(remittance.status) && remittance.status !== 'waived')
    .filter((remittance) => {
      const dueDate = normalizeDate(remittance.dueDate);
      return dueDate !== null && dueDate < today;
    })
    .sort((left, right) => {
      const leftDate = normalizeDate(left.dueDate)?.getTime() ?? 0;
      const rightDate = normalizeDate(right.dueDate)?.getTime() ?? 0;
      return leftDate - rightDate;
    });

  const blockedDrivers = readinessReport.drivers.filter(
    (driver) => driver.activationReadiness !== 'ready',
  );
  const missingVerificationDrivers = drivers.filter(
    (driver) =>
      driver.identityStatus !== 'verified' &&
      driver.identityStatus !== 'review_needed' &&
      driver.status !== 'terminated',
  );
  const openDisputes = disputes
    .filter((dispute) => dispute.status !== 'resolved')
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  const latestDocuments = documents
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 6);
  const latestAudit = auditEvents.slice(0, 6);

  const activityItems =
    latestAudit.length > 0
      ? latestAudit.map((event) => ({
          id: event.id,
          title: `${event.entityType.replaceAll('_', ' ')} ${getAuditActionLabel(event.action)}`,
          description: event.actorId
            ? `Actor ${event.actorId.slice(0, 8)} · ${formatDate(event.createdAt, locale)}`
            : `System event · ${formatDate(event.createdAt, locale)}`,
          href: getAuditHref(event),
        }))
      : assignments
          .slice()
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
          .slice(0, 6)
          .map((assignment) => ({
            id: assignment.id,
            title: 'Assignment updated',
            description: `${getDriverLabel(driverById.get(assignment.driverId))} · ${getVehicleLabel(vehicleById.get(assignment.vehicleId))} · ${formatStatus(assignment.status)}`,
            href: `/assignments/${assignment.id}` as Route,
          }));

  return (
    <TenantAppShell
      description="See what needs attention, what just happened, and the evidence behind key operational activity."
      eyebrow="Operations"
      title="Operations"
    >
      <div className="space-y-6">
        <Card className="border-[var(--mobiris-primary-light)] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.98)_48%,rgba(219,234,254,0.82))] shadow-[0_28px_60px_-42px_rgba(37,99,235,0.5)]">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
                  Operations
                </p>
                <CardTitle className="text-3xl tracking-[-0.04em] text-slate-950">
                  What should I do next?
                </CardTitle>
                <CardDescription>
                  Start with the alerts, review what just happened, then open the supporting evidence only when you need to prove or investigate something.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={'/assignments' as Route}>
                  <Button>Open assignments</Button>
                </Link>
                <Link href={'/remittance' as Route}>
                  <Button variant="secondary">Open remittance</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Alerts</h2>
              <p className="text-sm text-slate-600">Fix the blockers that will slow operations first.</p>
            </div>
            <Badge tone={overdueRemittances.length + blockedDrivers.length + missingVerificationDrivers.length > 0 ? 'warning' : 'success'}>
              {overdueRemittances.length + blockedDrivers.length + missingVerificationDrivers.length > 0
                ? 'Action needed'
                : 'No urgent blockers'}
            </Badge>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Overdue remittance</CardTitle>
                <CardDescription>Collections already overdue and likely to need follow-up now.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdueRemittances.length > 0 ? (
                  overdueRemittances.slice(0, 4).map((remittance) => (
                    <AlertItem
                      ctaLabel="Open remittance"
                      description={`${getDriverLabel(driverById.get(remittance.driverId))} · due ${formatDate(remittance.dueDate, locale)} · ${formatMoney(remittance.amountMinorUnits, remittance.currency, locale)}`}
                      href={'/remittance' as Route}
                      key={remittance.id}
                      title={formatStatus(remittance.status)}
                      tone="danger"
                    />
                  ))
                ) : (
                  <Text className="text-sm text-slate-500">No overdue remittance items right now.</Text>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Blocked drivers</CardTitle>
                <CardDescription>Drivers who are not ready to operate and need intervention.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {blockedDrivers.length > 0 ? (
                  blockedDrivers.slice(0, 4).map((driver) => (
                    <AlertItem
                      ctaLabel="Open driver"
                      description={(driver.activationReadinessReasons ?? []).slice(0, 2).join(' · ') || 'Driver is not ready to operate.'}
                      href={`/drivers/${driver.id}` as Route}
                      key={driver.id}
                      title={getDriverLabel(driverById.get(driver.id))}
                      tone="warning"
                    />
                  ))
                ) : (
                  <Text className="text-sm text-slate-500">No blocked drivers at the moment.</Text>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Missing verification</CardTitle>
                <CardDescription>Drivers who still need identity work before they can move cleanly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {missingVerificationDrivers.length > 0 ? (
                  missingVerificationDrivers.slice(0, 4).map((driver) => (
                    <AlertItem
                      ctaLabel="Review driver"
                      description={`Identity status: ${formatStatus(driver.identityStatus)}.`}
                      href={`/drivers/${driver.id}` as Route}
                      key={driver.id}
                      title={getDriverLabel(driver)}
                      tone="warning"
                    />
                  ))
                ) : (
                  <Text className="text-sm text-slate-500">No missing verification items right now.</Text>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Activity</h2>
            <p className="text-sm text-slate-600">See what just happened before you decide where to jump in.</p>
          </div>

          <Card className="border-slate-200 bg-white">
            <CardContent className="space-y-3 pt-6">
              {activityItems.length > 0 ? (
                activityItems.map((item) => (
                  <div
                    className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4"
                    key={item.id}
                  >
                    <div className="space-y-1">
                      <Text tone="strong">{item.title}</Text>
                      <Text tone="muted">{item.description}</Text>
                    </div>
                    {item.href ? (
                      <Link href={item.href}>
                        <Button size="sm" variant="secondary">
                          Open workflow
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                ))
              ) : (
                <Text className="text-sm text-slate-500">No recent activity yet.</Text>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Evidence</h2>
              <p className="text-sm text-slate-600">Use documents, disputes, and logs to support a decision or investigation.</p>
            </div>
            <Link href={'/audit' as Route}>
              <Button size="sm" variant="secondary">
                Open advanced audit
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Recent supporting paperwork, receipts, and generated records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestDocuments.length > 0 ? (
                  latestDocuments.map((document) => (
                    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4" key={document.id}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Text tone="strong">{formatStatus(document.documentType)}</Text>
                        <Badge tone={document.status === 'verified' || document.status === 'signed' ? 'success' : 'warning'}>
                          {formatStatus(document.status)}
                        </Badge>
                      </div>
                      <Text tone="muted">{document.fileName}</Text>
                      <Text tone="muted">{formatDate(document.createdAt, locale)}</Text>
                      <div className="mt-3">
                        <Link href={getEvidenceHref(document)}>
                          <Button size="sm" variant="secondary">Open document</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <Text className="text-sm text-slate-500">No supporting documents yet.</Text>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Disputes</CardTitle>
                <CardDescription>Items still under review or waiting on resolution.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {openDisputes.length > 0 ? (
                  openDisputes.slice(0, 5).map((dispute) => (
                    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4" key={dispute.id}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Text tone="strong">{dispute.title}</Text>
                        <Badge tone={dispute.status === 'escalated' ? 'danger' : 'warning'}>
                          {formatStatus(dispute.status)}
                        </Badge>
                      </div>
                      <Text tone="muted">{formatStatus(dispute.reasonCode)}</Text>
                      <Text tone="muted">
                        {dispute.finalAmountMinorUnits != null && dispute.currency
                          ? formatMoney(dispute.finalAmountMinorUnits, dispute.currency, locale)
                          : 'Amount not set'}
                      </Text>
                    </div>
                  ))
                ) : (
                  <Text className="text-sm text-slate-500">No open disputes right now.</Text>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Logs</CardTitle>
                <CardDescription>Recent trace events kept for investigation and support.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestAudit.length > 0 ? (
                  latestAudit.map((event) => (
                    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4" key={event.id}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Text tone="strong">{formatStatus(event.entityType)}</Text>
                        <Badge tone="neutral">{getAuditActionLabel(event.action)}</Badge>
                      </div>
                      <Text tone="muted">{formatDate(event.createdAt, locale)}</Text>
                      <Text tone="muted">
                        {event.actorId ? `Actor ${event.actorId.slice(0, 8)}` : 'System event'}
                      </Text>
                    </div>
                  ))
                ) : (
                  <Text className="text-sm text-slate-500">No trace logs available.</Text>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </TenantAppShell>
  );
}
