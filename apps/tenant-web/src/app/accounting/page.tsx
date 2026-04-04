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
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  TenantEmptyStateCard,
  TenantMetricCard,
  TenantMetricGrid,
  TenantSurfaceCard,
} from '../../features/shared/tenant-page-patterns';
import {
  getAccountingBalanceSummary,
  getAccountingProfitAndLoss,
  type TenantApiContext,
  getTenantApiContext,
  getTenantApiToken,
  listAccountingLedger,
  listBusinessEntities,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';
import { getEntryTone, getNetProfitAccent } from './view-helpers';

function formatAmount(amountMinorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatTimestamp(value: string, locale: string): string {
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? value : timestamp.toLocaleString(locale);
}

export default async function AccountingPage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const [context, businessEntities] = await Promise.all([
    getTenantApiContext(token).catch(() => ({}) as TenantApiContext),
    listBusinessEntities(token).catch(() => []),
  ]);

  const businessEntityId =
    context.businessEntityId ?? businessEntities[0]?.id ?? null;
  const businessEntityName =
    businessEntities.find((entity) => entity.id === businessEntityId)?.name ?? 'your business entity';
  const locale = getFormattingLocale(businessEntities[0]?.country ?? 'NG');

  if (!businessEntityId) {
    return (
      <TenantAppShell
        description="Ledger, balance summaries, and profit visibility for your tenant operations."
        eyebrow="Finance"
        title="Accounting"
      >
        <TenantEmptyStateCard
          title="No business entity is available yet"
          description="Accounting becomes available after your tenant business hierarchy is set up."
        />
      </TenantAppShell>
    );
  }

  const [summary, profitAndLoss, ledger] = await Promise.all([
    getAccountingBalanceSummary(businessEntityId, token),
    getAccountingProfitAndLoss(businessEntityId, {}, token),
    listAccountingLedger(businessEntityId, { limit: 20 }, token),
  ]);

  return (
    <TenantAppShell
      description="Ledger, balances, and a basic profit-and-loss view for tenant operations."
      eyebrow="Finance"
      title="Accounting"
    >
      <section className="mb-6 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Accounting
            </p>
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Ledger and profit visibility for {businessEntityName}
            </h2>
            <p className="max-w-3xl text-sm text-slate-600">
              This view derives tenant operational finance from remittance collections and wallet ledger activity without mixing it with platform billing.
            </p>
          </div>
          <Badge tone="neutral">{summary.currency}</Badge>
        </div>
      </section>

      <TenantMetricGrid className="mb-6">
        <TenantMetricCard
          label="Current balance"
          value={formatAmount(summary.currentBalanceMinorUnits, summary.currency, locale)}
          accent="slate"
        />
        <TenantMetricCard
          label="Collected remittance"
          value={formatAmount(summary.remittanceCollectedMinorUnits, summary.currency, locale)}
          accent="success"
        />
        <TenantMetricCard
          label="Pending remittance"
          value={formatAmount(summary.pendingRemittanceMinorUnits, summary.currency, locale)}
          accent="warning"
        />
        <TenantMetricCard
          label="Net profit"
          value={formatAmount(profitAndLoss.netProfitMinorUnits, profitAndLoss.currency, locale)}
          accent={getNetProfitAccent(profitAndLoss.netProfitMinorUnits)}
        />
      </TenantMetricGrid>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_minmax(280px,0.9fr)]">
        <TenantSurfaceCard
          title="Ledger entries"
          description="Recent tenant-side financial events derived from operational wallet activity."
        >
          {ledger.data.length === 0 ? (
            <TenantEmptyStateCard
              title="No ledger entries yet"
              description="Ledger activity will appear after remittance, adjustments, or payouts are recorded."
            />
          ) : (
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.data.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatTimestamp(entry.createdAt, locale)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge tone={getEntryTone(entry.type)}>{entry.category.replace(/_/g, ' ')}</Badge>
                          {entry.description ? (
                            <p className="text-xs text-slate-500">{entry.description}</p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {entry.referenceId ?? 'Direct ledger event'}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {entry.remittance?.status?.replace(/_/g, ' ') ?? entry.type}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={entry.direction === 'inflow' ? 'text-emerald-700' : 'text-amber-700'}>
                          {entry.direction === 'inflow' ? '+' : '-'}
                          {formatAmount(entry.amountMinorUnits, entry.currency, locale)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableViewport>
          )}
        </TenantSurfaceCard>

        <div className="space-y-6">
          <TenantSurfaceCard
            title="Balance summary"
            description="Current tenant operational-finance posture for this business entity."
          >
            <dl className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Total credits</dt>
                <dd className="font-medium text-slate-950">
                  {formatAmount(summary.totalCreditsMinorUnits, summary.currency, locale)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Total debits</dt>
                <dd className="font-medium text-slate-950">
                  {formatAmount(summary.totalDebitsMinorUnits, summary.currency, locale)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Overdue remittances</dt>
                <dd className="font-medium text-slate-950">{summary.overdueRemittanceCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Disputed remittances</dt>
                <dd className="font-medium text-slate-950">{summary.disputedRemittanceCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Ledger entries</dt>
                <dd className="font-medium text-slate-950">{summary.ledgerEntryCount}</dd>
              </div>
            </dl>
          </TenantSurfaceCard>

          <TenantSurfaceCard
            title="Profit and loss"
            description="Basic operational P&L derived from collected remittance and tracked wallet expenses."
          >
            <dl className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Revenue</dt>
                <dd className="font-medium text-slate-950">
                  {formatAmount(profitAndLoss.revenueMinorUnits, profitAndLoss.currency, locale)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Expenses</dt>
                <dd className="font-medium text-slate-950">
                  {formatAmount(profitAndLoss.expenseMinorUnits, profitAndLoss.currency, locale)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Net</dt>
                <dd className={`font-semibold ${profitAndLoss.netProfitMinorUnits >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatAmount(profitAndLoss.netProfitMinorUnits, profitAndLoss.currency, locale)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Revenue sources</h3>
                {profitAndLoss.revenueBreakdown.map((item) => (
                  <div className="flex items-center justify-between text-sm" key={item.category}>
                    <span className="text-slate-500">{item.category.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-slate-900">
                      {formatAmount(item.amountMinorUnits, profitAndLoss.currency, locale)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Expense categories</h3>
                {profitAndLoss.expenseBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-500">No tracked expenses in the selected period.</p>
                ) : (
                  profitAndLoss.expenseBreakdown.map((item) => (
                    <div className="flex items-center justify-between text-sm" key={item.category}>
                      <span className="text-slate-500">{item.category.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-slate-900">
                        {formatAmount(item.amountMinorUnits, profitAndLoss.currency, locale)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TenantSurfaceCard>
        </div>
      </div>
    </TenantAppShell>
  );
}
