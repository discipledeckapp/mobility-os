import { getCountryConfig, isCountrySupported } from '@mobility-os/domain-config';
import { Card, CardContent, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  type FleetRecord,
  type VehicleMakerRecord,
  getTenantMe,
  listFleets,
  listVehicleMakers,
} from '../../../lib/api-core';
import { CreateVehicleForm } from '../create-vehicle-form';

export default async function NewVehiclePage() {
  let fleets: FleetRecord[] = [];
  let makers: VehicleMakerRecord[] = [];
  let fleetError: string | null = null;
  let vehicleCatalogError: string | null = null;
  let tenantCurrencyCode: string | null = null;

  try {
    const tenant = await getTenantMe();
    if (isCountrySupported(tenant.country)) {
      tenantCurrencyCode = getCountryConfig(tenant.country).currency;
    }
  } catch {
    tenantCurrencyCode = null;
  }

  try {
    fleets = await listFleets();
  } catch (error) {
    fleetError = error instanceof Error ? error.message : 'Unable to load fleets.';
  }

  try {
    makers = await listVehicleMakers();
  } catch (error) {
    vehicleCatalogError = error instanceof Error ? error.message : 'Unable to load vehicle makers.';
  }

  return (
    <TenantAppShell
      description="Add a new vehicle to the organisation registry. Start with fleet and VIN if you have it, then confirm catalog, valuation, and secondary identifiers."
      eyebrow="Assets"
      title="Add vehicle"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Text tone="strong">Vehicle registry workflow</Text>
              <Text tone="muted">
                Vehicles are now managed from the registry first. Add new assets here, then return
                to the list to search and drill into details.
              </Text>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href="/vehicles"
            >
              Back to vehicle registry
            </Link>
          </CardContent>
        </Card>

        <CreateVehicleForm
          fleetError={fleetError}
          fleets={fleets}
          makers={makers}
          tenantCurrencyCode={tenantCurrencyCode}
          vehicleCatalogError={vehicleCatalogError}
        />
      </div>
    </TenantAppShell>
  );
}
