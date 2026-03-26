import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  getFleet,
  listBusinessEntities,
  listDrivers,
  listOperatingUnits,
  listVehicles,
  type DriverRecord,
  type VehicleRecord,
} from '../../../lib/api-core';

type FleetDetailPageProps = {
  params: Promise<{ id: string }>;
};

function getStatusTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'inactive') return 'warning';
  return 'neutral';
}

function getDriverStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'warning';
  if (status === 'terminated') return 'danger';
  return 'neutral';
}

export default async function FleetDetailPage({ params }: FleetDetailPageProps) {
  const { id } = await params;

  const [fleet, driversResult, vehiclesResult, operatingUnits, entities] = await Promise.all([
    getFleet(id),
    listDrivers({ fleetId: id, limit: 200 }).catch(() => ({ data: [] as DriverRecord[], total: 0, page: 1, limit: 200 })),
    listVehicles({ fleetId: id, limit: 200 }).catch(() => ({ data: [] as VehicleRecord[], total: 0, page: 1, limit: 200 })),
    listOperatingUnits().catch(() => []),
    listBusinessEntities().catch(() => []),
  ]);

  const operatingUnit = operatingUnits.find((u) => u.id === fleet.operatingUnitId) ?? null;
  const businessEntity = operatingUnit
    ? entities.find((e) => e.id === operatingUnit.businessEntityId) ?? null
    : null;

  const drivers = driversResult.data;
  const vehicles = vehiclesResult.data;
  const activeDrivers = drivers.filter((d) => d.status === 'active');
  const activeVehicles = vehicles.filter((v) => v.status === 'active');

  return (
    <TenantAppShell
      description={`Vehicles, drivers, and operational state for ${fleet.name}.`}
      eyebrow="Structure"
      title={fleet.name}
    >
      <div className="space-y-6">
        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link className="hover:text-[var(--mobiris-primary-dark)] hover:underline" href="/fleets">
              Fleets
            </Link>
            <span>/</span>
            <span className="font-medium text-[var(--mobiris-ink)]">{fleet.name}</span>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-ink)] hover:bg-slate-50"
            href={`/fleets/${id}/edit` as Route}
          >
            Edit fleet
          </Link>
        </div>

        {/* Summary hero */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
            <div className="h-0.5 bg-[var(--mobiris-primary)]" />
            <div className="space-y-1 px-5 py-4">
              <Text tone="muted">Status</Text>
              <div className="mt-2">
                <Badge tone={getStatusTone(fleet.status)}>{fleet.status}</Badge>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-emerald-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
            <div className="h-0.5 bg-emerald-400" />
            <div className="space-y-1 px-5 py-4">
              <Text tone="muted">Active drivers</Text>
              <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                {activeDrivers.length}
              </p>
              <Text tone="muted">of {drivers.length} total</Text>
            </div>
          </div>
          <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-sky-200 bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
            <div className="h-0.5 bg-sky-400" />
            <div className="space-y-1 px-5 py-4">
              <Text tone="muted">Active vehicles</Text>
              <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                {activeVehicles.length}
              </p>
              <Text tone="muted">of {vehicles.length} total</Text>
            </div>
          </div>
          <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]">
            <div className="h-0.5 bg-slate-300" />
            <div className="space-y-1 px-5 py-4">
              <Text tone="muted">Business model</Text>
              <p className="mt-2 text-sm font-semibold text-[var(--mobiris-ink)]">
                {fleet.businessModel}
              </p>
            </div>
          </div>
        </div>

        {/* Fleet identity */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Text tone="muted">Fleet name</Text>
              <Heading size="h3">{fleet.name}</Heading>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Operating unit</Text>
              <Text>{operatingUnit?.name ?? fleet.operatingUnitId}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Business entity</Text>
              <Text>{businessEntity?.name ?? 'Not resolved'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Business model</Text>
              <Text>{fleet.businessModel}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Status</Text>
              <Badge tone={getStatusTone(fleet.status)}>{fleet.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vehicles ({vehicles.length})</CardTitle>
              <Link
                className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                href={`/vehicles?fleetId=${encodeURIComponent(id)}` as Route}
              >
                View all vehicles →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <div className="flex h-28 items-center justify-center rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-[var(--mobiris-border)] bg-slate-50">
                <Text tone="muted">No vehicles are assigned to this fleet yet.</Text>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Make / Model</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow className="cursor-pointer hover:bg-slate-50/80" key={vehicle.id}>
                      <TableCell>
                        <Link
                          className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/vehicles/${vehicle.id}` as Route}
                        >
                          {vehicle.tenantVehicleCode}
                        </Link>
                        <p className="text-xs text-slate-400">{vehicle.vehicleType}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-[var(--mobiris-ink)]">
                          {vehicle.make} {vehicle.model}
                          {vehicle.trim ? ` ${vehicle.trim}` : ''}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">{vehicle.plate ?? '—'}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">{vehicle.year}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {vehicle.color ? (
                            <span
                              className="inline-block h-3.5 w-3.5 rounded-full border border-slate-200"
                              style={{ backgroundColor: vehicle.color.toLowerCase() }}
                            />
                          ) : null}
                          <p className="text-sm text-slate-600">{vehicle.color ?? '—'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge tone={getStatusTone(vehicle.status)}>{vehicle.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Drivers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Drivers ({drivers.length})</CardTitle>
              <Link
                className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                href={`/drivers?fleetId=${encodeURIComponent(id)}` as Route}
              >
                View all drivers →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {drivers.length === 0 ? (
              <div className="flex h-28 items-center justify-center rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-[var(--mobiris-border)] bg-slate-50">
                <Text tone="muted">No drivers are assigned to this fleet yet.</Text>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Identity</TableHead>
                    <TableHead>Readiness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow className="cursor-pointer hover:bg-slate-50/80" key={driver.id}>
                      <TableCell>
                        <Link
                          className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/drivers/${driver.id}` as Route}
                        >
                          {driver.firstName} {driver.lastName}
                        </Link>
                        <p className="text-xs text-slate-400">{driver.email ?? ''}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">{driver.phone}</p>
                      </TableCell>
                      <TableCell>
                        <Badge tone={getDriverStatusTone(driver.status)}>{driver.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={
                            driver.identityStatus === 'verified'
                              ? 'success'
                              : driver.identityStatus === 'pending_verification'
                                ? 'warning'
                                : driver.identityStatus === 'failed'
                                  ? 'danger'
                                  : 'neutral'
                          }
                        >
                          {driver.identityStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={
                            driver.activationReadiness === 'ready'
                              ? 'success'
                              : driver.activationReadiness === 'partially_ready'
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {driver.activationReadiness === 'ready'
                            ? 'Ready'
                            : driver.activationReadiness === 'partially_ready'
                              ? 'Partial'
                              : 'Not ready'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </TenantAppShell>
  );
}
