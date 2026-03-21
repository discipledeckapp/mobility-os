import {
  Badge,
  Button,
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
import { listInvoices, listSubscriptions } from '../../lib/api-control-plane';

function formatCurrency(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

type SubscriptionsPageProps = {
  searchParams?: Promise<{
    plan?: string;
    status?: string;
  }>;
};

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const params = (await searchParams) ?? {};
  const [subscriptions, invoices] = await Promise.all([listSubscriptions(), listInvoices()]);
  const planFilter = params.plan?.trim().toLowerCase() ?? '';
  const statusFilter = params.status?.trim().toLowerCase() ?? '';
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesPlan = !planFilter || subscription.planTier.toLowerCase() === planFilter;
    const matchesStatus = !statusFilter || subscription.status.toLowerCase() === statusFilter;
    return matchesPlan && matchesStatus;
  });
  const availablePlanTiers = Array.from(
    new Set(subscriptions.map((subscription) => subscription.planTier)),
  );

  const activeCount = subscriptions.filter(
    (subscription) => subscription.status === 'active',
  ).length;
  const endingSoonCount = subscriptions.filter(
    (subscription) => subscription.cancelAtPeriodEnd,
  ).length;
  const openInvoiceTotal = invoices
    .filter((invoice) => invoice.status === 'open')
    .reduce((sum, invoice) => sum + invoice.amountDueMinorUnits, 0);

  return (
    <ControlPlaneShell
      description="Review organisation subscription posture, active plans, and outstanding billing state."
      eyebrow="Billing"
      title="Subscriptions"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Active subscriptions</CardDescription>
              <CardTitle>{activeCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Ending at period close</CardDescription>
              <CardTitle>{endingSoonCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Open invoice exposure</CardDescription>
              <CardTitle>
                {formatCurrency(openInvoiceTotal, invoices[0]?.currency ?? 'NGN')}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription registry</CardTitle>
            <CardDescription>
              Review each organisation subscription, billing period, and plan posture from one
              platform surface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="mb-4 flex flex-wrap gap-3" method="get">
              <select
                className="rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
                defaultValue={params.plan ?? ''}
                name="plan"
              >
                <option value="">All plans</option>
                {availablePlanTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              <select
                className="rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
                defaultValue={params.status ?? ''}
                name="status"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past due</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button type="submit" variant="secondary">
                Apply
              </Button>
            </form>
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current period</TableHead>
                    <TableHead>Renewal posture</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{subscription.tenantId}</p>
                          <p className="text-xs text-slate-500">{subscription.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{subscription.planName}</p>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {subscription.planTier} · {subscription.currency}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={
                            subscription.status === 'active'
                              ? 'success'
                              : subscription.status === 'trialing'
                                ? 'neutral'
                                : 'warning'
                          }
                        >
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString()} to{' '}
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {subscription.cancelAtPeriodEnd ? (
                          <Badge tone="warning">Cancel at period end</Badge>
                        ) : (
                          <Badge tone="success">Continuing</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableViewport>
            {filteredSubscriptions.length === 0 ? (
              <Text className="pt-4">No subscriptions match the current filters.</Text>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ControlPlaneShell>
  );
}
