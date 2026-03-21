import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
  Text,
} from '@mobility-os/ui';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import { listSubscriptions, listTenantLifecycleEvents } from '../../lib/api-control-plane';
import { TransitionLifecycleForm } from './transition-lifecycle-form';

function getTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'active') return 'success';
  if (['past_due', 'grace_period', 'suspended'].includes(status)) return 'warning';
  return 'neutral';
}

export default async function TenantLifecyclePage() {
  const subscriptions = await listSubscriptions();
  const lifecycleEvents = await Promise.all(
    subscriptions.map(async (subscription) => {
      const events = await listTenantLifecycleEvents(subscription.tenantId);
      return [subscription.tenantId, events] as const;
    }),
  );

  const latestEventByTenant = new Map(
    lifecycleEvents.map(([tenantId, events]) => [tenantId, events[0] ?? null] as const),
  );
  const recentEvents = lifecycleEvents
    .flatMap(([, events]) => events)
    .sort(
      (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
    )
    .slice(0, 8);
  const activeCount = subscriptions.filter(
    (subscription) => subscription.status === 'active',
  ).length;
  const attentionCount = subscriptions.filter((subscription) =>
    ['past_due', 'grace_period', 'suspended'].includes(subscription.status),
  ).length;

  return (
    <ControlPlaneShell
      description="Review lifecycle posture and apply governed organisation status transitions from the control plane."
      eyebrow="Lifecycle"
      title="Tenant lifecycle"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Tracked organisations</CardDescription>
              <CardTitle>{subscriptions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Active posture</CardDescription>
              <CardTitle>{activeCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Needs attention</CardDescription>
              <CardTitle>{attentionCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle registry</CardTitle>
            <CardDescription>
              Review current organisation status, most recent lifecycle event, and governed
              transition controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    return (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{subscription.tenantId}</p>
                            <p className="text-xs text-slate-500">{subscription.id}</p>
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
            {subscriptions.length === 0 ? (
              <Text className="pt-4">No organisation subscriptions are available yet.</Text>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent lifecycle activity</CardTitle>
            <CardDescription>
              The latest governed organisation status changes recorded in the control plane.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEvents.length === 0 ? (
              <Text>No lifecycle events have been recorded yet.</Text>
            ) : (
              recentEvents.map((event) => (
                <div
                  className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                  key={event.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{event.tenantId}</p>
                    <Badge tone={getTone(event.toStatus)}>{event.toStatus}</Badge>
                    <p className="text-xs text-slate-500">
                      {new Date(event.occurredAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {event.fromStatus ?? 'none'} to {event.toStatus}
                    {event.reason ? ` · ${event.reason}` : ''}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </ControlPlaneShell>
  );
}
