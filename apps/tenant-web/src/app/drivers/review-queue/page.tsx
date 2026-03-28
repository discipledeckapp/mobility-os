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
import Link from 'next/link';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { listDriverDocumentReviewQueue, listDriverLicenceReviewQueue } from '../../../lib/api-core';

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'approved') return 'success';
  if (status === 'pending' || status === 'expired') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

export default async function DriverReviewQueuePage() {
  const [documentQueue, licenceQueue] = await Promise.all([
    listDriverDocumentReviewQueue({ page: 1, limit: 100 }).catch(() => ({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    })),
    listDriverLicenceReviewQueue({ page: 1, limit: 100 }).catch(() => ({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    })),
  ]);

  return (
    <TenantAppShell
      eyebrow="Compliance"
      title="Driver document review queue"
      description="Review newly submitted, rejected, or expired driver documents and jump directly into the decision flow."
    >
      <Card>
        <CardHeader>
          <CardTitle>Queued documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documentQueue.data.length === 0 ? (
            <Text tone="muted">There are no driver documents waiting for review right now.</Text>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentQueue.data.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Text tone="strong">{document.driverName}</Text>
                          <Text tone="muted">{document.driverPhone}</Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Text>{document.documentType}</Text>
                          <Text tone="muted">{document.fileName}</Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge tone={getStatusTone(document.status)}>{document.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Text>{new Date(document.createdAt).toLocaleString()}</Text>
                      </TableCell>
                      <TableCell>
                        <Link
                          className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/drivers/${document.driverId}/review`}
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

      <Card>
        <CardHeader>
          <CardTitle>Driver licence linkage reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {licenceQueue.data.length === 0 ? (
            <Text tone="muted">
              There are no driver licence linkage reviews waiting for human approval right now.
            </Text>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Linkage</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenceQueue.data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Text tone="strong">{item.driverName}</Text>
                          <Text tone="muted">{item.driverPhone}</Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge tone={item.validity === 'valid' ? 'success' : 'warning'}>
                            {item.validity ?? 'unknown'}
                          </Badge>
                          <Text tone="muted">
                            {item.expiryDate ? `Expires ${item.expiryDate}` : 'Expiry not returned'}
                          </Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge tone="warning">{item.linkageDecision.replace(/_/g, ' ')}</Badge>
                          <Text tone="muted">
                            {item.overallLinkageScore !== null
                              ? `Overall score ${item.overallLinkageScore}%`
                              : 'Score not returned'}
                          </Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge tone={getStatusTone(item.riskImpact)}>{item.riskImpact}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                          href={`/drivers/${item.driverId}/review`}
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
    </TenantAppShell>
  );
}
