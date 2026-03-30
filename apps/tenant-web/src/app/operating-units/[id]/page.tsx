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
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  getOperatingUnit,
  listAssignments,
  listBusinessEntities,
  listDrivers,
  listFleets,
  listVehicles,
} from '../../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../../lib/vehicle-display';

type OperatingUnitDetailPageProps = {
  params: Promise<{
    id: string;
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

export default async function OperatingUnitDetailPage({
  params,
}: OperatingUnitDetailPageProps) {
  const { id } = await params;
  const [operatingUnit, businessEntities, fleets, driversPage, vehiclesPage, assignmentsPage] =
    await Promise.all([
      getOperatingUnit(id),
      listBusinessEntities(),
      listFleets(),
      listDrivers({ limit: 500 }),
      listVehicles({ limit: 500 }),
      listAssignments({ limit: 500 }),
    ]);

  const drivers = driversPage.data.filter((driver) => driver.operatingUnitId === id);
  const vehicles = vehiclesPage.data.filter((vehicle) => vehicle.operatingUnitId === id);
  const unitFleets = fleets.filter((fleet) => fleet.operatingUnitId === id);
  const unitAssignments = assignmentsPage.data.filter((assignment) => assignment.operatingUnitId === id);
  const parentEntity =
    businessEntities.find((entity) => entity.id === operatingUnit.businessEntityId) ?? null;

  return (
    <TenantAppShell
      description="Review hierarchy coverage, dispatch posture, and linked fleets inside this operating unit."
      eyebrow="Structure"
      title={operatingUnit.name}
    >
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.35)]">
          <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Text tone="strong">{operatingUnit.name}</Text>
                <Badge tone={getStatusTone(operatingUnit.status)}>{operatingUnit.status}</Badge>
              </div>
              <Text tone="muted">
                Parent business entity: {parentEntity?.name ?? operatingUnit.businessEntityId}
              </Text>
              <Text tone="muted">
                Operating units define local execution boundaries before fleets, drivers, vehicles, and assignments are attached.
              </Text>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold text-[var(--mobiris-ink)] transition-all hover:border-slate-300 hover:bg-slate-50"
                href={`/operating-units/${encodeURIComponent(id)}/edit` as Route}
              >
                Edit operating unit
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all hover:bg-[var(--mobiris-primary-dark)]"
                href={`/fleets/new?operatingUnitId=${encodeURIComponent(id)}` as Route}
              >
                Add fleet
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><CardHeader><CardDescription>Fleets</CardDescription><CardTitle>{unitFleets.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Drivers</CardDescription><CardTitle>{drivers.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Vehicles</CardDescription><CardTitle>{vehicles.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Active assignments</CardDescription><CardTitle>{unitAssignments.filter((assignment) => assignment.status === 'active').length}</CardTitle></CardHeader></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Linked fleets</CardTitle>
              <CardDescription>
                Fleets currently attached to this operating unit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {unitFleets.length > 0 ? (
                unitFleets.map((fleet) => (
                  <Link
                    className="block rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3 transition-all hover:border-slate-300 hover:bg-white"
                    href={`/fleets/${encodeURIComponent(fleet.id)}` as Route}
                    key={fleet.id}
                  >
                    <Text tone="strong">{fleet.name}</Text>
                    <Text tone="muted">
                      {fleet.businessModel} · {fleet.status}
                    </Text>
                  </Link>
                ))
              ) : (
                <Text tone="muted">No fleets are linked to this operating unit yet.</Text>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispatch posture</CardTitle>
              <CardDescription>
                Quick read on staffing, asset coverage, and live assignment pressure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                <Text tone="strong">
                  {drivers.length > 0 && vehicles.length > 0
                    ? 'Staffing and asset coverage exist'
                    : 'Coverage is incomplete'}
                </Text>
                <Text tone="muted">
                  {drivers.length} drivers · {vehicles.length} vehicles ·{' '}
                  {unitAssignments.filter((assignment) =>
                    ['pending_driver_confirmation', 'driver_action_required', 'pending'].includes(
                      assignment.status,
                    ),
                  ).length}{' '}
                  assignments needing attention.
                </Text>
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                <Text tone="strong">Recent vehicles</Text>
                <Text tone="muted">
                  {vehicles.length > 0
                    ? vehicles
                        .slice(0, 3)
                        .map((vehicle) => getVehiclePrimaryLabel(vehicle))
                        .join(', ')
                    : 'No vehicles are attached yet.'}
                </Text>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantAppShell>
  );
}
