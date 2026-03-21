import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import { type FleetRecord, type VehicleRecord, listFleets, listVehicles } from '../../lib/api-core';
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
      <VehicleRecordsPanel errorMessage={errorMessage} fleets={fleets} vehicles={vehicles} />
    </TenantAppShell>
  );
}
