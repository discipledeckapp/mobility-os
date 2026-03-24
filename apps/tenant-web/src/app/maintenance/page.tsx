import Link from 'next/link';
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
import { getOperationalReadinessReport, listFleets } from '../../lib/api-core';

function toneForStatus(status: string) {
  switch (status) {
    case 'maintenance':
    case 'inspection':
      return 'warning' as const;
    case 'inactive':
      return 'neutral' as const;
    default:
      return 'success' as const;
  }
}

export default async function MaintenancePage() {
  const [report, fleetsResult] = await Promise.all([getOperationalReadinessReport(), listFleets()]);
  const fleetNames = new Map(fleetsResult.map((fleet) => [fleet.id, fleet.name]));
  const maintenanceVehicles = report.vehicles.filter((vehicle) =>
    ['maintenance', 'inspection', 'inactive'].includes(vehicle.status),
  );

  return (
    <TenantAppShell
      description="Review vehicles moved into maintenance or inspection states and return them to service once cleared."
      eyebrow="Operations"
      title="Maintenance queue"
    >
      <Card>
        <CardHeader>
          <CardTitle>Vehicles needing maintenance attention</CardTitle>
          <Text tone="muted">
            Review vehicles already moved into maintenance or inspection-related states, then open
            the record to complete updates and return them to service.
          </Text>
        </CardHeader>
        <CardContent>
          {maintenanceVehicles.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Fleet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <Link
                        className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                        href={`/vehicles/${vehicle.id}`}
                      >
                        {vehicle.primaryLabel}
                      </Link>
                    </TableCell>
                    <TableCell>{fleetNames.get(vehicle.fleetId) ?? vehicle.fleetId}</TableCell>
                    <TableCell>
                      <Badge tone={toneForStatus(vehicle.status)}>{vehicle.status}</Badge>
                    </TableCell>
                    <TableCell>{vehicle.maintenanceSummary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <Text tone="strong">No vehicles in maintenance</Text>
              <Text tone="muted">
                Vehicles marked for maintenance or inspection will appear here.
              </Text>
            </div>
          )}
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}
