import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  listFleets,
  listAssignments,
  listDrivers,
  listVehicles,
  type AssignmentRecord,
  type DriverRecord,
  type FleetRecord,
  type VehicleRecord,
} from '../../lib/api-core';
import { AssignmentRecordsPanel } from './assignment-records-panel';

export default async function AssignmentsPage() {
  let assignments: AssignmentRecord[] = [];
  let drivers: DriverRecord[] = [];
  let vehicles: VehicleRecord[] = [];
  let fleets: FleetRecord[] = [];
  let errorMessage: string | null = null;

  try {
    assignments = (await listAssignments({ limit: 200 })).data;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Unable to load assignments.';
  }

  const [driversResult, vehiclesResult, fleetsResult] = await Promise.allSettled([
    (async () => listDrivers({ limit: 200 }))(),
    (async () => listVehicles({ limit: 200 }))(),
    (async () => listFleets())(),
  ]);

  if (driversResult.status === 'fulfilled') {
    drivers = driversResult.value.data;
  }

  if (vehiclesResult.status === 'fulfilled') {
    vehicles = vehiclesResult.value.data;
  }

  if (fleetsResult.status === 'fulfilled') {
    fleets = fleetsResult.value;
  }

  return (
    <TenantAppShell
      description="Search, filter, and drill into assignment records before opening a separate creation or review flow."
      eyebrow="Operations"
      title="Assignments"
    >
      <AssignmentRecordsPanel
        assignments={assignments}
        drivers={drivers}
        errorMessage={errorMessage}
        fleets={fleets}
        vehicles={vehicles}
      />
    </TenantAppShell>
  );
}
