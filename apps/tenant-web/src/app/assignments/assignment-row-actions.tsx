'use client';

import { useActionState, useRef } from 'react';
import Link from 'next/link';
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

  if (!['created', 'pending_driver_confirmation', 'driver_action_required', 'accepted', 'active'].includes(status)) {
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
      <div className="flex flex-wrap gap-2">
        {status === 'accepted' ? (
          <form
            action={startFormAction}
            ref={startFormRef}
          >
            <input name="assignmentId" type="hidden" value={assignmentId} />
            <ConfirmSubmitButton
              confirmDescription="This moves the accepted assignment into active duty."
              confirmTitle="Begin this assignment?"
              disabled={isBusy}
              formRef={startFormRef}
              label={isStarting ? 'Beginning...' : 'Begin'}
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

        {status !== 'ended' && status !== 'cancelled' && status !== 'declined' ? (
          <form action={cancelFormAction} ref={cancelFormRef}>
            <input name="assignmentId" type="hidden" value={assignmentId} />
            <ConfirmSubmitButton
              confirmDescription="Cancel assignment"
              confirmTitle="Are you sure you want to cancel this assignment?"
              confirmLabel={isCancelling ? 'Cancelling...' : 'Cancel assignment'}
              confirmClassName="border border-rose-700 bg-rose-600 text-white shadow-[0_16px_32px_-18px_rgba(190,24,93,0.65)] hover:bg-rose-700 focus-visible:ring-rose-600"
              dismissLabel="Keep assignment"
              disabled={isBusy}
              formRef={cancelFormRef}
              label={isCancelling ? 'Cancelling...' : 'Cancel'}
              variant="secondary"
            >
              <div className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                  Cancelling this assignment will immediately remove the driver from it and return
                  the vehicle to the available pool.
                </p>
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-4">
                  <Text tone="danger">This will happen next:</Text>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                    <li>The driver will be unassigned from this vehicle.</li>
                    <li>The assignment will stop and be marked as cancelled.</li>
                    <li>The vehicle will become available for reassignment.</li>
                  </ul>
                </div>
              </div>
            </ConfirmSubmitButton>
          </form>
        ) : null}

        <Link
          className="inline-flex items-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          href="/assignments/new"
        >
          Reassign driver
        </Link>
      </div>

      {feedback ? <Text tone={feedbackTone}>{feedback}</Text> : null}
    </div>
  );
}
