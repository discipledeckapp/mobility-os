import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { TenantAppShell } from '../shared/tenant-app-shell';
import type {
  DashboardActivityItem,
  DashboardFeatureCard,
  DashboardSummaryItem,
} from './tenant-dashboard-data';

interface TenantDashboardShellProps {
  summary: DashboardSummaryItem[];
  remittanceSummary: DashboardSummaryItem[];
  recentActivity: DashboardActivityItem[];
  featureCards: DashboardFeatureCard[];
  notes: string[];
  isEmpty: boolean;
}

const summaryHrefs: Record<string, Route> = {
  'Total drivers': '/drivers',
  'Active drivers': '/drivers',
  'Total vehicles': '/vehicles',
  'Active assignments': '/assignments',
  'Pending remittances': '/remittance',
};

const featureCardIcons: Record<string, React.ReactNode> = {
  '/drivers': (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 20 20"
      width="20"
    >
      <circle cx="10" cy="7" r="3" />
      <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" />
    </svg>
  ),
  '/vehicles': (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 20 20"
      width="20"
    >
      <path d="M2 12V10L5 5h10l3 5v2" />
      <path d="M2 12h16" />
      <circle cx="5.5" cy="15.5" r="2" />
      <circle cx="14.5" cy="15.5" r="2" />
    </svg>
  ),
  '/assignments': (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 20 20"
      width="20"
    >
      <circle cx="4" cy="10" r="2.5" />
      <circle cx="16" cy="10" r="2.5" />
      <path d="M6.5 10h7" />
      <path d="M11.5 6.5L15.5 10l-4 3.5" />
    </svg>
  ),
  '/remittance': (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 20 20"
      width="20"
    >
      <rect height="11" rx="2" width="17" x="1.5" y="5" />
      <circle cx="10" cy="10.5" r="2.5" />
      <path d="M5 8v5M15 8v5" />
    </svg>
  ),
};

const activityKindColors: Record<string, string> = {
  driver: 'bg-blue-400',
  vehicle: 'bg-violet-400',
  assignment: 'bg-emerald-400',
  remittance: 'bg-amber-400',
};

export function TenantDashboardShell({
  summary,
  remittanceSummary,
  recentActivity,
  featureCards,
  isEmpty,
}: TenantDashboardShellProps) {
  const badgeToneBySummaryTone = {
    accent: 'success',
    neutral: 'neutral',
    warm: 'warning',
  } as const;
  const badgeLabelBySummaryTone = {
    accent: 'Good',
    neutral: 'Normal',
    warm: 'Attention',
  } as const;
  const badgeToneByStatus = {
    active: 'success',
    available: 'success',
    confirmed: 'success',
    pending: 'warning',
    suspended: 'warning',
    maintenance: 'warning',
    cancelled: 'danger',
    disputed: 'danger',
    retired: 'danger',
    completed: 'neutral',
    waived: 'neutral',
  } as const;

  return (
    <TenantAppShell
      description="Fleet and driver operations at a glance."
      eyebrow="Operations"
      title="Dashboard"
    >
      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summary.map((item) => {
          const href = summaryHrefs[item.label];
          const inner = (
            <Card
              key={item.label}
              className={`group border-slate-200 bg-white shadow-[0_4px_16px_-8px_rgba(15,23,42,0.12)] transition-all duration-150 ${
                href
                  ? 'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-10px_rgba(37,99,235,0.2)] cursor-pointer'
                  : ''
              } overflow-hidden`}
            >
              <div
                className={`h-0.5 w-full ${
                  item.tone === 'accent'
                    ? 'bg-[var(--mobiris-primary)]'
                    : item.tone === 'warm'
                      ? 'bg-amber-400'
                      : 'bg-slate-200'
                }`}
              />
              <CardContent className="space-y-2 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {item.label}
                </p>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
                  {item.value}
                </p>
                {item.detail ? <p className="text-xs text-slate-400">{item.detail}</p> : null}
                <Badge tone={badgeToneBySummaryTone[item.tone]}>
                  {badgeLabelBySummaryTone[item.tone]}
                </Badge>
              </CardContent>
            </Card>
          );
          return href ? (
            <Link href={href} key={item.label}>
              {inner}
            </Link>
          ) : (
            <div key={item.label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,1fr)]">
        {/* Remittance summary */}
        <Card className="border-slate-200 bg-white shadow-[0_4px_20px_-10px_rgba(15,23,42,0.14)]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Remittance summary</CardTitle>
              <CardDescription>
                Current collections posture from live remittance records.
              </CardDescription>
            </div>
            <Link href="/remittance">
              <Button size="sm" variant="ghost">
                View all →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {remittanceSummary.length === 0 ? (
              <Text tone="muted">No remittance summary available yet.</Text>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {remittanceSummary.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-100 bg-[linear-gradient(180deg,#f8fbff,#eef5ff)] p-4 space-y-2"
                  >
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--mobiris-ink)]">
                      {item.value}
                    </p>
                    {item.detail ? <p className="text-xs text-slate-400">{item.detail}</p> : null}
                    <Badge tone={badgeToneBySummaryTone[item.tone]}>
                      {badgeLabelBySummaryTone[item.tone]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity — compact feed */}
        <Card className="border-slate-200 bg-white shadow-[0_4px_20px_-10px_rgba(15,23,42,0.14)]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest records across all operational areas.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <Text tone="muted">No recent operational activity yet.</Text>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((item) => (
                  <div className="flex items-start gap-3 py-3" key={item.id}>
                    {/* Kind indicator dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      <div
                        className={`h-2 w-2 rounded-full ${activityKindColors[item.kind] ?? 'bg-slate-300'}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-snug text-[var(--mobiris-ink)]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{item.description}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      {item.status ? (
                        <Badge
                          tone={
                            badgeToneByStatus[item.status as keyof typeof badgeToneByStatus] ??
                            'neutral'
                          }
                        >
                          {item.status}
                        </Badge>
                      ) : null}
                      <Link href={item.href}>
                        <span className="text-xs font-semibold text-[var(--mobiris-primary-dark)] hover:underline">
                          Open
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Work areas with icons */}
      <Card className="border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_4px_20px_-10px_rgba(15,23,42,0.12)]">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Work areas</CardTitle>
            <CardDescription>Jump straight into the main operational workflows.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <Link href={card.href} key={card.href}>
                <Card className="group h-full border-slate-200 bg-white shadow-none transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--mobiris-primary)]/30 hover:shadow-[0_8px_24px_-12px_rgba(37,99,235,0.22)]">
                  <CardContent className="flex flex-col gap-3 px-5 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[var(--mobiris-radius-button)] bg-[var(--mobiris-primary-tint)] text-[var(--mobiris-primary-dark)] transition-colors group-hover:bg-[var(--mobiris-primary)] group-hover:text-white">
                      {featureCardIcons[card.href] ?? (
                        <svg
                          aria-hidden="true"
                          fill="none"
                          focusable="false"
                          height="20"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
                          viewBox="0 0 20 20"
                          width="20"
                        >
                          <rect height="14" rx="2" width="14" x="3" y="3" />
                          <path d="M7 9h6M7 13h4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-ink)]">
                        {card.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {card.description}
                      </p>
                    </div>
                    <p className="mt-auto text-xs font-semibold text-[var(--mobiris-primary-dark)] group-hover:underline">
                      Open →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {isEmpty ? (
        <Card className="border-dashed border-slate-200">
          <CardHeader>
            <CardTitle>No operational data yet</CardTitle>
            <CardDescription>
              Add drivers, vehicles, and assignments to start seeing live data on this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/drivers/new">
                <Button size="sm">Add first driver</Button>
              </Link>
              <Link href="/vehicles/new">
                <Button size="sm" variant="secondary">
                  Add first vehicle
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </TenantAppShell>
  );
}
