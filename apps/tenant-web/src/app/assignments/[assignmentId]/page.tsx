import Link from 'next/link';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  getAssignment,
  listDrivers,
  listFleets,
  listVehicles,
  type DriverRecord,
  type FleetRecord,
  type VehicleRecord,
} from '../../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../../lib/vehicle-display';
import { AssignmentRowActions } from '../assignment-row-actions';

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'assigned' || status === 'created') return 'warning';
  if (status === 'cancelled') return 'danger';
  return 'neutral';
}

function formatDateTime(value?: string | null): string {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const [assignment, drivers, vehicles, fleets] = await Promise.all([
    getAssignment(assignmentId),
    listDrivers({ limit: 200 }).then((result) => result.data).catch(() => [] as DriverRecord[]),
    listVehicles({ limit: 200 }).then((result) => result.data).catch(() => [] as VehicleRecord[]),
    listFleets().catch(() => [] as FleetRecord[]),
  ]);

  const driver = drivers.find((record) => record.id === assignment.driverId);
  const vehicle = vehicles.find((record) => record.id === assignment.vehicleId);
  const fleet = fleets.find((record) => record.id === assignment.fleetId);

  return (
    <TenantAppShell
      description="Review assignment state, linked driver and vehicle, and lifecycle actions."
      eyebrow="Operations"
      title="Assignment detail"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <div className="space-y-6">
          <Card className="border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
            <CardHeader>
              <CardTitle>{assignment.id}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Text tone="muted">Current status</Text>
                <Badge tone={getStatusTone(assignment.status)}>{assignment.status}</Badge>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Started</Text>
                <Text>{formatDateTime(assignment.startedAt)}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Ended</Text>
                <Text>{formatDateTime(assignment.endedAt)}</Text>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignment profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Text tone="muted">Driver</Text>
                <Text>{driver ? `${driver.firstName} ${driver.lastName}` : assignment.driverId}</Text>
                {driver ? (
                  <Link
                    className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                    href={`/drivers/${driver.id}`}
                  >
                    Open driver record
                  </Link>
                ) : null}
              </div>
              <div className="space-y-1">
                <Text tone="muted">Vehicle</Text>
                <Text>{vehicle ? getVehiclePrimaryLabel(vehicle) : assignment.vehicleId}</Text>
                {vehicle ? (
                  <Link
                    className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                    href={`/vehicles/${vehicle.id}`}
                  >
                    Open vehicle record
                  </Link>
                ) : null}
              </div>
              <div className="space-y-1">
                <Text tone="muted">Fleet</Text>
                <Text>{fleet?.name ?? assignment.fleetId}</Text>
              </div>
              <div className="space-y-1">
                <Text tone="muted">Recorded notes</Text>
                <Text>{assignment.notes ?? 'No operator note recorded.'}</Text>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-sky-200 bg-sky-50/60">
            <CardHeader>
              <CardTitle>Assignment actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Text tone="muted">
                Use these controls to move the assignment through its lifecycle.
              </Text>
              <AssignmentRowActions
                assignmentId={assignment.id}
                status={assignment.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Text tone="muted">Assignment readiness</Text>
                <Heading size="h3">
                  {assignment.status === 'active'
                    ? 'Trip is in progress'
                    : assignment.status === 'assigned' || assignment.status === 'created'
                      ? 'Reserved and waiting to start'
                      : 'Lifecycle complete'}
                </Heading>
              </div>
              <Text tone="muted">
                Keep the registry as the main operational list. Use this detail page for
                status changes and to jump into the linked driver or vehicle record.
              </Text>
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantAppShell>
  );
}
