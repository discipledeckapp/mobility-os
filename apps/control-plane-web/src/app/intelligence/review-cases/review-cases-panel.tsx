'use client';

import {
  Badge,
  Button,
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
  TableViewport,
  Text,
} from '@mobility-os/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { useActionState } from 'react';
import type { ReviewCaseRecord } from '../../../lib/api-intelligence';
import {
  resolveReviewCaseAction,
  type ReviewCaseActionState,
  updateReviewCaseStatusAction,
} from './actions';

const initialState: ReviewCaseActionState = {};

function tone(status: string): 'neutral' | 'warning' | 'success' | 'danger' {
  if (status === 'resolved') return 'success';
  if (status === 'escalated') return 'danger';
  if (status === 'in_review') return 'warning';
  return 'neutral';
}

function ReviewCaseRow({ reviewCase }: { reviewCase: ReviewCaseRecord }) {
  const [statusState, statusAction, statusPending] = useActionState(
    updateReviewCaseStatusAction,
    initialState,
  );
  const [resolveState, resolveAction, resolvePending] = useActionState(
    resolveReviewCaseAction,
    initialState,
  );

  return (
    <TableRow>
      <TableCell>
        <Link
          className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
          href={`/intelligence/persons/${reviewCase.personId}` as Route}
        >
          {reviewCase.personId}
        </Link>
      </TableCell>
      <TableCell>
        <Badge tone={tone(reviewCase.status)}>{reviewCase.status}</Badge>
      </TableCell>
      <TableCell>{reviewCase.confidenceScore.toFixed(2)}</TableCell>
      <TableCell className="max-w-[340px] text-sm text-slate-600">
        {reviewCase.notes ?? 'No notes recorded'}
      </TableCell>
      <TableCell className="space-y-2">
        {reviewCase.status !== 'resolved' ? (
          <>
            <form action={statusAction} className="flex flex-wrap items-center gap-2">
              <input name="id" type="hidden" value={reviewCase.id} />
              <select
                className="h-9 rounded-[var(--mobiris-radius-button)] border border-slate-200 px-3 text-sm"
                defaultValue={reviewCase.status === 'escalated' ? 'escalated' : 'in_review'}
                name="status"
              >
                <option value="in_review">Mark in review</option>
                <option value="escalated">Escalate</option>
              </select>
              <input
                className="h-9 rounded-[var(--mobiris-radius-button)] border border-slate-200 px-3 text-sm"
                name="notes"
                placeholder="Optional note"
              />
              <Button disabled={statusPending} type="submit" variant="secondary">
                Update
              </Button>
            </form>
            <form action={resolveAction} className="flex flex-wrap items-center gap-2">
              <input name="id" type="hidden" value={reviewCase.id} />
              <select
                className="h-9 rounded-[var(--mobiris-radius-button)] border border-slate-200 px-3 text-sm"
                defaultValue="separate"
                name="resolution"
              >
                <option value="merge">Merge</option>
                <option value="separate">Separate</option>
                <option value="fraud_confirmed">Fraud confirmed</option>
                <option value="dismissed">Dismiss</option>
              </select>
              <input
                className="h-9 rounded-[var(--mobiris-radius-button)] border border-slate-200 px-3 text-sm"
                name="notes"
                placeholder="Resolution note"
              />
              <Button disabled={resolvePending} type="submit">
                Resolve
              </Button>
            </form>
          </>
        ) : (
          <Text tone="muted">Resolved</Text>
        )}
        {statusState.error ? <Text className="text-rose-700">{statusState.error}</Text> : null}
        {resolveState.error ? <Text className="text-rose-700">{resolveState.error}</Text> : null}
      </TableCell>
    </TableRow>
  );
}

export function ReviewCasesPanel({ reviewCases }: { reviewCases: ReviewCaseRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual identity review queue</CardTitle>
      </CardHeader>
      <CardContent>
        <TableViewport>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewCases.map((reviewCase) => (
                <ReviewCaseRow key={reviewCase.id} reviewCase={reviewCase} />
              ))}
            </TableBody>
          </Table>
        </TableViewport>
        {reviewCases.length === 0 ? (
          <Text className="pt-4">No review cases are currently open.</Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
