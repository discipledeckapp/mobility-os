import { Card, CardContent, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { TenantAppShell } from '../../../../features/shared/tenant-app-shell';
import {
  getFleet,
  listBusinessEntities,
  listOperatingUnits,
} from '../../../../lib/api-core';
import { updateFleetAction } from '../../actions';
import { FleetForm } from '../../fleet-form';

type EditFleetPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditFleetPage({ params }: EditFleetPageProps) {
  const { id } = await params;
  const [fleet, businessEntities, operatingUnits] = await Promise.all([
    getFleet(id),
    listBusinessEntities(),
    listOperatingUnits(),
  ]);

  return (
    <TenantAppShell
      description="Edit fleet metadata inside the existing tenant operating hierarchy."
      eyebrow="Structure"
      title="Edit fleet"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Text tone="strong">Editing {fleet.name}</Text>
              <Text tone="muted">
                This updates the fleet record without changing control-plane or intelligence-plane
                boundaries.
              </Text>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href={`/fleets?fleetId=${encodeURIComponent(fleet.id)}`}
            >
              Back to fleet
            </Link>
          </CardContent>
        </Card>

        <FleetForm
          action={updateFleetAction}
          businessEntities={businessEntities}
          description="Update the fleet metadata and operating-unit attachment used in the tenant operations plane."
          fleet={fleet}
          operatingUnits={operatingUnits}
          submitLabel="Save fleet"
          title="Edit fleet"
        />
      </div>
    </TenantAppShell>
  );
}
