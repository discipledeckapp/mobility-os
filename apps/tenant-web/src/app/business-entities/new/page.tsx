import { Card, CardContent, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { getTenantMe } from '../../../lib/api-core';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { createBusinessEntityAction } from '../actions';
import { BusinessEntityForm } from '../business-entity-form';

export default async function NewBusinessEntityPage() {
  let defaultCountryCode: string | null = null;

  try {
    const tenant = await getTenantMe();
    defaultCountryCode = tenant.country;
  } catch {
    defaultCountryCode = null;
  }

  return (
    <TenantAppShell
      description="Add a new legal or operating entity for this tenant without changing the existing hierarchy boundaries."
      eyebrow="Structure"
      title="Add business entity"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Text tone="strong">Business entity registry workflow</Text>
              <Text tone="muted">
                Create the entity here first, then return to Organisation Structure in Settings to manage its operating units and fleets.
              </Text>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href="/settings?section=structure"
            >
              Back to organisation structure
            </Link>
          </CardContent>
        </Card>

        <BusinessEntityForm
          action={createBusinessEntityAction}
          defaultCountryCode={defaultCountryCode}
          description="Business entities remain tenant-plane records. This flow only captures the legal entity metadata needed by the existing hierarchy."
          submitLabel="Create business entity"
          title="Create business entity"
        />
      </div>
    </TenantAppShell>
  );
}
