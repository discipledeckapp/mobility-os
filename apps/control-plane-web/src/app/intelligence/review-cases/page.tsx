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
import { listReviewCases } from '../../../lib/api-intelligence';
import { requirePlatformSession } from '../../../lib/require-platform-session';

function toneForCaseStatus(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'resolved' || status === 'closed') return 'success';
  if (status === 'escalated') return 'danger';
  if (status === 'open' || status === 'in_review') return 'warning';
  return 'neutral';
}

export default async function IntelligenceReviewCasesPage() {
  await connection();

  const token = await requirePlatformSession();
  const reviewCases = await listReviewCases({}, token).catch(() => null);

  const dataWarning = !reviewCases
    ? 'Review cases could not be loaded from api-intelligence.'
    : null;
  const items = reviewCases ?? [];
  const openCount = items.filter((item) => item.status === 'open').length;
  const inReviewCount = items.filter((item) => item.status === 'in_review').length;
  const escalatedCount = items.filter((item) => item.status === 'escalated').length;
  const resolvedCount = items.filter((item) =>
    ['resolved', 'closed'].includes(item.status),
  ).length;

  return (
    <ControlPlaneShell
      eyebrow="Platform intelligence"
      title="Review cases"
      description="Work the manual-review queue without dropping into tenant-facing surfaces."
    >
      <div className="space-y-6">
        {dataWarning ? <ControlPlaneDataNotice description={dataWarning} /> : null}

        <ControlPlaneHeroPanel
          eyebrow="Manual review queue"
          title="Review cases from the intelligence plane"
          description="These cases represent people whose verification or linkage confidence requires staff judgment. Open the person record to inspect the full risk and identity context."
          badges={[
            { label: `${openCount} open`, tone: openCount > 0 ? 'warning' : 'success' },
            {
              label: `${inReviewCount} in review`,
              tone: inReviewCount > 0 ? 'warning' : 'success',
            },
            {
              label: `${escalatedCount} escalated`,
              tone: escalatedCount > 0 ? 'danger' : 'success',
            },
          ]}
        />

        <ControlPlaneMetricGrid columns={4}>
          <ControlPlaneMetricCard label="Total cases" value={items.length} />
          <ControlPlaneMetricCard
            label="Open"
            value={openCount}
            tone={openCount > 0 ? 'warning' : 'success'}
          />
          <ControlPlaneMetricCard
            label="Escalated"
            value={escalatedCount}
            tone={escalatedCount > 0 ? 'danger' : 'success'}
          />
          <ControlPlaneMetricCard
            label="Resolved"
            value={resolvedCount}
            tone={resolvedCount > 0 ? 'success' : 'neutral'}
          />
        </ControlPlaneMetricGrid>

        <ControlPlaneSectionShell
          title="Case queue"
          description="This view is intentionally cross-tenant and platform-only."
        >
          {items.length === 0 ? (
            <ControlPlaneEmptyStateCard
              title="No review cases"
              description="There are no intelligence review cases to work right now."
            />
          ) : (
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case</TableHead>
                    <TableHead>Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{item.id}</p>
                          <p className="text-xs text-slate-500">
                            Created {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/intelligence/persons/${item.personId}` as Route}
                          className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                        >
                          {item.personId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge tone={toneForCaseStatus(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {item.confidenceScore}%
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {item.reviewedBy ?? 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {new Date(item.updatedAt).toLocaleString()}
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
