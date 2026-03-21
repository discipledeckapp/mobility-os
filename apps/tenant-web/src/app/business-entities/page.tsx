import Link from 'next/link';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getBusinessEntity,
  listBusinessEntities,
  listFleets,
  listOperatingUnits,
} from '../../lib/api-core';

type BusinessEntitiesPageProps = {
  searchParams?: Promise<{
    entityId?: string;
  }>;
};

function getStatusTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'inactive') return 'warning';
  return 'neutral';
}

export default async function BusinessEntitiesPage({
  searchParams,
}: BusinessEntitiesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const entities = await listBusinessEntities();
  const selectedEntityId = resolvedSearchParams.entityId ?? entities[0]?.id ?? null;
  const [operatingUnits, fleets, selectedEntity] = await Promise.all([
    listOperatingUnits(
      selectedEntityId ? { businessEntityId: selectedEntityId } : {},
    ),
    listFleets(),
    selectedEntityId ? getBusinessEntity(selectedEntityId) : Promise.resolve(null),
  ]);

  const relatedOperatingUnits = selectedEntityId
    ? operatingUnits.filter((unit) => unit.businessEntityId === selectedEntityId)
    : [];
  const relatedFleets = selectedEntityId
    ? fleets.filter((fleet) =>
        relatedOperatingUnits.some((unit) => unit.id === fleet.operatingUnitId),
      )
    : [];

  return (
    <TenantAppShell
      description="Review organisation legal entities, their operating units, and downstream fleet structure."
      eyebrow="Structure"
      title="Business entities"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Entity registry</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Business model</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entities.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell>
                      <Link
                        className="font-semibold text-[var(--mobiris-primary)] hover:underline"
                        href={`/business-entities?entityId=${encodeURIComponent(entity.id)}`}
                      >
                        {entity.name}
                      </Link>
                    </TableCell>
                    <TableCell>{entity.country}</TableCell>
                    <TableCell>{entity.businessModel}</TableCell>
                    <TableCell>
                      <Badge tone={getStatusTone(entity.status)}>{entity.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entity detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEntity ? (
                <>
                  <div>
                    <Text tone="muted">Name</Text>
                    <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                      {selectedEntity.name}
                    </p>
                  </div>
                  <div>
                    <Text tone="muted">Country</Text>
                    <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                      {selectedEntity.country}
                    </p>
                  </div>
                  <div>
                    <Text tone="muted">Business model</Text>
                    <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                      {selectedEntity.businessModel}
                    </p>
                  </div>
                  <div>
                    <Text tone="muted">Status</Text>
                    <div className="mt-2">
                      <Badge tone={getStatusTone(selectedEntity.status)}>
                        {selectedEntity.status}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <Text>No business entities are available yet.</Text>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operating units</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedOperatingUnits.length === 0 ? (
                <Text>No operating units are linked to this entity yet.</Text>
              ) : (
                relatedOperatingUnits.map((unit) => (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 px-4 py-3"
                    key={unit.id}
                  >
                    <p className="text-sm font-semibold text-[var(--mobiris-ink)]">{unit.name}</p>
                    <Text tone="muted">{unit.status}</Text>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fleets under this entity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedFleets.length === 0 ? (
                <Text>No fleets are currently linked to this entity.</Text>
              ) : (
                relatedFleets.map((fleet) => (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3"
                    key={fleet.id}
                  >
                    <p className="text-sm font-semibold text-[var(--mobiris-ink)]">{fleet.name}</p>
                    <Text tone="muted">{fleet.businessModel}</Text>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantAppShell>
  );
}
