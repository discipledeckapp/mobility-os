import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { type VehicleValuationRecord, getTenantMe, getVehicle } from '../../../lib/api-core';
import { getVehiclePrimaryLabel, getVehicleSecondaryLabel } from '../../../lib/vehicle-display';
import { VehicleDetailActions } from './vehicle-detail-actions';

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

function getCurrentValuation(
  valuations: VehicleValuationRecord[],
  valuationKind: string,
): VehicleValuationRecord | undefined {
  return valuations.find(
    (valuation) => valuation.valuationKind === valuationKind && valuation.isCurrent,
  );
}

function formatDate(value?: string | null, locale = 'en-US'): string {
  if (!value) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined,
  }).format(new Date(value));
}

export default async function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const [vehicle, tenant] = await Promise.all([
    getVehicle(vehicleId),
    getTenantMe().catch(() => null),
  ]);
  const acquisition = getCurrentValuation(vehicle.valuations, 'acquisition');
  const estimate = getCurrentValuation(vehicle.valuations, 'estimate');
  const locale = tenant?.country === 'NG' ? 'en-NG' : 'en-US';

  return (
    <TenantAppShell
      description="Vehicle identification, valuation, assignment history, and VIN context."
      eyebrow="Assets"
      title={getVehiclePrimaryLabel(vehicle)}
    >
      <Card className="border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <CardHeader>
          <CardTitle>{getVehiclePrimaryLabel(vehicle)}</CardTitle>
          <CardDescription>{getVehicleSecondaryLabel(vehicle)}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <Text tone="muted">System code</Text>
            <Heading size="h3">{vehicle.systemVehicleCode}</Heading>
          </div>
          <div className="space-y-1">
            <Text tone="muted">Fleet</Text>
            <Heading size="h3">{vehicle.fleetName}</Heading>
          </div>
          <div className="space-y-1">
            <Text tone="muted">Status</Text>
            <Badge
              tone={
                vehicle.status === 'available'
                  ? 'success'
                  : vehicle.status === 'maintenance'
                    ? 'warning'
                    : vehicle.status === 'retired'
                      ? 'danger'
                      : 'neutral'
              }
            >
              {vehicle.status}
            </Badge>
          </div>
          <div className="space-y-1">
            <Text tone="muted">Plate</Text>
            <Heading size="h3">{vehicle.plate ?? 'Not recorded'}</Heading>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="space-y-6">
          <Card className="border-sky-200 bg-sky-50/60">
            <CardHeader>
              <CardTitle>Vehicle images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex h-64 items-center justify-center rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-[var(--mobiris-border)] bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(15,23,42,0.04))] p-6 text-center">
                <div className="space-y-2">
                  <Heading size="h3">
                    {vehicle.make} {vehicle.model}
                  </Heading>
                  <Text tone="muted">
                    No vehicle image has been uploaded yet. When image capture is added for fleet
                    assets, the latest vehicle image will appear here.
                  </Text>
                </div>
              </div>
              <Text tone="muted">
                Keep this vehicle record image-ready for future inspections, damage evidence, and
                assignment handover checks.
              </Text>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Identification</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Text tone="muted">Organisation vehicle code</Text>
                <Heading size="h3">{vehicle.tenantVehicleCode}</Heading>
              </div>
              <div className="space-y-1">
                <Text tone="muted">System vehicle code</Text>
                <Heading size="h3">{vehicle.systemVehicleCode}</Heading>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Plate number</Text>
                <Text>{vehicle.plate ?? 'Not recorded'}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">VIN</Text>
                <Text>{vehicle.vin ?? 'Not recorded'}</Text>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50/45">
            <CardHeader>
              <CardTitle>Vehicle profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Text tone="muted">Make</Text>
                <Text>{vehicle.make}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Model</Text>
                <Text>{vehicle.model}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Trim</Text>
                <Text>{vehicle.trim ?? 'Not recorded'}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Year</Text>
                <Text>{vehicle.year}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Fleet</Text>
                <Text>{vehicle.fleetName}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Business entity</Text>
                <Text>{vehicle.businessEntityName}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Odometer</Text>
                <Text>
                  {vehicle.odometerKm !== null && vehicle.odometerKm !== undefined
                    ? `${vehicle.odometerKm.toLocaleString(locale)} km`
                    : 'Not recorded'}
                </Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Maintenance status</Text>
                <Text>{vehicle.maintenanceSummary}</Text>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/60">
            <CardHeader>
              <CardTitle>Decoded VIN / specs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {vehicle.latestVinDecode ? (
                <>
                  <div className="space-y-1">
                    <Text tone="muted">Decoded make</Text>
                    <Text>{vehicle.latestVinDecode.decodedMake ?? 'Not provided'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Decoded model</Text>
                    <Text>{vehicle.latestVinDecode.decodedModel ?? 'Not provided'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Decoded year</Text>
                    <Text>{vehicle.latestVinDecode.decodedModelYear ?? 'Not provided'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Body class</Text>
                    <Text>{vehicle.latestVinDecode.bodyClass ?? 'Not provided'}</Text>
                  </div>
                </>
              ) : (
                <Text tone="muted">No VIN decode data has been recorded for this vehicle yet.</Text>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Valuation summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Text tone="muted">Acquisition</Text>
                <Text>
                  {acquisition
                    ? `${formatMoney(acquisition.amountMinorUnits, acquisition.currency ?? null, locale)} on ${new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(acquisition.valuationDate))}`
                    : 'Not recorded'}
                </Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Current estimate</Text>
                <Text>
                  {estimate
                    ? `${formatMoney(estimate.amountMinorUnits, estimate.currency ?? null, locale)} as of ${new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(estimate.valuationDate))}`
                    : 'Not recorded'}
                </Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Valuation source</Text>
                <Text>{estimate?.source ?? acquisition?.source ?? 'Not recorded'}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Current recommendation</Text>
                <Badge tone={vehicle.economics.profitMinorUnits >= 0 ? 'success' : 'warning'}>
                  {vehicle.economics.recommendation.replaceAll('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-lime-200 bg-lime-50/45">
            <CardHeader>
              <CardTitle>Economics and ownership insight</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Text tone="muted">Confirmed revenue</Text>
                <Heading size="h3">
                  {formatMoney(
                    vehicle.economics.confirmedRevenueMinorUnits,
                    vehicle.economics.valuationCurrency ?? acquisition?.currency ?? estimate?.currency ?? null,
                    locale,
                  )}
                </Heading>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Tracked expenses</Text>
                <Heading size="h3">
                  {formatMoney(
                    vehicle.economics.trackedExpenseMinorUnits,
                    vehicle.economics.valuationCurrency ?? acquisition?.currency ?? estimate?.currency ?? null,
                    locale,
                  )}
                </Heading>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Profit / loss</Text>
                <Heading size="h3">
                  {formatMoney(
                    vehicle.economics.profitMinorUnits,
                    vehicle.economics.valuationCurrency ?? acquisition?.currency ?? estimate?.currency ?? null,
                    locale,
                  )}
                </Heading>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Estimated current value</Text>
                <Heading size="h3">
                  {vehicle.economics.currentEstimatedValueMinorUnits !== null &&
                  vehicle.economics.currentEstimatedValueMinorUnits !== undefined
                    ? formatMoney(
                        vehicle.economics.currentEstimatedValueMinorUnits,
                        vehicle.economics.valuationCurrency ?? estimate?.currency ?? acquisition?.currency ?? null,
                        locale,
                      )
                    : 'Not recorded'}
                </Heading>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/55">
            <CardHeader>
              <CardTitle>Assignment summary / history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Text>Total assignments: {vehicle.assignmentSummary.totalAssignments}</Text>
              <Text>Active assignments: {vehicle.assignmentSummary.activeAssignments}</Text>
              <Text>
                Latest assignment:{' '}
                {vehicle.assignmentSummary.latestAssignmentId
                  ? `${vehicle.assignmentSummary.latestAssignmentId} (${vehicle.assignmentSummary.latestAssignmentStatus ?? 'unknown'})`
                  : 'None'}
              </Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Text tone="muted">{vehicle.maintenanceSummary}</Text>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <Text tone="muted">Due now</Text>
                  <Heading size="h3">{vehicle.maintenanceDue.dueCount}</Heading>
                </div>
                <div className="space-y-1">
                  <Text tone="muted">Overdue</Text>
                  <Heading size="h3">{vehicle.maintenanceDue.overdueCount}</Heading>
                </div>
                <div className="space-y-1">
                  <Text tone="muted">Next due</Text>
                  <Text>{formatDate(vehicle.maintenanceDue.nextDueAt, locale)}</Text>
                </div>
              </div>
              <div className="space-y-2">
                <Text tone="muted">Active schedules</Text>
                {vehicle.maintenanceSchedules.length === 0 ? (
                  <Text tone="muted">No preventive maintenance schedule has been configured yet.</Text>
                ) : (
                  <div className="space-y-2">
                    {vehicle.maintenanceSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-white px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <Heading size="h3">{schedule.scheduleType.replaceAll('_', ' ')}</Heading>
                          <Badge tone={schedule.isActive ? 'success' : 'warning'}>
                            {schedule.isActive ? 'active' : 'paused'}
                          </Badge>
                        </div>
                        <Text tone="muted">
                          Next due {formatDate(schedule.nextDueAt, locale)}
                          {schedule.nextDueOdometerKm ? ` or ${schedule.nextDueOdometerKm.toLocaleString(locale)} km` : ''}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Text tone="muted">Maintenance activity timeline</Text>
                {vehicle.maintenanceEvents.length === 0 ? (
                  <Text tone="muted">No maintenance activity has been logged yet.</Text>
                ) : (
                  <div className="space-y-2">
                    {vehicle.maintenanceEvents.slice(0, 6).map((event) => (
                      <div
                        key={event.id}
                        className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-white px-4 py-3"
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
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Text tone="muted">Inspection history</Text>
                {vehicle.inspections.length === 0 ? (
                  <Text tone="muted">No inspections have been logged yet.</Text>
                ) : (
                  <div className="space-y-2">
                    {vehicle.inspections.slice(0, 6).map((inspection) => (
                      <div
                        key={inspection.id}
                        className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-white px-4 py-3"
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
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Text tone="muted">Incident log</Text>
                {vehicle.incidents.length === 0 ? (
                  <Text tone="muted">No incidents have been recorded for this vehicle.</Text>
                ) : (
                  <div className="space-y-2">
                    {vehicle.incidents.slice(0, 6).map((incident) => (
                      <div
                        key={incident.id}
                        className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-white px-4 py-3"
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
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <VehicleDetailActions vehicle={vehicle} />
        </div>
      </div>
    </TenantAppShell>
  );
}
