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
import {
  getPlatformApiToken,
  listPlatformWalletLedger,
  listPlatformWallets,
  listTenants,
} from '../../lib/api-control-plane';

function formatCurrency(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

export default async function PlatformWalletsPage() {
  const token = await getPlatformApiToken().catch(() => undefined);
  const dataWarnings: string[] = [];
  const [walletsResult, ledgerResult, tenantsResult] = token
    ? await Promise.allSettled([
        listPlatformWallets(token),
        listPlatformWalletLedger({ page: 1, limit: 20 }, token),
        listTenants(token),
      ])
    : await Promise.allSettled([
        Promise.resolve([]),
        Promise.resolve({ data: [] }),
        Promise.resolve([]),
      ]);
  const wallets = walletsResult.status === 'fulfilled' ? walletsResult.value : [];
  const ledger = ledgerResult.status === 'fulfilled' ? ledgerResult.value : { data: [] };
  const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
  if (!token) dataWarnings.push('Your platform session could not be read on this request.');
  if (walletsResult.status !== 'fulfilled') dataWarnings.push('Platform wallet balances are temporarily unavailable.');
  if (ledgerResult.status !== 'fulfilled') dataWarnings.push('Recent platform wallet ledger activity could not be loaded.');
  if (tenantsResult.status !== 'fulfilled') dataWarnings.push('Organisation labels could not be resolved.');
  const tenantLookup = buildTenantLookup(tenants);
  const fundedWallets = wallets.filter((wallet) => wallet.balanceMinorUnits > 0).length;
  const balancesByCurrency = wallets.reduce<Record<string, number>>((totals, wallet) => {
    totals[wallet.currency] = (totals[wallet.currency] ?? 0) + wallet.balanceMinorUnits;
    return totals;
  }, {});

  return (
    <ControlPlaneShell
      description="Inspect SaaS billing wallets and ledger movement without mixing them with tenant operational wallets."
      eyebrow="Platform wallet oversight"
      title="Platform wallets"
    >
      <div className="space-y-6">
        {dataWarnings.length > 0 ? (
          <ControlPlaneDataNotice
            description={dataWarnings.join(' ')}
            title="Platform wallets loaded with partial billing data"
          />
        ) : null}
        <ControlPlaneHeroPanel
          badges={[
            { label: `${wallets.length} wallets`, tone: 'neutral' },
            { label: `${fundedWallets} funded`, tone: fundedWallets ? 'success' : 'warning' },
            { label: `${wallets.length - fundedWallets} need funding`, tone: wallets.length - fundedWallets ? 'warning' : 'success' },
          ]}
          description="These are the SaaS billing wallets, not tenant remittance wallets. Use this page to see who is funded, who is depleted, and what ledger activity is shaping platform billing posture."
          eyebrow="Billing reserves"
          title="Track wallet balances and funding posture across every tenant on the platform."
        />

        <ControlPlaneMetricGrid columns={3}>
          {Object.entries(balancesByCurrency).map(([currency, total]) => (
            <ControlPlaneMetricCard
              detail={`Aggregate balance across all platform wallets in ${currency}.`}
              key={currency}
              label={`${currency} balance`}
              tone={total > 0 ? 'success' : 'warning'}
              value={formatCurrency(total, currency)}
            />
          ))}
          <ControlPlaneMetricCard label="Funded wallets" tone="success" value={fundedWallets} />
        </ControlPlaneMetricGrid>

        <ControlPlaneSectionShell
          description="Review funded posture, ledger activity volume, and the organisations that are currently depleted."
          title="Wallet registry"
        >
          {wallets.length === 0 ? (
            <ControlPlaneEmptyStateCard
              description="No platform wallets have been created yet."
              title="No platform wallet registry yet"
            />
          ) : (
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Ledger entries</TableHead>
                    <TableHead>Last activity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet) => {
                    const tenant = getTenantLabel(tenantLookup, wallet.tenantId);
                    return (
                      <TableRow key={wallet.walletId}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                              href={`/tenants/${wallet.tenantId}`}
                            >
                              {tenant.name}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {tenant.slug} · {tenant.country}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {formatCurrency(wallet.balanceMinorUnits, wallet.currency)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">{wallet.entryCount}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {wallet.lastEntryAt
                            ? new Date(wallet.lastEntryAt).toLocaleString()
                            : 'No ledger activity yet'}
                        </TableCell>
                        <TableCell>
                          <Badge tone={wallet.balanceMinorUnits > 0 ? 'success' : 'warning'}>
                            {wallet.balanceMinorUnits > 0 ? 'Funded' : 'Needs funding'}
                          </Badge>
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
          description="Recent platform wallet credits and debits across all tenants."
          title="Transaction ledger"
        >
          {ledger.data.length === 0 ? (
            <ControlPlaneEmptyStateCard
              description="No platform wallet ledger entries have been recorded yet."
              title="No wallet movement yet"
            />
          ) : (
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.data.map((entry) => {
                    const tenant = getTenantLabel(tenantLookup, entry.tenantId);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                              href={`/tenants/${entry.tenantId}`}
                            >
                              {tenant.name}
                            </Link>
                            <p className="text-xs text-slate-500">{tenant.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone={entry.type === 'credit' ? 'success' : 'warning'}>{entry.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {formatCurrency(entry.amountMinorUnits, entry.currency)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {entry.referenceType ? `${entry.referenceType} · ${entry.referenceId ?? 'n/a'}` : 'No linked reference'}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(entry.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableViewport>
          )}
        </ControlPlaneSectionShell>
      </div>
    </ControlPlaneShell>
  );
}
