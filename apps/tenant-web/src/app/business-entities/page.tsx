import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  listAssignments,
  listBusinessEntities,
  listDrivers,
  listFleets,
  listOperatingUnits,
  listRemittances,
  listVehicles,
  type OperatingUnitRecord,
  type RemittanceRecord,
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

function getRiskTone(level: 'low' | 'medium' | 'high'): 'success' | 'warning' | 'danger' {
  if (level === 'low') return 'success';
  if (level === 'medium') return 'warning';
  return 'danger';
}

function getEntityRiskLevel(input: {
  flaggedDrivers: number;
  disputedRemittances: number;
  inactiveFleets: number;
}): { level: 'low' | 'medium' | 'high'; label: string } {
  if (input.disputedRemittances > 0 || input.flaggedDrivers >= 4 || input.inactiveFleets >= 2) {
    return { level: 'high', label: 'High risk' };
  }
  if (input.flaggedDrivers > 0 || input.inactiveFleets > 0) {
    return { level: 'medium', label: 'Medium risk' };
  }
  return { level: 'low', label: 'Low risk' };
}

function formatAmount(amountMinorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(date: string | null | undefined, locale: string): string {
  if (!date) {
    return 'Not scheduled';
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(locale, { dateStyle: 'medium' });
}

export default async function BusinessEntitiesPage({
  searchParams,
}: BusinessEntitiesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [entities, operatingUnits, fleets, driversResult, vehiclesResult, assignmentsResult, remittancesResult] =
    await Promise.all([
      listBusinessEntities(),
      listOperatingUnits(),
      listFleets(),
      listDrivers({ limit: 500 }),
      listVehicles({ limit: 500 }),
      listAssignments({ limit: 500 }),
      listRemittances({ limit: 500 }),
    ]);

  const drivers = driversResult.data;
  const vehicles = vehiclesResult.data;
  const assignments = assignmentsResult.data;
  const remittances = remittancesResult.data;
  const selectedEntityId = resolvedSearchParams.entityId ?? entities[0]?.id ?? null;
  const locale = 'en-NG';

  const entityCards = entities.map((entity) => {
    const entityUnits = operatingUnits.filter((unit) => unit.businessEntityId === entity.id);
    const entityFleets = fleets.filter((fleet) =>
      entityUnits.some((unit) => unit.id === fleet.operatingUnitId),
    );
    const entityFleetIds = new Set(entityFleets.map((fleet) => fleet.id));
    const entityDrivers = drivers.filter((driver) => driver.businessEntityId === entity.id);
    const entityVehicles = vehicles.filter((vehicle) => vehicle.businessEntityId === entity.id);
    const entityAssignments = assignments.filter((assignment) => assignment.businessEntityId === entity.id);
    const activeAssignments = entityAssignments.filter((assignment) => assignment.status === 'active');
    const entityRemittances = remittances.filter((remittance) => remittance.businessEntityId === entity.id);
    const disputedRemittances = entityRemittances.filter((remittance) => remittance.status === 'disputed').length;
    const flaggedDrivers = entityDrivers.filter(
      (driver) => driver.enforcementStatus && driver.enforcementStatus !== 'clear',
    ).length;
    const inactiveFleets = entityFleets.filter((fleet) => fleet.status !== 'active').length;
    const risk = getEntityRiskLevel({
      disputedRemittances,
      flaggedDrivers,
      inactiveFleets,
    });

    return {
      activeAssignments: activeAssignments.length,
      drivers: entityDrivers,
      entity,
      fleets: entityFleets,
      fleetIds: entityFleetIds,
      flaggedDrivers,
      inactiveFleets,
      operatingUnits: entityUnits,
      remittances: entityRemittances,
      risk,
      vehicles: entityVehicles,
    };
  });

  const selectedEntityCard =
    entityCards.find((item) => item.entity.id === selectedEntityId) ?? entityCards[0] ?? null;

  const selectedFleetStats = selectedEntityCard
    ? selectedEntityCard.fleets.map((fleet) => {
        const fleetDrivers = selectedEntityCard.drivers.filter((driver) => driver.fleetId === fleet.id);
        const fleetVehicles = selectedEntityCard.vehicles.filter((vehicle) => vehicle.fleetId === fleet.id);
        const fleetAssignments = assignments.filter((assignment) => assignment.fleetId === fleet.id);
        const fleetActiveAssignments = fleetAssignments.filter((assignment) => assignment.status === 'active').length;
        return { drivers: fleetDrivers.length, fleet, activeAssignments: fleetActiveAssignments, vehicles: fleetVehicles.length };
      })
    : [];

  const selectedRecentRemittances = selectedEntityCard
    ? selectedEntityCard.remittances
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
    : [];

  return (
    <TenantAppShell
      description="Track how each business entity is staffed, structured, and performing operationally."
      eyebrow="Operations"
      title="Business entities"
    >
      <div className="mb-6 flex flex-col gap-4 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Text tone="strong">Entity operations dashboard</Text>
          <Text tone="muted">
            Compare entities by active fleets, staffing coverage, and live assignment pressure before drilling into the next action.
          </Text>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
            href={'/operating-units/new' as Route}
          >
            Add operating unit
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
            href={'/fleets/new' as Route}
          >
            Add fleet
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
            href={'/business-entities/new' as Route}
          >
            Add business entity
          </Link>
        </div>
      </div>

      {entityCards.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-8">
            <Text tone="strong">No business entities yet</Text>
            <Text tone="muted">
              Add a business entity to organise operating units, fleets, drivers, and vehicles under a clear structure.
            </Text>
            <div>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
                href={'/business-entities/new' as Route}
              >
                Add business entity
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {entityCards.map((item) => (
              <Link
                className={`rounded-[var(--mobiris-radius-card)] border p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)] transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_26px_50px_-34px_rgba(15,23,42,0.35)] ${
                  item.entity.id === selectedEntityCard?.entity.id
                    ? 'border-[var(--mobiris-primary)] bg-[color-mix(in_srgb,var(--mobiris-primary)_8%,white)]'
                    : 'border-slate-200 bg-white'
                }`}
                href={`/business-entities?entityId=${encodeURIComponent(item.entity.id)}` as Route}
                key={item.entity.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--mobiris-ink)]">
                      {item.entity.name}
                    </p>
                    <Text tone="muted">
                      {item.entity.country} · {item.entity.businessModel}
                    </Text>
                  </div>
                  <Badge tone={getStatusTone(item.entity.status)}>{item.entity.status}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Operating units</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">
                      {item.operatingUnits.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Fleets</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">
                      {item.fleets.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Drivers</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">
                      {item.drivers.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Active assignments</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">
                      {item.activeAssignments}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge tone={getRiskTone(item.risk.level)}>{item.risk.label}</Badge>
                  <Badge tone={item.inactiveFleets > 0 ? 'warning' : 'neutral'}>
                    {item.inactiveFleets > 0 ? `${item.inactiveFleets} fleets inactive` : 'All fleets active'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>

          {selectedEntityCard ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedEntityCard.entity.name}</CardTitle>
                    <CardDescription>
                      Structure, staffing coverage, and live workload signals for this business entity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={getStatusTone(selectedEntityCard.entity.status)}>
                        {selectedEntityCard.entity.status}
                      </Badge>
                      <Badge tone={getRiskTone(selectedEntityCard.risk.level)}>
                        {selectedEntityCard.risk.label}
                      </Badge>
                      <Badge tone={selectedEntityCard.activeAssignments > 0 ? 'success' : 'neutral'}>
                        {selectedEntityCard.activeAssignments > 0 ? 'Assignments running' : 'No live assignments'}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <Text tone="muted">Operating units</Text>
                        <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                          {selectedEntityCard.operatingUnits.length}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <Text tone="muted">Fleets</Text>
                        <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                          {selectedEntityCard.fleets.length}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <Text tone="muted">Drivers</Text>
                        <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                          {selectedEntityCard.drivers.length}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <Text tone="muted">Vehicles</Text>
                        <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                          {selectedEntityCard.vehicles.length}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-4">
                        <Text tone="strong">Entity profile</Text>
                        <div className="mt-3 space-y-3">
                          <div>
                            <Text tone="muted">Country</Text>
                            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                              {selectedEntityCard.entity.country}
                            </p>
                          </div>
                          <div>
                            <Text tone="muted">Business model</Text>
                            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                              {selectedEntityCard.entity.businessModel}
                            </p>
                          </div>
                          <div>
                            <Text tone="muted">Inactive fleets</Text>
                            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                              {selectedEntityCard.inactiveFleets}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-4">
                        <Text tone="strong">Operational signals</Text>
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <Text tone="muted">Active assignments</Text>
                            <Text tone="strong">{selectedEntityCard.activeAssignments}</Text>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <Text tone="muted">Flagged drivers</Text>
                            <Text tone="strong">{selectedEntityCard.flaggedDrivers}</Text>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <Text tone="muted">Disputed remittances</Text>
                            <Text tone="strong">
                              {selectedEntityCard.remittances.filter((remittance) => remittance.status === 'disputed').length}
                            </Text>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <Text tone="muted">Pending collections</Text>
                            <Text tone="strong">
                              {
                                selectedEntityCard.remittances.filter(
                                  (remittance) => remittance.status === 'pending',
                                ).length
                              }
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Operating units</CardTitle>
                      <CardDescription>
                        The units currently carrying this entity’s fleet activity.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedEntityCard.operatingUnits.length === 0 ? (
                        <Text tone="muted">No operating units are linked to this entity yet.</Text>
                      ) : (
                        selectedEntityCard.operatingUnits.map((unit: OperatingUnitRecord) => (
                          <div
                            className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 px-4 py-3"
                            key={unit.id}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[var(--mobiris-ink)]">{unit.name}</p>
                                <Text tone="muted">{unit.status}</Text>
                              </div>
                              <Badge tone={getStatusTone(unit.status)}>{unit.status}</Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Fleet coverage</CardTitle>
                      <CardDescription>
                        The fleets under this entity and how they are staffed today.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedFleetStats.length === 0 ? (
                        <Text tone="muted">No fleets are currently linked to this entity.</Text>
                      ) : (
                        selectedFleetStats.map((item) => (
                          <div
                            className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 px-4 py-3"
                            key={item.fleet.id}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[var(--mobiris-ink)]">{item.fleet.name}</p>
                                <Text tone="muted">
                                  {item.drivers} drivers · {item.vehicles} vehicles · {item.activeAssignments} live assignments
                                </Text>
                              </div>
                              <Badge tone={getStatusTone(item.fleet.status)}>{item.fleet.status}</Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Next actions</CardTitle>
                    <CardDescription>
                      The fastest ways to expand or rebalance this entity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link
                      className="flex min-h-12 items-center justify-between rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                      href={'/operating-units/new' as Route}
                    >
                      Add operating unit
                      <span className="text-[var(--mobiris-primary-dark)]">Open</span>
                    </Link>
                    <Link
                      className="flex min-h-12 items-center justify-between rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                      href={'/fleets/new' as Route}
                    >
                      Add fleet
                      <span className="text-[var(--mobiris-primary-dark)]">Open</span>
                    </Link>
                    <Link
                      className="flex min-h-12 items-center justify-between rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                      href={`/business-entities/${selectedEntityCard.entity.id}/edit` as Route}
                    >
                      Edit business entity
                      <span className="text-[var(--mobiris-primary-dark)]">Open</span>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent remittance activity</CardTitle>
                    <CardDescription>
                      The latest collection movement across fleets in this entity.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRecentRemittances.length === 0 ? (
                      <Text tone="muted">No remittance activity has been recorded for this entity yet.</Text>
                    ) : (
                      selectedRecentRemittances.map((remittance: RemittanceRecord) => (
                        <div
                          className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 px-4 py-3"
                          key={remittance.id}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[var(--mobiris-ink)]">
                                {formatAmount(remittance.amountMinorUnits, remittance.currency, locale)}
                              </p>
                              <Text tone="muted">{formatDate(remittance.dueDate, locale)}</Text>
                            </div>
                            <Badge tone={remittance.status === 'disputed' ? 'warning' : remittance.status === 'completed' ? 'success' : 'neutral'}>
                              {remittance.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </>
      )}
    </TenantAppShell>
  );
}
