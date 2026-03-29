import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
  Text,
} from '@mobility-os/ui';
import Link from 'next/link';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
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

  return (
    <ControlPlaneShell
      eyebrow="Platform operations"
      title="Operational oversight"
      description="Work the real platform support queue: activation blockers, licence review pressure, provider-retry issues, remittance risk, and vehicle health across tenants."
    >
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-5">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Tenants needing intervention</CardDescription>
              <CardTitle>{overview.totals.tenantsNeedingAttention}</CardTitle>
              <Text tone="muted">Tenants with operational attention score above zero.</Text>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Drivers awaiting activation</CardDescription>
              <CardTitle>{overview.totals.driversAwaitingActivation}</CardTitle>
              <Text tone="muted">
                Onboarding and verification blockers platform support can monitor.
              </Text>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Licence verification issue pressure</CardDescription>
              <CardTitle>
                {overview.totals.pendingLicenceReviews + overview.totals.providerRetryRequired}
              </CardTitle>
              <Text tone="muted">
                {overview.totals.pendingLicenceReviews} failed verification ·{' '}
                {overview.totals.providerRetryRequired} provider retry
              </Text>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Assignments at risk</CardDescription>
              <CardTitle>{overview.totals.atRiskAssignments}</CardTitle>
              <Text tone="muted">
                Remittance or readiness posture likely needs support attention.
              </Text>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Fleet risk load</CardDescription>
              <CardTitle>{overview.totals.vehiclesAtRisk}</CardTitle>
              <Text tone="muted">
                {overview.totals.criticalMaintenanceCount} critical maintenance items open.
              </Text>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-slate-200/80">
          <CardHeader>
            <CardTitle>Cross-tenant operations queue</CardTitle>
            <CardDescription>
              This is the platform-facing complement to tenant operations. It highlights where
              support, risk, or intervention is needed without cloning tenant CRUD screens.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {overview.tenants.map((tenant) => (
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
          </CardContent>
        </Card>
      </div>
    </ControlPlaneShell>
  );
}
