import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { getTenantMe, getVehicle } from '../../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../../lib/vehicle-display';
import { VehicleCommandCenter } from './vehicle-command-center';

export default async function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = await params;
  const [vehicle, tenant] = await Promise.all([
    getVehicle(vehicleId),
    getTenantMe().catch(() => null),
  ]);
  const locale = tenant?.country === 'NG' ? 'en-NG' : 'en-US';

  return (
    <TenantAppShell
      description="Vehicle state, assignment, remittance, and maintenance in one command center."
      eyebrow="Assets"
      title={getVehiclePrimaryLabel(vehicle)}
    >
      <VehicleCommandCenter locale={locale} vehicle={vehicle} />
    </TenantAppShell>
  );
}
