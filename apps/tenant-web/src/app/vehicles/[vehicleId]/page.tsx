import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { getTenantMe, getVehicle, listAuditLog, type AuditLogRecord } from '../../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../../lib/vehicle-display';
import { VehicleCommandCenter } from './vehicle-command-center';

export default async function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const [vehicle, tenant, auditEvents] = await Promise.all([
    getVehicle(vehicleId),
    getTenantMe().catch(() => null),
    listAuditLog({ limit: 20, relatedVehicleId: vehicleId })
      .then((result) => result.data)
      .catch(() => [] as AuditLogRecord[]),
  ]);
  const locale = tenant?.country === 'NG' ? 'en-NG' : 'en-US';

  return (
    <TenantAppShell
      description="Vehicle state, assignment, remittance, and maintenance in one command center."
      eyebrow="Assets"
      title={getVehiclePrimaryLabel(vehicle)}
    >
      <VehicleCommandCenter auditEvents={auditEvents} locale={locale} vehicle={vehicle} />
    </TenantAppShell>
  );
}
