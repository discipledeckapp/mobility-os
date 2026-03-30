import type { Route } from 'next';
import { Card, CardContent, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { TenantAppShell } from '../../../../features/shared/tenant-app-shell';
import { getOperatingUnit, listBusinessEntities } from '../../../../lib/api-core';
import { updateOperatingUnitAction } from '../../actions';
import { OperatingUnitForm } from '../../operating-unit-form';

type EditOperatingUnitPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditOperatingUnitPage({
  params,
}: EditOperatingUnitPageProps) {
  const { id } = await params;
  const [operatingUnit, businessEntities] = await Promise.all([
    getOperatingUnit(id),
    listBusinessEntities(),
  ]);

  return (
    <TenantAppShell
      description="Edit operating-unit metadata inside the existing tenant hierarchy."
      eyebrow="Structure"
      title="Edit operating unit"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Text tone="strong">Editing {operatingUnit.name}</Text>
              <Text tone="muted">
                This updates the tenant-plane operating-unit record without changing control-plane
                or intelligence-plane boundaries.
              </Text>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href={`/operating-units/${encodeURIComponent(operatingUnit.id)}` as Route}
            >
              Back to operating unit
            </Link>
          </CardContent>
        </Card>

        <OperatingUnitForm
          action={updateOperatingUnitAction}
          businessEntities={businessEntities}
          description="Update the operating-unit metadata used in the tenant hierarchy."
          operatingUnit={operatingUnit}
          submitLabel="Save operating unit"
          title="Edit operating unit"
        />
      </div>
    </TenantAppShell>
  );
}
