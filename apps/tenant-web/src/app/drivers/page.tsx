import Link from 'next/link';
import { Card, CardContent, Text } from '@mobility-os/ui';
import { CsvBulkImportCard } from '../../components/csv-bulk-import-card';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getTenantMe,
  getTenantApiToken,
  listDrivers,
  listFleets,
  type DriverRecord,
  type FleetRecord,
  type TenantRecord,
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
  let tenant: TenantRecord | null = null;
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
    const [driversResult, fleetsResult, tenantResult] = await Promise.all([
      listDrivers({
        page,
        limit: pageSize,
        ...(q ? { q } : {}),
        ...(fleetId ? { fleetId } : {}),
        ...(status ? { status } : {}),
        ...(identityStatus ? { identityStatus } : {}),
      }, token),
      listFleets(token),
      getTenantMe(token).catch(() => null),
    ]);
    totalDrivers = driversResult.total;
    filteredDrivers = driversResult.total;
    fleets = fleetsResult;
    drivers = driversResult.data;
    tenant = tenantResult;
    if (!q && !fleetId && !status && !identityStatus) {
      filteredDrivers = totalDrivers;
    }
  } catch (error) {
    errorMessage = getFriendlyDriverRegistryErrorMessage(error);
  }

  const verificationTierLabel = tenant?.verificationTierLabel ?? 'Basic Identity';
  const verificationTierDescription =
    tenant?.verificationTierDescription ?? 'Identity checks required before a driver is cleared to operate.';
  const documentsEnabled = (tenant?.requiredDriverDocumentSlugs?.length ?? 0) > 0;
  const verificationChecklist = [
    'Identity verification',
    tenant?.requireGuarantorVerification || tenant?.requireGuarantor ? 'Guarantor verification' : null,
    documentsEnabled ? 'Required driver documents' : null,
  ].filter(Boolean) as string[];

  return (
    <TenantAppShell
      description="See which drivers are ready to operate, which ones need attention, and what the current verification tier requires."
      eyebrow="Operators"
      title="Drivers"
    >
      <Card className="mb-6 overflow-hidden border-slate-200 bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(239,246,255,0.95)_45%,rgba(219,234,254,0.84))] shadow-[0_22px_48px_-34px_rgba(37,99,235,0.34)]">
        <CardContent className="space-y-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
                Verification level
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                {verificationTierLabel}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {verificationTierDescription}
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_18px_32px_-18px_rgba(37,99,235,0.72)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
              href="/drivers/new"
            >
              Add driver
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {verificationChecklist.map((item) => (
              <div
                className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
        showDocuments={documentsEnabled}
        tenantVerificationTierLabel={verificationTierLabel}
        totalDrivers={totalDrivers}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <CsvBulkImportCard
          id="bulk-import"
          checkboxLabel="Send self-verification link after importing each driver"
          checkboxName="autoSendSelfServiceLink"
          description="Use bulk import when you already have a prepared roster and want to upload drivers in one pass."
          exportHref="/api/download/drivers-export"
          formAction={importDriversCsvAction}
          templateHref="/api/download/driver-import-template"
          title="Add drivers in bulk"
        />
        {documentsEnabled ? (
          <Card className="border-slate-200 bg-white">
            <CardContent className="space-y-3 py-6">
              <Text tone="strong">Document review queue</Text>
              <Text tone="muted">
                Review uploaded driver documents only when your verification setup requires them.
              </Text>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
                href="/drivers/review-queue"
              >
                Open document review queue
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </TenantAppShell>
  );
}
