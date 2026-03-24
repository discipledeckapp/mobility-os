import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getReportsOverview,
  getTenantMe,
  type ReportsOverviewRecord,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';

function formatCurrency(amountMinorUnits: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDateLabel(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatWeekLabel(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `Week of ${new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(date)}`;
}

function SimpleBarChart({
  points,
  locale,
  formatter,
}: {
  points: ReportsOverviewRecord['dailyRemittanceTrend'];
  locale: string;
  formatter: (label: string, locale: string) => string;
}) {
  const maxValue = Math.max(...points.map((point) => point.amountMinorUnits), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        {points.map((point) => {
          const height = Math.max((point.amountMinorUnits / maxValue) * 160, 8);
          return (
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={point.label}>
              <div className="text-xs text-slate-500">
                {(point.amountMinorUnits / 100).toFixed(0)}
              </div>
              <div className="flex h-40 w-full items-end rounded-[var(--mobiris-radius-card)] bg-slate-100 px-1.5 py-1.5">
                <div
                  className="w-full rounded-[calc(var(--mobiris-radius-card)-0.4rem)] bg-[linear-gradient(180deg,var(--mobiris-primary-light),var(--mobiris-primary))]"
                  style={{ height: `${height}px` }}
                />
              </div>
              <div className="text-center text-xs text-slate-500">
                {formatter(point.label, locale)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DonutSummary({
  active,
  inactive,
}: {
  active: number;
  inactive: number;
}) {
  const total = Math.max(active + inactive, 1);
  const activeDegrees = (active / total) * 360;

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
      <div
        className="h-36 w-36 rounded-full"
        style={{
          background: `conic-gradient(var(--mobiris-primary) 0deg ${activeDegrees}deg, #cbd5e1 ${activeDegrees}deg 360deg)`,
        }}
      >
        <div className="m-4 flex h-[calc(100%-2rem)] w-[calc(100%-2rem)] items-center justify-center rounded-full bg-white text-center">
          <div>
            <div className="text-2xl font-semibold text-[var(--mobiris-ink)]">{total}</div>
            <div className="text-xs text-slate-500">drivers</div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-[var(--mobiris-primary)]" />
          <Text>Active: {active}</Text>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-slate-300" />
          <Text>Inactive: {inactive}</Text>
        </div>
      </div>
    </div>
  );
}

export default async function ReportsPage() {
  const [overview, tenant] = await Promise.all([
    getReportsOverview(),
    getTenantMe().catch(() => null),
  ]);
  const locale = getFormattingLocale(tenant?.country);

  return (
    <TenantAppShell
      title="Reports"
      eyebrow="Reports"
      description="A lightweight operating summary across wallet movements, remittance performance, and driver activity."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total balance</CardTitle>
              <CardDescription>Combined operational wallet position</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                {formatCurrency(
                  overview.wallet.totalBalanceMinorUnits,
                  overview.wallet.currency,
                  locale,
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inflow</CardTitle>
              <CardDescription>Total wallet credits recorded</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-[-0.04em] text-emerald-600">
                {formatCurrency(
                  overview.wallet.totalInflowMinorUnits,
                  overview.wallet.currency,
                  locale,
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Outflow</CardTitle>
              <CardDescription>Total wallet debits recorded</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-[-0.04em] text-rose-600">
                {formatCurrency(
                  overview.wallet.totalOutflowMinorUnits,
                  overview.wallet.currency,
                  locale,
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily remittance trend</CardTitle>
              <CardDescription>Recorded remittance value over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                formatter={formatDateLabel}
                locale={locale}
                points={overview.dailyRemittanceTrend}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly remittance trend</CardTitle>
              <CardDescription>Recorded remittance value over the last 6 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                formatter={formatWeekLabel}
                locale={locale}
                points={overview.weeklyRemittanceTrend}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Driver activity</CardTitle>
              <CardDescription>Active vs inactive driver population</CardDescription>
            </CardHeader>
            <CardContent>
              <DonutSummary
                active={overview.driverActivity.active}
                inactive={overview.driverActivity.inactive}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>More reports</CardTitle>
              <CardDescription>Continue into operational readiness details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Text>
                Use the readiness report for licence expiry, assignment readiness, and vehicle
                maintenance visibility.
              </Text>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
                href="/reports/readiness"
              >
                Open readiness report
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fleet performance</CardTitle>
              <CardDescription>Revenue, expense, and maintenance risk by fleet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.fleetPerformance.slice(0, 5).map((fleet) => (
                <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 p-4" key={fleet.fleetId}>
                  <div className="flex items-center justify-between gap-3">
                    <Text className="font-semibold">{fleet.fleetName}</Text>
                    <Text>{formatCurrency(fleet.profitMinorUnits, overview.wallet.currency, locale)}</Text>
                  </div>
                  <Text className="text-sm text-slate-500">
                    {fleet.vehicleCount} vehicles • {fleet.activeAssignmentCount} active assignments
                  </Text>
                  <Text className="text-sm text-slate-500">
                    Expenses {formatCurrency(fleet.trackedExpenseMinorUnits, overview.wallet.currency, locale)} • Overdue maintenance {fleet.overdueMaintenanceCount}
                  </Text>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fleet manager performance</CardTitle>
              <CardDescription>Compare assigned scope profitability and risk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.managerPerformance.slice(0, 5).map((manager) => (
                <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 p-4" key={manager.userId}>
                  <div className="flex items-center justify-between gap-3">
                    <Text className="font-semibold">{manager.name}</Text>
                    <Text>{formatCurrency(manager.profitMinorUnits, overview.wallet.currency, locale)}</Text>
                  </div>
                  <Text className="text-sm text-slate-500">
                    {manager.vehicleCount} vehicles across {manager.fleetCount} fleets
                  </Text>
                  <Text className="text-sm text-slate-500">
                    At-risk assignments {manager.atRiskAssignmentCount} • Overdue maintenance {manager.overdueMaintenanceCount}
                  </Text>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantAppShell>
  );
}
