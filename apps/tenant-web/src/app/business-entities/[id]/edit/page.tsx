import { Card, CardContent, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { TenantAppShell } from '../../../../features/shared/tenant-app-shell';
import { getBusinessEntity } from '../../../../lib/api-core';
import { updateBusinessEntityAction } from '../../actions';
import { BusinessEntityForm } from '../../business-entity-form';

type EditBusinessEntityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBusinessEntityPage({
  params,
}: EditBusinessEntityPageProps) {
  const { id } = await params;
  const entity = await getBusinessEntity(id);

  return (
    <TenantAppShell
      description="Edit tenant business-entity metadata within the existing tenant hierarchy."
      eyebrow="Structure"
      title="Edit business entity"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Text tone="strong">Editing {entity.name}</Text>
              <Text tone="muted">
                This updates the tenant-plane business-entity record without changing control-plane
                or intelligence-plane responsibilities.
              </Text>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href={`/business-entities?entityId=${encodeURIComponent(entity.id)}`}
            >
              Back to business entity
            </Link>
          </CardContent>
        </Card>

        <BusinessEntityForm
          action={updateBusinessEntityAction}
          description="Update the entity metadata used by the tenant operating hierarchy."
          entity={entity}
          submitLabel="Save business entity"
          title="Edit business entity"
        />
      </div>
    </TenantAppShell>
  );
}
