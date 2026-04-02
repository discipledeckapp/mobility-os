import Link from 'next/link';
import type { Route } from 'next';
import { Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getOperationalReadinessReport,
  getTenantApiToken,
  type FleetRecord,
  type VehicleRecord,
  listFleets,
  listVehicles,
} from '../../lib/api-core';
import { importVehiclesCsvAction } from './actions';
import { VehicleRecordsPanel } from './vehicle-records-panel';

function getFriendlyVehicleRegistryErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'We could not load the vehicle registry right now.';
  }

  const message = error.message.trim();
  if (message === 'Internal server error' || message === 'api-core returned status 500') {
    return 'We could not load the vehicle registry right now. Try refreshing. If the problem persists, verify that api-core is running on port 3001.';
  }

  return message;
}

export default async function VehiclesPage() {
  let vehicles: VehicleRecord[] = [];
  let fleets: FleetRecord[] = [];
  let attentionCount = 0;
  let maintenanceCount = 0;
  let inspectionCount = 0;
  let errorMessage: string | null = null;

  try {
    const token = await getTenantApiToken().catch(() => undefined);
    const [vehiclesResult, fleetsResult, readinessReport] = await Promise.all([
      listVehicles({ limit: 200 }, token),
      listFleets(token),
      getOperationalReadinessReport(token),
    ]);
    vehicles = vehiclesResult.data;
    fleets = fleetsResult;
    maintenanceCount = readinessReport.vehicles.filter((vehicle) => vehicle.status === 'maintenance').length;
    inspectionCount = readinessReport.vehicles.filter((vehicle) => vehicle.status === 'inspection').length;
    attentionCount = readinessReport.vehicles.filter((vehicle) =>
      ['maintenance', 'inspection', 'inactive'].includes(vehicle.status),
    ).length;
  } catch (error) {
    errorMessage = getFriendlyVehicleRegistryErrorMessage(error);
  }

  return (
    <TenantAppShell
      description="Search and control the organisation vehicle registry, then drill into each asset for identification, valuation, assignment history, and VIN context."
      eyebrow="Assets"
      title="Vehicles"
    >
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Vehicles needing attention</CardTitle>
              <Text tone="muted">
                See which vehicles are blocked by maintenance, inspection, or inactive status before you work the registry.
              </Text>
            </div>
            <Link href={'/vehicles/health' as Route}>
              <span className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50">
                Open Vehicle Health
              </span>
            </Link>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4">
              <Text tone="muted">Needs attention</Text>
              <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">{attentionCount}</p>
            </div>
            <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4">
              <Text tone="muted">Maintenance queue</Text>
              <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">{maintenanceCount}</p>
            </div>
            <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4">
              <Text tone="muted">Inspection queue</Text>
              <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">{inspectionCount}</p>
            </div>
          </CardContent>
        </Card>

        <VehicleRecordsPanel
          errorMessage={errorMessage}
          exportHref="/api/download/vehicles-export"
          fleets={fleets}
          importAction={importVehiclesCsvAction}
          templateHref="/api/download/vehicle-import-template"
          vehicles={vehicles}
        />
      </div>
    </TenantAppShell>
  );
}
