import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  listAssignments,
  listBusinessEntities,
  listDrivers,
  listFleets,
  listOperatingUnits,
  listVehicles,
} from '../../lib/api-core';

type OperatingUnitsPageProps = {
  searchParams?: Promise<{
    businessEntityId?: string;
  }>;
};

function getStatusTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'active') {
    return 'success';
  }
  if (status === 'inactive') {
    return 'warning';
  }
  return 'neutral';
}

export default async function OperatingUnitsPage({
  searchParams,
}: OperatingUnitsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedBusinessEntityId = resolvedSearchParams.businessEntityId;
  const [operatingUnits, businessEntities, fleets, driversPage, vehiclesPage, assignmentsPage] =
    await Promise.all([
      listOperatingUnits(selectedBusinessEntityId ? { businessEntityId: selectedBusinessEntityId } : {}),
      listBusinessEntities(),
      listFleets(),
      listDrivers({ limit: 500 }),
      listVehicles({ limit: 500 }),
      listAssignments({ limit: 500 }),
    ]);

  const drivers = driversPage.data;
  const vehicles = vehiclesPage.data;
  const assignments = assignmentsPage.data;
  const entityNameById = new Map(businessEntities.map((entity) => [entity.id, entity.name]));
  const cards = operatingUnits.map((unit) => {
    const unitFleets = fleets.filter((fleet) => fleet.operatingUnitId === unit.id);
    const unitFleetIds = new Set(unitFleets.map((fleet) => fleet.id));
    const unitDrivers = drivers.filter((driver) => driver.operatingUnitId === unit.id);
    const unitVehicles = vehicles.filter((vehicle) => vehicle.operatingUnitId === unit.id);
    const unitAssignments = assignments.filter((assignment) => assignment.operatingUnitId === unit.id);

    return {
      unit,
      fleetCount: unitFleets.length,
      driverCount: unitDrivers.length,
      vehicleCount: unitVehicles.length,
      activeAssignmentCount: unitAssignments.filter((assignment) => assignment.status === 'active').length,
      pendingAssignmentCount: unitAssignments.filter((assignment) =>
        ['pending_driver_confirmation', 'driver_action_required', 'pending'].includes(assignment.status),
      ).length,
      fleetNames: unitFleets.map((fleet) => fleet.name),
      hasDispatchCoverage: unitFleetIds.size > 0 && unitDrivers.length > 0 && unitVehicles.length > 0,
    };
  });

  return (
    <TenantAppShell
      description="Organise branches, depots, and execution zones beneath business entities, then review how fleets, drivers, and vehicles are distributed."
      eyebrow="Structure"
      title="Operating units"
    >
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.35)]">
          <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Text tone="strong">Operating-unit command center</Text>
              <Text tone="muted">
                Use operating units to separate depots, local execution teams, or city-level dispatch structure before fleets and assignments are attached.
              </Text>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold text-[var(--mobiris-ink)] transition-all hover:border-slate-300 hover:bg-slate-50"
                href={'/business-entities' as Route}
              >
                Open business entities
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all hover:bg-[var(--mobiris-primary-dark)]"
                href={'/operating-units/new' as Route}
              >
                Add operating unit
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><CardHeader><CardDescription>Operating units</CardDescription><CardTitle>{cards.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Linked fleets</CardDescription><CardTitle>{cards.reduce((sum, item) => sum + item.fleetCount, 0)}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Drivers in scope</CardDescription><CardTitle>{cards.reduce((sum, item) => sum + item.driverCount, 0)}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Vehicles in scope</CardDescription><CardTitle>{cards.reduce((sum, item) => sum + item.vehicleCount, 0)}</CardTitle></CardHeader></Card>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="space-y-3 py-8">
              <Text tone="strong">No operating units yet</Text>
              <Text tone="muted">
                Create an operating unit to group fleets and dispatch structure inside a business entity.
              </Text>
              <div>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white"
                  href={'/operating-units/new' as Route}
                >
                  Create operating unit
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {cards.map((item) => (
              <Link
                className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:border-slate-300"
                href={`/operating-units/${encodeURIComponent(item.unit.id)}` as Route}
                key={item.unit.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--mobiris-ink)]">
                      {item.unit.name}
                    </p>
                    <Text tone="muted">
                      {entityNameById.get(item.unit.businessEntityId) ?? item.unit.businessEntityId}
                    </Text>
                  </div>
                  <Badge tone={getStatusTone(item.unit.status)}>{item.unit.status}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Fleets</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">{item.fleetCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Drivers</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">{item.driverCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Vehicles</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">{item.vehicleCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Active assignments</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">{item.activeAssignmentCount}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Text tone="muted">
                    {item.hasDispatchCoverage
                      ? 'Dispatch coverage exists for this operating unit.'
                      : 'This operating unit still needs full dispatch coverage.'}
                  </Text>
                  <Text tone="muted">
                    {item.fleetNames.length > 0
                      ? `Fleets: ${item.fleetNames.slice(0, 3).join(', ')}${item.fleetNames.length > 3 ? '…' : ''}`
                      : 'No fleets linked yet'}
                  </Text>
                  <Text tone="muted">
                    {item.pendingAssignmentCount > 0
                      ? `${item.pendingAssignmentCount} assignment${item.pendingAssignmentCount > 1 ? 's' : ''} still need attention.`
                      : 'No pending assignment pressure right now.'}
                  </Text>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </TenantAppShell>
  );
}
