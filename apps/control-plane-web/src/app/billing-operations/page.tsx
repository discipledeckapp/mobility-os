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
import { listInvoices } from '../../lib/api-control-plane';
import { RunBillingOpsCard } from './run-billing-ops-card';

function formatCurrency(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function getInvoiceTone(status: string): 'success' | 'warning' | 'neutral' {
  if (status === 'paid') return 'success';
  if (['open', 'uncollectible'].includes(status)) return 'warning';
  return 'neutral';
}

export default async function BillingOperationsPage() {
  const invoices = await listInvoices();
  const openInvoices = invoices.filter((invoice) => invoice.status === 'open');
  const overdueExposure = openInvoices.reduce(
    (sum, invoice) => sum + (invoice.amountDueMinorUnits - invoice.amountPaidMinorUnits),
    0,
  );

  return (
    <ControlPlaneShell
      description="Run billing and collections deliberately, then review invoice posture without leaving the control plane."
      eyebrow="Billing"
      title="Billing operations"
    >
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Invoices tracked</CardDescription>
                <CardTitle>{invoices.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Open invoices</CardDescription>
                <CardTitle>{openInvoices.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-slate-200/80">
              <CardHeader>
                <CardDescription>Open exposure</CardDescription>
                <CardTitle>
                  {formatCurrency(overdueExposure, invoices[0]?.currency ?? 'NGN')}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <RunBillingOpsCard />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice registry</CardTitle>
            <CardDescription>
              Review invoice posture, collection exposure, and payment outcomes across
              organisations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount due</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{invoice.tenantId}</p>
                          <p className="text-xs text-slate-500">{invoice.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge tone={getInvoiceTone(invoice.status)}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {formatCurrency(invoice.amountDueMinorUnits, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(invoice.periodStart).toLocaleDateString()} to{' '}
                        {new Date(invoice.periodEnd).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {invoice.dueAt ? new Date(invoice.dueAt).toLocaleString() : 'No due date'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableViewport>
            {invoices.length === 0 ? (
              <Text className="pt-4">No invoices have been generated yet.</Text>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ControlPlaneShell>
  );
}
