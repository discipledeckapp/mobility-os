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
import { listPlatformWalletLedger, listPlatformWallets } from '../../lib/api-control-plane';

function formatCurrency(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

export default async function PlatformWalletsPage() {
  const [wallets, ledger] = await Promise.all([
    listPlatformWallets(),
    listPlatformWalletLedger({ page: 1, limit: 20 }),
  ]);
  const fundedWallets = wallets.filter((wallet) => wallet.balanceMinorUnits > 0).length;
  const balancesByCurrency = wallets.reduce<Record<string, number>>((totals, wallet) => {
    totals[wallet.currency] = (totals[wallet.currency] ?? 0) + wallet.balanceMinorUnits;
    return totals;
  }, {});

  return (
    <ControlPlaneShell
      description="Inspect SaaS wallet balances and activity without mixing them with tenant operational wallets."
      eyebrow="Billing"
      title="Platform wallets"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(balancesByCurrency).map(([currency, total]) => (
            <Card className="border-slate-200/80" key={currency}>
              <CardHeader>
                <CardDescription>{currency} balance</CardDescription>
                <CardTitle>{formatCurrency(total, currency)}</CardTitle>
              </CardHeader>
            </Card>
          ))}
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Funded wallets</CardDescription>
              <CardTitle>{fundedWallets}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wallet registry</CardTitle>
            <CardDescription>
              Review funded posture, ledger activity volume, and recent wallet movement by
              organisation.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {wallets.map((wallet) => (
                    <TableRow key={wallet.walletId}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{wallet.tenantId}</p>
                          <p className="text-xs text-slate-500">{wallet.walletId}</p>
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
                  ))}
                </TableBody>
              </Table>
            </TableViewport>
            {wallets.length === 0 ? (
              <Text className="pt-4">No platform wallets have been created yet.</Text>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction ledger</CardTitle>
            <CardDescription>
              Most recent platform wallet entries across tenants, paged from the control-plane
              ledger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.data.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.tenantId}</TableCell>
                      <TableCell>
                        <Badge tone={entry.type === 'credit' ? 'success' : 'warning'}>
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(entry.amountMinorUnits, entry.currency)}
                      </TableCell>
                      <TableCell>
                        {entry.referenceType ?? entry.referenceId ?? 'Manual entry'}
                      </TableCell>
                      <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableViewport>
            {ledger.data.length === 0 ? (
              <Text className="pt-4">
                No platform wallet ledger entries have been recorded yet.
              </Text>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ControlPlaneShell>
  );
}
