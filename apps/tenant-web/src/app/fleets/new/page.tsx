import { Card, CardContent, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { listBusinessEntities, listOperatingUnits } from '../../../lib/api-core';
import { createFleetAction } from '../actions';
import { FleetForm } from '../fleet-form';

export default async function NewFleetPage() {
  const [businessEntities, operatingUnits] = await Promise.all([
    listBusinessEntities(),
    listOperatingUnits(),
  ]);

  return (
    <TenantAppShell
      description="Add a fleet within the existing tenant operating hierarchy by linking it to a business entity and operating unit."
      eyebrow="Structure"
      title="Add fleet"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Text tone="strong">Fleet registry workflow</Text>
              <Text tone="muted">
                Create the fleet here, then return to the fleet registry to review assignments and
                downstream activity.
              </Text>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href="/fleets"
            >
              Back to fleets
            </Link>
          </CardContent>
        </Card>

        <FleetForm
          action={createFleetAction}
          businessEntities={businessEntities}
          description="This flow only creates the tenant-plane fleet record and links it to the existing business hierarchy."
          operatingUnits={operatingUnits}
          submitLabel="Create fleet"
          title="Create fleet"
        />
      </div>
    </TenantAppShell>
  );
}
