import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  listDrivers,
  listFleets,
  type DriverRecord,
  type FleetRecord,
} from '../../lib/api-core';
import { DriverRecordsPanel } from './driver-records-panel';

const DEFAULT_DRIVER_PAGE_SIZE = 20;

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

type DriversPageProps = {
  searchParams?: Promise<{
    q?: string;
    fleetId?: string;
    status?: string;
    identityStatus?: string;
    page?: string;
    pageSize?: string;
  }>;
};

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  let drivers: DriverRecord[] = [];
  let totalDrivers = 0;
  let filteredDrivers = 0;
  let fleets: FleetRecord[] = [];
  let errorMessage: string | null = null;

  const page = parsePositiveInteger(resolvedSearchParams.page, 1);
  const pageSize = Math.min(
    parsePositiveInteger(resolvedSearchParams.pageSize, DEFAULT_DRIVER_PAGE_SIZE),
    200,
  );
  const q = resolvedSearchParams.q?.trim() ?? '';
  const fleetId = resolvedSearchParams.fleetId?.trim() ?? '';
  const status = resolvedSearchParams.status?.trim() ?? '';
  const identityStatus = resolvedSearchParams.identityStatus?.trim() ?? '';

  try {
    const [driversResult, fleetsResult] = await Promise.all([
      listDrivers({
        page,
        limit: pageSize,
        ...(q ? { q } : {}),
        ...(fleetId ? { fleetId } : {}),
        ...(status ? { status } : {}),
        ...(identityStatus ? { identityStatus } : {}),
      }),
      listFleets(),
    ]);
    totalDrivers = driversResult.total;
    filteredDrivers = driversResult.total;
    fleets = fleetsResult;
    drivers = driversResult.data;
    if (!q && !fleetId && !status && !identityStatus) {
      filteredDrivers = totalDrivers;
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
        filteredDrivers={filteredDrivers}
        initialFleetId={fleetId}
        initialIdentityStatus={identityStatus}
        initialPage={page}
        initialPageSize={pageSize}
        initialSearchQuery={q}
        initialStatus={status}
        totalDrivers={totalDrivers}
      />
    </TenantAppShell>
  );
}
