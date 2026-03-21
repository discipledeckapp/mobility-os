'use client';

import { useActionState } from 'react';
import { Button, Text } from '@mobility-os/ui';
import {
  cancelAssignmentAction,
  completeAssignmentAction,
  startAssignmentAction,
  type AssignmentResolutionActionState,
} from './actions';

const initialState: AssignmentResolutionActionState = {};

export function AssignmentRowActions({
  assignmentId,
  status,
}: {
  assignmentId: string;
  status: string;
}) {
  const [startState, startFormAction, isStarting] = useActionState(
    startAssignmentAction,
    initialState,
  );
  const [completeState, completeFormAction, isCompleting] = useActionState(
    completeAssignmentAction,
    initialState,
  );
  const [cancelState, cancelFormAction, isCancelling] = useActionState(
    cancelAssignmentAction,
    initialState,
  );

  if (!['created', 'assigned', 'active'].includes(status)) {
    return <Text tone="muted">No actions</Text>;
  }

  const feedback =
    startState.error ??
    completeState.error ??
    cancelState.error ??
    startState.success ??
    completeState.success ??
    cancelState.success;
  const feedbackTone =
    startState.error || completeState.error || cancelState.error
      ? 'danger'
      : feedback
        ? 'success'
        : 'muted';
  const isBusy = isStarting || isCompleting || isCancelling;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {status !== 'active' ? (
          <form action={startFormAction}>
            <input name="assignmentId" type="hidden" value={assignmentId} />
            <Button disabled={isBusy} size="sm" variant="secondary">
              {isStarting ? 'Starting...' : 'Start'}
            </Button>
          </form>
        ) : null}

        {status === 'active' ? (
        <form action={completeFormAction}>
          <input name="assignmentId" type="hidden" value={assignmentId} />
          <Button disabled={isBusy} size="sm" variant="secondary">
            {isCompleting ? 'Completing...' : 'Complete'}
          </Button>
        </form>
        ) : null}

        <form action={cancelFormAction}>
          <input name="assignmentId" type="hidden" value={assignmentId} />
          <Button disabled={isBusy} size="sm" variant="ghost">
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </Button>
        </form>
      </div>

      {feedback ? <Text tone={feedbackTone}>{feedback}</Text> : null}
    </div>
  );
}
