import { Card, CardContent, Text } from '@mobility-os/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { listBusinessEntities } from '../../../lib/api-core';
import { createOperatingUnitAction } from '../actions';
import { OperatingUnitForm } from '../operating-unit-form';

export default async function NewOperatingUnitPage() {
  const businessEntities = await listBusinessEntities();

  return (
    <TenantAppShell
      description="Add an operating unit within the existing business-entity hierarchy for this tenant."
      eyebrow="Structure"
      title="Add operating unit"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <Text tone="strong">Operating unit registry workflow</Text>
              <Text tone="muted">
                Create the operating unit here, then return to Organisation Structure in Settings to manage linked fleets.
              </Text>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href={'/settings?section=structure' as Route}
            >
              Back to organisation structure
            </Link>
          </CardContent>
        </Card>

        <OperatingUnitForm
          action={createOperatingUnitAction}
          businessEntities={businessEntities}
          description="This flow only captures tenant-plane operating-unit metadata and its parent business entity."
          submitLabel="Create operating unit"
          title="Create operating unit"
        />
      </div>
    </TenantAppShell>
  );
}
