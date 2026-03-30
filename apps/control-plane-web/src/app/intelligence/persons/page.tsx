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
  Text,
} from '@mobility-os/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { ControlPlaneShell } from '../../../features/shared/control-plane-shell';
import {
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
  ControlPlaneSectionShell,
  ControlPlaneToolbarPanel,
} from '../../../features/shared/control-plane-page-patterns';
import { listIntelligencePersons } from '../../../lib/api-intelligence';
import { PersonLookupForm } from './person-lookup-form';

export default async function IntelligencePersonsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    riskBand?: string;
    countryCode?: string;
    watchlistStatus?: string;
    reviewState?: string;
    roleType?: string;
    reverificationRequired?: string;
  }>;
}) {
  const { q, riskBand, countryCode, watchlistStatus, reviewState, roleType, reverificationRequired } =
    await searchParams;
  const people = await listIntelligencePersons({
    ...(q ? { q } : {}),
    ...(riskBand ? { riskBand } : {}),
    ...(countryCode ? { countryCode } : {}),
    ...(watchlistStatus ? { watchlistStatus } : {}),
    ...(reviewState ? { reviewState } : {}),
    ...(roleType ? { roleType } : {}),
    ...(reverificationRequired ? { reverificationRequired } : {}),
  }).catch(() => []);
  const watchlistedCount = people.filter((person) => person.isWatchlisted).length;
  const duplicateCount = people.filter((person) => person.hasDuplicateFlag).length;
  const highRiskCount = people.filter((person) => person.riskBand.toLowerCase() === 'high').length;

  return (
    <ControlPlaneShell
      description="Search canonical people across tenants and inspect linked roles, risk, watchlists, and review posture."
      eyebrow="Intelligence operations"
      title="Verified persons"
    >
      <div className="space-y-6">
        <ControlPlaneHeroPanel
          badges={[
            { label: `${people.length} results`, tone: 'neutral' },
            { label: `${watchlistedCount} watchlisted`, tone: watchlistedCount ? 'warning' : 'success' },
            { label: `${duplicateCount} duplicate flagged`, tone: duplicateCount ? 'warning' : 'success' },
          ]}
          description="This is the canonical identity registry used for cross-tenant person intelligence. Search by person code, name, or record id, then drill into risk, associations, watchlists, and review history."
          eyebrow="Canonical identity registry"
          title={q?.trim() ? `Inspect the people matching “${q.trim()}”` : 'Inspect verified people across all tenants.'}
        />

        <ControlPlaneMetricGrid columns={3}>
          <ControlPlaneMetricCard label="Returned people" value={people.length} />
          <ControlPlaneMetricCard label="Watchlisted" tone={watchlistedCount ? 'warning' : 'success'} value={watchlistedCount} />
          <ControlPlaneMetricCard label="High risk band" tone={highRiskCount ? 'warning' : 'success'} value={highRiskCount} />
        </ControlPlaneMetricGrid>

        <ControlPlaneSectionShell
          description="Search by global person code, canonical name, or raw canonical person id."
          helper={
            <Link href={'/intelligence/review-cases' as Route}>
              <Button variant="secondary">Open review queue</Button>
            </Link>
          }
          title="Search people"
        >
          <ControlPlaneToolbarPanel>
            <PersonLookupForm
              countryCode={countryCode ?? ''}
              initialQuery={q ?? ''}
              reverificationRequired={reverificationRequired ?? ''}
              reviewState={reviewState ?? ''}
              riskBand={riskBand ?? ''}
              roleType={roleType ?? ''}
              watchlistStatus={watchlistStatus ?? ''}
            />
          </ControlPlaneToolbarPanel>
        </ControlPlaneSectionShell>

        <ControlPlaneSectionShell
          description="Results from the canonical person graph. Open a person to inspect linked roles, risk, and watchlists."
          title={q?.trim() ? `Search results for “${q.trim()}”` : 'Recent verified persons'}
        >
          <TableViewport>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Global code</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Watchlist</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          className="font-medium text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/intelligence/persons/${person.id}` as Route}
                        >
                          {person.fullName ?? person.id}
                        </Link>
                        <p className="text-xs text-slate-500">{person.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{person.globalPersonCode ?? 'Not assigned yet'}</TableCell>
                    <TableCell>
                      <Badge tone={person.riskBand.toLowerCase() === 'high' ? 'danger' : person.riskBand.toLowerCase() === 'medium' ? 'warning' : 'success'}>
                        {person.riskBand}
                      </Badge>
                    </TableCell>
                    <TableCell>{person.verificationCountryCode ?? 'n/a'}</TableCell>
                    <TableCell>{person.verificationStatus ?? 'Not verified'}</TableCell>
                    <TableCell>{person.isWatchlisted ? 'Flagged' : 'Clear'}</TableCell>
                    <TableCell>{new Date(person.updatedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {people.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-8 text-center text-slate-500" colSpan={7}>
                      No people matched the current search.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableViewport>
          <div className="mt-4">
            <Text tone="muted">
              {people.length} person record{people.length === 1 ? '' : 's'} shown.
            </Text>
          </div>
        </ControlPlaneSectionShell>
      </div>
    </ControlPlaneShell>
  );
}
