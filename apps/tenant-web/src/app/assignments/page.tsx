import Link from 'next/link';
import { CsvBulkImportCard } from '../../components/csv-bulk-import-card';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  TenantEmptyStateCard,
  TenantHeroPanel,
  TenantSectionHeader,
} from '../../features/shared/tenant-page-patterns';
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

  const activeAssignments = assignments.filter((assignment) => assignment.status === 'active').length;
  const assignmentsNeedingAttention = assignments.filter((assignment) =>
    ['created', 'driver_action_required', 'pending_driver_confirmation'].includes(assignment.status),
  ).length;
  const remittanceBackedAssignments = assignments.filter(
    (assignment) => !assignment.paymentModel || assignment.paymentModel === 'remittance' || assignment.paymentModel === 'hire_purchase',
  ).length;

  return (
    <TenantAppShell
      description="Search, filter, and drill into assignment records before opening a separate creation or review flow."
      eyebrow="Operations"
      title="Assignments"
    >
      <TenantHeroPanel
        actions={
          !errorMessage ? (
            <Link
              className="inline-flex h-11 w-full items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_18px_32px_-18px_rgba(37,99,235,0.72)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)] sm:w-auto"
              href="/assignments/new"
            >
              Create assignment
            </Link>
          ) : null
        }
        description="Create new assignments, search by driver or vehicle, and review assignment status before opening detailed records."
        eyebrow="Assignment registry"
        title="Manage live assignments from one place."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700">
            {assignments.length} total assignment records
          </div>
          <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700">
            {activeAssignments} active right now
          </div>
          <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700">
            {assignmentsNeedingAttention} waiting for action or confirmation
          </div>
        </div>
        <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-700">
          On mobile, start with assignments waiting for action before scanning the full registry.
        </div>
      </TenantHeroPanel>

      {errorMessage ? (
        <TenantEmptyStateCard
          actions={
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
              href="/assignments"
            >
              Try again
            </Link>
          }
          description="Please try again shortly or contact support if this continues."
          title="Assignments are temporarily unavailable"
          tone="warning"
        />
      ) : (
        <>
          <AssignmentRecordsPanel
            assignments={assignments}
            drivers={drivers}
            fleets={fleets}
            remittanceBackedAssignments={remittanceBackedAssignments}
            vehicles={vehicles}
          />

          <section className="mt-8 space-y-4" id="bulk-import">
            <TenantSectionHeader
              description="Use bulk import when you already have a prepared assignment sheet and want to upload in one pass."
              eyebrow="Secondary workflow"
              title="Bulk import assignments"
            />
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
