import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  type BusinessEntityRecord,
  type WalletBalanceRecord,
  type WalletEntryRecord,
  getOperationalWalletBalance,
  getTenantApiToken,
  getTenantSession,
  listBusinessEntities,
  listOperationalWalletEntries,
} from '../../lib/api-core';

interface WalletPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatMoney(amountMinorUnits: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function entryTone(type: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (type === 'credit') {
    return 'success';
  }
  if (type === 'debit') {
    return 'warning';
  }
  if (type === 'reversal') {
    return 'danger';
  }
  return 'neutral';
}

function pickSelectedEntity(
  entities: BusinessEntityRecord[],
  preferredEntityId: string | null,
): BusinessEntityRecord | null {
  if (preferredEntityId) {
    const preferred = entities.find((entity) => entity.id === preferredEntityId);
    if (preferred) {
      return preferred;
    }
  }

  return entities[0] ?? null;
}

async function loadOperationalWalletState(
  entity: BusinessEntityRecord | null,
  token: string | undefined,
): Promise<{
  balance: WalletBalanceRecord | null;
  entries: WalletEntryRecord[];
  errorMessage: string | null;
}> {
  if (!entity) {
    return {
      balance: null,
      entries: [],
      errorMessage: null,
    };
  }

  try {
    const [balance, entries] = await Promise.all([
      getOperationalWalletBalance(entity.id, token),
      listOperationalWalletEntries(entity.id, token),
    ]);

    return {
      balance,
      entries,
      errorMessage: null,
    };
  } catch (error) {
    return {
      balance: null,
      entries: [],
      errorMessage:
        error instanceof Error
          ? error.message
          : 'We could not load the operational wallet right now.',
    };
  }
}

export default async function WalletPage({ searchParams }: WalletPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedEntityId = firstQueryValue(resolvedSearchParams.entityId) ?? null;
  const token = await getTenantApiToken().catch(() => undefined);
  const [session, entities] = await Promise.all([
    getTenantSession(token).catch(() => null),
    listBusinessEntities(token).catch(() => []),
  ]);

  const locale = session?.formattingLocale ?? 'en-NG';
  const selectedEntity = pickSelectedEntity(entities, selectedEntityId ?? session?.businessEntityId ?? null);
  const { balance, entries, errorMessage } = await loadOperationalWalletState(selectedEntity, token);
  const credits = entries
    .filter((entry) => entry.type === 'credit')
    .reduce((sum, entry) => sum + entry.amountMinorUnits, 0);
  const debits = entries
    .filter((entry) => entry.type === 'debit')
    .reduce((sum, entry) => sum + Math.abs(entry.amountMinorUnits), 0);

  return (
    <TenantAppShell
      description="Review operational cash movement by business entity, track ledger entries, and separate day-to-day finance from verification funding and subscription billing."
      eyebrow="Operational Finance"
      title="Operational wallet"
    >
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)]">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
                  Operational wallet
                </p>
                <CardTitle className="text-3xl tracking-[-0.04em] text-slate-950">
                  {balance
                    ? formatMoney(balance.balanceMinorUnits, balance.currency, locale)
                    : 'No wallet selected'}
                </CardTitle>
                <CardDescription>
                  This wallet tracks operational money movement for a business entity. Verification
                  funding and subscription billing are handled separately.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                  href={'/verification-funding' as Route}
                >
                  Open verification funding
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-ink)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
                  href={'/subscription' as Route}
                >
                  Open subscription billing
                </Link>
              </div>
            </div>
            {selectedEntity ? (
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                <Text tone="strong">{selectedEntity.name}</Text>
                <Text tone="muted">
                  Business entity wallet context{balance ? ` · wallet ${balance.walletId}` : ''}.
                </Text>
              </div>
            ) : (
              <div className="rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-200 bg-slate-50/80 p-4">
                <Text tone="strong">No business entity wallet available yet</Text>
                <Text tone="muted">
                  Add a business entity first before tracking operational wallet balances.
                </Text>
              </div>
            )}
          </CardHeader>
          {selectedEntity ? (
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                <Text tone="muted">Total credits</Text>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-emerald-700">
                  {balance ? formatMoney(credits, balance.currency, locale) : '—'}
                </p>
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                <Text tone="muted">Total debits</Text>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-amber-700">
                  {balance ? formatMoney(debits, balance.currency, locale) : '—'}
                </p>
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-950 bg-slate-950 p-4 text-white">
                <Text className="text-blue-100/70">Latest update</Text>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                  {balance ? formatDate(balance.updatedAt, locale) : 'No wallet activity yet'}
                </p>
              </div>
            </CardContent>
          ) : null}
        </Card>

        {entities.length > 1 ? (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Business entity wallets</CardTitle>
              <CardDescription>
                Switch between entities to inspect each operational wallet separately.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {entities.map((entity) => {
                const isSelected = entity.id === selectedEntity?.id;
                return (
                  <Link
                    className={`rounded-[var(--mobiris-radius-card)] border p-4 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 ${
                      isSelected
                        ? 'border-[var(--mobiris-primary)] bg-[var(--mobiris-primary-tint)]'
                        : 'border-slate-200 bg-white'
                    }`}
                    href={`/wallet?entityId=${encodeURIComponent(entity.id)}` as Route}
                    key={entity.id}
                  >
                    <Text tone="strong">{entity.name}</Text>
                    <Text tone="muted">
                      {entity.country} · {entity.businessModel}
                    </Text>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        ) : null}

        {errorMessage ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle>Operational wallet is temporarily unavailable</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Operational ledger</CardTitle>
            <CardDescription>
              Credits and debits recorded against the selected business entity wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedEntity && entries.length > 0 ? (
              entries.map((entry) => (
                <div
                  className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                  key={entry.id}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Text tone="strong">
                        {entry.description || `${entry.referenceType ?? 'wallet'} activity`}
                      </Text>
                      <Badge tone={entryTone(entry.type)}>{entry.type}</Badge>
                    </div>
                    <Text tone="muted">
                      {entry.referenceType
                        ? `${entry.referenceType}${entry.referenceId ? ` · ${entry.referenceId}` : ''}`
                        : 'Manual or system wallet adjustment'}
                    </Text>
                    <Text tone="muted">{formatDate(entry.createdAt, locale)}</Text>
                  </div>
                  <p
                    className={`text-lg font-semibold tracking-[-0.03em] ${
                      entry.type === 'credit'
                        ? 'text-emerald-700'
                        : entry.type === 'debit'
                          ? 'text-amber-700'
                          : entry.type === 'reversal'
                            ? 'text-rose-700'
                            : 'text-slate-900'
                    }`}
                  >
                    {formatMoney(entry.amountMinorUnits, entry.currency, locale)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
                <Text tone="strong">No operational wallet activity yet</Text>
                <Text tone="muted">
                  Wallet entries will appear here as operational credits and debits are recorded for
                  the selected business entity.
                </Text>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TenantAppShell>
  );
}
