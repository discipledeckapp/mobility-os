import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  listDrivers,
  listFleets,
  type DriverRecord,
  type FleetRecord,
} from '../../lib/api-core';
import { DriverRecordsPanel } from './driver-records-panel';

function getFriendlyDriverRegistryErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'We could not load the driver registry right now.';
  }

  const message = error.message.trim();
  if (
    message === 'Internal server error' ||
    message === 'api-core returned status 500'
  ) {
    return 'We could not load the driver registry right now. Try refreshing. If the problem persists, verify that api-core is running on port 3001.';
  }

  return message;
}

export default async function DriversPage() {
  let drivers: DriverRecord[] = [];
  let fleets: FleetRecord[] = [];
  let errorMessage: string | null = null;

  try {
    const [driversResult, fleetsResult] = await Promise.all([
      listDrivers({ limit: 200 }),
      listFleets(),
    ]);
    drivers = driversResult.data;
    fleets = fleetsResult;
  } catch (error) {
    errorMessage = getFriendlyDriverRegistryErrorMessage(error);
  }

  return (
    <TenantAppShell
      description="Search and manage the organisation driver registry, then drill into each driver record for verification, review, assignment, and remittance context."
      eyebrow="Operators"
      title="Drivers"
    >
      <DriverRecordsPanel drivers={drivers} errorMessage={errorMessage} fleets={fleets} />
    </TenantAppShell>
  );
}
