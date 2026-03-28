'use client';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { useActionState } from 'react';
import {
  type ReviewDriverLicenceVerificationActionState,
  reviewDriverLicenceVerificationAction,
} from './actions';

const initialState: ReviewDriverLicenceVerificationActionState = {};

export function DriverLicenceReviewPanel({
  driverId,
  currentDecision,
}: {
  driverId: string;
  currentDecision?: 'approved' | 'rejected' | 'request_reverification' | null;
}) {
  const [state, formAction, isPending] = useActionState(
    reviewDriverLicenceVerificationAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviewer action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentDecision ? (
          <Badge tone={currentDecision === 'approved' ? 'success' : 'warning'}>
            Existing decision: {currentDecision.replace(/_/g, ' ')}
          </Badge>
        ) : null}
        {state.error ? <Text tone="danger">{state.error}</Text> : null}
        {state.success ? <Text tone="success">{state.success}</Text> : null}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="driverId" value={driverId} />
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="licence-review-notes"
            >
              Reviewer note
            </label>
            <textarea
              id="licence-review-notes"
              name="notes"
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Record the evidence or reason for your decision."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button disabled={isPending} name="decision" value="approved" type="submit">
              {isPending ? 'Saving…' : 'Approve licence'}
            </Button>
            <Button
              disabled={isPending}
              name="decision"
              value="rejected"
              type="submit"
              variant="secondary"
            >
              {isPending ? 'Saving…' : 'Reject licence'}
            </Button>
            <Button
              disabled={isPending}
              name="decision"
              value="request_reverification"
              type="submit"
              variant="ghost"
            >
              {isPending ? 'Saving…' : 'Request re-verification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
