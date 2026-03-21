import {
  Badge,
  Card,
  CardContent,
  CardDescription,
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
  getTenantMe,
  listFleets,
  listDrivers,
  listAssignments,
  listRemittances,
  listVehicles,
  type AssignmentRecord,
  type DriverRecord,
  type FleetRecord,
  type RemittanceRecord,
  type VehicleRecord,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';
import { getVehiclePrimaryLabel } from '../../lib/vehicle-display';
import { CreateRemittanceForm } from './create-remittance-form';
import { RemittanceRowActions } from './remittance-row-actions';

function formatAmount(amountMinorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(dateString: string, locale: string): string {
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return dateString;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return dateString;
  }

  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    dateStyle: 'medium',
  });
}

export default async function RemittancePage() {
  let remittances: RemittanceRecord[] = [];
  let assignments: AssignmentRecord[] = [];
  let drivers: DriverRecord[] = [];
  let vehicles: VehicleRecord[] = [];
  let fleets: FleetRecord[] = [];
  let errorMessage: string | null = null;
  let helperNote: string | null = null;
  let fleetError: string | null = null;
  let locale = 'en-US';

  try {
    const tenant = await getTenantMe();
    locale = getFormattingLocale(tenant.country);
  } catch {
    locale = 'en-US';
  }

  try {
    remittances = (await listRemittances({ limit: 200 })).data;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : 'Unable to load remittance.';
  }

  const assignmentsResult = await Promise.resolve()
    .then(() => listAssignments({ limit: 200 }))
    .catch((error) => error);

  if (assignmentsResult instanceof Error) {
    helperNote =
      'Assignment quick-picks are unavailable because live assignment data could not be loaded.';
  } else {
    assignments = assignmentsResult.data;
  }

  const [driversResult, vehiclesResult, fleetsResult] = await Promise.allSettled([
    (async () => listDrivers({ limit: 200 }))(),
    (async () => listVehicles({ limit: 200 }))(),
    (async () => listFleets())(),
  ]);

  if (driversResult.status === 'fulfilled') {
    drivers = driversResult.value.data;
  } else {
    const driverNote =
      'Driver labels are unavailable because live driver data could not be loaded.';
    helperNote = helperNote ? `${helperNote} ${driverNote}` : driverNote;
  }

  if (vehiclesResult.status === 'fulfilled') {
    vehicles = vehiclesResult.value.data;
  } else {
    const vehicleNote =
      'Vehicle labels are unavailable because live vehicle data could not be loaded.';
    helperNote = helperNote ? `${helperNote} ${vehicleNote}` : vehicleNote;
  }

  if (fleetsResult.status === 'fulfilled') {
    fleets = fleetsResult.value;
  } else {
    fleetError =
      fleetsResult.reason instanceof Error
        ? fleetsResult.reason.message
        : 'Live fleet data could not be loaded.';
  }

  const assignmentLabels = new Map(
    assignments.map((assignment) => [assignment.id, assignment.id]),
  );
  const driverLabels = new Map(
    drivers.map((driver) => [driver.id, `${driver.firstName} ${driver.lastName}`]),
  );
  const vehicleLabels = new Map(
    vehicles.map((vehicle) => [vehicle.id, getVehiclePrimaryLabel(vehicle)]),
  );

  return (
    <TenantAppShell
      description="Daily collections recording and reconciliation for transport operators."
      eyebrow="Collections"
      title="Remittance"
    >
      <CreateRemittanceForm
        fleetError={fleetError}
        fleets={fleets}
        activeAssignments={assignments.filter(
          (assignment) => assignment.status === 'active',
        )}
        drivers={drivers}
        vehicles={vehicles}
        helperNote={helperNote}
      />

      <Card>
        <CardHeader>
          <CardTitle>Remittance records</CardTitle>
          <CardDescription>
            All remittance records for this tenant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage ? (
            <Text>{errorMessage}</Text>
          ) : remittances.length === 0 ? (
            <Text>No remittance records found for this tenant yet.</Text>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remittances.map((remittance) => (
                  <TableRow key={remittance.id}>
                    <TableCell>
                      <Badge
                        tone={
                          remittance.status === 'confirmed'
                            ? 'success'
                            : remittance.status === 'disputed'
                              ? 'danger'
                              : remittance.status === 'waived'
                                ? 'neutral'
                                : 'warning'
                        }
                      >
                        {remittance.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Text>
                          {assignmentLabels.get(remittance.assignmentId) ?? remittance.assignmentId}
                        </Text>
                        <Text tone="muted">{remittance.assignmentId}</Text>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Text>{driverLabels.get(remittance.driverId) ?? remittance.driverId}</Text>
                        <Text tone="muted">{remittance.driverId}</Text>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Text>{vehicleLabels.get(remittance.vehicleId) ?? remittance.vehicleId}</Text>
                        <Text tone="muted">{remittance.vehicleId}</Text>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatAmount(
                        remittance.amountMinorUnits,
                        remittance.currency,
                        locale,
                      )}
                    </TableCell>
                    <TableCell>{formatDate(remittance.dueDate, locale)}</TableCell>
                    <TableCell>
                      <RemittanceRowActions
                        remittanceId={remittance.id}
                        status={remittance.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}
