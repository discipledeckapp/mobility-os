'use client';

import { useActionState, useMemo, useState } from 'react';
import { Button, Text } from '@mobility-os/ui';
import type { DriverRecord } from '../../lib/api-core';
import {
  updateDriverStatusAction,
  type UpdateDriverStatusActionState,
} from './actions';

const initialState: UpdateDriverStatusActionState = {};

function getDriverActions(
  status: string,
): Array<{ label: string; nextStatus: string; confirm?: boolean; consequence?: string }> {
  switch (status) {
    case 'inactive':
      return [{ label: 'Activate', nextStatus: 'active' }];
    case 'active':
      return [
        {
          label: 'Suspend',
          nextStatus: 'suspended',
          confirm: true,
          consequence: 'Suspending will block all new assignments for this driver.',
        },
        {
          label: 'Terminate',
          nextStatus: 'terminated',
          confirm: true,
          consequence: 'Terminating is permanent. Active assignments will be ended.',
        },
      ];
    case 'suspended':
      return [
        { label: 'Reactivate', nextStatus: 'active' },
        {
          label: 'Terminate',
          nextStatus: 'terminated',
          confirm: true,
          consequence: 'Terminating is permanent. Active assignments will be ended.',
        },
      ];
    default:
      return [];
  }
}

export function DriverStatusActions({
  driver,
}: {
  driver: DriverRecord;
}) {
  const [state, formAction, isPending] = useActionState(
    updateDriverStatusAction,
    initialState,
  );
  const [confirmingStatus, setConfirmingStatus] = useState<string | null>(null);
  const actions = useMemo(() => getDriverActions(driver.status), [driver.status]);

  if (actions.length === 0) {
    return <Text tone="muted">No actions</Text>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const isConfirming = confirmingStatus === action.nextStatus;

          if (action.confirm && isConfirming) {
            return (
              <div className="flex flex-wrap items-center gap-2" key={action.nextStatus}>
                <div className="space-y-0.5">
                  <Text tone="muted">Confirm {action.label.toLowerCase()}?</Text>
                  {action.consequence ? (
                    <Text tone="danger">{action.consequence}</Text>
                  ) : null}
                </div>
                <form action={formAction}>
                  <input name="driverId" type="hidden" value={driver.id} />
                  <input name="status" type="hidden" value={action.nextStatus} />
                  <Button disabled={isPending} size="sm" type="submit">
                    {isPending ? 'Saving...' : action.label}
                  </Button>
                </form>
                <Button
                  disabled={isPending}
                  onClick={() => setConfirmingStatus(null)}
                  size="sm"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            );
          }

          if (action.confirm) {
            return (
              <Button
                key={action.nextStatus}
                onClick={() => setConfirmingStatus(action.nextStatus)}
                size="sm"
                variant="ghost"
              >
                {action.label}
              </Button>
            );
          }

          return (
            <form action={formAction} key={action.nextStatus}>
              <input name="driverId" type="hidden" value={driver.id} />
              <input name="status" type="hidden" value={action.nextStatus} />
              <Button disabled={isPending} size="sm" type="submit" variant="ghost">
                {action.label}
              </Button>
            </form>
          );
        })}
      </div>

      {state.error ? <Text>{state.error}</Text> : null}
      {state.success ? <Text tone="muted">{state.success}</Text> : null}
    </div>
  );
}
