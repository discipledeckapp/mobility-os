'use client';

import { useActionState, useRef } from 'react';
import { Input, Text } from '@mobility-os/ui';
import {
  confirmRemittanceAction,
  disputeRemittanceAction,
  waiveRemittanceAction,
  type RemittanceResolutionActionState,
} from './actions';
import { ConfirmSubmitButton } from '../../features/shared/confirm-submit-button';

const initialState: RemittanceResolutionActionState = {};

export function RemittanceRowActions({
  remittanceId,
  status,
}: {
  remittanceId: string;
  status: string;
}) {
  const [confirmState, confirmFormAction, isConfirming] = useActionState(
    confirmRemittanceAction,
    initialState,
  );
  const [disputeState, disputeFormAction, isDisputing] = useActionState(
    disputeRemittanceAction,
    initialState,
  );
  const [waiveState, waiveFormAction, isWaiving] = useActionState(
    waiveRemittanceAction,
    initialState,
  );
  const confirmFormRef = useRef<HTMLFormElement | null>(null);
  const disputeFormRef = useRef<HTMLFormElement | null>(null);
  const waiveFormRef = useRef<HTMLFormElement | null>(null);

  if (status !== 'pending') {
    return <Text tone="muted">No actions</Text>;
  }

  const isBusy = isConfirming || isDisputing || isWaiving;
  const feedback =
    confirmState.error ??
    disputeState.error ??
    waiveState.error ??
    confirmState.success ??
    disputeState.success ??
    waiveState.success;
  const feedbackTone =
    confirmState.error || disputeState.error || waiveState.error
      ? 'muted'
      : 'default';

  return (
    <div className="space-y-3">
      <form action={confirmFormAction} className="space-y-2" ref={confirmFormRef}>
        <input name="confirmIntent" type="hidden" value="confirm" />
        <input name="remittanceId" type="hidden" value={remittanceId} />
        <Input name="paidDate" type="date" />
        <ConfirmSubmitButton
          confirmDescription="This will mark the remittance as reconciled for the selected payment date."
          confirmTitle="Confirm this remittance?"
          disabled={isBusy}
          formRef={confirmFormRef}
          label={isConfirming ? 'Confirming...' : 'Confirm'}
        />
      </form>

      <form action={disputeFormAction} className="space-y-2" ref={disputeFormRef}>
        <input name="remittanceId" type="hidden" value={remittanceId} />
        <Input name="notes" placeholder="Dispute reason" />
        <ConfirmSubmitButton
          confirmDescription="The driver and finance team will see this remittance as disputed until it is resolved."
          confirmTitle="Submit this remittance dispute?"
          disabled={isBusy}
          formRef={disputeFormRef}
          label={isDisputing ? 'Submitting...' : 'Dispute'}
          variant="ghost"
        />
      </form>

      <form action={waiveFormAction} className="space-y-2" ref={waiveFormRef}>
        <input name="remittanceId" type="hidden" value={remittanceId} />
        <Input name="notes" placeholder="Waiver reason" />
        <ConfirmSubmitButton
          confirmDescription="Waiving this remittance will remove it from the collection expectation."
          confirmTitle="Waive this remittance?"
          disabled={isBusy}
          formRef={waiveFormRef}
          label={isWaiving ? 'Submitting...' : 'Waive'}
          variant="ghost"
        />
      </form>

      {feedback ? <Text tone={feedbackTone}>{feedback}</Text> : null}
    </div>
  );
}
