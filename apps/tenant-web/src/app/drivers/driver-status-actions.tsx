'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { Button, Text } from '@mobility-os/ui';
import type { DriverRecord } from '../../lib/api-core';
import {
  removeDriverAction,
  type RemoveDriverActionState,
  updateDriverStatusAction,
  type UpdateDriverStatusActionState,
} from './actions';

const initialState: UpdateDriverStatusActionState = {};
const initialRemoveState: RemoveDriverActionState = {};

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
      return [
        activationAction,
        {
          label: 'Remove',
          nextStatus: 'archive',
          confirm: true,
          consequence:
            'This removes the driver from your active roster. Historical records, if any, are preserved.',
        },
      ];
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
        {
          label: 'Remove',
          nextStatus: 'archive',
          confirm: true,
          consequence:
            'This removes the driver from your active roster. Historical records, if any, are preserved.',
        },
      ];
    case 'terminated':
      return [
        {
          label: 'Remove',
          nextStatus: 'archive',
          confirm: true,
          consequence:
            'This removes the driver from your active roster. Historical records, if any, are preserved.',
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
  const [removeState, removeFormAction, isRemoving] = useActionState(
    removeDriverAction,
    initialRemoveState,
  );
  const [confirmingStatus, setConfirmingStatus] = useState<string | null>(null);
  const [removeReason, setRemoveReason] = useState('');
  const actions = useMemo(() => getDriverActions(driver), [driver]);

  useEffect(() => {
    if (state.success || removeState.success) {
      router.refresh();
    }
  }, [removeState.success, router, state.success]);

  if (actions.length === 0) {
    return <Text tone="muted">No actions</Text>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const isConfirming = confirmingStatus === action.nextStatus;

          if (action.confirm && isConfirming) {
            if (action.nextStatus === 'archive') {
              return (
                <div className="flex flex-col gap-2" key={action.nextStatus}>
                  <div className="space-y-0.5">
                    <Text tone="muted">Confirm remove driver?</Text>
                    {action.consequence ? <Text tone="danger">{action.consequence}</Text> : null}
                  </div>
                  <form action={removeFormAction} className="flex flex-col gap-2">
                    <input name="driverId" type="hidden" value={driver.id} />
                    <input name="reason" type="hidden" value={removeReason} />
                    <textarea
                      className="min-h-[80px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      onChange={(event) => setRemoveReason(event.target.value)}
                      placeholder="Optional reason for removing this driver"
                      value={removeReason}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button disabled={isRemoving} size="sm" type="submit">
                        {isRemoving ? 'Removing...' : 'Remove driver'}
                      </Button>
                      <Button
                        disabled={isRemoving}
                        onClick={() => setConfirmingStatus(null)}
                        size="sm"
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              );
            }

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
      {removeState.error ? <Text tone="danger">{removeState.error}</Text> : null}
      {removeState.success ? <Text tone="success">{removeState.success}</Text> : null}
    </div>
  );
}
