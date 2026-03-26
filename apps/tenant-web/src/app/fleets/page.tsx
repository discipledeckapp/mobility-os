import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getFleet,
  listBusinessEntities,
  listDrivers,
  listFleets,
  listOperatingUnits,
  listVehicles,
} from '../../lib/api-core';

type FleetsPageProps = {
  searchParams?: Promise<{
    fleetId?: string;
  }>;
};

function getStatusTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'inactive') return 'warning';
  return 'neutral';
}

export default async function FleetsPage({ searchParams }: FleetsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const fleets = await listFleets();
  const selectedFleetId = resolvedSearchParams.fleetId ?? fleets[0]?.id ?? null;
  const [selectedFleet, drivers, vehicles, operatingUnits, entities] = await Promise.all([
    selectedFleetId ? getFleet(selectedFleetId) : Promise.resolve(null),
    selectedFleetId ? listDrivers({ fleetId: selectedFleetId, limit: 200 }) : Promise.resolve({ data: [], total: 0, page: 1, limit: 200 }),
    selectedFleetId ? listVehicles({ fleetId: selectedFleetId, limit: 200 }) : Promise.resolve({ data: [], total: 0, page: 1, limit: 200 }),
    listOperatingUnits(),
    listBusinessEntities(),
  ]);

  const operatingUnit = selectedFleet
    ? operatingUnits.find((unit) => unit.id === selectedFleet.operatingUnitId) ?? null
    : null;
  const businessEntity = operatingUnit
    ? entities.find((entity) => entity.id === operatingUnit.businessEntityId) ?? null
    : null;

  return (
    <TenantAppShell
      description="Review fleet structure, assignment-ready assets, and the operating hierarchy behind each fleet."
      eyebrow="Structure"
      title="Fleets"
    >
      <div className="mb-6 flex justify-end">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
          href={'/fleets/new' as Route}
        >
          Add fleet
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Fleet registry</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Business model</TableHead>
                  <TableHead>Operating unit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fleets.map((fleet) => (
                  <TableRow key={fleet.id}>
                    <TableCell>
                      <Link
                        className="font-semibold text-[var(--mobiris-primary)] hover:underline"
                        href={`/fleets/${fleet.id}` as Route}
                      >
                        {fleet.name}
                      </Link>
                    </TableCell>
                    <TableCell>{fleet.businessModel}</TableCell>
                    <TableCell>
                      {operatingUnits.find((unit) => unit.id === fleet.operatingUnitId)?.name ??
                        fleet.operatingUnitId}
                    </TableCell>
                    <TableCell>
                      <Badge tone={getStatusTone(fleet.status)}>{fleet.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fleet detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFleet ? (
                <>
                  <div>
                    <Text tone="muted">Fleet</Text>
                    <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                      {selectedFleet.name}
                    </p>
                  </div>
                  <div>
                    <Text tone="muted">Operating unit</Text>
                    <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                      {operatingUnit?.name ?? selectedFleet.operatingUnitId}
                    </p>
                  </div>
                  <div>
                    <Text tone="muted">Business entity</Text>
                    <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                      {businessEntity?.name ?? 'Not resolved'}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 px-4 py-3">
                      <Text tone="muted">Drivers</Text>
                      <p className="mt-2 text-lg font-semibold text-[var(--mobiris-ink)]">
                        {drivers.total}
                      </p>
                    </div>
                    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 px-4 py-3">
                      <Text tone="muted">Vehicles</Text>
                      <p className="mt-2 text-lg font-semibold text-[var(--mobiris-ink)]">
                        {vehicles.total}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link
                      className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                      href={`/fleets/${selectedFleet.id}/edit` as Route}
                    >
                      Edit fleet
                    </Link>
                  </div>
                </>
              ) : (
                <Text>No fleets are available yet.</Text>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver roster snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {drivers.data.length === 0 ? (
                <Text>No drivers are currently assigned to this fleet.</Text>
              ) : (
                drivers.data.slice(0, 5).map((driver) => (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3"
                    key={driver.id}
                  >
                    <p className="text-sm font-semibold text-[var(--mobiris-ink)]">
                      {driver.firstName} {driver.lastName}
                    </p>
                    <Text tone="muted">{driver.status}</Text>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle roster snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicles.data.length === 0 ? (
                <Text>No vehicles are currently assigned to this fleet.</Text>
              ) : (
                vehicles.data.slice(0, 5).map((vehicle) => (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3"
                    key={vehicle.id}
                  >
                    <p className="text-sm font-semibold text-[var(--mobiris-ink)]">
                      {vehicle.tenantVehicleCode}
                    </p>
                    <Text tone="muted">
                      {vehicle.make} {vehicle.model} · {vehicle.status}
                    </Text>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantAppShell>
  );
}
