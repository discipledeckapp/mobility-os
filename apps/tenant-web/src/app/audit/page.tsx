import Link from 'next/link';
import type { Route } from 'next';
import { Badge, Text } from '@mobility-os/ui';
import {
  TenantEmptyStateCard,
  TenantHeroPanel,
  TenantMetricCard,
  TenantMetricGrid,
  TenantSectionHeader,
  TenantSurfaceCard,
  TenantToolbarPanel,
} from '../../features/shared/tenant-page-patterns';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import { getTenantApiToken, getTenantSession, listAuditLog, type AuditLogRecord } from '../../lib/api-core';

function formatDateTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function actionTone(action: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (action.includes('created') || action.includes('started') || action.includes('approved')) {
    return 'success';
  }
  if (action.includes('updated') || action.includes('reviewed') || action.includes('submitted')) {
    return 'warning';
  }
  if (action.includes('rejected') || action.includes('archived') || action.includes('cancel')) {
    return 'danger';
  }
  return 'neutral';
}

function formatAction(action: string) {
  return action.replaceAll('.', ' ').replaceAll('_', ' ');
}

function formatEntity(entityType: string) {
  return entityType.replaceAll('_', ' ');
}

function getEntityHref(item: AuditLogRecord): Route | null {
  const metadataVehicleId =
    item.metadata && typeof item.metadata.vehicleId === 'string' ? item.metadata.vehicleId : null;

  switch (item.entityType) {
    case 'driver':
      return `/drivers/${item.entityId}` as Route;
    case 'vehicle':
      return `/vehicles/${item.entityId}` as Route;
    case 'assignment':
      return `/assignments/${item.entityId}` as Route;
    case 'remittance':
      return '/remittance' as Route;
    case 'work_order':
      return metadataVehicleId ? (`/vehicles/${metadataVehicleId}?tab=maintenance` as Route) : ('/vehicles/health' as Route);
    case 'inspection':
      return metadataVehicleId ? (`/vehicles/${metadataVehicleId}?tab=history` as Route) : ('/vehicles/health' as Route);
    case 'vehicle_incident':
      return metadataVehicleId ? (`/vehicles/${metadataVehicleId}?tab=history` as Route) : ('/vehicles' as Route);
    case 'dispute':
    case 'document':
      return '/operations' as Route;
    default:
      return null;
  }
}

function summarizeMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) {
    return null;
  }

  const entries = Object.entries(metadata)
    .filter(([, value]) => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    .slice(0, 3)
    .map(([key, value]) => `${key.replaceAll('_', ' ')}: ${String(value)}`);

  return entries.length > 0 ? entries.join(' · ') : null;
}

export default async function AuditPage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const [session, auditPage] = await Promise.all([
    getTenantSession(token).catch(() => null),
    listAuditLog({ limit: 100 }, token).catch(() => ({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    })),
  ]);

  const locale = session?.formattingLocale ?? 'en-NG';
  const events = auditPage.data;
  const recentCreates = events.filter((item) => item.action.includes('created') || item.action.includes('started')).length;
  const recentUpdates = events.filter((item) => item.action.includes('updated') || item.action.includes('reviewed') || item.action.includes('submitted')).length;
  const sensitiveChanges = events.filter((item) =>
    ['driver', 'assignment', 'work_order', 'inspection', 'dispute'].includes(item.entityType),
  ).length;
  const actorlessEvents = events.filter((item) => !item.actorId).length;

  return (
    <TenantAppShell
      description="Use this only when you need deeper chronology, actor tracing, or debug-level investigation."
      eyebrow="Advanced"
      title="Advanced Audit"
    >
      <div className="space-y-6">
        <TenantHeroPanel
          actions={
            <>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                href={'/operations' as Route}
              >
                Open operations
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all hover:bg-[var(--mobiris-primary-dark)]"
                href={'/reports/readiness' as Route}
              >
                Open readiness report
              </Link>
            </>
          }
          description="This is the secondary trace view for deeper investigations. Use Operations first, then come here when you need exact chronology or actor-level debugging."
          eyebrow="Advanced"
          title="Operational trace audit"
        >
          <TenantToolbarPanel className="grid gap-3 md:grid-cols-3">
            <div>
              <Text tone="strong">Action history</Text>
              <Text tone="muted">Recent operational mutations across drivers, assignments, maintenance, inspections, disputes, and other important records.</Text>
            </div>
            <div>
              <Text tone="strong">Traceability</Text>
              <Text tone="muted">Each item keeps the entity type, event action, actor, and a snapshot of the operational context that triggered it.</Text>
            </div>
            <div>
              <Text tone="strong">Operational follow-up</Text>
              <Text tone="muted">Audit should lead back to action. Each row links back into the owning workflow whenever there is a clear destination.</Text>
            </div>
          </TenantToolbarPanel>
        </TenantHeroPanel>

        <TenantMetricGrid>
          <TenantMetricCard accent="success" label="New actions" note="Creates and starts in the current page window." value={recentCreates} />
          <TenantMetricCard accent="warning" label="State changes" note="Updates, reviews, and submissions in the current page window." value={recentUpdates} />
          <TenantMetricCard accent="sky" label="Sensitive workflow events" note="Drivers, assignments, maintenance, inspections, and disputes." value={sensitiveChanges} />
          <TenantMetricCard accent={actorlessEvents > 0 ? 'warning' : 'slate'} label="System-originated events" note="Events without a direct acting user attached." value={actorlessEvents} />
        </TenantMetricGrid>

        <TenantSurfaceCard
          contentClassName="pt-6"
          description="Recent tenant operations audit entries. This is the fastest place to inspect chronology before opening the underlying module."
          title="Audit ledger"
        >
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event) => {
                const href = getEntityHref(event);
                const metadataSummary = summarizeMetadata(event.metadata);
                return (
                  <div
                    className="grid gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white px-4 py-4 lg:grid-cols-[1.15fr_0.95fr_auto]"
                    key={event.id}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Text tone="strong">{formatEntity(event.entityType)}</Text>
                        <Badge tone={actionTone(event.action)}>{formatAction(event.action)}</Badge>
                      </div>
                      <Text tone="muted">
                        Entity {event.entityId.slice(0, 10)}{event.entityId.length > 10 ? '…' : ''}
                        {event.actorId ? ` · actor ${event.actorId.slice(0, 10)}${event.actorId.length > 10 ? '…' : ''}` : ' · system event'}
                      </Text>
                      <Text tone="muted">{metadataSummary ?? 'No extra event metadata was recorded for this action.'}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="strong">Recorded</Text>
                      <Text tone="muted">{formatDateTime(event.createdAt, locale)}</Text>
                      <Text tone="strong">Change snapshots</Text>
                      <Text tone="muted">
                        {event.beforeState || event.afterState ? 'Before/after payload retained' : 'No state snapshot recorded'}
                      </Text>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {href ? (
                        <Link
                          className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                          href={href}
                        >
                          Open workflow
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <TenantEmptyStateCard
              description="Audit entries will appear here as your team creates, changes, reviews, and resolves operational records."
              title="No audit events recorded yet"
            />
          )}
        </TenantSurfaceCard>

        <TenantSurfaceCard contentClassName="pt-6">
          <TenantSectionHeader
            description="Use audit history to answer who changed an operational record, then jump into the owning workflow to continue the investigation or resolve the issue."
            title="Suggested investigations"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/drivers' as Route}
            >
              <Text tone="strong">Driver changes</Text>
              <Text tone="muted">Inspect onboarding, archival, reverification, and identity-related mutations.</Text>
            </Link>
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/vehicles/health' as Route}
            >
              <Text tone="strong">Maintenance activity</Text>
              <Text tone="muted">Review vehicle health queues, work-order progression, and repair pressure.</Text>
            </Link>
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/operations' as Route}
            >
              <Text tone="strong">Operations and evidence</Text>
              <Text tone="muted">Return to the main operations surface for action queues, activity, and supporting evidence.</Text>
            </Link>
          </div>
        </TenantSurfaceCard>
      </div>
    </TenantAppShell>
  );
}
