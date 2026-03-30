import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import Link from 'next/link';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';
import { listDriverDocumentReviewQueue } from '../../../lib/api-core';
import { DocumentReviewQueueWorkbench } from './document-review-queue-workbench';

export default async function DriverReviewQueuePage() {
  const documentQueue = await listDriverDocumentReviewQueue({ page: 1, limit: 100 }).catch(
    () => ({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    }),
  );

  return (
    <TenantAppShell
      eyebrow="Compliance"
      title="Driver document review queue"
      description="Review newly submitted, rejected, or expired driver documents and jump directly into the decision flow."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Text tone="muted">Queued documents</Text>
              <CardTitle>{documentQueue.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Text tone="muted">Rejected / expired</Text>
              <CardTitle>
                {
                  documentQueue.data.filter((document) =>
                    ['rejected', 'expired'].includes(document.status),
                  ).length
                }
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Text tone="muted">Quick path</Text>
              <Link
                className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
                href="/drivers/licence-review"
              >
                Open licence review queue
              </Link>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Queued documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documentQueue.data.length === 0 ? (
              <Text tone="muted">There are no driver documents waiting for review right now.</Text>
            ) : (
              <DocumentReviewQueueWorkbench documents={documentQueue.data} />
            )}
          </CardContent>
        </Card>
      </div>
    </TenantAppShell>
  );
}
