import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
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
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { listDriverLicenceReviewQueue } from '../../../lib/api-core';

function complianceTone(
  status: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'verified' || status === 'approved') return 'success';
  if (status === 'pending' || status === 'under_review') return 'warning';
  if (status === 'rejected' || status === 'expired' || status === 'invalid') return 'danger';
  return 'neutral';
}

function riskImpactTone(
  riskImpact: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (riskImpact === 'low') return 'success';
  if (riskImpact === 'medium') return 'warning';
  if (riskImpact === 'high' || riskImpact === 'critical') return 'danger';
  return 'neutral';
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Not recorded';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default async function DriverLicenceReviewQueuePage() {
  const licenceQueue = await listDriverLicenceReviewQueue({ page: 1, limit: 100 }).catch(
    () => ({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    }),
  );

  const highRisk = licenceQueue.data.filter((item) =>
    ['high', 'critical'].includes(item.riskImpact),
  ).length;
  const expired = licenceQueue.data.filter((item) => item.status === 'expired').length;

  return (
    <TenantAppShell
      eyebrow="Compliance"
      title="Driver licence review queue"
      description="Review licence verification results that still need human intervention because of expiry, linkage risk, or unresolved verification posture."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Text tone="muted">Queued licence reviews</Text>
              <CardTitle>{licenceQueue.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Text tone="muted">High-risk cases</Text>
              <CardTitle>{highRisk}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Text tone="muted">Expired / invalid</Text>
              <CardTitle>{expired}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Queued licence checks</CardTitle>
          </CardHeader>
          <CardContent>
            {licenceQueue.data.length === 0 ? (
              <Text tone="muted">There are no licence verification reviews waiting right now.</Text>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Linkage</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Review</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenceQueue.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <Text tone="strong">{item.driverName}</Text>
                            <Text tone="muted">{item.driverStatus}</Text>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone={complianceTone(item.status)}>{item.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Text>{item.linkageDecision.replace(/_/g, ' ')}</Text>
                            <Text tone="muted">
                              {item.overallLinkageScore != null
                                ? `Score ${item.overallLinkageScore}`
                                : 'Score pending'}
                            </Text>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone={riskImpactTone(item.riskImpact)}>
                            {item.riskImpact} risk
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Text>{formatDate(item.expiryDate)}</Text>
                        </TableCell>
                        <TableCell>
                          <Link
                            className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                            href={`/drivers/${item.driverId}/review` as Route}
                          >
                            Open review flow
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TenantAppShell>
  );
}
