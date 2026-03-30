'use client';

import { useActionState, useRef, useState } from 'react';
import { Badge, Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from '@mobility-os/ui';
import type { DriverDocumentReviewQueueRecord } from '../../../lib/api-core';
import { ConfirmSubmitButton } from '../../../features/shared/confirm-submit-button';
import {
  reviewDriverDocumentAction,
  type ReviewDriverDocumentActionState,
} from '../actions';

const reviewInitialState: ReviewDriverDocumentActionState = {};

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'approved') return 'success';
  if (status === 'pending' || status === 'expired') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

function formatDocumentDate(value?: string | null): string {
  if (!value) return 'Not recorded';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
}

function QueueReviewRow({ document }: { document: DriverDocumentReviewQueueRecord }) {
  const [reviewState, reviewAction, isReviewPending] = useActionState(
    reviewDriverDocumentAction,
    reviewInitialState,
  );
  const [reviewIntent, setReviewIntent] = useState<'approved' | 'rejected'>('approved');
  const rejectFormRef = useRef<HTMLFormElement | null>(null);
  const needsExpiry = document.documentType === 'drivers-license';

  return (
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
        {document.previewUrl ? (
          <a
            className="text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
            href={document.previewUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open document
          </a>
        ) : (
          <Text tone="muted">Preview unavailable</Text>
        )}
      </TableCell>
      <TableCell className="min-w-[280px]">
        <form action={reviewAction} className="space-y-3" ref={rejectFormRef}>
          <input name="driverId" type="hidden" value={document.driverId} />
          <input name="documentId" type="hidden" value={document.id} />
          <input name="status" type="hidden" value={reviewIntent} />
          {needsExpiry ? (
            <Input
              defaultValue={document.expiresAt?.slice(0, 10) ?? ''}
              name="expiresAt"
              required
              type="date"
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isReviewPending}
              onClick={() => setReviewIntent('approved')}
              size="sm"
              type="submit"
            >
              Approve
            </Button>
            <ConfirmSubmitButton
              confirmDescription="Rejecting this document will send the driver back to upload a corrected replacement."
              confirmTitle="Reject this document?"
              confirmLabel="Reject document"
              disabled={isReviewPending}
              formRef={rejectFormRef}
              label="Reject"
              onConfirm={() => setReviewIntent('rejected')}
              size="sm"
              variant="ghost"
            />
          </div>
          <Text tone="muted">Expiry: {formatDocumentDate(document.expiresAt)}</Text>
          {reviewState.error ? <Text tone="danger">{reviewState.error}</Text> : null}
          {reviewState.success ? <Text tone="success">{reviewState.success}</Text> : null}
        </form>
      </TableCell>
    </TableRow>
  );
}

export function DocumentReviewQueueWorkbench({
  documents,
}: {
  documents: DriverDocumentReviewQueueRecord[];
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Decision</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <QueueReviewRow document={document} key={document.id} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
