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
import type { Route } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { ControlPlaneShell } from '../../../features/shared/control-plane-shell';
import {
  ControlPlaneDataNotice,
  ControlPlaneEmptyStateCard,
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
  ControlPlaneSectionShell,
} from '../../../features/shared/control-plane-page-patterns';
import { listIntelligencePersons } from '../../../lib/api-intelligence';
import { requirePlatformSession } from '../../../lib/require-platform-session';

function toneForBand(
  riskBand: string | null | undefined,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (riskBand === 'critical' || riskBand === 'high') return 'danger';
  if (riskBand === 'medium') return 'warning';
  if (riskBand === 'low') return 'success';
  return 'neutral';
}

export default async function FlaggedPersonsPage() {
  await connection();

  const token = await requirePlatformSession();
  const persons = await listIntelligencePersons({}, token).catch(() => null);
  const dataWarning = !persons
    ? 'Flagged people could not be loaded from api-intelligence.'
    : null;

  const items =
    persons?.filter(
      (person) =>
        person.isWatchlisted ||
        person.hasDuplicateFlag ||
        person.fraudSignalCount > 0 ||
        ['high', 'critical'].includes(person.riskBand),
    ) ?? [];

  return (
    <ControlPlaneShell
      eyebrow="Platform intelligence"
      title="Flagged persons"
      description="Cross-tenant view of people whose risk, watchlist, or duplicate state requires staff attention."
    >
      <div className="space-y-6">
        {dataWarning ? <ControlPlaneDataNotice description={dataWarning} /> : null}

        <ControlPlaneHeroPanel
          eyebrow="Elevated-risk population"
          title="See the people who are flagged for risk, watchlist, or duplicate posture."
          description="This queue is intended for platform staff only. It surfaces person-level intelligence posture without turning the control plane into a tenant workflow surface."
          badges={[
            {
              label: `${items.filter((person) => person.isWatchlisted).length} watchlisted`,
              tone: items.some((person) => person.isWatchlisted) ? 'danger' : 'success',
            },
            {
              label: `${items.filter((person) => person.hasDuplicateFlag).length} duplicate flagged`,
              tone: items.some((person) => person.hasDuplicateFlag) ? 'warning' : 'success',
            },
            {
              label: `${items.filter((person) => person.fraudSignalCount > 0).length} with fraud signals`,
              tone: items.some((person) => person.fraudSignalCount > 0) ? 'warning' : 'success',
            },
          ]}
        />

        <ControlPlaneMetricGrid columns={4}>
          <ControlPlaneMetricCard label="Flagged people" value={items.length} />
          <ControlPlaneMetricCard
            label="Watchlisted"
            value={items.filter((person) => person.isWatchlisted).length}
            tone={items.some((person) => person.isWatchlisted) ? 'danger' : 'success'}
          />
          <ControlPlaneMetricCard
            label="High / critical risk"
            value={items.filter((person) => ['high', 'critical'].includes(person.riskBand)).length}
            tone={
              items.some((person) => ['high', 'critical'].includes(person.riskBand))
                ? 'danger'
                : 'success'
            }
          />
          <ControlPlaneMetricCard
            label="Duplicate flags"
            value={items.filter((person) => person.hasDuplicateFlag).length}
            tone={items.some((person) => person.hasDuplicateFlag) ? 'warning' : 'success'}
          />
        </ControlPlaneMetricGrid>

        <ControlPlaneSectionShell
          title="Flagged population"
          description="Open a person record to inspect associations, review cases, watchlists, and signals."
        >
          {items.length === 0 ? (
            <ControlPlaneEmptyStateCard
              title="No flagged people"
              description="There are no elevated-risk or watchlisted people in the current intelligence view."
            />
          ) : (
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Watchlist</TableHead>
                    <TableHead>Duplicate</TableHead>
                    <TableHead>Fraud signals</TableHead>
                    <TableHead>Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((person) => (
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
                        {person.isWatchlisted ? (
                          <Badge tone="danger">Flagged</Badge>
                        ) : (
                          <Badge tone="success">Clear</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {person.hasDuplicateFlag ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {person.fraudSignalCount}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {person.verificationStatus ?? 'unknown'}
                        <div className="text-xs text-slate-500">
                          {person.verificationProvider ?? 'n/a'} · {person.verificationCountryCode ?? 'n/a'}
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
    </ControlPlaneShell>
  );
}
