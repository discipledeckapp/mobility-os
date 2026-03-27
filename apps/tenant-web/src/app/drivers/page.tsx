import Link from 'next/link';
import { Card, CardContent, Text } from '@mobility-os/ui';
import { CsvBulkImportCard } from '../../components/csv-bulk-import-card';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getTenantApiToken,
  listDrivers,
  listFleets,
  type DriverRecord,
  type FleetRecord,
} from '../../lib/api-core';
import { DriverRecordsPanel } from './driver-records-panel';
import { importDriversCsvAction } from './actions';

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
    const token = await getTenantApiToken().catch(() => undefined);
    const [driversResult, fleetsResult] = await Promise.all([
      listDrivers({
        page,
        limit: pageSize,
        ...(q ? { q } : {}),
        ...(fleetId ? { fleetId } : {}),
        ...(status ? { status } : {}),
        ...(identityStatus ? { identityStatus } : {}),
      }, token),
      listFleets(token),
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
      description="Search and verify drivers in the organisation registry, then drill into each record for identity status, document compliance, assignment history, and remittance accountability."
      eyebrow="Operators"
      title="Drivers"
    >
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Text tone="strong">Need to activate drivers?</Text>
            <Text tone="muted">
              Open the readiness queue to review drivers who are still blocked on identity,
              documents, or approval before they become assignment-ready.
            </Text>
          </div>
          <Link
            className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
            href="/reports/readiness"
          >
            Open readiness queue
          </Link>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <CsvBulkImportCard
          id="bulk-import"
          checkboxLabel="Send self-verification link after importing each driver"
          checkboxName="autoSendSelfServiceLink"
          description="Use bulk import as the secondary path when you already have a prepared roster. Download the template, validate rows, and import in one pass."
          exportHref="/api/download/drivers-export"
          formAction={importDriversCsvAction}
          templateHref="/api/download/driver-import-template"
          title="Add drivers in bulk"
        />
        <Card className="border-slate-200 bg-white">
          <CardContent className="space-y-3 py-6">
            <Text tone="strong">Document review queue</Text>
            <Text tone="muted">
              Open the review queue to approve or reject uploaded documents and clear blocked drivers out of readiness.
            </Text>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
              href="/drivers/review-queue"
            >
              Open document review queue
            </Link>
          </CardContent>
        </Card>
      </div>

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
