'use client';

import { useActionState, useRef } from 'react';
import { Text } from '@mobility-os/ui';
import {
  acceptAssignmentTermsAction,
  cancelAssignmentAction,
  completeAssignmentAction,
  declineAssignmentAction,
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
  const [acceptState, acceptFormAction, isAccepting] = useActionState(
    acceptAssignmentTermsAction,
    initialState,
  );
  const [completeState, completeFormAction, isCompleting] = useActionState(
    completeAssignmentAction,
    initialState,
  );
  const [declineState, declineFormAction, isDeclining] = useActionState(
    declineAssignmentAction,
    initialState,
  );
  const [cancelState, cancelFormAction, isCancelling] = useActionState(
    cancelAssignmentAction,
    initialState,
  );
  const startFormRef = useRef<HTMLFormElement | null>(null);
  const acceptFormRef = useRef<HTMLFormElement | null>(null);
  const completeFormRef = useRef<HTMLFormElement | null>(null);
  const declineFormRef = useRef<HTMLFormElement | null>(null);
  const cancelFormRef = useRef<HTMLFormElement | null>(null);

  if (!['created', 'pending_driver_confirmation', 'active'].includes(status)) {
    return <Text tone="muted">No actions</Text>;
  }

  const feedback =
    startState.error ??
    acceptState.error ??
    completeState.error ??
    declineState.error ??
    cancelState.error ??
    startState.success ??
    acceptState.success ??
    completeState.success ??
    declineState.success ??
    cancelState.success;
  const feedbackTone =
    startState.error || acceptState.error || completeState.error || declineState.error || cancelState.error
      ? 'danger'
      : feedback
        ? 'success'
        : 'muted';
  const isBusy = isStarting || isAccepting || isCompleting || isDeclining || isCancelling;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {status === 'pending_driver_confirmation' ? (
          <form action={acceptFormAction} ref={acceptFormRef}>
            <input name="assignmentId" type="hidden" value={assignmentId} />
            <ConfirmSubmitButton
              confirmDescription="This records the driver's acknowledgement and moves the assignment into active duty."
              confirmTitle="Confirm assignment acceptance?"
              disabled={isBusy}
              formRef={acceptFormRef}
              label={isAccepting ? 'Accepting...' : 'Accept'}
            />
          </form>
        ) : null}

        {status !== 'active' ? (
          <form
            action={startFormAction}
            ref={startFormRef}
          >
            <input name="assignmentId" type="hidden" value={assignmentId} />
            <ConfirmSubmitButton
              confirmDescription="This validates that the assignment is already acknowledged and active."
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
              confirmDescription="This marks the vehicle as returned and stops future remittance expectation."
              confirmTitle="End this assignment?"
              disabled={isBusy}
              formRef={completeFormRef}
              label={isCompleting ? 'Ending...' : 'End'}
            />
          </form>
        ) : null}

        {status === 'pending_driver_confirmation' ? (
          <form action={declineFormAction} ref={declineFormRef}>
            <input name="assignmentId" type="hidden" value={assignmentId} />
            <ConfirmSubmitButton
              confirmDescription="This records that the driver did not accept the assignment."
              confirmTitle="Decline this assignment?"
              disabled={isBusy}
              formRef={declineFormRef}
              label={isDeclining ? 'Declining...' : 'Decline'}
              variant="ghost"
            />
          </form>
        ) : (
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
        )}
      </div>

      {feedback ? <Text tone={feedbackTone}>{feedback}</Text> : null}
    </div>
  );
}
