'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Badge, Card, CardContent, CardHeader, CardTitle, Heading, Text } from '@mobility-os/ui';
import Link from 'next/link';
import type { VehicleDetailRecord, VehicleValuationRecord } from '../../../lib/api-core';
import { getVehiclePrimaryLabel, getVehicleSecondaryLabel } from '../../../lib/vehicle-display';
import { VehicleDetailActions } from './vehicle-detail-actions';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'remittance', label: 'Remittance' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'history', label: 'History' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function isTabKey(value: string | null | undefined): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

function formatMoney(amountMinorUnits: number, currency?: string | null, locale = 'en-US'): string {
  if (!currency) {
    return (amountMinorUnits / 100).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(value?: string | null, locale = 'en-US'): string {
  if (!value) return 'Not scheduled';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined,
  }).format(new Date(value));
}

function getCurrentValuation(
  valuations: VehicleValuationRecord[],
  valuationKind: string,
): VehicleValuationRecord | undefined {
  return valuations.find(
    (valuation) => valuation.valuationKind === valuationKind && valuation.isCurrent,
  );
}

function getAvailabilityBadge(vehicle: VehicleDetailRecord): {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
} {
  if (vehicle.status === 'retired') return { label: 'Inactive', tone: 'danger' };
  if (vehicle.status === 'maintenance') return { label: 'Active', tone: 'warning' };
  return { label: 'Active', tone: 'success' };
}

function getAssignmentBadge(vehicle: VehicleDetailRecord): {
  label: string;
  tone: 'success' | 'warning' | 'neutral';
} {
  if (vehicle.assignmentSummary.activeAssignments > 0) {
    return { label: 'Assigned', tone: 'success' };
  }
  return { label: 'Idle', tone: 'neutral' };
}

function getMaintenanceBadge(vehicle: VehicleDetailRecord): {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
} {
  if (vehicle.status === 'maintenance') return { label: 'In maintenance', tone: 'warning' };
  if (vehicle.maintenanceDue.overdueCount > 0) return { label: 'Overdue maintenance', tone: 'danger' };
  if (vehicle.maintenanceDue.dueCount > 0) return { label: 'Maintenance due', tone: 'warning' };
  return { label: 'Maintenance clear', tone: 'success' };
}

function SummaryMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | undefined;
}) {
  return (
    <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/88 p-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.18)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}

function InfoGrid({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-white p-4"
          key={item.label}
        >
          <Text tone="muted">{item.label}</Text>
          <div className="mt-1 text-sm text-slate-800">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function VehicleCommandCenter({
  locale,
  vehicle,
}: {
  locale: string;
  vehicle: VehicleDetailRecord;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') ?? null;
  const urlTab = isTabKey(tabParam) ? tabParam : null;
  const [manualTab, setManualTab] = useState<TabKey | null>(null);
  const activeTab = manualTab ?? urlTab ?? 'overview';
  const acquisition = getCurrentValuation(vehicle.valuations, 'acquisition');
  const estimate = getCurrentValuation(vehicle.valuations, 'estimate');
  const valuationCurrency =
    vehicle.economics.valuationCurrency ?? estimate?.currency ?? acquisition?.currency ?? null;
  const availabilityBadge = getAvailabilityBadge(vehicle);
  const assignmentBadge = getAssignmentBadge(vehicle);
  const maintenanceBadge = getMaintenanceBadge(vehicle);

  const panels: Record<TabKey, React.ReactNode> = {
    overview: (
      <div className="grid gap-5 xl:grid-cols-[1.25fr,0.95fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex min-h-64 items-center justify-center rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-slate-200 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(15,23,42,0.04))] p-6 text-center">
              <div className="space-y-2">
                <Heading size="h3">
                  {vehicle.make} {vehicle.model}
                </Heading>
                <Text tone="muted">
                  Vehicle photo capture is not available yet. This space is reserved for future handover and inspection images.
                </Text>
              </div>
            </div>
            <InfoGrid
              items={[
                { label: 'Organisation code', value: vehicle.tenantVehicleCode },
                { label: 'System code', value: vehicle.systemVehicleCode },
                { label: 'Plate number', value: vehicle.plate ?? 'Not recorded' },
                { label: 'VIN', value: vehicle.vin ?? 'Not recorded' },
                { label: 'Fleet', value: vehicle.fleetName },
                { label: 'Business entity', value: vehicle.businessEntityName },
                {
                  label: 'Current odometer',
                  value:
                    vehicle.odometerKm != null
                      ? `${vehicle.odometerKm.toLocaleString(locale)} km`
                      : 'Not recorded',
                },
                { label: 'Maintenance note', value: vehicle.maintenanceSummary },
              ]}
            />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoGrid
                items={[
                  { label: 'Make', value: vehicle.make },
                  { label: 'Model', value: vehicle.model },
                  { label: 'Trim', value: vehicle.trim ?? 'Not recorded' },
                  { label: 'Year', value: String(vehicle.year) },
                  { label: 'Vehicle type', value: vehicle.vehicleType.replaceAll('_', ' ') },
                  { label: 'Operating unit', value: vehicle.operatingUnitName },
                ]}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Valuation snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SummaryMetric
                label="Acquisition"
                value={
                  acquisition
                    ? formatMoney(acquisition.amountMinorUnits, acquisition.currency ?? null, locale)
                    : 'Not recorded'
                }
                hint={acquisition ? formatDate(acquisition.valuationDate, locale) : undefined}
              />
              <SummaryMetric
                label="Current estimate"
                value={
                  estimate
                    ? formatMoney(estimate.amountMinorUnits, estimate.currency ?? null, locale)
                    : 'Not recorded'
                }
                hint={estimate ? `Updated ${formatDate(estimate.valuationDate, locale)}` : undefined}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    assignment: (
      <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Assignment state</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <SummaryMetric
                label="Assigned driver"
                value={vehicle.assignmentSummary.assignedDriverName ?? 'No active driver'}
                hint={
                  vehicle.assignmentSummary.latestAssignmentId
                    ? `Latest ${vehicle.assignmentSummary.latestAssignmentId}`
                    : 'Create an assignment to put this vehicle to work'
                }
              />
              <SummaryMetric
                label="Active assignments"
                value={String(vehicle.assignmentSummary.activeAssignments)}
                hint={`${vehicle.assignmentSummary.totalAssignments} total assignments`}
              />
              <SummaryMetric
                label="Latest assignment"
                value={vehicle.assignmentSummary.latestAssignmentStatus ?? 'None yet'}
                hint={
                  vehicle.assignmentSummary.latestAssignmentStartedAt
                    ? formatDate(vehicle.assignmentSummary.latestAssignmentStartedAt, locale)
                    : undefined
                }
              />
            </div>
            <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/80 p-4">
              <Text tone="muted">
                Use the assignment workflow to attach a driver, review handover state, or resolve an idle vehicle.
              </Text>
              <div className="mt-3">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)]"
                  href="/assignments/new"
                >
                  Assign driver
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>What to do next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {vehicle.assignmentSummary.activeAssignments > 0
                  ? 'Vehicle is currently in service.'
                  : 'Vehicle is currently idle.'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {vehicle.assignmentSummary.activeAssignments > 0
                  ? 'Review the current assignment and remittance health before making changes.'
                  : 'Create a new assignment when the vehicle is ready to be deployed.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    remittance: (
      <div className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Remittance snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <SummaryMetric
              label="Last remittance"
              value={
                vehicle.remittanceSummary.latestAmountMinorUnits != null
                  ? formatMoney(
                      vehicle.remittanceSummary.latestAmountMinorUnits,
                      vehicle.remittanceSummary.currency ?? valuationCurrency,
                      locale,
                    )
                  : 'No remittance yet'
              }
              hint={
                vehicle.remittanceSummary.latestRecordedAt
                  ? formatDate(vehicle.remittanceSummary.latestRecordedAt, locale)
                  : undefined
              }
            />
            <SummaryMetric
              label="Next due"
              value={
                vehicle.remittanceSummary.nextDueAt
                  ? formatDate(vehicle.remittanceSummary.nextDueAt, locale)
                  : 'Not scheduled'
              }
              hint={
                vehicle.remittanceSummary.nextDueAmountMinorUnits != null
                  ? formatMoney(
                      vehicle.remittanceSummary.nextDueAmountMinorUnits,
                      vehicle.remittanceSummary.currency ?? valuationCurrency,
                      locale,
                    )
                  : undefined
              }
            />
            <SummaryMetric
              label="Confirmed revenue"
              value={formatMoney(vehicle.economics.confirmedRevenueMinorUnits, valuationCurrency, locale)}
              hint="Total confirmed remittance received"
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Economics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoGrid
              items={[
                {
                  label: 'Tracked expenses',
                  value: formatMoney(vehicle.economics.trackedExpenseMinorUnits, valuationCurrency, locale),
                },
                {
                  label: 'Profit / loss',
                  value: formatMoney(vehicle.economics.profitMinorUnits, valuationCurrency, locale),
                },
                {
                  label: 'Current estimated value',
                  value:
                    vehicle.economics.currentEstimatedValueMinorUnits != null
                      ? formatMoney(vehicle.economics.currentEstimatedValueMinorUnits, valuationCurrency, locale)
                      : 'Not recorded',
                },
                {
                  label: 'Recommendation',
                  value: (
                    <Badge tone={vehicle.economics.profitMinorUnits >= 0 ? 'success' : 'warning'}>
                      {vehicle.economics.recommendation.replaceAll('_', ' ')}
                    </Badge>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    ),
    maintenance: (
      <div className="space-y-5">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Maintenance command</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <SummaryMetric
              label="Maintenance state"
              value={maintenanceBadge.label}
              hint={vehicle.maintenanceSummary}
            />
            <SummaryMetric
              label="Due now"
              value={String(vehicle.maintenanceDue.dueCount)}
            />
            <SummaryMetric
              label="Overdue"
              value={String(vehicle.maintenanceDue.overdueCount)}
            />
            <SummaryMetric
              label="Next due"
              value={formatDate(vehicle.maintenanceDue.nextDueAt, locale)}
              hint={
                vehicle.maintenanceDue.nextDueOdometerKm
                  ? `${vehicle.maintenanceDue.nextDueOdometerKm.toLocaleString(locale)} km`
                  : undefined
              }
            />
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Preventive schedules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicle.maintenanceSchedules.length === 0 ? (
                <Text tone="muted">No preventive maintenance schedule has been configured yet.</Text>
              ) : (
                vehicle.maintenanceSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Heading size="h3">{schedule.scheduleType.replaceAll('_', ' ')}</Heading>
                      <Badge tone={schedule.isActive ? 'success' : 'warning'}>
                        {schedule.isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <Text tone="muted">
                      Next due {formatDate(schedule.nextDueAt, locale)}
                      {schedule.nextDueOdometerKm ? ` or ${schedule.nextDueOdometerKm.toLocaleString(locale)} km` : ''}
                    </Text>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Recent maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicle.maintenanceEvents.length === 0 ? (
                <Text tone="muted">No maintenance activity has been logged yet.</Text>
              ) : (
                vehicle.maintenanceEvents.slice(0, 6).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Heading size="h3">{event.title}</Heading>
                      <Badge tone={event.status === 'completed' ? 'success' : 'warning'}>
                        {event.status}
                      </Badge>
                    </div>
                    <Text tone="muted">
                      {formatDate(event.completedAt ?? event.scheduledFor, locale)}
                      {event.costMinorUnits ? ` • ${formatMoney(event.costMinorUnits, event.currency ?? null, locale)}` : ''}
                    </Text>
                    {event.description ? <Text tone="muted">{event.description}</Text> : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    history: (
      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="border-slate-200 bg-white xl:col-span-1">
          <CardHeader>
            <CardTitle>VIN and specs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vehicle.latestVinDecode ? (
              <InfoGrid
                items={[
                  { label: 'Decoded make', value: vehicle.latestVinDecode.decodedMake ?? 'Not provided' },
                  { label: 'Decoded model', value: vehicle.latestVinDecode.decodedModel ?? 'Not provided' },
                  { label: 'Decoded year', value: vehicle.latestVinDecode.decodedModelYear?.toString() ?? 'Not provided' },
                  { label: 'Body class', value: vehicle.latestVinDecode.bodyClass ?? 'Not provided' },
                ]}
              />
            ) : (
              <Text tone="muted">No VIN decode data has been recorded yet.</Text>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white xl:col-span-1">
          <CardHeader>
            <CardTitle>Inspection history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vehicle.inspections.length === 0 ? (
              <Text tone="muted">No inspections have been logged yet.</Text>
            ) : (
              vehicle.inspections.slice(0, 6).map((inspection) => (
                <div
                  key={inspection.id}
                  className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Heading size="h3">{inspection.inspectionType.replaceAll('_', ' ')}</Heading>
                    <Badge tone={inspection.status === 'passed' ? 'success' : 'warning'}>
                      {inspection.status}
                    </Badge>
                  </div>
                  <Text tone="muted">
                    {formatDate(inspection.inspectionDate, locale)}
                    {inspection.odometerKm ? ` • ${inspection.odometerKm.toLocaleString(locale)} km` : ''}
                  </Text>
                  <Text tone="muted">{inspection.summary}</Text>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white xl:col-span-1">
          <CardHeader>
            <CardTitle>Incident history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vehicle.incidents.length === 0 ? (
              <Text tone="muted">No incidents have been recorded for this vehicle.</Text>
            ) : (
              vehicle.incidents.slice(0, 6).map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Heading size="h3">{incident.title}</Heading>
                    <Badge tone={incident.status === 'resolved' ? 'success' : 'warning'}>
                      {incident.status}
                    </Badge>
                  </div>
                  <Text tone="muted">
                    {formatDate(incident.occurredAt, locale)}
                    {incident.estimatedCostMinorUnits
                      ? ` • ${formatMoney(incident.estimatedCostMinorUnits, incident.currency ?? null, locale)}`
                      : ''}
                  </Text>
                  {incident.description ? <Text tone="muted">{incident.description}</Text> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    ),
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)+0.2rem)] border border-slate-200 bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(239,246,255,0.95)_45%,rgba(219,234,254,0.84))] p-5 shadow-[0_22px_48px_-34px_rgba(37,99,235,0.36)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
              Vehicle command center
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
              {vehicle.tenantVehicleCode || vehicle.systemVehicleCode}
            </h1>
            <p className="mt-2 text-base text-slate-600">
              {getVehiclePrimaryLabel(vehicle)} · {getVehicleSecondaryLabel(vehicle)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={availabilityBadge.tone}>{availabilityBadge.label}</Badge>
              <Badge tone={assignmentBadge.tone}>{assignmentBadge.label}</Badge>
              <Badge tone={maintenanceBadge.tone}>{maintenanceBadge.label}</Badge>
            </div>
          </div>
          <div className="w-full xl:max-w-md">
            <VehicleDetailActions vehicle={vehicle} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric
          label="Assigned driver"
          value={vehicle.assignmentSummary.assignedDriverName ?? 'No active driver'}
          hint={vehicle.assignmentSummary.activeAssignments > 0 ? 'Currently attached' : 'Ready to assign'}
        />
        <SummaryMetric
          label="Last remittance"
          value={
            vehicle.remittanceSummary.latestAmountMinorUnits != null
              ? formatMoney(
                  vehicle.remittanceSummary.latestAmountMinorUnits,
                  vehicle.remittanceSummary.currency ?? valuationCurrency,
                  locale,
                )
              : 'No remittance yet'
          }
          hint={
            vehicle.remittanceSummary.latestRecordedAt
              ? formatDate(vehicle.remittanceSummary.latestRecordedAt, locale)
              : undefined
          }
        />
        <SummaryMetric
          label="Next due"
          value={
            vehicle.remittanceSummary.nextDueAt
              ? formatDate(vehicle.remittanceSummary.nextDueAt, locale)
              : 'Not scheduled'
          }
          hint={
            vehicle.remittanceSummary.nextDueAmountMinorUnits != null
              ? formatMoney(
                  vehicle.remittanceSummary.nextDueAmountMinorUnits,
                  vehicle.remittanceSummary.currency ?? valuationCurrency,
                  locale,
                )
              : undefined
          }
        />
        <SummaryMetric
          label="Maintenance"
          value={maintenanceBadge.label}
          hint={vehicle.maintenanceSummary}
        />
      </div>

      <div className="space-y-6">
        <div className="flex gap-1 overflow-x-auto rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-1">
          {TABS.map((tab) => (
            <button
              className={`flex-shrink-0 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] px-4 py-2.5 text-sm font-semibold tracking-[-0.01em] transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-white text-[var(--mobiris-ink)] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.12)]'
                  : 'text-slate-500 hover:bg-white/60 hover:text-[var(--mobiris-ink)]'
              }`}
              key={tab.key}
              onClick={() => setManualTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">{panels[activeTab]}</div>
      </div>
    </div>
  );
}
