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
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  type TenantBillingPlanRecord,
  type TenantBillingSummaryRecord,
  type WalletBalanceRecord,
  type WalletEntryRecord,
  getOperationalWalletBalance,
  getTenantApiContext,
  getTenantBillingSummary,
  listTenantBillingPlans,
  getTenantMe,
  getTenantSession,
  listOperationalWalletEntries,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';
import { PaymentActionPanel } from './payment-action-panel';

function formatMoney(amountMinorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getEntryTone(type: string): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (type) {
    case 'credit':
      return 'success';
    case 'debit':
      return 'warning';
    case 'reversal':
      return 'danger';
    default:
      return 'neutral';
  }
}

export default async function WalletPage() {
  let balance: WalletBalanceRecord | null = null;
  let entries: WalletEntryRecord[] = [];
  let billingSummary: TenantBillingSummaryRecord | null = null;
  let plans: TenantBillingPlanRecord[] = [];
  let contextError: string | null = null;
  let balanceError: string | null = null;
  let entriesError: string | null = null;
  let billingError: string | null = null;
  let locale = 'en-US';
  let currencyMinorUnit = 2;

  try {
    const [tenant, session] = await Promise.all([getTenantMe(), getTenantSession()]);
    locale = getFormattingLocale(tenant.country);
    currencyMinorUnit = session.currencyMinorUnit ?? 2;
    const tenantContext = await getTenantApiContext();
    const businessEntityId = tenantContext.businessEntityId;

    if (!businessEntityId) {
      contextError =
        'The current tenant session does not include a business-entity scope for wallet access.';
    } else {
      const [balanceResult, entriesResult, billingResult, plansResult] = await Promise.allSettled([
        getOperationalWalletBalance(businessEntityId),
        listOperationalWalletEntries(businessEntityId),
        getTenantBillingSummary(),
        listTenantBillingPlans(),
      ]);

      if (balanceResult.status === 'fulfilled') {
        balance = balanceResult.value;
      } else {
        balanceError =
          balanceResult.reason instanceof Error
            ? balanceResult.reason.message
            : 'Unable to load wallet balance.';
      }

      if (entriesResult.status === 'fulfilled') {
        entries = entriesResult.value;
      } else {
        entriesError =
          entriesResult.reason instanceof Error
            ? entriesResult.reason.message
            : 'Unable to load wallet entries.';
      }

      if (billingResult.status === 'fulfilled') {
        billingSummary = billingResult.value;
      } else {
        billingError =
          billingResult.reason instanceof Error
            ? billingResult.reason.message
            : 'Unable to load subscription and verification wallet context.';
      }

      if (plansResult.status === 'fulfilled') {
        plans = plansResult.value;
      }
    }
  } catch (error) {
    contextError =
      error instanceof Error
        ? error.message
        : 'Unable to resolve the current business-entity wallet context.';
  }

  return (
    <TenantAppShell
      description="Track the organisation wallet balance and recent ledger activity for the active operating business."
      eyebrow="Finance"
      title="Wallet"
    >
      <Card>
        <CardHeader>
          <CardTitle>Subscription and verification wallet</CardTitle>
          <CardDescription>
            Review your current plan, outstanding subscription billing, and the platform wallet used
            for verification charges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {billingError ? (
            <Text>{billingError}</Text>
          ) : !billingSummary ? (
            <Text>Subscription and verification wallet context is not available yet.</Text>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-white/70 bg-white/95 shadow-none">
                  <CardContent className="p-4">
                    <Text tone="muted">Plan</Text>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                      {billingSummary.subscription.planName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {billingSummary.subscription.planTier} ·{' '}
                      {billingSummary.subscription.currency}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-white/70 bg-[var(--mobiris-primary-tint)] shadow-none">
                  <CardContent className="p-4">
                    <Text tone="muted">Subscription status</Text>
                    <div className="mt-2">
                      <Badge
                        tone={
                          billingSummary.subscription.status === 'active'
                            ? 'success'
                            : ['past_due', 'grace_period'].includes(
                                  billingSummary.subscription.status,
                                )
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {billingSummary.subscription.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-white/70 bg-[var(--mobiris-primary-tint)] shadow-none">
                  <CardContent className="p-4">
                    <Text tone="muted">Verification wallet</Text>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                      {formatMoney(
                        billingSummary.verificationWallet.balanceMinorUnits,
                        billingSummary.verificationWallet.currency,
                        locale,
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <PaymentActionPanel
                currencyMinorUnit={currencyMinorUnit}
                plans={plans}
                summary={billingSummary}
              />

              <Card className="border-white/70 bg-white/95 shadow-none">
                <CardHeader>
                  <CardTitle>Verification wallet ledger</CardTitle>
                  <CardDescription>
                    Recent platform wallet movements used for SaaS billing and verification
                    recovery.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {billingSummary.verificationWallet.entries.length === 0 ? (
                    <Text>No verification wallet entries have been recorded yet.</Text>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingSummary.verificationWallet.entries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <Badge tone={getEntryTone(entry.type)}>{entry.type}</Badge>
                            </TableCell>
                            <TableCell>
                              {formatMoney(entry.amountMinorUnits, entry.currency, locale)}
                            </TableCell>
                            <TableCell>{entry.description ?? 'No description'}</TableCell>
                            <TableCell>{formatDate(entry.createdAt, locale)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational wallet balance</CardTitle>
          <CardDescription>
            Current balance, settlement currency, and latest update for this organisation wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contextError ? (
            <Text>{contextError}</Text>
          ) : balanceError ? (
            <Text>{balanceError}</Text>
          ) : !balance ? (
            <Text>No operational wallet balance is available for this business entity.</Text>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-white/70 bg-white/95 shadow-none">
                <CardContent className="p-4">
                  <Text tone="muted">Current balance</Text>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]">
                    {formatMoney(balance.balanceMinorUnits, balance.currency, locale)}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-[var(--mobiris-primary-tint)] shadow-none">
                <CardContent className="p-4">
                  <Text tone="muted">Currency</Text>
                  <p className="mt-2 text-lg font-semibold text-[var(--mobiris-ink)]">
                    {balance.currency}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/70 bg-[var(--mobiris-primary-tint)] shadow-none">
                <CardContent className="p-4">
                  <Text tone="muted">Updated</Text>
                  <p className="mt-2 text-lg font-semibold text-[var(--mobiris-ink)]">
                    {formatDate(balance.updatedAt, locale)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ledger entries</CardTitle>
          <CardDescription>
            Recent wallet movements for this organisation, including credits, debits, and reversals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contextError ? (
            <Text>{contextError}</Text>
          ) : entriesError ? (
            <Text>{entriesError}</Text>
          ) : entries.length === 0 ? (
            <Text>No wallet ledger entries have been recorded yet.</Text>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge tone={getEntryTone(entry.type)}>{entry.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatMoney(entry.amountMinorUnits, entry.currency, locale)}
                    </TableCell>
                    <TableCell>{entry.description ?? 'No description'}</TableCell>
                    <TableCell>{formatDate(entry.createdAt, locale)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}
