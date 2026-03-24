'use client';

import { Button, Text } from '@mobility-os/ui';
import { useActionState, useMemo, useState } from 'react';
import type { VehicleRecord } from '../../lib/api-core';
import { type UpdateVehicleStatusActionState, updateVehicleStatusAction } from './actions';
import { Modal } from '../../features/shared/modal';

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
  const [selectedAction, setSelectedAction] = useState<{
    label: string;
    nextStatus: string;
  } | null>(null);
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
          return (
            <Button
              disabled={isPending}
              key={action.nextStatus}
              onClick={() => setSelectedAction({ label: action.label, nextStatus: action.nextStatus })}
              size="sm"
              variant="ghost"
            >
              {action.label}
            </Button>
          );
        })}
      </div>

      <Modal
        description={
          selectedAction
            ? `This will update ${vehicle.plate || vehicle.tenantVehicleCode || vehicle.systemVehicleCode} to ${selectedAction.nextStatus}.`
            : ''
        }
        footer={
          selectedAction ? (
            <>
              <Button onClick={() => setSelectedAction(null)} size="sm" variant="ghost">
                Cancel
              </Button>
              <form action={formAction}>
                <input name="vehicleId" type="hidden" value={vehicle.id} />
                <input name="status" type="hidden" value={selectedAction.nextStatus} />
                <Button disabled={isPending} size="sm" type="submit">
                  {isPending ? 'Saving...' : selectedAction.label}
                </Button>
              </form>
            </>
          ) : null
        }
        onClose={() => setSelectedAction(null)}
        open={Boolean(selectedAction)}
        title={selectedAction ? `${selectedAction.label}?` : 'Confirm action'}
      >
        <p className="text-sm leading-6 text-slate-600">
          {selectedAction
            ? `Confirm this status change for ${vehicle.make} ${vehicle.model}.`
            : ''}
        </p>
      </Modal>

      {state.error ? <Text tone="danger">{state.error}</Text> : null}
      {state.success ? <Text tone="success">{state.success}</Text> : null}
    </div>
  );
}
