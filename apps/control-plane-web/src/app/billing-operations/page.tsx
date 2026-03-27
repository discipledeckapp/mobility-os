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
import {
  getPlatformApiToken,
  listControlPlaneDisputes,
  listControlPlaneDocuments,
  listInvoices,
} from '../../lib/api-control-plane';
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

function getDisputeTone(status: string): 'success' | 'warning' | 'neutral' | 'danger' {
  if (status === 'resolved') return 'success';
  if (['open', 'under_review', 'awaiting_evidence', 'escalated'].includes(status)) return 'warning';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

export default async function BillingOperationsPage() {
  const token = await getPlatformApiToken().catch(() => undefined);
  const [invoices, disputes, documents] = await Promise.all([
    listInvoices(token),
    listControlPlaneDisputes(undefined, token),
    listControlPlaneDocuments(undefined, token),
  ]);
  const openInvoices = invoices.filter((invoice) => invoice.status === 'open');
  const overdueExposure = openInvoices.reduce(
    (sum, invoice) => sum + (invoice.amountDueMinorUnits - invoice.amountPaidMinorUnits),
    0,
  );
  const recentDisputes = disputes.slice(0, 6);
  const recentDocuments = documents.slice(0, 6);

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

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Dispute registry</CardTitle>
              <CardDescription>
                Billing, payment, and reconciliation disputes with evidence-backed status history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispute</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDisputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{dispute.title}</p>
                            <p className="text-xs text-slate-500">{dispute.disputeCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone={getDisputeTone(dispute.status)}>{dispute.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {dispute.relatedEntityType}:{' '}
                          <span className="font-mono text-xs">{dispute.relatedEntityId}</span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(dispute.updatedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableViewport>
              {recentDisputes.length === 0 ? (
                <Text className="pt-4">No disputes have been opened in the control plane yet.</Text>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issued documents</CardTitle>
              <CardDescription>
                Fingerprinted invoices, receipts, and resolution summaries generated from billing events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Fingerprint</TableHead>
                      <TableHead>Download</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDocuments.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{document.documentNumber}</p>
                            <p className="text-xs text-slate-500">{document.relatedEntityType}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{document.documentType}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {document.fingerprint.slice(0, 16)}...
                        </TableCell>
                        <TableCell>
                          <a
                            className="text-sm font-medium text-[var(--mobiris-primary-dark)] hover:underline"
                            href={`/api/records/documents/${document.id}/content`}
                          >
                            Download
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableViewport>
              {recentDocuments.length === 0 ? (
                <Text className="pt-4">No platform documents have been issued yet.</Text>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
