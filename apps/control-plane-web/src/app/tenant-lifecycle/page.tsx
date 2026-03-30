import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
} from '@mobility-os/ui';
import Link from 'next/link';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import {
  ControlPlaneDataNotice,
  ControlPlaneEmptyStateCard,
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
  ControlPlaneSectionShell,
} from '../../features/shared/control-plane-page-patterns';
import { buildTenantLookup, getTenantLabel } from '../../features/shared/tenant-lookup';
import { listSubscriptions, listTenantLifecycleEvents, listTenants } from '../../lib/api-control-plane';
import { TransitionLifecycleForm } from './transition-lifecycle-form';

function getTone(status: string): 'success' | 'warning' | 'neutral' | 'danger' {
  if (status === 'active') return 'success';
  if (['past_due', 'grace_period', 'suspended'].includes(status)) return 'warning';
  if (status === 'terminated') return 'danger';
  return 'neutral';
}

export default async function TenantLifecyclePage() {
  const dataWarnings: string[] = [];
  const [subscriptionsResult, tenantsResult] = await Promise.allSettled([
    listSubscriptions(),
    listTenants(),
  ]);
  const subscriptions = subscriptionsResult.status === 'fulfilled' ? subscriptionsResult.value : [];
  const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
  if (subscriptionsResult.status !== 'fulfilled') dataWarnings.push('Subscription-backed lifecycle registry could not be loaded.');
  if (tenantsResult.status !== 'fulfilled') dataWarnings.push('Organisation labels could not be resolved.');
  const tenantLookup = buildTenantLookup(tenants);
  const lifecycleEvents = await Promise.all(
    subscriptions.map(async (subscription) => {
      const events = await listTenantLifecycleEvents(subscription.tenantId).catch(() => {
        dataWarnings.push(`Lifecycle history is unavailable for tenant ${subscription.tenantId}.`);
        return [];
      });
      return [subscription.tenantId, events] as const;
    }),
  );

  const latestEventByTenant = new Map(
    lifecycleEvents.map(([tenantId, events]) => [tenantId, events[0] ?? null] as const),
  );
  const recentEvents = lifecycleEvents
    .flatMap(([, events]) => events)
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
    .slice(0, 8);
  const activeCount = subscriptions.filter((subscription) => subscription.status === 'active').length;
  const attentionCount = subscriptions.filter((subscription) =>
    ['past_due', 'grace_period', 'suspended'].includes(subscription.status),
  ).length;

  return (
    <ControlPlaneShell
      description="Review lifecycle posture and apply governed organisation status transitions from the control plane."
      eyebrow="Lifecycle governance"
      title="Tenant lifecycle"
    >
      <div className="space-y-6">
        {dataWarnings.length > 0 ? (
          <ControlPlaneDataNotice
            description={Array.from(new Set(dataWarnings)).join(' ')}
            title="Lifecycle loaded with partial platform data"
          />
        ) : null}
        <ControlPlaneHeroPanel
          badges={[
            { label: `${subscriptions.length} tracked`, tone: 'neutral' },
            { label: `${activeCount} active`, tone: 'success' },
            { label: `${attentionCount} need intervention`, tone: attentionCount ? 'warning' : 'success' },
          ]}
          description="Use lifecycle controls deliberately. This is where platform staff move organisations between governed states and preserve the audit trail of why that change happened."
          eyebrow="Organisation status transitions"
          title="See current lifecycle posture and apply controlled status changes with context."
        />

        <ControlPlaneMetricGrid columns={3}>
          <ControlPlaneMetricCard label="Tracked organisations" value={subscriptions.length} />
          <ControlPlaneMetricCard label="Active posture" tone="success" value={activeCount} />
          <ControlPlaneMetricCard label="Needs attention" tone={attentionCount ? 'warning' : 'success'} value={attentionCount} />
        </ControlPlaneMetricGrid>

        <ControlPlaneSectionShell
          description="Review current organisation status, most recent lifecycle event, and governed transition controls."
          title="Lifecycle registry"
        >
          {subscriptions.length === 0 ? (
            <ControlPlaneEmptyStateCard
              description="No organisation subscriptions are available yet."
              title="No lifecycle registry yet"
            />
          ) : (
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Current status</TableHead>
                    <TableHead>Billing period</TableHead>
                    <TableHead>Latest event</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => {
                    const latestEvent = latestEventByTenant.get(subscription.tenantId);
                    const tenant = getTenantLabel(tenantLookup, subscription.tenantId);
                    return (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                              href={`/tenants/${subscription.tenantId}`}
                            >
                              {tenant.name}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {tenant.slug} · {tenant.country}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone={getTone(subscription.status)}>{subscription.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()} to{' '}
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {latestEvent ? (
                            <div className="space-y-1">
                              <p>
                                {latestEvent.fromStatus ?? 'none'} to {latestEvent.toStatus}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(latestEvent.occurredAt).toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            'No lifecycle events recorded yet'
                          )}
                        </TableCell>
                        <TableCell>
                          <TransitionLifecycleForm tenantId={subscription.tenantId} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableViewport>
          )}
        </ControlPlaneSectionShell>

        <ControlPlaneSectionShell
          description="The latest governed organisation status changes recorded in the control plane."
          title="Recent lifecycle activity"
        >
          {recentEvents.length === 0 ? (
            <ControlPlaneEmptyStateCard
              description="No lifecycle events have been recorded yet."
              title="No lifecycle activity yet"
            />
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => {
                const tenant = getTenantLabel(tenantLookup, event.tenantId);
                return (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                    key={event.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{tenant.name}</p>
                      <Badge tone={getTone(event.toStatus)}>{event.toStatus}</Badge>
                      <p className="text-xs text-slate-500">{new Date(event.occurredAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {event.fromStatus ?? 'none'} to {event.toStatus}
                      {event.reason ? ` · ${event.reason}` : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ControlPlaneSectionShell>
      </div>
    </ControlPlaneShell>
  );
}
