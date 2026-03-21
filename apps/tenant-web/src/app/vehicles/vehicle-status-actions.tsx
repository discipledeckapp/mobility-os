'use client';

import { Button, Text } from '@mobility-os/ui';
import { useActionState, useMemo, useState } from 'react';
import type { VehicleRecord } from '../../lib/api-core';
import { type UpdateVehicleStatusActionState, updateVehicleStatusAction } from './actions';

const initialState: UpdateVehicleStatusActionState = {};

function getVehicleActions(
  status: string,
): Array<{ label: string; nextStatus: string; confirm?: boolean }> {
  switch (status) {
    case 'available':
      return [
        { label: 'Send to Maintenance', nextStatus: 'maintenance' },
        { label: 'Retire', nextStatus: 'retired', confirm: true },
      ];
    case 'maintenance':
      return [{ label: 'Return to Service', nextStatus: 'available' }];
    default:
      return [];
  }
}

export function VehicleStatusActions({
  vehicle,
}: {
  vehicle: VehicleRecord;
}) {
  const [state, formAction, isPending] = useActionState(updateVehicleStatusAction, initialState);
  const [confirmingStatus, setConfirmingStatus] = useState<string | null>(null);
  const actions = useMemo(() => getVehicleActions(vehicle.status), [vehicle.status]);

  if (actions.length === 0) {
    return (
      <Text tone="muted">
        {vehicle.status === 'assigned' ? 'No actions while assigned' : 'No actions'}
      </Text>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const isConfirming = confirmingStatus === action.nextStatus;

          if (action.confirm && isConfirming) {
            return (
              <div className="flex flex-wrap items-center gap-2" key={action.nextStatus}>
                <Text tone="muted">Confirm {action.label.toLowerCase()}?</Text>
                <form action={formAction}>
                  <input name="vehicleId" type="hidden" value={vehicle.id} />
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
              <input name="vehicleId" type="hidden" value={vehicle.id} />
              <input name="status" type="hidden" value={action.nextStatus} />
              <Button disabled={isPending} size="sm" type="submit" variant="ghost">
                {action.label}
              </Button>
            </form>
          );
        })}
      </div>

      {state.error ? <Text tone="danger">{state.error}</Text> : null}
      {state.success ? <Text tone="success">{state.success}</Text> : null}
    </div>
  );
}
