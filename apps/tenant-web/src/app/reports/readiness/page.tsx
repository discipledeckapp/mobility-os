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
import Link from 'next/link';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  getTenantApiToken,
  getLicenceExpiryReport,
  getOperationalReadinessReport,
  getTenantMe,
  listFleets,
} from '../../../lib/api-core';
import { getFormattingLocale } from '../../../lib/locale';

function readinessTone(status: string): 'success' | 'warning' | 'danger' {
  if (status === 'ready') return 'success';
  if (status === 'partially_ready') return 'warning';
  return 'danger';
}

function readinessLabel(status: string): string {
  if (status === 'ready') return 'Ready';
  if (status === 'partially_ready') return 'Partially ready';
  return 'Not ready';
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export default async function ReadinessReportPage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const [report, licenceExpiry, fleets, tenant] = await Promise.all([
    getOperationalReadinessReport(token),
    getLicenceExpiryReport(token),
    listFleets(token).catch(() => []),
    getTenantMe(token).catch(() => null),
  ]);

  const locale = getFormattingLocale(tenant?.country);
  const fleetNames = new Map(fleets.map((fleet) => [fleet.id, fleet.name]));

  return (
    <TenantAppShell
      title="Readiness report"
      eyebrow="Insights"
      description="Operational readiness across drivers and vehicles, with licence expiry visibility."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Drivers ready</CardTitle>
            </CardHeader>
            <CardContent>
              <Heading size="h2">
                {report.drivers.filter((driver) => driver.activationReadiness === 'ready').length}
              </Heading>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Licence expiry due</CardTitle>
            </CardHeader>
            <CardContent>
              <Heading size="h2">
                {licenceExpiry.filter((item) => item.daysUntilExpiry <= 30).length}
              </Heading>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vehicles in maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <Heading size="h2">
                {report.vehicles.filter((vehicle) => vehicle.status === 'maintenance').length}
              </Heading>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Driver readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Fleet</TableHead>
                  <TableHead>Activation</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Licence expiry</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/drivers/${driver.id}`}
                        >
                          {driver.fullName}
                        </Link>
                        {driver.activationReadinessReasons[0] ? (
                          <Text tone="muted">{driver.activationReadinessReasons[0]}</Text>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{fleetNames.get(driver.fleetId) ?? driver.fleetId}</TableCell>
                    <TableCell>
                      <Badge tone={readinessTone(driver.activationReadiness)}>
                        {readinessLabel(driver.activationReadiness)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge tone={readinessTone(driver.assignmentReadiness)}>
                        {readinessLabel(driver.assignmentReadiness)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(driver.approvedLicenceExpiresAt, locale)}</TableCell>
                    <TableCell>{driver.riskBand ?? 'Insufficient data'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Licence expiry watch</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Fleet</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Days left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenceExpiry.map((item) => (
                  <TableRow key={item.driverId}>
                    <TableCell>{item.fullName}</TableCell>
                    <TableCell>{fleetNames.get(item.fleetId) ?? item.fleetId}</TableCell>
                    <TableCell>{formatDate(item.expiresAt, locale)}</TableCell>
                    <TableCell>{item.daysUntilExpiry}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Fleet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current valuation</TableHead>
                  <TableHead>Maintenance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.vehicles.map((vehicle) => (
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
                    <TableCell>{vehicle.status}</TableCell>
                    <TableCell>
                      {vehicle.currentValuationMinorUnits !== null &&
                      vehicle.currentValuationMinorUnits !== undefined
                        ? `${vehicle.currentValuationCurrency ?? ''} ${(vehicle.currentValuationMinorUnits / 100).toFixed(2)}`
                        : 'Not recorded'}
                    </TableCell>
                    <TableCell>{vehicle.maintenanceSummary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TenantAppShell>
  );
}
