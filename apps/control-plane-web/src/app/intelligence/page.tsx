import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
} from '@mobility-os/ui';
import type { Route } from 'next';
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
import { listIntelligencePersons, listReviewCases } from '../../lib/api-intelligence';
import { requirePlatformSession } from '../../lib/require-platform-session';

function toneForBand(
  riskBand: string | null | undefined,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (riskBand === 'critical' || riskBand === 'high') return 'danger';
  if (riskBand === 'medium') return 'warning';
  if (riskBand === 'low') return 'success';
  return 'neutral';
}

export default async function IntelligenceOverviewPage() {
  await connection();

  const token = await requirePlatformSession();
  const warnings: string[] = [];
  const [personsResult, reviewCasesResult] = await Promise.allSettled([
    listIntelligencePersons({}, token),
    listReviewCases({}, token),
  ]);

  const persons = personsResult.status === 'fulfilled' ? personsResult.value : [];
  const reviewCases = reviewCasesResult.status === 'fulfilled' ? reviewCasesResult.value : [];

  if (personsResult.status !== 'fulfilled') {
    warnings.push('The person-risk registry could not be loaded from api-intelligence.');
  }
  if (reviewCasesResult.status !== 'fulfilled') {
    warnings.push('The intelligence review-case queue could not be loaded from api-intelligence.');
  }

  const flaggedPersons = persons.filter(
    (person) =>
      person.isWatchlisted ||
      person.hasDuplicateFlag ||
      person.fraudSignalCount > 0 ||
      ['high', 'critical'].includes(person.riskBand),
  );
  const openReviewCases = reviewCases.filter((item) =>
    ['open', 'in_review', 'escalated'].includes(item.status),
  );
  const reviewCasePersonIds = new Set(openReviewCases.map((item) => item.personId));
  const staleReverificationCount = persons.filter(
    (person) =>
      person.verificationStatus === 'reverification_required' ||
      reviewCasePersonIds.has(person.id),
  ).length;

  return (
    <ControlPlaneShell
      eyebrow="Platform intelligence"
      title="Risk and review oversight"
      description="Give platform staff a safe read-only view into people who are flagged, under review, or trending toward manual intervention."
    >
      <div className="space-y-6">
        {warnings.length > 0 ? (
          <ControlPlaneDataNotice
            description={warnings.join(' ')}
            title="Intelligence loaded with partial platform data"
          />
        ) : null}

        <ControlPlaneHeroPanel
          eyebrow="Intelligence review queue"
          title="See who is flagged, under review, or trending toward manual intervention."
          description="This surface stays in the control plane and uses the platform staff token against api-intelligence. It is intended for review operations, not tenant-side case handling."
          badges={[
            {
              label: `${flaggedPersons.length} flagged people`,
              tone: flaggedPersons.length > 0 ? 'warning' : 'success',
            },
            {
              label: `${openReviewCases.length} open review cases`,
              tone: openReviewCases.length > 0 ? 'warning' : 'success',
            },
            {
              label: `${staleReverificationCount} need reverification follow-up`,
              tone: staleReverificationCount > 0 ? 'warning' : 'neutral',
            },
          ]}
        >
          <div className="flex flex-wrap gap-3">
            <Link href={'/intelligence/review-cases' as Route}>
              <Button>Open review cases</Button>
            </Link>
            <Link href={'/intelligence/flagged-persons' as Route}>
              <Button variant="secondary">Open flagged persons</Button>
            </Link>
          </div>
        </ControlPlaneHeroPanel>

        <ControlPlaneMetricGrid columns={4}>
          <ControlPlaneMetricCard
            label="Tracked people"
            value={persons.length}
            detail="People currently visible in the intelligence registry."
          />
          <ControlPlaneMetricCard
            label="Flagged people"
            value={flaggedPersons.length}
            tone={flaggedPersons.length > 0 ? 'warning' : 'success'}
            detail="Watchlist hits, duplicate flags, fraud signals, or high/critical risk."
          />
          <ControlPlaneMetricCard
            label="Open review cases"
            value={openReviewCases.length}
            tone={openReviewCases.length > 0 ? 'warning' : 'success'}
            detail="Cases still open, in review, or escalated."
          />
          <ControlPlaneMetricCard
            label="High-risk population"
            value={persons.filter((person) => ['high', 'critical'].includes(person.riskBand)).length}
            tone={
              persons.some((person) => ['high', 'critical'].includes(person.riskBand))
                ? 'danger'
                : 'success'
            }
            detail="People whose current derived risk band is high or critical."
          />
        </ControlPlaneMetricGrid>

        <div className="grid gap-6 xl:grid-cols-2">
          <ControlPlaneSectionShell
            title="Open review cases"
            description="Current manual-review queue from the intelligence plane."
            helper={
              <Link href={'/intelligence/review-cases' as Route}>
                <Button variant="secondary">View all</Button>
              </Link>
            }
          >
            {openReviewCases.length === 0 ? (
              <ControlPlaneEmptyStateCard
                title="No review queue"
                description="There are no open intelligence review cases right now."
              />
            ) : (
              <div className="space-y-3">
                {openReviewCases.slice(0, 6).map((reviewCase) => (
                  <div className="rounded-2xl border border-slate-200 px-4 py-3" key={reviewCase.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/intelligence/persons/${reviewCase.personId}` as Route}
                          className="text-sm font-semibold text-slate-900 hover:text-[var(--mobiris-primary)]"
                        >
                          Person {reviewCase.personId}
                        </Link>
                        <p className="text-xs text-slate-500">
                          Confidence {reviewCase.confidenceScore}% · opened{' '}
                          {new Date(reviewCase.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge tone={reviewCase.status === 'escalated' ? 'danger' : 'warning'}>
                        {reviewCase.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ControlPlaneSectionShell>

          <ControlPlaneSectionShell
            title="Flagged people"
            description="People whose current posture suggests staff attention."
            helper={
              <Link href={'/intelligence/flagged-persons' as Route}>
                <Button variant="secondary">View all</Button>
              </Link>
            }
          >
            {flaggedPersons.length === 0 ? (
              <ControlPlaneEmptyStateCard
                title="No flagged people"
                description="No watchlist, duplicate, or elevated-risk records are currently surfaced."
              />
            ) : (
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Person</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Signals</TableHead>
                      <TableHead>Verification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedPersons.slice(0, 8).map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              href={`/intelligence/persons/${person.id}` as Route}
                              className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                            >
                              {person.fullName?.trim() || person.id}
                            </Link>
                            <p className="text-xs text-slate-500">{person.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone={toneForBand(person.riskBand)}>{person.riskBand}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {person.fraudSignalCount} active
                          <div className="text-xs text-slate-500">
                            {person.isWatchlisted ? 'Watchlisted' : 'Not watchlisted'} ·{' '}
                            {person.hasDuplicateFlag ? 'Duplicate flag' : 'No duplicate flag'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {person.verificationStatus ?? 'unknown'}
                          <div className="text-xs text-slate-500">
                            {person.verificationProvider ?? 'n/a'} · score {person.verificationConfidence}
                          </div>
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
