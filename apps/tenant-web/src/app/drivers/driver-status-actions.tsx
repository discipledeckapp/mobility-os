'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { Button, Text } from '@mobility-os/ui';
import type { DriverRecord } from '../../lib/api-core';
import {
  updateDriverStatusAction,
  type UpdateDriverStatusActionState,
} from './actions';

const initialState: UpdateDriverStatusActionState = {};

function getDriverActions(
  driver: DriverRecord,
): Array<{
  label: string;
  nextStatus: string;
  confirm?: boolean;
  consequence?: string;
  disabled?: boolean;
  blockedReason?: string;
}> {
  const activationBlocked =
    driver.status !== 'active' && driver.activationReadiness !== 'ready';
  const activationBlockedReason = activationBlocked
    ? driver.activationReadinessReasons[0] ??
      'This driver is not ready for activation yet.'
    : undefined;
  const activationAction =
    activationBlockedReason
      ? {
          label: driver.status === 'suspended' ? 'Reactivate' : 'Activate',
          nextStatus: 'active',
          disabled: activationBlocked,
          blockedReason: activationBlockedReason,
        }
      : {
          label: driver.status === 'suspended' ? 'Reactivate' : 'Activate',
          nextStatus: 'active',
          disabled: activationBlocked,
        };

  switch (driver.status) {
    case 'inactive':
      return [activationAction];
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
        activationAction,
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
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateDriverStatusAction,
    initialState,
  );
  const [confirmingStatus, setConfirmingStatus] = useState<string | null>(null);
  const actions = useMemo(() => getDriverActions(driver), [driver]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

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
              <Button
                disabled={isPending || action.disabled}
                size="sm"
                title={action.blockedReason}
                type="submit"
                variant="ghost"
              >
                {action.label}
              </Button>
            </form>
          );
        })}
      </div>

      {actions.some((action) => action.disabled && action.blockedReason) ? (
        <Text tone="muted">
          {actions.find((action) => action.disabled && action.blockedReason)?.blockedReason}
        </Text>
      ) : null}

      {state.error ? <Text tone="danger">{state.error}</Text> : null}
      {state.success ? <Text tone="success">{state.success}</Text> : null}
    </div>
  );
}
