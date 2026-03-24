import { CsvBulkImportCard } from '../../components/csv-bulk-import-card';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import { type FleetRecord, type VehicleRecord, listFleets, listVehicles } from '../../lib/api-core';
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
  let errorMessage: string | null = null;

  try {
    const [vehiclesResult, fleetsResult] = await Promise.all([
      listVehicles({ limit: 200 }),
      listFleets(),
    ]);
    vehicles = vehiclesResult.data;
    fleets = fleetsResult;
  } catch (error) {
    errorMessage = getFriendlyVehicleRegistryErrorMessage(error);
  }

  return (
    <TenantAppShell
      description="Search and manage the organisation vehicle registry, then drill into each asset for identification, valuation, assignment, and VIN context."
      eyebrow="Assets"
      title="Vehicles"
    >
      <div className="mb-6">
        <CsvBulkImportCard
          description="Download the vehicle template, map your existing fleet inventory into it, and import vehicles in bulk. Subscription limits are enforced during import."
          exportHref="/api/download/vehicles-export"
          formAction={importVehiclesCsvAction}
          templateHref="/api/download/vehicle-import-template"
          title="Bulk import vehicles"
        />
      </div>
      <VehicleRecordsPanel errorMessage={errorMessage} fleets={fleets} vehicles={vehicles} />
    </TenantAppShell>
  );
}
