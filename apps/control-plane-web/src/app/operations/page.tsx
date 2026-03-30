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
import Link from 'next/link';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import {
  ControlPlaneEmptyStateCard,
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
  ControlPlaneSectionShell,
} from '../../features/shared/control-plane-page-patterns';
import { getOperationalOversight } from '../../lib/api-control-plane';

function attentionTone(score: number): 'success' | 'warning' | 'danger' | 'neutral' {
  if (score >= 16) return 'danger';
  if (score >= 6) return 'warning';
  if (score > 0) return 'neutral';
  return 'success';
}

function complianceTone(rate: number): 'success' | 'warning' | 'danger' | 'neutral' {
  if (rate >= 90) return 'success';
  if (rate >= 70) return 'warning';
  return 'danger';
}

export default async function OperationsPage() {
  const overview = await getOperationalOversight();
  const highestAttention = overview.tenants.slice(0, 8);

  return (
    <ControlPlaneShell
      eyebrow="Platform operations"
      title="Operational oversight"
      description="Work the real platform support queue: activation blockers, licence review pressure, provider-retry issues, remittance risk, and vehicle health across tenants."
    >
      <div className="space-y-6">
        <ControlPlaneHeroPanel
          badges={[
            { label: `${overview.totals.tenantsNeedingAttention} tenants need intervention`, tone: overview.totals.tenantsNeedingAttention ? 'warning' : 'success' },
            { label: `${overview.totals.driversAwaitingActivation} activation blockers`, tone: overview.totals.driversAwaitingActivation ? 'warning' : 'success' },
            { label: `${overview.totals.providerRetryRequired} provider retries`, tone: overview.totals.providerRetryRequired ? 'warning' : 'neutral' },
          ]}
          description="This is the support-facing operations queue for issues that cut across tenant boundaries: blocked onboarding, verification failures, expiring licences, and fleet risk indicators that need intervention."
          eyebrow="Cross-tenant intervention queue"
          title="See which tenants have operational pressure building before it turns into escalations."
        />

        <ControlPlaneMetricGrid columns={5}>
          <ControlPlaneMetricCard
            detail="Tenants with operational attention score above zero."
            label="Tenants needing intervention"
            tone={overview.totals.tenantsNeedingAttention ? 'warning' : 'success'}
            value={overview.totals.tenantsNeedingAttention}
          />
          <ControlPlaneMetricCard
            detail="Onboarding and verification blockers platform support can monitor."
            label="Drivers awaiting activation"
            tone={overview.totals.driversAwaitingActivation ? 'warning' : 'success'}
            value={overview.totals.driversAwaitingActivation}
          />
          <ControlPlaneMetricCard
            detail={`${overview.totals.pendingLicenceReviews} failed verification · ${overview.totals.providerRetryRequired} provider retry`}
            label="Licence issue pressure"
            tone={overview.totals.pendingLicenceReviews + overview.totals.providerRetryRequired ? 'warning' : 'success'}
            value={overview.totals.pendingLicenceReviews + overview.totals.providerRetryRequired}
          />
          <ControlPlaneMetricCard
            detail="Assignments whose readiness or remittance posture suggests support attention."
            label="Assignments at risk"
            tone={overview.totals.atRiskAssignments ? 'warning' : 'success'}
            value={overview.totals.atRiskAssignments}
          />
          <ControlPlaneMetricCard
            detail={`${overview.totals.criticalMaintenanceCount} critical maintenance items open.`}
            label="Fleet risk load"
            tone={overview.totals.vehiclesAtRisk ? 'warning' : 'success'}
            value={overview.totals.vehiclesAtRisk}
          />
        </ControlPlaneMetricGrid>

        <ControlPlaneSectionShell
          description="Platform-facing complement to tenant operations. It highlights where support, risk, or intervention is needed without cloning tenant CRUD screens."
          title="Cross-tenant operations queue"
        >
          {highestAttention.length === 0 ? (
            <ControlPlaneEmptyStateCard
              description="No cross-tenant operational issues are currently being surfaced."
              title="No operations queue"
            />
          ) : (
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Attention</TableHead>
                    <TableHead>Activation blockers</TableHead>
                    <TableHead>Licence risk</TableHead>
                    <TableHead>Operational risk</TableHead>
                    <TableHead>Inspection compliance</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highestAttention.map((tenant) => (
                    <TableRow key={tenant.tenantId}>
                      <TableCell>
                        <div>
                          <Link
                            className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                            href={`/tenants/${tenant.tenantId}`}
                          >
                            {tenant.tenantName}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {tenant.slug} · {tenant.country} · {tenant.tenantStatus}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge tone={attentionTone(tenant.attentionScore)}>
                          score {tenant.attentionScore}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {tenant.verificationHealth.driversAwaitingActivation} awaiting activation
                        <div className="text-xs text-slate-500">
                          {tenant.driverActivity.activeUnverified} active but unverified ·{' '}
                          {tenant.driverActivity.onboardingPool} in onboarding pool
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {tenant.verificationHealth.licenceVerificationIssueCount} failed ·{' '}
                        {tenant.verificationHealth.providerRetryRequiredCount} retry
                        <div className="text-xs text-slate-500">
                          {tenant.verificationHealth.expiredLicencesCount} expired ·{' '}
                          {tenant.verificationHealth.expiringLicencesSoonCount} expiring soon
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {tenant.riskSummary.atRiskAssignmentCount} at-risk assignments
                        <div className="text-xs text-slate-500">
                          {tenant.riskSummary.vehiclesAtRiskCount} vehicles at risk ·{' '}
                          {tenant.riskSummary.criticalMaintenanceCount} critical maintenance
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge tone={complianceTone(tenant.riskSummary.inspectionComplianceRate)}>
                          {tenant.riskSummary.inspectionComplianceRate.toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/tenants/${tenant.tenantId}`}>
                          <Button variant="secondary">Open tenant</Button>
                        </Link>
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
