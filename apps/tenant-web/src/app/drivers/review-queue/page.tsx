import Link from 'next/link';
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
import { listDriverDocumentReviewQueue } from '../../../lib/api-core';

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'approved') return 'success';
  if (status === 'pending' || status === 'expired') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

export default async function DriverReviewQueuePage() {
  const queue = await listDriverDocumentReviewQueue({ page: 1, limit: 100 }).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    limit: 100,
  }));

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
          {queue.data.length === 0 ? (
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
                  {queue.data.map((document) => (
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
    </TenantAppShell>
  );
}
