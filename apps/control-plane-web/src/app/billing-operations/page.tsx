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
import { connection } from 'next/server';
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
import {
  listControlPlaneDisputes,
  listControlPlaneDocuments,
  listInvoices,
  listTenants,
} from '../../lib/api-control-plane';
import { requirePlatformSession } from '../../lib/require-platform-session';
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
  await connection();

  const token = await requirePlatformSession();
  const dataWarnings: string[] = [];
  const [invoicesResult, disputesResult, documentsResult, tenantsResult] =
    await Promise.allSettled([
      listInvoices(token),
      listControlPlaneDisputes(undefined, token),
      listControlPlaneDocuments(undefined, token),
      listTenants(token),
    ]);
  const invoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value : [];
  const disputes = disputesResult.status === 'fulfilled' ? disputesResult.value : [];
  const documents = documentsResult.status === 'fulfilled' ? documentsResult.value : [];
  const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
  if (invoicesResult.status !== 'fulfilled') dataWarnings.push('Invoice registry is temporarily unavailable.');
  if (disputesResult.status !== 'fulfilled') dataWarnings.push('Dispute registry could not be loaded.');
  if (documentsResult.status !== 'fulfilled') dataWarnings.push('Issued billing documents could not be loaded.');
  if (tenantsResult.status !== 'fulfilled') dataWarnings.push('Organisation labels could not be resolved.');
  const tenantLookup = buildTenantLookup(tenants);
  const openInvoices = invoices.filter((invoice) => invoice.status === 'open');
  const overdueExposure = openInvoices.reduce(
    (sum, invoice) => sum + (invoice.amountDueMinorUnits - invoice.amountPaidMinorUnits),
    0,
  );
  const recentDisputes = disputes.slice(0, 6);
  const recentDocuments = documents.slice(0, 6);

  return (
    <ControlPlaneShell
      description="Run billing cycles and collections deliberately, then inspect invoices, disputes, and issued documents from one admin surface."
      eyebrow="Billing operations"
      title="Billing operations"
    >
      <div className="space-y-6">
        {dataWarnings.length > 0 ? (
          <ControlPlaneDataNotice
            description={dataWarnings.join(' ')}
            title="Billing operations loaded with partial platform data"
          />
        ) : null}
        <ControlPlaneHeroPanel
          badges={[
            { label: `${openInvoices.length} open invoices`, tone: openInvoices.length ? 'warning' : 'success' },
            { label: `${recentDisputes.length} recent disputes`, tone: recentDisputes.length ? 'warning' : 'neutral' },
            { label: `${recentDocuments.length} recent documents`, tone: 'neutral' },
          ]}
          description="This is the platform billing desk. Use it to trigger billing runs, watch invoice exposure, review disputes, and inspect issued billing artefacts without relying on raw database state."
          eyebrow="Collections and billing desk"
          title="See invoice exposure, dispute load, and platform billing artefacts together."
        >
          <RunBillingOpsCard />
        </ControlPlaneHeroPanel>

        <ControlPlaneMetricGrid columns={3}>
          <ControlPlaneMetricCard label="Invoices tracked" value={invoices.length} />
          <ControlPlaneMetricCard label="Open invoices" tone={openInvoices.length ? 'warning' : 'success'} value={openInvoices.length} />
          <ControlPlaneMetricCard
            detail="Outstanding across open invoices."
            label="Open exposure"
            tone={overdueExposure > 0 ? 'warning' : 'success'}
            value={formatCurrency(overdueExposure, invoices[0]?.currency ?? 'NGN')}
          />
        </ControlPlaneMetricGrid>

        <ControlPlaneSectionShell
          description="Review invoice posture, collection exposure, and tenant-level payment pressure."
          title="Invoice registry"
        >
          {invoices.length === 0 ? (
            <ControlPlaneEmptyStateCard
              description="No invoices have been generated yet."
              title="No invoice registry yet"
            />
          ) : (
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
                  {invoices.map((invoice) => {
                    const tenant = getTenantLabel(tenantLookup, invoice.tenantId);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                              href={`/tenants/${invoice.tenantId}`}
                            >
                              {tenant.name}
                            </Link>
                            <p className="text-xs text-slate-500">{tenant.slug}</p>
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
                    );
                  })}
                </TableBody>
              </Table>
            </TableViewport>
          )}
        </ControlPlaneSectionShell>

        <div className="grid gap-6 xl:grid-cols-2">
          <ControlPlaneSectionShell
            description="Billing, payment, and reconciliation disputes with evidence-backed status history."
            title="Dispute registry"
          >
            {recentDisputes.length === 0 ? (
              <ControlPlaneEmptyStateCard
                description="No disputes have been opened in the control plane yet."
                title="No active disputes"
              />
            ) : (
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispute</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDisputes.map((dispute) => {
                      const tenant = dispute.tenantId ? getTenantLabel(tenantLookup, dispute.tenantId) : null;
                      return (
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
                            {tenant ? `${tenant.name} · ${tenant.slug}` : 'No tenant linked'}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(dispute.updatedAt).toLocaleString()}
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
            description="Fingerprinted invoices, receipts, and resolution artefacts generated from billing events."
            title="Issued documents"
          >
            {recentDocuments.length === 0 ? (
              <ControlPlaneEmptyStateCard
                description="No platform documents have been issued yet."
                title="No billing artefacts yet"
              />
            ) : (
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
            )}
          </ControlPlaneSectionShell>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
