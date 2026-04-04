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
import { connection } from 'next/server';
import { ControlPlaneShell } from '../../../../features/shared/control-plane-shell';
import {
  ControlPlaneDataNotice,
  ControlPlaneEmptyStateCard,
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
  ControlPlaneSectionShell,
} from '../../../../features/shared/control-plane-page-patterns';
import {
  getIntelligencePerson,
  getPersonRiskSummary,
  listIdentifiersByPerson,
  listPersonAssociations,
  listPersonIdentityChanges,
  listPersonLinkageEvents,
  listReviewCases,
  listRiskSignalsByPerson,
  listWatchlistEntriesByPerson,
} from '../../../../lib/api-intelligence';
import { requirePlatformSession } from '../../../../lib/require-platform-session';

function toneForBand(
  riskBand: string | null | undefined,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (riskBand === 'critical' || riskBand === 'high') return 'danger';
  if (riskBand === 'medium') return 'warning';
  if (riskBand === 'low') return 'success';
  return 'neutral';
}

export default async function IntelligencePersonPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  await connection();

  const { personId } = await params;
  const token = await requirePlatformSession();
  const warnings: string[] = [];

  const [
    personResult,
    riskSummaryResult,
    associationsResult,
    reviewCasesResult,
    riskSignalsResult,
    watchlistEntriesResult,
    identifiersResult,
    identityChangesResult,
    linkageEventsResult,
  ] = await Promise.allSettled([
    getIntelligencePerson(personId, token),
    getPersonRiskSummary(personId, token),
    listPersonAssociations(personId, token),
    listReviewCases({ personId }, token),
    listRiskSignalsByPerson(personId, true, token),
    listWatchlistEntriesByPerson(personId, token),
    listIdentifiersByPerson(personId, token),
    listPersonIdentityChanges(personId, token),
    listPersonLinkageEvents(personId, token),
  ]);

  const person = personResult.status === 'fulfilled' ? personResult.value : null;
  const riskSummary = riskSummaryResult.status === 'fulfilled' ? riskSummaryResult.value : null;
  const associations = associationsResult.status === 'fulfilled' ? associationsResult.value : [];
  const reviewCases = reviewCasesResult.status === 'fulfilled' ? reviewCasesResult.value : [];
  const riskSignals = riskSignalsResult.status === 'fulfilled' ? riskSignalsResult.value : [];
  const watchlistEntries =
    watchlistEntriesResult.status === 'fulfilled' ? watchlistEntriesResult.value : [];
  const identifiers = identifiersResult.status === 'fulfilled' ? identifiersResult.value : [];
  const identityChanges =
    identityChangesResult.status === 'fulfilled' ? identityChangesResult.value : [];
  const linkageEvents =
    linkageEventsResult.status === 'fulfilled' ? linkageEventsResult.value : [];

  if (personResult.status !== 'fulfilled') warnings.push('The person record could not be loaded.');
  if (riskSummaryResult.status !== 'fulfilled') warnings.push('The person risk summary could not be loaded.');
  if (associationsResult.status !== 'fulfilled') warnings.push('Tenant associations could not be loaded.');
  if (reviewCasesResult.status !== 'fulfilled') warnings.push('Review cases could not be loaded.');
  if (riskSignalsResult.status !== 'fulfilled') warnings.push('Risk signals could not be loaded.');
  if (watchlistEntriesResult.status !== 'fulfilled') warnings.push('Watchlist entries could not be loaded.');
  if (identifiersResult.status !== 'fulfilled') warnings.push('Identifiers could not be loaded.');
  if (identityChangesResult.status !== 'fulfilled') warnings.push('Identity change history could not be loaded.');
  if (linkageEventsResult.status !== 'fulfilled') warnings.push('Linkage events could not be loaded.');

  const personLabel = person?.fullName?.trim() || person?.globalPersonCode || personId;

  return (
    <ControlPlaneShell
      eyebrow="Platform intelligence"
      title={personLabel}
      description="Person-level drill-down for platform staff review. This stays in the control plane and reads directly from the intelligence plane."
    >
      <div className="space-y-6">
        {warnings.length > 0 ? (
          <ControlPlaneDataNotice
            title="Person record loaded with partial intelligence data"
            description={warnings.join(' ')}
          />
        ) : null}

        <ControlPlaneHeroPanel
          eyebrow="Person overview"
          title={personLabel}
          description={`Person ID ${personId}`}
          badges={[
            {
              label: `Risk ${person?.riskBand ?? riskSummary?.riskBand ?? 'unknown'}`,
              tone: toneForBand(person?.riskBand ?? riskSummary?.riskBand),
            },
            {
              label: `${reviewCases.filter((item) => ['open', 'in_review', 'escalated'].includes(item.status)).length} open cases`,
              tone:
                reviewCases.some((item) => ['open', 'in_review', 'escalated'].includes(item.status))
                  ? 'warning'
                  : 'success',
            },
            {
              label: `${watchlistEntries.filter((item) => item.isActive).length} active watchlists`,
              tone: watchlistEntries.some((item) => item.isActive) ? 'danger' : 'success',
            },
          ]}
        />

        <ControlPlaneMetricGrid columns={5}>
          <ControlPlaneMetricCard
            label="Risk score"
            value={riskSummary?.score ?? person?.globalRiskScore ?? 0}
            tone={toneForBand(person?.riskBand ?? riskSummary?.riskBand)}
          />
          <ControlPlaneMetricCard
            label="Linked organisations"
            value={riskSummary?.linkedOrganisationCount ?? 0}
          />
          <ControlPlaneMetricCard
            label="Active review cases"
            value={riskSummary?.activeReviewCaseCount ?? 0}
            tone={(riskSummary?.activeReviewCaseCount ?? 0) > 0 ? 'warning' : 'success'}
          />
          <ControlPlaneMetricCard
            label="Active watchlists"
            value={riskSummary?.activeWatchlistCount ?? 0}
            tone={(riskSummary?.activeWatchlistCount ?? 0) > 0 ? 'danger' : 'success'}
          />
          <ControlPlaneMetricCard
            label="Guarantor exposure"
            value={riskSummary?.guarantorLinkedDriverCount ?? 0}
            tone={riskSummary?.guarantorExposureExceeded ? 'warning' : 'neutral'}
            detail={
              riskSummary?.guarantorExposureExceeded
                ? 'Current guarantor exposure exceeds the configured safe threshold.'
                : 'No exposure threshold issue detected.'
            }
          />
        </ControlPlaneMetricGrid>

        <div className="grid gap-6 xl:grid-cols-2">
          <ControlPlaneSectionShell
            title="Risk factors"
            description="Why this person currently scores the way they do."
          >
            {riskSummary?.contributingFactors?.length ? (
              <div className="space-y-3">
                {riskSummary.contributingFactors.map((factor) => (
                  <div className="rounded-2xl border border-slate-200 px-4 py-3" key={factor.code}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{factor.label}</p>
                        <p className="text-xs text-slate-500">{factor.code}</p>
                      </div>
                      <Badge tone={factor.weight >= 15 ? 'danger' : factor.weight >= 8 ? 'warning' : 'neutral'}>
                        +{factor.weight}
                      </Badge>
                    </div>
                    {factor.detail ? (
                      <p className="mt-2 text-sm text-slate-600">{factor.detail}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <ControlPlaneEmptyStateCard
                title="No contributing factors"
                description="No derived risk factors are currently attached to this person."
              />
            )}
          </ControlPlaneSectionShell>

          <ControlPlaneSectionShell
            title="Identifiers"
            description="Masked identifiers already attached to the person graph."
          >
            {identifiers.length === 0 ? (
              <ControlPlaneEmptyStateCard
                title="No identifiers"
                description="No identifiers are currently attached to this person."
              />
            ) : (
              <div className="space-y-3">
                {identifiers.map((identifier) => (
                  <div className="rounded-2xl border border-slate-200 px-4 py-3" key={identifier.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{identifier.type}</p>
                        <p className="text-xs text-slate-500">
                          {identifier.maskedValue} · {identifier.countryCode ?? 'n/a'}
                        </p>
                      </div>
                      <Badge tone={identifier.isVerified ? 'success' : 'neutral'}>
                        {identifier.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ControlPlaneSectionShell>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ControlPlaneSectionShell
            title="Review cases"
            description="Manual review history and outstanding decisions."
          >
            {reviewCases.length === 0 ? (
              <ControlPlaneEmptyStateCard
                title="No review cases"
                description="This person has no review cases in the intelligence plane."
              />
            ) : (
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Reviewer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewCases.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm text-slate-700">{item.id}</TableCell>
                        <TableCell>
                          <Badge
                            tone={
                              item.status === 'escalated'
                                ? 'danger'
                                : ['open', 'in_review'].includes(item.status)
                                  ? 'warning'
                                  : 'success'
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">{item.confidenceScore}%</TableCell>
                        <TableCell className="text-sm text-slate-700">{item.reviewedBy ?? 'Unassigned'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableViewport>
            )}
          </ControlPlaneSectionShell>

          <ControlPlaneSectionShell
            title="Watchlists and signals"
            description="Current active watchlist and risk-signal posture."
          >
            <div className="space-y-4">
              {watchlistEntries.length === 0 ? null : (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">Watchlists</p>
                  {watchlistEntries.map((entry) => (
                    <div className="rounded-2xl border border-slate-200 px-4 py-3" key={entry.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{entry.type}</p>
                          <p className="text-xs text-slate-500">{entry.reason}</p>
                        </div>
                        <Badge tone={entry.isActive ? 'danger' : 'neutral'}>
                          {entry.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {riskSignals.length === 0 ? null : (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">Risk signals</p>
                  {riskSignals.map((signal) => (
                    <div className="rounded-2xl border border-slate-200 px-4 py-3" key={signal.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{signal.type}</p>
                          <p className="text-xs text-slate-500">
                            {signal.source} · {new Date(signal.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge tone={signal.severity === 'critical' || signal.severity === 'high' ? 'danger' : 'warning'}>
                          {signal.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {watchlistEntries.length === 0 && riskSignals.length === 0 ? (
                <ControlPlaneEmptyStateCard
                  title="No active risk posture"
                  description="There are no watchlist entries or active risk signals attached to this person."
                />
              ) : null}
            </div>
          </ControlPlaneSectionShell>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ControlPlaneSectionShell
            title="Associations"
            description="Local entity links across tenants and roles."
          >
            {associations.length === 0 ? (
              <ControlPlaneEmptyStateCard
                title="No associations"
                description="This person is not currently linked to any tenant-side entities."
              />
            ) : (
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {associations.map((association) => (
                      <TableRow key={association.id}>
                        <TableCell className="text-sm text-slate-700">{association.tenantId}</TableCell>
                        <TableCell className="text-sm text-slate-700">{association.roleType}</TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {association.localEntityType}
                          <div className="text-xs text-slate-500">{association.localEntityId ?? 'n/a'}</div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">{association.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableViewport>
            )}
          </ControlPlaneSectionShell>

          <ControlPlaneSectionShell
            title="Event history"
            description="Recent identity change and linkage activity."
          >
            {identityChanges.length === 0 && linkageEvents.length === 0 ? (
              <ControlPlaneEmptyStateCard
                title="No event history"
                description="No identity-change or linkage events are available for this person."
              />
            ) : (
              <div className="space-y-3">
                {identityChanges.slice(0, 5).map((event) => (
                  <div className="rounded-2xl border border-slate-200 px-4 py-3" key={event.id}>
                    <p className="text-sm font-semibold text-slate-900">{event.eventType}</p>
                    <p className="text-xs text-slate-500">
                      Identity change · {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                {linkageEvents.slice(0, 5).map((event) => (
                  <div className="rounded-2xl border border-slate-200 px-4 py-3" key={event.id}>
                    <p className="text-sm font-semibold text-slate-900">{event.eventType}</p>
                    <p className="text-xs text-slate-500">
                      Linkage event · {new Date(event.occurredAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ControlPlaneSectionShell>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
