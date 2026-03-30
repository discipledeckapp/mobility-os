import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Route } from 'next';
import { Badge, Text } from '@mobility-os/ui';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import {
  TenantEmptyStateCard,
  TenantHeroPanel,
  TenantMetricCard,
  TenantMetricGrid,
  TenantSectionHeader,
  TenantSurfaceCard,
} from '../../../features/shared/tenant-page-patterns';
import {
  listAssignments,
  listBusinessEntities,
  listDrivers,
  listFleets,
  listOperatingUnits,
  listRemittances,
  listVehicles,
} from '../../../lib/api-core';

function getStatusTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'active') {
    return 'success';
  }
  if (status === 'inactive') {
    return 'warning';
  }
  return 'neutral';
}

function getRiskTone(level: 'low' | 'medium' | 'high'): 'success' | 'warning' | 'danger' {
  if (level === 'low') {
    return 'success';
  }
  if (level === 'medium') {
    return 'warning';
  }
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
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString(locale, { dateStyle: 'medium' });
}

export default async function BusinessEntityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [
    entitiesResult,
    operatingUnitsResult,
    fleetsResult,
    driversResult,
    vehiclesResult,
    assignmentsResult,
    remittancesResult,
  ] = await Promise.allSettled([
    listBusinessEntities(),
    listOperatingUnits({ businessEntityId: id }),
    listFleets(),
    listDrivers({ limit: 500 }),
    listVehicles({ limit: 500 }),
    listAssignments({ limit: 500 }),
    listRemittances({ limit: 500 }),
  ]);

  if (entitiesResult.status === 'rejected') {
    throw entitiesResult.reason;
  }

  const entity = entitiesResult.value.find((candidate) => candidate.id === id);
  if (!entity) {
    notFound();
  }

  const operatingUnits =
    operatingUnitsResult.status === 'fulfilled' ? operatingUnitsResult.value : [];
  const fleets =
    fleetsResult.status === 'fulfilled'
      ? fleetsResult.value.filter((fleet) =>
          operatingUnits.some((unit) => unit.id === fleet.operatingUnitId),
        )
      : [];
  const drivers =
    driversResult.status === 'fulfilled'
      ? driversResult.value.data.filter((driver) => driver.businessEntityId === id)
      : [];
  const vehicles =
    vehiclesResult.status === 'fulfilled'
      ? vehiclesResult.value.data.filter((vehicle) => vehicle.businessEntityId === id)
      : [];
  const assignments =
    assignmentsResult.status === 'fulfilled'
      ? assignmentsResult.value.data.filter((assignment) => assignment.businessEntityId === id)
      : [];
  const remittances =
    remittancesResult.status === 'fulfilled'
      ? remittancesResult.value.data.filter((remittance) => remittance.businessEntityId === id)
      : [];
  const degraded =
    operatingUnitsResult.status === 'rejected' ||
    fleetsResult.status === 'rejected' ||
    driversResult.status === 'rejected' ||
    vehiclesResult.status === 'rejected' ||
    assignmentsResult.status === 'rejected' ||
    remittancesResult.status === 'rejected';

  const activeAssignments = assignments.filter((assignment) => assignment.status === 'active').length;
  const pendingAssignments = assignments.filter((assignment) =>
    ['pending_driver_confirmation', 'driver_action_required', 'pending'].includes(assignment.status),
  ).length;
  const disputedRemittances = remittances.filter((remittance) => remittance.status === 'disputed');
  const pendingRemittances = remittances.filter((remittance) => remittance.status === 'pending');
  const flaggedDrivers = drivers.filter(
    (driver) => driver.enforcementStatus && driver.enforcementStatus !== 'clear',
  ).length;
  const inactiveFleets = fleets.filter((fleet) => fleet.status !== 'active').length;
  const risk = getEntityRiskLevel({
    disputedRemittances: disputedRemittances.length,
    flaggedDrivers,
    inactiveFleets,
  });
  const operatingUnitFleetStats = operatingUnits.map((unit) => {
    const unitFleets = fleets.filter((fleet) => fleet.operatingUnitId === unit.id);
    const unitDrivers = drivers.filter((driver) => driver.operatingUnitId === unit.id);
    const unitVehicles = vehicles.filter((vehicle) => vehicle.operatingUnitId === unit.id);
    const unitAssignments = assignments.filter((assignment) => assignment.operatingUnitId === unit.id);

    return {
      unit,
      activeAssignments: unitAssignments.filter((assignment) => assignment.status === 'active').length,
      drivers: unitDrivers.length,
      fleets: unitFleets.length,
      vehicles: unitVehicles.length,
    };
  });
  const fleetStats = fleets.map((fleet) => ({
    fleet,
    activeAssignments: assignments.filter(
      (assignment) => assignment.fleetId === fleet.id && assignment.status === 'active',
    ).length,
    drivers: drivers.filter((driver) => driver.fleetId === fleet.id).length,
    vehicles: vehicles.filter((vehicle) => vehicle.fleetId === fleet.id).length,
  }));
  const recentRemittances = remittances
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5);
  const locale = 'en-NG';

  return (
    <TenantAppShell
      description="Review the operating units, fleets, staffing pressure, and collection health tied to this business entity."
      eyebrow="Structure"
      title={entity.name}
    >
      <div className="space-y-6">
        <TenantHeroPanel
          actions={
            <>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                href={'/business-entities' as Route}
              >
                Back to entities
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all hover:bg-[var(--mobiris-primary-dark)]"
                href={`/business-entities/${entity.id}/edit` as Route}
              >
                Edit entity
              </Link>
            </>
          }
          description="Business entities should give you a clean top-down read on where operating responsibility sits, how fleets are distributed, and where staffing or collections are drifting."
          eyebrow="Structure"
          title={`${entity.name} command center`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={getStatusTone(entity.status)}>{entity.status}</Badge>
            <Badge tone={getRiskTone(risk.level)}>{risk.label}</Badge>
            <Badge tone={activeAssignments > 0 ? 'success' : 'neutral'}>
              {activeAssignments > 0 ? 'Assignments running' : 'No live assignments'}
            </Badge>
            {degraded ? <Badge tone="warning">Some linked metrics unavailable</Badge> : null}
          </div>
        </TenantHeroPanel>

        <TenantMetricGrid>
          <TenantMetricCard accent="sky" label="Operating units" note="Branches, depots, or execution zones linked to this entity." value={operatingUnits.length} />
          <TenantMetricCard accent="slate" label="Fleets" note="Fleet groups currently attached beneath this entity." value={fleets.length} />
          <TenantMetricCard accent="warning" label="Pending assignments" note="Assignment work still waiting for action or confirmation." value={pendingAssignments} />
          <TenantMetricCard accent="danger" label="Disputed remittances" note="Collection items still in dispute under this entity." value={disputedRemittances.length} />
        </TenantMetricGrid>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <TenantSurfaceCard
            contentClassName="pt-6"
            description="The entity’s branch structure and how much fleet activity each unit is currently carrying."
            title="Operating-unit coverage"
          >
            {operatingUnitFleetStats.length > 0 ? (
              <div className="space-y-3">
                {operatingUnitFleetStats.map((item) => (
                  <div
                    className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                    key={item.unit.id}
                  >
                    <div className="space-y-1">
                      <Link
                        className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                        href={`/operating-units/${item.unit.id}` as Route}
                      >
                        {item.unit.name}
                      </Link>
                      <Text tone="muted">
                        {item.fleets} fleets · {item.drivers} drivers · {item.vehicles} vehicles
                      </Text>
                      <Text tone="muted">
                        {item.activeAssignments > 0
                          ? `${item.activeAssignments} active assignments running from this unit.`
                          : 'No active assignments running from this unit right now.'}
                      </Text>
                    </div>
                    <Badge tone={getStatusTone(item.unit.status)}>{item.unit.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <TenantEmptyStateCard
                actions={
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--mobiris-primary-dark)]"
                    href={'/operating-units/new' as Route}
                  >
                    Add operating unit
                  </Link>
                }
                description="Create operating units to place fleets, drivers, and vehicles into a clearer execution structure."
                title="No operating units are linked yet"
              />
            )}
          </TenantSurfaceCard>

          <TenantSurfaceCard
            contentClassName="pt-6"
            description="A quick operational read on this entity’s staffing, risk, and collection posture."
            title="Entity posture"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4">
                <Text tone="strong">Business profile</Text>
                <div className="mt-3 space-y-2">
                  <Text tone="muted">Country: {entity.country}</Text>
                  <Text tone="muted">Business model: {entity.businessModel}</Text>
                  <Text tone="muted">Inactive fleets: {inactiveFleets}</Text>
                </div>
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4">
                <Text tone="strong">Operational pressure</Text>
                <div className="mt-3 space-y-2">
                  <Text tone="muted">Flagged drivers: {flaggedDrivers}</Text>
                  <Text tone="muted">Pending remittances: {pendingRemittances.length}</Text>
                  <Text tone="muted">Vehicles in scope: {vehicles.length}</Text>
                </div>
              </div>
            </div>
            <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <Text tone="strong">Next actions</Text>
              <div className="mt-3 space-y-2">
                <Link className="block text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline" href={`/operating-units?businessEntityId=${entity.id}` as Route}>
                  Review operating units
                </Link>
                <Link className="block text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline" href={'/fleets' as Route}>
                  Review fleet coverage
                </Link>
                <Link className="block text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline" href={'/remittance' as Route}>
                  Review collection issues
                </Link>
              </div>
            </div>
          </TenantSurfaceCard>
        </div>

        <TenantSurfaceCard
          contentClassName="pt-6"
          description="The fleet groups under this entity and how heavily each one is currently staffed and assigned."
          title="Fleet coverage"
        >
          {fleetStats.length > 0 ? (
            <div className="space-y-3">
              {fleetStats.map((item) => (
                <div
                  className="grid gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-4 lg:grid-cols-[1.1fr_0.9fr_auto]"
                  key={item.fleet.id}
                >
                  <div className="space-y-1">
                    <Link
                      className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                      href={`/fleets?fleetId=${item.fleet.id}` as Route}
                    >
                      {item.fleet.name}
                    </Link>
                    <Text tone="muted">
                      {item.drivers} drivers · {item.vehicles} vehicles · {item.activeAssignments} active assignments
                    </Text>
                  </div>
                  <Text tone="muted">
                    {item.fleet.status === 'active'
                      ? 'Fleet is live and available for ongoing assignment operations.'
                      : 'Fleet is inactive and may need attention before new work is assigned.'}
                  </Text>
                  <div className="flex lg:justify-end">
                    <Badge tone={getStatusTone(item.fleet.status)}>{item.fleet.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TenantEmptyStateCard
              actions={
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--mobiris-primary-dark)]"
                  href={'/fleets/new' as Route}
                >
                  Add fleet
                </Link>
              }
              description="Once fleets are attached to this entity, their staffing and assignment load will be visible here."
              title="No fleets linked yet"
            />
          )}
        </TenantSurfaceCard>

        <TenantSectionHeader
          description="Recent collection movement helps you understand whether this entity is staffed correctly and whether operating structure is translating into healthy daily execution."
          eyebrow="Collections"
          title="Recent remittance activity"
        />

        <TenantSurfaceCard contentClassName="pt-6">
          {recentRemittances.length > 0 ? (
            <div className="space-y-3">
              {recentRemittances.map((remittance) => (
                <div
                  className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                  key={remittance.id}
                >
                  <div className="space-y-1">
                    <Text tone="strong">
                      {formatAmount(remittance.amountMinorUnits, remittance.currency, locale)}
                    </Text>
                    <Text tone="muted">{formatDate(remittance.dueDate, locale)}</Text>
                  </div>
                  <Badge
                    tone={
                      remittance.status === 'disputed'
                        ? 'warning'
                        : remittance.status === 'completed'
                          ? 'success'
                          : 'neutral'
                    }
                  >
                    {remittance.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <TenantEmptyStateCard
              description="Remittance activity will appear here once collections begin under this entity."
              title="No remittance activity yet"
            />
          )}
        </TenantSurfaceCard>
      </div>
    </TenantAppShell>
  );
}
