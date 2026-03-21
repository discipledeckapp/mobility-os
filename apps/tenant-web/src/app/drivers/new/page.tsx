import Link from 'next/link';
import { Card, CardContent, Text } from '@mobility-os/ui';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  getTenantMe,
  listFleets,
  type FleetRecord,
} from '../../../lib/api-core';
import { CreateDriverForm } from '../create-driver-form';

export default async function NewDriverPage() {
  let fleets: FleetRecord[] = [];
  let fleetError: string | null = null;
  let tenantCountryCode: string | null = null;

  try {
    const tenant = await getTenantMe();
    tenantCountryCode = tenant.country;
  } catch {
    tenantCountryCode = null;
  }

  try {
    fleets = await listFleets();
  } catch (error) {
    fleetError =
      error instanceof Error ? error.message : 'Unable to load fleets.';
  }

  return (
    <TenantAppShell
      description="Add a new driver to the organisation registry, then open the driver record to continue identity verification and onboarding."
      eyebrow="Operators"
      title="Add driver"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Text tone="strong">Driver registry workflow</Text>
              <Text tone="muted">
                Add the driver here first, then return to the registry to search,
                filter, and open the full driver record.
              </Text>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href="/drivers"
            >
              Back to driver registry
            </Link>
          </CardContent>
        </Card>

        <CreateDriverForm
          fleetError={fleetError}
          fleets={fleets}
          tenantCountryCode={tenantCountryCode}
        />
      </div>
    </TenantAppShell>
  );
}
