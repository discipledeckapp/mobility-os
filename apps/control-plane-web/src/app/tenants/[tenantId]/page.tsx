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
  TableViewport,
  Text,
} from '@mobility-os/ui';
import { ControlPlaneShell } from '../../../features/shared/control-plane-shell';
import { getTenantDetail } from '../../../lib/api-control-plane';
import { TransitionTenantCard } from './transition-tenant-card';

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'suspended' || status === 'past_due') return 'warning';
  if (status === 'terminated') return 'danger';
  return 'neutral';
}

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await getTenantDetail(tenantId);

  return (
    <ControlPlaneShell
      description="Review the tenant governance record, subscription posture, invoices, and feature overrides."
      eyebrow="Organisation governance"
      title={tenant.name}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tenant detail</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Text tone="muted">Slug</Text>
                <p className="mt-1 text-sm font-semibold text-slate-900">{tenant.slug}</p>
              </div>
              <div>
                <Text tone="muted">Country</Text>
                <p className="mt-1 text-sm font-semibold text-slate-900">{tenant.country}</p>
              </div>
              <div>
                <Text tone="muted">Tenant status</Text>
                <div className="mt-2">
                  <Badge tone={statusTone(tenant.status)}>{tenant.status}</Badge>
                </div>
              </div>
              <div>
                <Text tone="muted">Created</Text>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription status</CardTitle>
            </CardHeader>
            <CardContent>
              {tenant.subscription ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Text tone="muted">Plan</Text>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {tenant.subscription.planName}
                    </p>
                  </div>
                  <div>
                    <Text tone="muted">Tier</Text>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {tenant.subscription.planTier}
                    </p>
                  </div>
                  <div>
                    <Text tone="muted">Status</Text>
                    <div className="mt-2">
                      <Badge tone={statusTone(tenant.subscription.status)}>
                        {tenant.subscription.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Text tone="muted">Current period</Text>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {new Date(tenant.subscription.currentPeriodStart).toLocaleDateString()} to{' '}
                      {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <Text>No subscription is attached to this tenant yet.</Text>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice history</CardTitle>
            </CardHeader>
            <CardContent>
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount due</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenant.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.id}</TableCell>
                        <TableCell>
                          <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.currency} {(invoice.amountDueMinorUnits / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.periodStart).toLocaleDateString()} to{' '}
                          {new Date(invoice.periodEnd).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableViewport>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <TransitionTenantCard tenantId={tenant.id} />

          <Card>
            <CardHeader>
              <CardTitle>Feature flag overrides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenant.featureFlagOverrides.length === 0 ? (
                <Text>No tenant-specific feature flag overrides are configured.</Text>
              ) : (
                tenant.featureFlagOverrides.map((override) => (
                  <div className="rounded-xl border border-slate-200 px-4 py-3" key={override.id}>
                    <p className="text-sm font-semibold text-slate-900">{override.flagKey}</p>
                    <Text tone="muted">
                      {override.isEnabled ? 'Enabled' : 'Disabled'}
                      {override.planTier ? ` · ${override.planTier}` : ''}
                      {override.countryCode ? ` · ${override.countryCode}` : ''}
                    </Text>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lifecycle activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenant.lifecycleEvents.length === 0 ? (
                <Text>No lifecycle events recorded yet.</Text>
              ) : (
                tenant.lifecycleEvents.map((event) => (
                  <div className="rounded-xl border border-slate-200 px-4 py-3" key={event.id}>
                    <p className="text-sm font-semibold text-slate-900">
                      {event.fromStatus ?? 'Unknown'} → {event.toStatus}
                    </p>
                    <Text tone="muted">
                      {new Date(event.occurredAt).toLocaleString()} · {event.triggeredBy}
                    </Text>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
