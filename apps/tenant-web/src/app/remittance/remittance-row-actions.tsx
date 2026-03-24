'use client';

import { useActionState } from 'react';
import { Button, Input, Text } from '@mobility-os/ui';
import {
  confirmRemittanceAction,
  disputeRemittanceAction,
  waiveRemittanceAction,
  type RemittanceResolutionActionState,
} from './actions';

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
      <form action={confirmFormAction} className="space-y-2">
        <input name="confirmIntent" type="hidden" value="confirm" />
        <input name="remittanceId" type="hidden" value={remittanceId} />
        <Input name="paidDate" type="date" />
        <Button
          disabled={isBusy}
          onClick={(event) => {
            if (!window.confirm('Confirm this remittance?')) {
              event.preventDefault();
            }
          }}
          size="sm"
          variant="secondary"
        >
          {isConfirming ? 'Confirming...' : 'Confirm'}
        </Button>
      </form>

      <form action={disputeFormAction} className="space-y-2">
        <input name="remittanceId" type="hidden" value={remittanceId} />
        <Input name="notes" placeholder="Dispute reason" />
        <Button
          disabled={isBusy}
          onClick={(event) => {
            if (!window.confirm('Submit this remittance dispute?')) {
              event.preventDefault();
            }
          }}
          size="sm"
          variant="ghost"
        >
          {isDisputing ? 'Submitting...' : 'Dispute'}
        </Button>
      </form>

      <form action={waiveFormAction} className="space-y-2">
        <input name="remittanceId" type="hidden" value={remittanceId} />
        <Input name="notes" placeholder="Waiver reason" />
        <Button
          disabled={isBusy}
          onClick={(event) => {
            if (!window.confirm('Waive this remittance?')) {
              event.preventDefault();
            }
          }}
          size="sm"
          variant="ghost"
        >
          {isWaiving ? 'Submitting...' : 'Waive'}
        </Button>
      </form>

      {feedback ? <Text tone={feedbackTone}>{feedback}</Text> : null}
    </div>
  );
}
