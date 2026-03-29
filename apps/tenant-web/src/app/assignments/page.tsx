import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { CsvBulkImportCard } from '../../components/csv-bulk-import-card';
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
import { importAssignmentsCsvAction } from './actions';
import { AssignmentRecordsPanel } from './assignment-records-panel';

function getFriendlyAssignmentRegistryErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'We couldn’t load assignment records right now.';
  }

  const message = error.message.trim();
  if (
    message.includes('pending migration') ||
    message.includes('db:migrate') ||
    message.includes('required database table') ||
    message.includes('temporarily unavailable') ||
    message === 'Internal server error' ||
    message === 'api-core returned status 500' ||
    message === 'api-core returned status 503'
  ) {
    return 'Assignments are temporarily unavailable. Please try again shortly or contact support if this continues.';
  }

  return message;
}

export default async function AssignmentsPage() {
  let assignments: AssignmentRecord[] = [];
  let drivers: DriverRecord[] = [];
  let vehicles: VehicleRecord[] = [];
  let fleets: FleetRecord[] = [];
  let errorMessage: string | null = null;

  try {
    assignments = (await listAssignments({ limit: 200 })).data;
  } catch (error) {
    errorMessage = getFriendlyAssignmentRegistryErrorMessage(error);
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
      <div className="mb-6 rounded-[calc(var(--mobiris-radius-card)+0.1rem)] border border-slate-200 bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(239,246,255,0.95)_45%,rgba(219,234,254,0.84))] p-5 shadow-[0_22px_48px_-34px_rgba(37,99,235,0.36)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
              Assignment registry
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Manage live assignments from one place.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create new assignments, search by driver or vehicle, and review assignment status before opening detailed records.
            </p>
          </div>
          {!errorMessage ? (
            <Link
              className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_18px_32px_-18px_rgba(37,99,235,0.72)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
              href="/assignments/new"
            >
              Create assignment
            </Link>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <Card className="border-slate-200 bg-white shadow-[0_16px_36px_-26px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle>Assignments are temporarily unavailable</CardTitle>
            <CardDescription>
              We couldn&apos;t load assignment records right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Text tone="muted">
              Please try again shortly or contact support if this continues.
            </Text>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
                href="/assignments"
              >
                Try again
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <AssignmentRecordsPanel
            assignments={assignments}
            drivers={drivers}
            fleets={fleets}
            vehicles={vehicles}
          />

          <section className="mt-8 space-y-4" id="bulk-import">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Secondary workflow
              </p>
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                Bulk import assignments
              </h3>
              <p className="text-sm text-slate-500">
                Use bulk import when you already have a prepared assignment sheet and want to upload in one pass.
              </p>
            </div>
            <CsvBulkImportCard
              description="Import assignment records in bulk using fleet name, driver phone, and vehicle code matches. This can include remittance terms for each assignment."
              exportHref="/api/download/assignments-export"
              formAction={importAssignmentsCsvAction}
              templateHref="/api/download/assignment-import-template"
              title="Bulk import assignments"
            />
          </section>
        </>
      )}
    </TenantAppShell>
  );
}
