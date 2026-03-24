'use client';

import { useActionState, useRef } from 'react';
import { Text } from '@mobility-os/ui';
import {
  cancelAssignmentAction,
  completeAssignmentAction,
  startAssignmentAction,
  type AssignmentResolutionActionState,
} from './actions';
import { ConfirmSubmitButton } from '../../features/shared/confirm-submit-button';

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
  const startFormRef = useRef<HTMLFormElement | null>(null);
  const completeFormRef = useRef<HTMLFormElement | null>(null);
  const cancelFormRef = useRef<HTMLFormElement | null>(null);

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
          <form
            action={startFormAction}
            ref={startFormRef}
          >
            <input name="assignmentId" type="hidden" value={assignmentId} />
            <ConfirmSubmitButton
              confirmDescription="This will move the assignment into an active operational state."
              confirmTitle="Start this assignment?"
              disabled={isBusy}
              formRef={startFormRef}
              label={isStarting ? 'Starting...' : 'Start'}
            />
          </form>
        ) : null}

        {status === 'active' ? (
          <form action={completeFormAction} ref={completeFormRef}>
            <input name="assignmentId" type="hidden" value={assignmentId} />
            <ConfirmSubmitButton
              confirmDescription="This will stop future operational activity and close the assignment."
              confirmTitle="Complete this assignment?"
              disabled={isBusy}
              formRef={completeFormRef}
              label={isCompleting ? 'Completing...' : 'Complete'}
            />
          </form>
        ) : null}

        <form action={cancelFormAction} ref={cancelFormRef}>
          <input name="assignmentId" type="hidden" value={assignmentId} />
          <ConfirmSubmitButton
            confirmDescription="Cancellation removes this assignment from the operational pipeline."
            confirmTitle="Cancel this assignment?"
            disabled={isBusy}
            formRef={cancelFormRef}
            label={isCancelling ? 'Cancelling...' : 'Cancel'}
            variant="ghost"
          />
        </form>
      </div>

      {feedback ? <Text tone={feedbackTone}>{feedback}</Text> : null}
    </div>
  );
}
