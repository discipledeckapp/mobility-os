import Link from 'next/link';
import { CsvBulkImportCard } from '../../components/csv-bulk-import-card';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  TenantHeroPanel,
  TenantSectionHeader,
  TenantSurfaceCard,
  TenantToolbarPanel,
} from '../../features/shared/tenant-page-patterns';
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
      <TenantHeroPanel
        actions={
          <Link
            className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_18px_32px_-18px_rgba(37,99,235,0.72)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
            href="/drivers/new"
          >
            Add driver
          </Link>
        }
        description={verificationTierDescription}
        eyebrow="Verification level"
        title={verificationTierLabel}
      >
        <TenantToolbarPanel className="border-white/70 bg-white/55">
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
        </TenantToolbarPanel>
      </TenantHeroPanel>

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
        <div className="space-y-4" id="bulk-import">
          <TenantSectionHeader
            description="Use bulk import when you already have a prepared roster and want to upload drivers in one pass."
            eyebrow="Secondary workflow"
            title="Add drivers in bulk"
          />
          <CsvBulkImportCard
            checkboxLabel="Send self-verification link after importing each driver"
            checkboxName="autoSendSelfServiceLink"
            description="Use bulk import when you already have a prepared roster and want to upload drivers in one pass."
            exportHref="/api/download/drivers-export"
            formAction={importDriversCsvAction}
            templateHref="/api/download/driver-import-template"
            title="Add drivers in bulk"
          />
        </div>
        {documentsEnabled ? (
          <TenantSurfaceCard
            contentClassName="space-y-3 py-6"
            description="Review uploaded driver documents only when your verification setup requires them."
            title="Document review queue"
          >
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
              href="/drivers/review-queue"
            >
              Open document review queue
            </Link>
          </TenantSurfaceCard>
        ) : null}
      </div>
    </TenantAppShell>
  );
}
