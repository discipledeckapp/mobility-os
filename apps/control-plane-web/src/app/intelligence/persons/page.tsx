import {
  Card,
  CardContent,
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
import type { Route } from 'next';
import Link from 'next/link';
import { ControlPlaneShell } from '../../../features/shared/control-plane-shell';
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

  return (
    <ControlPlaneShell
      description="Search canonical people across tenants and inspect linked roles, risk, watchlists, and review posture."
      eyebrow="Intelligence operations"
      title="Verified persons"
    >
      <Card>
        <CardHeader>
          <CardTitle>Search people</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonLookupForm
            countryCode={countryCode ?? ''}
            initialQuery={q ?? ''}
            reverificationRequired={reverificationRequired ?? ''}
            reviewState={reviewState ?? ''}
            riskBand={riskBand ?? ''}
            roleType={roleType ?? ''}
            watchlistStatus={watchlistStatus ?? ''}
          />
          <Text tone="muted">
            Search by global person code, canonical name, or raw canonical person id.
          </Text>
          <Link href={'/intelligence/review-cases' as Route}>
            <button
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              type="button"
            >
              Open review queue
            </button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{q?.trim() ? `Search results for “${q.trim()}”` : 'Recent verified persons'}</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <Link
                      className="font-medium text-[var(--mobiris-primary-dark)] hover:underline"
                      href={`/intelligence/persons/${person.id}` as Route}
                    >
                      {person.fullName ?? person.id}
                    </Link>
                  </TableCell>
                  <TableCell>{person.globalPersonCode ?? 'Not assigned yet'}</TableCell>
                  <TableCell>{person.riskBand}</TableCell>
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
        </CardContent>
      </Card>
    </ControlPlaneShell>
  );
}
