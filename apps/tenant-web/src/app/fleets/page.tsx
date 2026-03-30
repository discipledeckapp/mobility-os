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
  type RemittanceRecord,
} from '../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../lib/vehicle-display';

type FleetsPageProps = {
  searchParams?: Promise<{
    fleetId?: string;
  }>;
};

type ResolvedFleetsPageData = {
  fleets: Awaited<ReturnType<typeof listFleets>>;
  operatingUnits: Awaited<ReturnType<typeof listOperatingUnits>>;
  entities: Awaited<ReturnType<typeof listBusinessEntities>>;
  drivers: Awaited<ReturnType<typeof listDrivers>>['data'];
  vehicles: Awaited<ReturnType<typeof listVehicles>>['data'];
  assignments: Awaited<ReturnType<typeof listAssignments>>['data'];
  remittances: Awaited<ReturnType<typeof listRemittances>>['data'];
  degraded: boolean;
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

function getFleetRiskLevel(input: {
  disputedRemittances: number;
  overduePendingRemittances: number;
  flaggedDrivers: number;
}): { level: 'low' | 'medium' | 'high'; label: string } {
  if (input.disputedRemittances > 0 || input.flaggedDrivers >= 3 || input.overduePendingRemittances >= 3) {
    return { level: 'high', label: 'High risk' };
  }
  if (input.flaggedDrivers > 0 || input.overduePendingRemittances > 0) {
    return { level: 'medium', label: 'Medium risk' };
  }
  return { level: 'low', label: 'Low risk' };
}

function getRemittanceHealth(input: {
  activeAssignments: number;
  overduePendingRemittances: number;
  disputedRemittances: number;
}): string {
  if (input.activeAssignments === 0) {
    return 'No active collections';
  }
  if (input.disputedRemittances > 0) {
    return 'Disputes need review';
  }
  if (input.overduePendingRemittances > 0) {
    return 'Collections behind schedule';
  }
  return 'Collections on track';
}

async function resolveFleetsPageData(): Promise<ResolvedFleetsPageData> {
  const [
    fleetsResult,
    operatingUnitsResult,
    entitiesResult,
    driversResult,
    vehiclesResult,
    assignmentsResult,
    remittancesResult,
  ] = await Promise.allSettled([
    listFleets(),
    listOperatingUnits(),
    listBusinessEntities(),
    listDrivers({ limit: 500 }),
    listVehicles({ limit: 500 }),
    listAssignments({ limit: 500 }),
    listRemittances({ limit: 500 }),
  ]);

  if (fleetsResult.status === 'rejected') {
    throw fleetsResult.reason;
  }

  return {
    fleets: fleetsResult.value,
    operatingUnits:
      operatingUnitsResult.status === 'fulfilled' ? operatingUnitsResult.value : [],
    entities: entitiesResult.status === 'fulfilled' ? entitiesResult.value : [],
    drivers: driversResult.status === 'fulfilled' ? driversResult.value.data : [],
    vehicles: vehiclesResult.status === 'fulfilled' ? vehiclesResult.value.data : [],
    assignments:
      assignmentsResult.status === 'fulfilled' ? assignmentsResult.value.data : [],
    remittances:
      remittancesResult.status === 'fulfilled' ? remittancesResult.value.data : [],
    degraded:
      operatingUnitsResult.status === 'rejected' ||
      entitiesResult.status === 'rejected' ||
      driversResult.status === 'rejected' ||
      vehiclesResult.status === 'rejected' ||
      assignmentsResult.status === 'rejected' ||
      remittancesResult.status === 'rejected',
  };
}

export default async function FleetsPage({ searchParams }: FleetsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const {
    fleets,
    operatingUnits,
    entities,
    drivers,
    vehicles,
    assignments,
    remittances,
    degraded,
  } = await resolveFleetsPageData();
  const selectedFleetId = resolvedSearchParams.fleetId ?? fleets[0]?.id ?? null;

  const fleetCards = fleets.map((fleet) => {
    const fleetDrivers = drivers.filter((driver) => driver.fleetId === fleet.id);
    const fleetVehicles = vehicles.filter((vehicle) => vehicle.fleetId === fleet.id);
    const fleetAssignments = assignments.filter((assignment) => assignment.fleetId === fleet.id);
    const activeAssignments = fleetAssignments.filter((assignment) => assignment.status === 'active');
    const fleetRemittances = remittances.filter((remittance) => remittance.fleetId === fleet.id);
    const disputedRemittances = fleetRemittances.filter((remittance) => remittance.status === 'disputed').length;
    const overduePendingRemittances = fleetRemittances.filter((remittance) => {
      if (remittance.status !== 'pending') {
        return false;
      }
      const dueDate = new Date(remittance.dueDate);
      return !Number.isNaN(dueDate.getTime()) && dueDate.getTime() < Date.now();
    }).length;
    const flaggedDrivers = fleetDrivers.filter(
      (driver) => driver.enforcementStatus && driver.enforcementStatus !== 'clear',
    ).length;
    const risk = getFleetRiskLevel({
      disputedRemittances,
      flaggedDrivers,
      overduePendingRemittances,
    });
    const latestRemittance = fleetRemittances
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const operatingUnit = operatingUnits.find((unit) => unit.id === fleet.operatingUnitId) ?? null;
    const entity = operatingUnit
      ? entities.find((candidate) => candidate.id === operatingUnit.businessEntityId) ?? null
      : null;

    return {
      activeAssignments: activeAssignments.length,
      drivers: fleetDrivers,
      entity,
      flaggedDrivers,
      fleet,
      latestRemittance,
      operatingUnit,
      overduePendingRemittances,
      remittanceHealth: getRemittanceHealth({
        activeAssignments: activeAssignments.length,
        disputedRemittances,
        overduePendingRemittances,
      }),
      risk,
      disputedRemittances,
      vehicles: fleetVehicles,
    };
  });

  const selectedFleetCard =
    fleetCards.find((item) => item.fleet.id === selectedFleetId) ?? fleetCards[0] ?? null;
  const selectedFleetAssignments = selectedFleetCard
    ? assignments.filter((assignment) => assignment.fleetId === selectedFleetCard.fleet.id)
    : [];
  const selectedActiveAssignments = selectedFleetAssignments.filter(
    (assignment) => assignment.status === 'active',
  );
  const selectedPendingAssignments = selectedFleetAssignments.filter(
    (assignment) => assignment.status === 'pending',
  );
  const selectedRecentRemittances = selectedFleetCard
    ? remittances
        .filter((remittance) => remittance.fleetId === selectedFleetCard.fleet.id)
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
    : [];
  const driverLookup = new Map(
    drivers.map((driver) => [driver.id, `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim() || driver.id]),
  );
  const vehicleLookup = new Map(
    vehicles.map((vehicle) => [vehicle.id, getVehiclePrimaryLabel(vehicle)]),
  );
  const locale = 'en-NG';

  return (
    <TenantAppShell
      description="Monitor fleet capacity, assignment pressure, and collection health from one place."
      eyebrow="Operations"
      title="Fleets"
    >
      <div className="mb-6 flex flex-col gap-4 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Text tone="strong">Fleet operations dashboard</Text>
          <Text tone="muted">
            See which fleets are staffed, which ones need assignments, and where collections or risk signals need attention.
          </Text>
          {degraded ? (
            <Text className="text-amber-700">
              Some linked roster, assignment, or remittance signals are temporarily unavailable, so a few fleet metrics may be incomplete right now.
            </Text>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
            href={'/drivers/new' as Route}
          >
            Add driver
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
            href={'/assignments/new' as Route}
          >
            Assign driver
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
            href={'/vehicles/new' as Route}
          >
            Add vehicle
          </Link>
        </div>
      </div>

      {fleetCards.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-8">
            <Text tone="strong">No fleets yet</Text>
            <Text tone="muted">
              Create your first fleet to start grouping drivers, vehicles, and assignment workflows.
            </Text>
            <div>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
                href={'/fleets/new' as Route}
              >
                Add fleet
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {fleetCards.map((item) => (
              <Link
                className={`rounded-[var(--mobiris-radius-card)] border p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)] transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_26px_50px_-34px_rgba(15,23,42,0.35)] ${
                  item.fleet.id === selectedFleetCard?.fleet.id
                    ? 'border-[var(--mobiris-primary)] bg-[color-mix(in_srgb,var(--mobiris-primary)_8%,white)]'
                    : 'border-slate-200 bg-white'
                }`}
                href={`/fleets?fleetId=${encodeURIComponent(item.fleet.id)}` as Route}
                key={item.fleet.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--mobiris-ink)]">
                      {item.fleet.name}
                    </p>
                    <Text tone="muted">
                      {item.operatingUnit?.name ?? 'Operating unit pending'} · {item.entity?.name ?? 'Entity pending'}
                    </Text>
                  </div>
                  <Badge tone={getStatusTone(item.fleet.status)}>{item.fleet.status}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Drivers</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">{item.drivers.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Vehicles</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">{item.vehicles.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Active assignments</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">{item.activeAssignments}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <Text tone="muted">Flagged drivers</Text>
                    <p className="mt-1 text-xl font-semibold text-[var(--mobiris-ink)]">{item.flaggedDrivers}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge tone={getRiskTone(item.risk.level)}>{item.risk.label}</Badge>
                  <Badge tone={item.disputedRemittances > 0 ? 'warning' : 'neutral'}>
                    {item.remittanceHealth}
                  </Badge>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--mobiris-primary-dark)]">
                    Open command center
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {selectedFleetCard ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedFleetCard.fleet.name}</CardTitle>
                    <CardDescription>
                      Assignment coverage, collection readiness, and active roster signals for this fleet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={getStatusTone(selectedFleetCard.fleet.status)}>
                        {selectedFleetCard.fleet.status}
                      </Badge>
                      <Badge tone={getRiskTone(selectedFleetCard.risk.level)}>
                        {selectedFleetCard.risk.label}
                      </Badge>
                      <Badge tone={selectedFleetCard.activeAssignments > 0 ? 'success' : 'neutral'}>
                        {selectedFleetCard.activeAssignments > 0 ? 'Assignments live' : 'No live assignments'}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <Text tone="muted">Drivers</Text>
                        <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                          {selectedFleetCard.drivers.length}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <Text tone="muted">Vehicles</Text>
                        <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                          {selectedFleetCard.vehicles.length}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <Text tone="muted">Active assignments</Text>
                        <p className="mt-2 text-2xl font-semibold text-[var(--mobiris-ink)]">
                          {selectedFleetCard.activeAssignments}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <Text tone="muted">Collections status</Text>
                        <p className="mt-2 text-sm font-semibold text-[var(--mobiris-ink)]">
                          {selectedFleetCard.remittanceHealth}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-4">
                        <Text tone="strong">Structure</Text>
                        <div className="mt-3 space-y-3">
                          <div>
                            <Text tone="muted">Business entity</Text>
                            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                              {selectedFleetCard.entity?.name ?? 'Not linked'}
                            </p>
                          </div>
                          <div>
                            <Text tone="muted">Operating unit</Text>
                            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                              {selectedFleetCard.operatingUnit?.name ?? 'Not linked'}
                            </p>
                          </div>
                          <div>
                            <Text tone="muted">Business model</Text>
                            <p className="mt-1 text-sm font-semibold text-[var(--mobiris-ink)]">
                              {selectedFleetCard.fleet.businessModel}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-4">
                        <Text tone="strong">Operational signals</Text>
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <Text tone="muted">Pending assignments</Text>
                            <Text tone="strong">{selectedPendingAssignments.length}</Text>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <Text tone="muted">Overdue collections</Text>
                            <Text tone="strong">{selectedFleetCard.overduePendingRemittances}</Text>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <Text tone="muted">Disputed remittances</Text>
                            <Text tone="strong">{selectedFleetCard.disputedRemittances}</Text>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <Text tone="muted">Flagged drivers</Text>
                            <Text tone="strong">{selectedFleetCard.flaggedDrivers}</Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Driver roster</CardTitle>
                      <CardDescription>
                        The first drivers operators should check when staffing or rebalancing this fleet.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedFleetCard.drivers.length === 0 ? (
                        <Text tone="muted">No drivers are linked to this fleet yet.</Text>
                      ) : (
                        selectedFleetCard.drivers.slice(0, 5).map((driver) => (
                          <div
                            className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 px-4 py-3"
                            key={driver.id}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[var(--mobiris-ink)]">
                                  {driverLookup.get(driver.id) ?? driver.id}
                                </p>
                                <Text tone="muted">
                                  {driver.assignmentReadiness === 'ready'
                                    ? 'Ready for assignment'
                                    : driver.assignmentReadinessReasons[0] ?? 'Needs attention'}
                                </Text>
                              </div>
                              <Badge tone={driver.enforcementStatus && driver.enforcementStatus !== 'clear' ? 'warning' : 'success'}>
                                {driver.enforcementStatus && driver.enforcementStatus !== 'clear'
                                  ? 'Attention'
                                  : 'Clear'}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle roster</CardTitle>
                      <CardDescription>
                        The current vehicles available for assignment coverage and active operations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedFleetCard.vehicles.length === 0 ? (
                        <Text tone="muted">No vehicles are linked to this fleet yet.</Text>
                      ) : (
                        selectedFleetCard.vehicles.slice(0, 5).map((vehicle) => (
                          <div
                            className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 px-4 py-3"
                            key={vehicle.id}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[var(--mobiris-ink)]">
                                  {getVehiclePrimaryLabel(vehicle)}
                                </p>
                                <Text tone="muted">
                                  {vehicle.make} {vehicle.model} · {vehicle.status}
                                </Text>
                              </div>
                              <Badge tone={vehicle.status === 'active' ? 'success' : 'neutral'}>
                                {vehicle.status}
                              </Badge>
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
                      The fastest ways to move this fleet forward.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link
                      className="flex min-h-12 items-center justify-between rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                      href={`/fleets/${selectedFleetCard.fleet.id}` as Route}
                    >
                      Open fleet command center
                      <span className="text-[var(--mobiris-primary-dark)]">Open</span>
                    </Link>
                    <Link
                      className="flex min-h-12 items-center justify-between rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                      href={'/drivers/new' as Route}
                    >
                      Add driver
                      <span className="text-[var(--mobiris-primary-dark)]">Open</span>
                    </Link>
                    <Link
                      className="flex min-h-12 items-center justify-between rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                      href={'/assignments/new' as Route}
                    >
                      Assign driver
                      <span className="text-[var(--mobiris-primary-dark)]">Open</span>
                    </Link>
                    <Link
                      className="flex min-h-12 items-center justify-between rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                      href={'/vehicles/new' as Route}
                    >
                      Add vehicle
                      <span className="text-[var(--mobiris-primary-dark)]">Open</span>
                    </Link>
                    <Link
                      className="flex min-h-12 items-center justify-between rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                      href={selectedFleetCard.operatingUnit ? (`/operating-units/${selectedFleetCard.operatingUnit.id}` as Route) : ('/operating-units' as Route)}
                    >
                      Review operating unit
                      <span className="text-[var(--mobiris-primary-dark)]">Open</span>
                    </Link>
                    <Link
                      className="flex min-h-12 items-center justify-between rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                      href={`/fleets/${selectedFleetCard.fleet.id}/edit` as Route}
                    >
                      Edit fleet settings
                      <span className="text-[var(--mobiris-primary-dark)]">Open</span>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Assignment activity</CardTitle>
                    <CardDescription>
                      The latest assignment-linked movement inside this fleet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedActiveAssignments.length === 0 ? (
                      <Text tone="muted">No active assignments are running in this fleet right now.</Text>
                    ) : (
                      selectedActiveAssignments.slice(0, 4).map((assignment) => (
                        <div
                          className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50 px-4 py-3"
                          key={assignment.id}
                        >
                          <p className="text-sm font-semibold text-[var(--mobiris-ink)]">
                            {driverLookup.get(assignment.driverId) ?? assignment.driverId}
                          </p>
                          <Text tone="muted">
                            {vehicleLookup.get(assignment.vehicleId) ?? assignment.vehicleId}
                          </Text>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent remittance activity</CardTitle>
                    <CardDescription>
                      The latest collection events recorded for this fleet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRecentRemittances.length === 0 ? (
                      <Text tone="muted">No remittance records have been captured for this fleet yet.</Text>
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
