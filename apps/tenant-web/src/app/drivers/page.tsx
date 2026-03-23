import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  listDrivers,
  listFleets,
  type DriverRecord,
  type FleetRecord,
} from '../../lib/api-core';
import { DriverRecordsPanel } from './driver-records-panel';

const DRIVER_PAGE_LIMIT = 200;

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
  let totalDrivers = 0;
  let fleets: FleetRecord[] = [];
  let errorMessage: string | null = null;

  try {
    const [driversResult, fleetsResult] = await Promise.all([
      listDrivers({ limit: DRIVER_PAGE_LIMIT }),
      listFleets(),
    ]);
    totalDrivers = driversResult.total;
    fleets = fleetsResult;

    if (driversResult.total > driversResult.data.length) {
      const totalPages = Math.ceil(driversResult.total / DRIVER_PAGE_LIMIT);
      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          listDrivers({ page: index + 2, limit: DRIVER_PAGE_LIMIT }),
        ),
      );

      drivers = [
        ...driversResult.data,
        ...remainingPages.flatMap((pageResult) => pageResult.data),
      ];
    } else {
      drivers = driversResult.data;
    }
  } catch (error) {
    errorMessage = getFriendlyDriverRegistryErrorMessage(error);
  }

  return (
    <TenantAppShell
      description="Search and manage the organisation driver registry, then drill into each driver record for verification, review, assignment, and remittance context."
      eyebrow="Operators"
      title="Drivers"
    >
      <DriverRecordsPanel
        drivers={drivers}
        errorMessage={errorMessage}
        fleets={fleets}
        totalDrivers={totalDrivers}
      />
    </TenantAppShell>
  );
}
