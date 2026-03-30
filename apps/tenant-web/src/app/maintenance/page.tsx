import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getOperationalReadinessReport,
  getTenantApiToken,
  listFleets,
} from '../../lib/api-core';

function toneForStatus(status: string) {
  switch (status) {
    case 'maintenance':
      return 'warning' as const;
    case 'inspection':
      return 'neutral' as const;
    case 'inactive':
      return 'danger' as const;
    default:
      return 'success' as const;
  }
}

function QueueSection({
  title,
  description,
  items,
  fleetNames,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  items: Array<{
    id: string;
    primaryLabel: string;
    fleetId: string;
    status: string;
    maintenanceSummary: string;
  }>;
  fleetNames: Map<string, string>;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? (
          items.map((vehicle) => (
            <div
              className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
              key={vehicle.id}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                    href={`/vehicles/${vehicle.id}` as Route}
                  >
                    {vehicle.primaryLabel}
                  </Link>
                  <Badge tone={toneForStatus(vehicle.status)}>{vehicle.status}</Badge>
                </div>
                <Text tone="muted">
                  Fleet: {fleetNames.get(vehicle.fleetId) ?? vehicle.fleetId}
                </Text>
                <Text tone="muted">
                  {vehicle.maintenanceSummary || 'Open the vehicle record to update maintenance or inspection details.'}
                </Text>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  href={`/vehicles/${vehicle.id}` as Route}
                >
                  Open vehicle
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <Text tone="strong">{emptyTitle}</Text>
            <Text tone="muted">{emptyDescription}</Text>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function MaintenancePage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const [report, fleetsResult] = await Promise.all([
    getOperationalReadinessReport(token),
    listFleets(token),
  ]);
  const fleetNames = new Map(fleetsResult.map((fleet) => [fleet.id, fleet.name]));
  const maintenanceVehicles = report.vehicles.filter((vehicle) => vehicle.status === 'maintenance');
  const inspectionVehicles = report.vehicles.filter((vehicle) => vehicle.status === 'inspection');
  const inactiveVehicles = report.vehicles.filter((vehicle) => vehicle.status === 'inactive');
  const blockedVehicles = report.vehicles.filter((vehicle) =>
    ['maintenance', 'inspection', 'inactive'].includes(vehicle.status),
  );

  return (
    <TenantAppShell
      description="Work the maintenance and inspection queue from one place, then jump back into each vehicle command center to record service, inspections, and return-to-service changes."
      eyebrow="Operations"
      title="Maintenance and inspections"
    >
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.35)]">
          <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Text tone="strong">Operations queue</Text>
              <Text tone="muted">
                Use this board to see which vehicles are already in maintenance, which are waiting on inspection, and which assets are drifting toward overdue service.
              </Text>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all hover:bg-[var(--mobiris-primary-dark)]"
              href={'/vehicles' as Route}
            >
              Open vehicle registry
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><CardHeader><CardDescription>In maintenance</CardDescription><CardTitle>{maintenanceVehicles.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Awaiting inspection</CardDescription><CardTitle>{inspectionVehicles.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Blocked assets</CardDescription><CardTitle>{blockedVehicles.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Inactive assets</CardDescription><CardTitle>{inactiveVehicles.length}</CardTitle></CardHeader></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <QueueSection
            description="Vehicles already in maintenance mode and needing service updates or return-to-service decisions."
            emptyDescription="Vehicles moved into maintenance will appear here."
            emptyTitle="No vehicles in maintenance"
            fleetNames={fleetNames}
            items={maintenanceVehicles}
            title="Maintenance queue"
          />
          <QueueSection
            description="Vehicles currently blocked on inspection or explicitly moved into inspection state."
            emptyDescription="Vehicles waiting on inspection review will appear here."
            emptyTitle="No vehicles awaiting inspection"
            fleetNames={fleetNames}
            items={inspectionVehicles}
            title="Inspection queue"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <QueueSection
            description="Vehicles currently blocked from normal operations because they are in maintenance, inspection, or inactive state."
            emptyDescription="No vehicles are currently blocked from operations."
            emptyTitle="No blocked assets"
            fleetNames={fleetNames}
            items={blockedVehicles}
            title="Blocked asset watchlist"
          />
          <QueueSection
            description="Vehicles manually marked inactive and needing a return-to-service or disposition decision."
            emptyDescription="No inactive vehicles need disposition review right now."
            emptyTitle="No inactive asset pressure"
            fleetNames={fleetNames}
            items={inactiveVehicles}
            title="Inactive asset review"
          />
        </div>
      </div>
    </TenantAppShell>
  );
}
