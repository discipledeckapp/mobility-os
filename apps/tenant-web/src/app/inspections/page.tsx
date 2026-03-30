import Link from 'next/link';
import type { Route } from 'next';
import { Badge, Text } from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  TenantEmptyStateCard,
  TenantHeroPanel,
  TenantMetricCard,
  TenantMetricGrid,
  TenantSectionHeader,
  TenantSurfaceCard,
  TenantToolbarPanel,
} from '../../features/shared/tenant-page-patterns';
import {
  getOperationalReadinessReport,
  getTenantApiToken,
  getTenantMe,
  listFleets,
  listTenantInspections,
  listVehicles,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';
import { InspectionWorkbench } from './inspection-workbench';

function inspectionStatusTone(
  status: string,
): 'neutral' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'draft':
    case 'submitted':
    case 'under_review':
      return 'warning';
    case 'rejected':
    case 'escalated':
      return 'danger';
    default:
      return 'neutral';
  }
}

function inspectionRiskTone(
  riskLevel: string | null | undefined,
): 'neutral' | 'success' | 'warning' | 'danger' {
  switch ((riskLevel ?? '').toUpperCase()) {
    case 'GREEN':
      return 'success';
    case 'AMBER':
      return 'warning';
    case 'RED':
      return 'danger';
    default:
      return 'neutral';
  }
}

function formatInspectionType(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function formatDateTime(value: string | null | undefined, locale: string) {
  if (!value) {
    return 'Not yet recorded';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function isWithinPastDays(value: string | null | undefined, days: number) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = Date.now();
  return now - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

export default async function InspectionsPage() {
  const token = await getTenantApiToken().catch(() => undefined);

  const [report, inspectionsPage, fleets, vehiclesPage, tenant] = await Promise.all([
    getOperationalReadinessReport(token),
    listTenantInspections({ limit: 100 }, token),
    listFleets(token).catch(() => []),
    listVehicles({ limit: 200 }, token).catch(() => ({
      data: [],
      total: 0,
      page: 1,
      limit: 200,
    })),
    getTenantMe(token).catch(() => null),
  ]);

  const locale = getFormattingLocale(tenant?.country);
  const fleetNames = new Map(fleets.map((fleet) => [fleet.id, fleet.name]));
  const vehicleLabels = new Map<string, string>();
  const vehicleFleetIds = new Map<string, string>();
  const vehicleStatuses = new Map<string, string>();
  const vehicleMaintenanceSummaries = new Map<string, string>();

  for (const vehicle of report.vehicles) {
    vehicleLabels.set(vehicle.id, vehicle.primaryLabel);
    vehicleFleetIds.set(vehicle.id, vehicle.fleetId);
    vehicleStatuses.set(vehicle.id, vehicle.status);
    vehicleMaintenanceSummaries.set(vehicle.id, vehicle.maintenanceSummary);
  }

  for (const vehicle of vehiclesPage.data) {
    if (!vehicleLabels.has(vehicle.id)) {
      vehicleLabels.set(vehicle.id, vehicle.tenantVehicleCode || vehicle.systemVehicleCode);
    }
    if (!vehicleFleetIds.has(vehicle.id)) {
      vehicleFleetIds.set(vehicle.id, vehicle.fleetId);
    }
    if (!vehicleStatuses.has(vehicle.id)) {
      vehicleStatuses.set(vehicle.id, vehicle.status);
    }
  }

  const inspectionQueueVehicles = report.vehicles.filter((vehicle) => vehicle.status === 'inspection');
  const pendingReviewCount = inspectionsPage.data.filter((item) =>
    ['submitted', 'under_review', 'escalated'].includes(item.status),
  ).length;
  const draftCount = inspectionsPage.data.filter((item) => item.status === 'draft').length;
  const flaggedCount = inspectionsPage.data.filter((item) =>
    ['AMBER', 'RED'].includes(item.latestScore?.riskLevel?.toUpperCase() ?? ''),
  ).length;
  const reviewedRecentlyCount = inspectionsPage.data.filter(
    (item) => item.status === 'approved' && isWithinPastDays(item.reviewedAt, 7),
  ).length;
  const latestInspectionByVehicle = new Map<string, (typeof inspectionsPage.data)[number]>();

  for (const inspection of inspectionsPage.data) {
    if (!latestInspectionByVehicle.has(inspection.vehicleId)) {
      latestInspectionByVehicle.set(inspection.vehicleId, inspection);
    }
  }

  const neverInspectedCount = vehiclesPage.data.filter(
    (vehicle) => !latestInspectionByVehicle.has(vehicle.id),
  ).length;

  return (
    <TenantAppShell
      description="Track inspection holds, recent review outcomes, and the vehicles that still need a clean inspection trail before they return to service."
      eyebrow="Operations"
      title="Inspections"
    >
      <div className="space-y-6">
        <TenantHeroPanel
          actions={
            <>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                href={'/maintenance' as Route}
              >
                Open maintenance board
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all hover:bg-[var(--mobiris-primary-dark)]"
                href={'/vehicles' as Route}
              >
                Open vehicle registry
              </Link>
            </>
          }
          description="Inspection outcomes should answer one question fast: which vehicles are safe to return to operations, and which ones still need review or remediation."
          eyebrow="Operations"
          title="Inspection command center"
        >
          <TenantToolbarPanel className="grid gap-3 md:grid-cols-3">
            <div>
              <Text tone="strong">Inspection holds</Text>
              <Text tone="muted">
                Vehicles explicitly blocked on inspection review stay visible here until they are resolved in the vehicle record.
              </Text>
            </div>
            <div>
              <Text tone="strong">Recent outcomes</Text>
              <Text tone="muted">
                Review the latest approvals, escalations, and failed findings without digging through each vehicle command center one by one.
              </Text>
            </div>
            <div>
              <Text tone="strong">Coverage gaps</Text>
              <Text tone="muted">
                Vehicles without a recent inspection record remain easy to spot so inspection drift does not stay invisible.
              </Text>
            </div>
          </TenantToolbarPanel>
        </TenantHeroPanel>

        <TenantMetricGrid>
          <TenantMetricCard
            accent="warning"
            label="Needs review"
            note="Submitted, under-review, or escalated inspections."
            value={pendingReviewCount}
          />
          <TenantMetricCard
            accent="slate"
            label="Draft captures"
            note="Started but not yet submitted."
            value={draftCount}
          />
          <TenantMetricCard
            accent="danger"
            label="Flagged findings"
            note="Latest inspections with amber or red risk posture."
            value={flaggedCount}
          />
          <TenantMetricCard
            accent="sky"
            label="No inspection trail"
            note="Vehicles in the registry without any recorded inspection yet."
            value={neverInspectedCount}
          />
        </TenantMetricGrid>

        <TenantSurfaceCard
          contentClassName="pt-6"
          description="Record new inspection outcomes from the command center so vehicles on hold can be updated without switching back into each vehicle detail page."
          title="Inspection workbench"
        >
          <InspectionWorkbench inspections={inspectionsPage.data} vehicles={vehiclesPage.data} />
        </TenantSurfaceCard>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <TenantSurfaceCard
            contentClassName="pt-6"
            description="Vehicles currently marked as inspection-blocked, with the latest inspection context pulled into one review queue."
            title="Inspection hold queue"
          >
            {inspectionQueueVehicles.length > 0 ? (
              <div className="space-y-3">
                {inspectionQueueVehicles.map((vehicle) => {
                  const latestInspection = latestInspectionByVehicle.get(vehicle.id);
                  return (
                    <div
                      className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                      key={vehicle.id}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                            href={`/vehicles/${vehicle.id}` as Route}
                          >
                            {vehicle.primaryLabel}
                          </Link>
                          <Badge tone="warning">Inspection hold</Badge>
                          {latestInspection?.latestScore ? (
                            <Badge tone={inspectionRiskTone(latestInspection.latestScore.riskLevel)}>
                              {latestInspection.latestScore.riskLevel}
                            </Badge>
                          ) : null}
                        </div>
                        <Text tone="muted">
                          Fleet: {fleetNames.get(vehicle.fleetId) ?? vehicle.fleetId}
                        </Text>
                        <Text tone="muted">
                          {latestInspection
                            ? `${formatInspectionType(latestInspection.inspectionType)} • ${formatDateTime(latestInspection.submittedAt ?? latestInspection.startedAt, locale)}`
                            : 'No structured inspection has been submitted for this vehicle yet.'}
                        </Text>
                        <Text tone="muted">
                          {latestInspection?.summary ?? vehicle.maintenanceSummary}
                        </Text>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                          href={`/vehicles/${vehicle.id}` as Route}
                        >
                          Open vehicle
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <TenantEmptyStateCard
                description="Vehicles that are actively blocked on inspection will appear here so your team can clear them back into operations quickly."
                title="No vehicles are currently on inspection hold"
              />
            )}
          </TenantSurfaceCard>

          <TenantSurfaceCard
            contentClassName="pt-6"
            description="A quick read on recent approvals and the part of the fleet that still lacks inspection coverage."
            title="Inspection posture"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--mobiris-radius-card)] border border-emerald-200 bg-emerald-50/70 px-4 py-4">
                <Text tone="strong">Approved this week</Text>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-emerald-950">
                  {reviewedRecentlyCount}
                </p>
                <Text tone="muted">Recent approvals that moved vehicles closer to return-to-service.</Text>
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-amber-200 bg-amber-50/70 px-4 py-4">
                <Text tone="strong">Vehicles awaiting inspection</Text>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-amber-950">
                  {inspectionQueueVehicles.length}
                </p>
                <Text tone="muted">Vehicles already flagged in operational readiness as inspection-blocked.</Text>
              </div>
            </div>
            <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4">
              <Text tone="strong">What to do next</Text>
              <div className="mt-3 space-y-2">
                <Text tone="muted">1. Review vehicles on inspection hold and open the latest inspection context.</Text>
                <Text tone="muted">2. Resolve maintenance or compliance follow-up before returning the vehicle to active duty.</Text>
                <Text tone="muted">3. Use the vehicle registry to start missing inspections so fleet coverage does not drift.</Text>
              </div>
            </div>
          </TenantSurfaceCard>
        </div>

        <TenantSurfaceCard
          actions={
            <Link
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/reports/readiness' as Route}
            >
              Open readiness report
            </Link>
          }
          contentClassName="pt-6"
          description="Recent structured inspections across the tenant, including review status, score posture, and the vehicle they affect."
          title="Recent inspection activity"
        >
          {inspectionsPage.data.length > 0 ? (
            <div className="space-y-3">
              {inspectionsPage.data.map((inspection) => {
                const vehicleLabel = vehicleLabels.get(inspection.vehicleId) ?? inspection.vehicleId;
                const fleetId = vehicleFleetIds.get(inspection.vehicleId);
                const fleetLabel = fleetId ? (fleetNames.get(fleetId) ?? fleetId) : 'Unassigned fleet';
                const status = vehicleStatuses.get(inspection.vehicleId);
                return (
                  <div
                    className="grid gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-4 lg:grid-cols-[1.25fr_0.95fr_0.8fr_auto]"
                    key={inspection.id}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          className="font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/vehicles/${inspection.vehicleId}` as Route}
                        >
                          {vehicleLabel}
                        </Link>
                        <Badge tone={inspectionStatusTone(inspection.status)}>
                          {inspection.status.replaceAll('_', ' ')}
                        </Badge>
                        {inspection.latestScore ? (
                          <Badge tone={inspectionRiskTone(inspection.latestScore.riskLevel)}>
                            {inspection.latestScore.riskLevel} · {inspection.latestScore.score}
                          </Badge>
                        ) : null}
                      </div>
                      <Text tone="muted">
                        {formatInspectionType(inspection.inspectionType)} • {fleetLabel}
                        {status ? ` • vehicle status ${status}` : ''}
                      </Text>
                      <Text tone="muted">
                        {inspection.summary ?? vehicleMaintenanceSummaries.get(inspection.vehicleId) ?? 'No inspection summary recorded.'}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="strong">Started</Text>
                      <Text tone="muted">{formatDateTime(inspection.startedAt, locale)}</Text>
                      <Text tone="strong">Submitted</Text>
                      <Text tone="muted">{formatDateTime(inspection.submittedAt, locale)}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="strong">Reviewed</Text>
                      <Text tone="muted">{formatDateTime(inspection.reviewedAt, locale)}</Text>
                      <Text tone="strong">Checklist items</Text>
                      <Text tone="muted">{inspection.results.length}</Text>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        href={`/vehicles/${inspection.vehicleId}` as Route}
                      >
                        Open vehicle
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <TenantEmptyStateCard
              actions={
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--mobiris-primary-dark)]"
                  href={'/vehicles' as Route}
                >
                  Start from the vehicle registry
                </Link>
              }
              description="As your team starts and reviews structured inspections, the latest outcomes will appear here with vehicle and fleet context."
              title="No inspection activity has been recorded yet"
            />
          )}
        </TenantSurfaceCard>

        <TenantSectionHeader
          description="This workflow now gives inspections their own home. The next step is deeper capture and review tooling so teams can start, submit, and resolve inspection work without leaving the command center."
          eyebrow="What’s next"
          title="Workflow coverage"
        />
      </div>
    </TenantAppShell>
  );
}
