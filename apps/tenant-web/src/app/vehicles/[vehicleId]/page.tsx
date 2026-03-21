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
            <CardContent>
              <Text tone="muted">{vehicle.maintenanceSummary}</Text>
            </CardContent>
          </Card>

          <VehicleDetailActions vehicle={vehicle} />
        </div>
      </div>
    </TenantAppShell>
  );
}
