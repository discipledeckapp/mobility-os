import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from '@mobility-os/ui';
import Link from 'next/link';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  type TenantBillingSummaryRecord,
  getTenantBillingSummary,
  getTenantMe,
  getTenantSession,
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

function getLedgerSummary(entries: TenantBillingSummaryRecord['verificationWallet']['entries']) {
  return entries.reduce(
    (summary, entry) => {
      if (entry.type === 'credit') {
        summary.fundsAddedMinorUnits += entry.amountMinorUnits;
      }

      if (entry.type === 'debit') {
        summary.verificationChargesMinorUnits += Math.abs(entry.amountMinorUnits);
      }

      return summary;
    },
    {
      fundsAddedMinorUnits: 0,
      verificationChargesMinorUnits: 0,
    },
  );
}

function FundingStateCard({
  summary,
  locale,
}: {
  summary: TenantBillingSummaryRecord;
  locale: string;
}) {
  const canVerifyNow = summary.verificationSpend.availableSpendMinorUnits > 0;
  const recommendedNextStep = canVerifyNow
    ? 'Company-paid verification can continue right now.'
    : summary.verificationSpend.savedCard?.active
      ? 'Fund verification funding to increase available spend.'
      : 'Add funds or set up a saved payment method before starting company-paid verification.';

  return (
    <Card className="border-[var(--mobiris-primary-light)] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.98)_48%,rgba(219,234,254,0.82))] shadow-[0_28px_60px_-42px_rgba(37,99,235,0.5)]">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
              Verification Funding
            </p>
            <Heading size="h1">Can I verify a driver right now?</Heading>
            <Text tone="muted">
              Verification funding determines whether company-paid verification can move immediately.
            </Text>
          </div>
          <Badge tone={canVerifyNow ? 'success' : 'warning'}>
            {canVerifyNow ? 'Ready to verify' : 'Funding action needed'}
          </Badge>
        </div>
        <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/85 p-4">
          <Text tone="strong">{recommendedNextStep}</Text>
          <Text tone="muted">
            Available spend combines funding balance and remaining verification credit.
          </Text>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/85 p-4">
          <Text tone="muted">Funding balance</Text>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            {formatMoney(
              summary.verificationSpend.walletBalanceMinorUnits,
              summary.verificationSpend.currency,
              locale,
            )}
          </p>
        </div>
        <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/85 p-4">
          <Text tone="muted">Credit limit</Text>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            {formatMoney(
              summary.verificationSpend.creditLimitMinorUnits,
              summary.verificationSpend.currency,
              locale,
            )}
          </p>
        </div>
        <div className="rounded-[var(--mobiris-radius-card)] border border-white/70 bg-white/85 p-4">
          <Text tone="muted">Credit used</Text>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            {formatMoney(
              summary.verificationSpend.creditUsedMinorUnits,
              summary.verificationSpend.currency,
              locale,
            )}
          </p>
        </div>
        <div className="rounded-[var(--mobiris-radius-card)] border border-slate-950 bg-slate-950 p-4 text-white">
          <Text className="text-blue-100/70">Available spend</Text>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            {formatMoney(
              summary.verificationSpend.availableSpendMinorUnits,
              summary.verificationSpend.currency,
              locale,
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function VerificationFundingPage() {
  let billingSummary: TenantBillingSummaryRecord | null = null;
  let fundingUnavailable = false;
  let locale = 'en-US';
  let currencyMinorUnit = 2;

  try {
    const [tenant, session, summary] = await Promise.all([
      getTenantMe(),
      getTenantSession(),
      getTenantBillingSummary(),
    ]);
    locale = getFormattingLocale(tenant.country);
    currencyMinorUnit = session.currencyMinorUnit ?? 2;
    billingSummary = summary;
  } catch (error) {
    console.error('[verification-funding] page load failed', error);
    fundingUnavailable = true;
  }

  return (
    <TenantAppShell
      description="Keep verification moving with a clear funding decision, visible credit context, and a simple verification ledger."
      eyebrow="Verification Funding"
      title="Verification Funding"
    >
      <div className="space-y-6">
        {fundingUnavailable || !billingSummary ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle>Verification funding is temporarily unavailable</CardTitle>
              <CardDescription>
                We could not load the latest funding state right now. Please try again shortly. If this keeps happening, contact support.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <FundingStateCard locale={locale} summary={billingSummary} />

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle>Funding model</CardTitle>
                  <CardDescription>
                    Funding balance and verification credit work together. They do not change the verification tier itself.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                      <Text tone="muted">Starter credit</Text>
                      <Text tone="strong">
                        {billingSummary.verificationSpend.starterCreditActive ? 'Active' : 'Inactive'}
                      </Text>
                      <Text tone="muted">
                        {billingSummary.verificationSpend.starterCreditEligible
                          ? 'Available for qualifying verification tiers'
                          : 'Not currently available for this account'}
                      </Text>
                    </div>
                    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                      <Text tone="muted">Card-backed credit</Text>
                      <Text tone="strong">
                        {billingSummary.verificationSpend.cardCreditActive ? 'Active' : 'Inactive'}
                      </Text>
                      <Text tone="muted">
                        {billingSummary.verificationSpend.savedCard?.active
                          ? 'A saved payment method is already linked'
                          : 'Add a saved payment method to unlock it'}
                      </Text>
                    </div>
                    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                      <Text tone="muted">Unlocked tiers</Text>
                      <Text tone="strong">{billingSummary.verificationSpend.unlockedTiers.length}</Text>
                      <Text tone="muted">
                        {billingSummary.verificationSpend.unlockedTiers.length > 0
                          ? billingSummary.verificationSpend.unlockedTiers.join(', ').replaceAll('_', ' ')
                          : 'Fund verification funding or activate credit to unlock more tiers'}
                      </Text>
                    </div>
                  </div>

                  <div className="rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-primary-light)] bg-[var(--mobiris-primary-tint)] p-4">
                    <Text tone="strong">Decision guide</Text>
                    <Text tone="muted">
                      {billingSummary.verificationSpend.availableSpendMinorUnits > 0
                        ? 'You can verify a driver right now under the company-paid model.'
                        : 'Top up verification funding or add a saved payment method before starting company-paid verification.'}
                    </Text>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle>Verification ledger snapshot</CardTitle>
                  <CardDescription>
                    See how much has been funded and how much verification has already consumed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  {(() => {
                    const ledgerSummary = getLedgerSummary(billingSummary.verificationWallet.entries);

                    return (
                      <>
                        <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                          <Text tone="muted">Funds added</Text>
                          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                            {formatMoney(
                              ledgerSummary.fundsAddedMinorUnits,
                              billingSummary.verificationWallet.currency,
                              locale,
                            )}
                          </p>
                        </div>
                        <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                          <Text tone="muted">Verification charges</Text>
                          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                            {formatMoney(
                              ledgerSummary.verificationChargesMinorUnits,
                              billingSummary.verificationWallet.currency,
                              locale,
                            )}
                          </p>
                        </div>
                        <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                          <Text tone="muted">Ledger entries</Text>
                          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                            {billingSummary.usage.verificationLedgerEntryCount}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            <PaymentActionPanel
              currencyMinorUnit={currencyMinorUnit}
              summary={billingSummary}
            />

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Verification funding ledger</CardTitle>
                <CardDescription>
                  Funding credits and verification deductions, with reference details and timestamps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingSummary.verificationWallet.entries.length === 0 ? (
                  <div className="rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-200 bg-slate-50/80 p-4">
                    <Text tone="strong">No verification funding activity yet</Text>
                    <Text tone="muted">
                      Add funds or complete a verification charge to start building the ledger.
                    </Text>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {billingSummary.verificationWallet.entries.map((entry) => (
                      <div
                        className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4"
                        key={entry.id}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone={getEntryTone(entry.type)}>{entry.type}</Badge>
                              <Text tone="strong">{entry.description ?? 'Verification funding activity'}</Text>
                            </div>
                            <Text tone="muted">
                              {entry.referenceType || entry.referenceId
                                ? `Reference: ${entry.referenceType ?? 'entry'}${entry.referenceId ? ` · ${entry.referenceId}` : ''}`
                                : 'Reference details were not attached to this entry.'}
                            </Text>
                            <Text tone="muted">{formatDate(entry.createdAt, locale)}</Text>
                          </div>
                          <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                            {formatMoney(entry.amountMinorUnits, entry.currency, locale)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {billingSummary.outstandingInvoice ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle>Outstanding subscription invoice</CardTitle>
                  <CardDescription>
                    Subscription billing is handled separately from verification funding, but this invoice still needs attention.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Text tone="strong">
                      {formatMoney(
                        billingSummary.outstandingInvoice.amountDueMinorUnits,
                        billingSummary.outstandingInvoice.currency,
                        locale,
                      )}
                    </Text>
                    <Text tone="muted">
                      Due {billingSummary.outstandingInvoice.dueAt ? formatDate(billingSummary.outstandingInvoice.dueAt, locale) : 'soon'}
                    </Text>
                  </div>
                  <Link href="/subscription">
                    <Badge tone="warning">Review subscription billing</Badge>
                  </Link>
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </TenantAppShell>
  );
}
