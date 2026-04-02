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
  getOperationalReadinessReport,
  getTenantApiToken,
  listFleets,
  listTenantInspections,
  listTenantWorkOrders,
  listVehicles,
} from '../../../lib/api-core';
import { MaintenanceWorkbench } from '../../maintenance/maintenance-workbench';
import { InspectionWorkbench } from '../../inspections/inspection-workbench';

function toneForStatus(status: string) {
  switch (status) {
    case 'maintenance':
      return 'warning' as const;
    case 'inspection':
      return 'neutral' as const;
    case 'inactive':
      return 'danger' as const;
    default:
      return 'success' as const;
  }
}

function QueueSection({
  title,
  description,
  items,
  fleetNames,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  items: Array<{
    id: string;
    primaryLabel: string;
    fleetId: string;
    status: string;
    maintenanceSummary: string;
  }>;
  fleetNames: Map<string, string>;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? (
          items.map((vehicle) => (
            <div
              className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
              key={vehicle.id}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                    href={`/vehicles/${vehicle.id}` as Route}
                  >
                    {vehicle.primaryLabel}
                  </Link>
                  <Badge tone={toneForStatus(vehicle.status)}>{vehicle.status}</Badge>
                </div>
                <Text tone="muted">
                  Fleet: {fleetNames.get(vehicle.fleetId) ?? vehicle.fleetId}
                </Text>
                <Text tone="muted">
                  {vehicle.maintenanceSummary || 'Open the vehicle record to update maintenance or inspection details.'}
                </Text>
              </div>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                href={`/vehicles/${vehicle.id}` as Route}
              >
                Open vehicle
              </Link>
            </div>
          ))
        ) : (
          <div className="rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <Text tone="strong">{emptyTitle}</Text>
            <Text tone="muted">{emptyDescription}</Text>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function VehicleHealthPage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const [report, fleetsResult, workOrdersPage, vehiclesPage, inspectionsPage] = await Promise.all([
    getOperationalReadinessReport(token),
    listFleets(token),
    listTenantWorkOrders({ limit: 100 }, token).catch(() => ({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    })),
    listVehicles({ limit: 200 }, token).catch(() => ({
      data: [],
      total: 0,
      page: 1,
      limit: 200,
    })),
    listTenantInspections({ limit: 100 }, token).catch(() => ({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    })),
  ]);

  const fleetNames = new Map(fleetsResult.map((fleet) => [fleet.id, fleet.name]));
  const vehicleLabels = new Map(
    vehiclesPage.data.map((vehicle) => [
      vehicle.id,
      vehicle.tenantVehicleCode || vehicle.systemVehicleCode,
    ]),
  );
  const maintenanceVehicles = report.vehicles.filter((vehicle) => vehicle.status === 'maintenance');
  const inspectionVehicles = report.vehicles.filter((vehicle) => vehicle.status === 'inspection');
  const attentionVehicles = report.vehicles.filter((vehicle) =>
    ['maintenance', 'inspection', 'inactive'].includes(vehicle.status),
  );
  const pendingWorkOrders = workOrdersPage.data.filter((item) =>
    ['pending', 'in_progress'].includes(item.status.toLowerCase()),
  );
  const highPriorityOrders = workOrdersPage.data.filter(
    (item) => item.priority.toLowerCase() === 'high',
  );
  const pendingInspectionReviews = inspectionsPage.data.filter((item) =>
    ['submitted', 'under_review', 'escalated'].includes(item.status),
  ).length;

  return (
    <TenantAppShell
      description="Review vehicles needing attention, work the inspection and maintenance queues, and return vehicles to service faster."
      eyebrow="Vehicles"
      title="Vehicle Health"
    >
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.35)]">
          <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Text tone="strong">Vehicle lifecycle health</Text>
              <Text tone="muted">
                Use this view to spot which vehicles need attention now, then jump into the vehicle record to clear service, inspection, or return-to-service work.
              </Text>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                href={'/vehicles' as Route}
              >
                Open all vehicles
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><CardHeader><CardDescription>Vehicles needing attention</CardDescription><CardTitle>{attentionVehicles.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Maintenance queue</CardDescription><CardTitle>{maintenanceVehicles.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Inspection queue</CardDescription><CardTitle>{inspectionVehicles.length}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Open work orders</CardDescription><CardTitle>{pendingWorkOrders.length}</CardTitle></CardHeader></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <QueueSection
            description="Vehicles currently blocked from normal operations because they are in maintenance, inspection, or inactive state."
            emptyDescription="No vehicles are currently blocked from operations."
            emptyTitle="No vehicles need attention right now"
            fleetNames={fleetNames}
            items={attentionVehicles}
            title="Vehicles needing attention"
          />
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Health signal</CardTitle>
              <CardDescription>
                Work the queues that directly affect vehicle availability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <Text tone="strong">Inspection review pressure</Text>
                <Text tone="muted">
                  {pendingInspectionReviews} inspection record{pendingInspectionReviews === 1 ? '' : 's'} still need review.
                </Text>
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <Text tone="strong">High-priority repairs</Text>
                <Text tone="muted">
                  {highPriorityOrders.length} work order{highPriorityOrders.length === 1 ? '' : 's'} are marked high priority.
                </Text>
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 px-4 py-4">
                <Text tone="strong">Return-to-service focus</Text>
                <Text tone="muted">
                  Clear maintenance and inspection blockers here before returning vehicles to active operations.
                </Text>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <QueueSection
            description="Vehicles already in maintenance mode and needing service updates or return-to-service decisions."
            emptyDescription="Vehicles moved into maintenance will appear here."
            emptyTitle="No vehicles in maintenance"
            fleetNames={fleetNames}
            items={maintenanceVehicles}
            title="Maintenance queue"
          />
          <QueueSection
            description="Vehicles currently blocked on inspection or explicitly moved into inspection state."
            emptyDescription="Vehicles waiting on inspection review will appear here."
            emptyTitle="No vehicles awaiting inspection"
            fleetNames={fleetNames}
            items={inspectionVehicles}
            title="Inspection queue"
          />
        </div>

        <Card className="border-slate-200 bg-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle>Maintenance work orders</CardTitle>
            <CardDescription>
              Repair work that still affects vehicle availability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workOrdersPage.data.length > 0 ? (
              workOrdersPage.data.map((order) => (
                <div
                  className="grid gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 lg:grid-cols-[1.15fr_0.9fr_auto]"
                  key={order.id}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                        href={`/vehicles/${order.vehicleId}` as Route}
                      >
                        {vehicleLabels.get(order.vehicleId) ?? order.vehicleId}
                      </Link>
                      <Badge tone={order.status.toLowerCase() === 'completed' ? 'success' : order.status.toLowerCase() === 'in_progress' ? 'warning' : 'neutral'}>
                        {order.status.replaceAll('_', ' ')}
                      </Badge>
                      <Badge tone={order.priority.toLowerCase() === 'high' ? 'danger' : order.priority.toLowerCase() === 'medium' ? 'warning' : 'neutral'}>
                        {order.priority.toLowerCase()} priority
                      </Badge>
                    </div>
                    <Text tone="muted">{order.issueDescription}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="strong">Estimated cost</Text>
                    <Text tone="muted">
                      {order.totalCostMinorUnits != null
                        ? `${order.currency ?? 'NGN'} ${(order.totalCostMinorUnits / 100).toFixed(2)}`
                        : 'Not costed yet'}
                    </Text>
                  </div>
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                    href={`/vehicles/${order.vehicleId}?tab=maintenance` as Route}
                  >
                    Open vehicle
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <Text tone="strong">No work orders recorded yet</Text>
                <Text tone="muted">
                  As maintenance jobs are created for vehicles, they will appear here with priority, status, and cost visibility.
                </Text>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200 bg-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle>Maintenance actions</CardTitle>
              <CardDescription>
                Create and progress repair work without leaving Vehicle Health.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaintenanceWorkbench
                vehicles={vehiclesPage.data}
                workOrders={workOrdersPage.data}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle>Inspection actions</CardTitle>
              <CardDescription>
                Capture fresh inspection outcomes for vehicles still on hold.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InspectionWorkbench inspections={inspectionsPage.data} vehicles={vehiclesPage.data} />
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantAppShell>
  );
}
