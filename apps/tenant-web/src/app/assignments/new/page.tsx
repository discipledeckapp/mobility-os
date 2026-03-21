import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  listDrivers,
  listFleets,
  listVehicles,
  type DriverRecord,
  type FleetRecord,
  type VehicleRecord,
} from '../../../lib/api-core';
import { CreateAssignmentForm } from '../create-assignment-form';

export default async function NewAssignmentPage() {
  let drivers: DriverRecord[] = [];
  let vehicles: VehicleRecord[] = [];
  let fleets: FleetRecord[] = [];
  let helperNote: string | null = null;
  let fleetError: string | null = null;

  const [driversResult, vehiclesResult, fleetsResult] = await Promise.allSettled([
    (async () => listDrivers({ limit: 200 }))(),
    (async () => listVehicles({ limit: 200 }))(),
    (async () => listFleets())(),
  ]);

  if (driversResult.status === 'fulfilled') {
    drivers = driversResult.value.data;
  } else {
    helperNote =
      'Driver quick-picks are unavailable because live driver data could not be loaded.';
  }

  if (vehiclesResult.status === 'fulfilled') {
    vehicles = vehiclesResult.value.data;
  } else {
    const vehicleNote =
      'Vehicle quick-picks are unavailable because live vehicle data could not be loaded.';
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

  return (
    <TenantAppShell
      description="Create a new assignment after choosing a ready driver and an available vehicle."
      eyebrow="Operations"
      title="Create assignment"
    >
      <CreateAssignmentForm
        activeDrivers={drivers.filter((driver) => driver.status === 'active')}
        availableVehicles={vehicles.filter((vehicle) => vehicle.status === 'available')}
        fleetError={fleetError}
        fleets={fleets}
        helperNote={helperNote}
      />
    </TenantAppShell>
  );
}
