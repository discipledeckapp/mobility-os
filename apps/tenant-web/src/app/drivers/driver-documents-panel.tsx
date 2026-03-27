'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  ActionPendingButtonState,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  InlineLoadingState,
  CardTitle,
  Input,
  Label,
  SearchableSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@mobility-os/ui';
import {
  getCountryConfig,
  getDocumentType,
  getRequiredDocuments,
  isCountrySupported,
} from '@mobility-os/domain-config';
import type { DriverDocumentRecord } from '../../lib/api-core';
import {
  reviewDriverDocumentAction,
  uploadDriverDocumentAction,
  uploadDriverSelfServiceDocumentAction,
  type ReviewDriverDocumentActionState,
  type UploadDriverDocumentActionState,
} from './actions';
import { ConfirmSubmitButton } from '../../features/shared/confirm-submit-button';

const initialState: UploadDriverDocumentActionState = {};
const reviewInitialState: ReviewDriverDocumentActionState = {};

function getDocumentStatusTone(
  status: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
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

function getUploadedByLabel(uploadedBy: string): string {
  if (uploadedBy === 'driver_self_service') {
    return 'driver self-service';
  }

  if (uploadedBy.startsWith('user_')) {
    return uploadedBy;
  }

  return uploadedBy || 'operator';
}

function DriverDocumentRow({
  document,
  driverId,
}: {
  document: DriverDocumentRecord;
  driverId: string;
}) {
  const [reviewState, reviewAction, isReviewPending] = useActionState(
    reviewDriverDocumentAction,
    reviewInitialState,
  );
  const [reviewIntent, setReviewIntent] = useState<'approved' | 'rejected'>('approved');
  const rejectFormRef = useRef<HTMLFormElement | null>(null);
  const documentConfig = getDocumentType(document.documentType);

  return (
    <TableRow key={document.id}>
      <TableCell>
        <div className="space-y-1">
          <Text tone="strong">{documentConfig.name}</Text>
          <Text tone="muted">Uploaded by {getUploadedByLabel(document.uploadedBy)}</Text>
          <Text tone="muted">{document.fileName}</Text>
        </div>
      </TableCell>
      <TableCell>
        <Badge tone={getDocumentStatusTone(document.status)}>
          {document.status}
        </Badge>
      </TableCell>
      <TableCell>{formatDocumentDate(document.expiresAt)}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <Text>{document.reviewedBy ?? 'Not reviewed yet'}</Text>
          <Text tone="muted">{formatDocumentDate(document.reviewedAt)}</Text>
        </div>
      </TableCell>
      <TableCell>
        {document.previewUrl ? (
          <a
            className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
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
      <TableCell>
        <form action={reviewAction} className="space-y-3" ref={rejectFormRef}>
          <input name="driverId" type="hidden" value={driverId} />
          <input name="documentId" type="hidden" value={document.id} />
          <input name="status" type="hidden" value={reviewIntent} />
          {documentConfig.hasExpiry ? (
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
              size="md"
              type="submit"
            >
              Approve
            </Button>
            <ConfirmSubmitButton
              confirmDescription="Rejecting this document will send the driver back to upload a corrected replacement."
              confirmTitle="Reject this document?"
              disabled={isReviewPending}
              formRef={rejectFormRef}
              label="Reject"
              confirmLabel="Reject document"
              onConfirm={() => setReviewIntent('rejected')}
              variant="ghost"
            />
          </div>
          {reviewState.error ? <Text tone="danger">{reviewState.error}</Text> : null}
          {reviewState.success ? <Text tone="success">{reviewState.success}</Text> : null}
        </form>
      </TableCell>
    </TableRow>
  );
}

export function DriverDocumentsPanel({
  driverId,
  countryCode,
  documents,
  mode = 'operator',
  selfServiceToken,
  requiredDocumentSlugs,
  onUploadSuccess,
}: {
  driverId: string;
  countryCode?: string | null | undefined;
  documents: DriverDocumentRecord[];
  mode?: 'operator' | 'self_service';
  selfServiceToken?: string | null | undefined;
  requiredDocumentSlugs?: string[] | null | undefined;
  onUploadSuccess?: () => void;
}) {
  const [documentType, setDocumentType] = useState('');
  const requiredDriverDocumentSlugs =
    requiredDocumentSlugs?.length
      ? requiredDocumentSlugs
      : countryCode && isCountrySupported(countryCode)
      ? getCountryConfig(countryCode).requiredDriverDocumentSlugs
      : ['national-id', 'drivers-license'];
  const requiredDocumentOptions = getRequiredDocuments(
    requiredDriverDocumentSlugs,
  ).map((document) => ({
    value: document.slug,
    label: document.name,
  }));

  const [state, formAction, isPending] = useActionState(
    mode === 'self_service' ? uploadDriverSelfServiceDocumentAction : uploadDriverDocumentAction,
    initialState,
  );

  useEffect(() => {
    if (state.success && onUploadSuccess) {
      onUploadSuccess();
    }
  }, [onUploadSuccess, state.success]);

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>Driver documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]">
          {mode === 'self_service' ? (
            <input name="token" type="hidden" value={selfServiceToken ?? ''} />
          ) : (
            <input name="driverId" type="hidden" value={driverId} />
          )}
          <SearchableSelect
            inputId={`driver-document-type-${driverId}`}
            label="Document type"
            name="documentType"
            onChange={setDocumentType}
            options={requiredDocumentOptions}
            placeholder="Select document type"
            required
            value={documentType}
          />
          <div className="space-y-2">
            <Label htmlFor={`driver-document-file-${driverId}`}>Document file</Label>
            <input
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="block w-full rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm text-[var(--mobiris-ink)]"
              id={`driver-document-file-${driverId}`}
              name="documentFile"
              type="file"
            />
            <Text tone="muted">
              Upload PDF, JPEG, PNG, or WEBP files up to 10 MB. Document content must match the file type.
            </Text>
          </div>
          <div className="flex items-end">
            <ActionPendingButtonState
              label="Upload document"
              pending={isPending}
              pendingLabel="Uploading securely"
            />
          </div>
        </form>

        {isPending ? (
          <InlineLoadingState
            message="Preparing the file, validating it, and attaching it to the driver record."
            title="Uploading document"
            variant="upload"
          />
        ) : null}
        {state.error ? <Text tone="danger">{state.error}</Text> : null}
        {state.success ? <Text tone="success">{state.success}</Text> : null}
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="flex h-36 items-center justify-center rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-[var(--mobiris-border)] bg-slate-50 p-6 text-center">
              <Text tone="muted">
                No driver documents have been uploaded yet.
              </Text>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {documents.map((document) => (
                  <div
                    className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-slate-50/70 p-4"
                    key={document.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <Text tone="strong">{getDocumentType(document.documentType).name}</Text>
                        <Text tone="muted">{document.fileName}</Text>
                        <Text tone="muted">Uploaded by {getUploadedByLabel(document.uploadedBy)}</Text>
                      </div>
                      <Badge tone={getDocumentStatusTone(document.status)}>{document.status}</Badge>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Text>Expiry: {formatDocumentDate(document.expiresAt)}</Text>
                      <Text>Reviewer: {document.reviewedBy ?? 'Not reviewed yet'}</Text>
                      <Text tone="muted">{formatDocumentDate(document.reviewedAt)}</Text>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {document.previewUrl ? (
                        <a
                          className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
                          href={document.previewUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Open document
                        </a>
                      ) : (
                        <Text tone="muted">Preview unavailable</Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Preview</TableHead>
                      {mode === 'operator' ? <TableHead>Actions</TableHead> : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((document) =>
                      mode === 'operator' ? (
                        <DriverDocumentRow
                          document={document}
                          driverId={driverId}
                          key={document.id}
                        />
                      ) : (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <Text tone="strong">{getDocumentType(document.documentType).name}</Text>
                              <Text tone="muted">Uploaded by {getUploadedByLabel(document.uploadedBy)}</Text>
                              <Text tone="muted">{document.fileName}</Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge tone={getDocumentStatusTone(document.status)}>{document.status}</Badge>
                          </TableCell>
                          <TableCell>{formatDocumentDate(document.expiresAt)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Text>{document.reviewedBy ?? 'Not reviewed yet'}</Text>
                              <Text tone="muted">{formatDocumentDate(document.reviewedAt)}</Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            {document.previewUrl ? (
                              <a
                                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
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
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
