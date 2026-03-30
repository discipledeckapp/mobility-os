'use client';

import { useActionState, useState } from 'react';
import { Button, Input, Label, Text } from '@mobility-os/ui';
import type { VehicleRecord, WorkOrderRecord } from '../../lib/api-core';
import {
  createWorkOrderAction,
  type MaintenanceWorkbenchActionState,
  updateWorkOrderAction,
} from './actions';

const initialState: MaintenanceWorkbenchActionState = {};

function Message({ state }: { state: MaintenanceWorkbenchActionState }) {
  if (state.error) {
    return <Text tone="danger">{state.error}</Text>;
  }

  if (state.success) {
    return <Text tone="success">{state.success}</Text>;
  }

  return null;
}

export function MaintenanceWorkbench({
  vehicles,
  workOrders,
}: {
  vehicles: VehicleRecord[];
  workOrders: WorkOrderRecord[];
}) {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(workOrders[0]?.id ?? '');
  const selectedWorkOrder = workOrders.find((item) => item.id === selectedWorkOrderId) ?? null;
  const [createState, createAction, createPending] = useActionState(createWorkOrderAction, initialState);
  const [updateState, updateAction, updatePending] = useActionState(updateWorkOrderAction, initialState);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4">
        <div className="space-y-1">
          <Text tone="strong">Create work order</Text>
          <Text tone="muted">
            Create a repair job directly from the maintenance command center when a vehicle needs service.
          </Text>
        </div>
        <form action={createAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="vehicleId">Vehicle</Label>
            <select
              className="h-11 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 text-sm"
              defaultValue={vehicles[0]?.id ?? ''}
              id="vehicleId"
              name="vehicleId"
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.tenantVehicleCode || vehicle.systemVehicleCode} · {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="issueDescription">Issue description</Label>
            <textarea
              className="min-h-24 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm outline-none"
              id="issueDescription"
              name="issueDescription"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              className="h-11 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 text-sm"
              defaultValue="HIGH"
              id="priority"
              name="priority"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor</Label>
            <Input id="vendorName" name="vendorName" placeholder="Optional vendor name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partsCost">Parts cost</Label>
            <Input id="partsCost" name="partsCost" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="labourCost">Labour cost</Label>
            <Input id="labourCost" name="labourCost" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input defaultValue="NGN" id="currency" name="currency" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              className="min-h-20 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm outline-none"
              id="notes"
              name="notes"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button disabled={createPending || vehicles.length === 0} type="submit">
              {createPending ? 'Creating...' : 'Create work order'}
            </Button>
            <Message state={createState} />
          </div>
        </form>
      </div>

      <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4">
        <div className="space-y-1">
          <Text tone="strong">Progress work order</Text>
          <Text tone="muted">
            Move a repair job forward, capture cost updates, and close it from the same maintenance workspace.
          </Text>
        </div>
        {workOrders.length > 0 ? (
          <form action={updateAction} className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="workOrderId">Work order</Label>
              <select
                className="h-11 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 text-sm"
                id="workOrderId"
                name="workOrderId"
                onChange={(event) => setSelectedWorkOrderId(event.target.value)}
                value={selectedWorkOrderId}
              >
                {workOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.issueDescription.slice(0, 60)} · {order.status}
                  </option>
                ))}
              </select>
              <input name="vehicleId" type="hidden" value={selectedWorkOrder?.vehicleId ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                className="h-11 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 text-sm"
                defaultValue={selectedWorkOrder?.status ?? 'pending'}
                id="status"
                key={`status-${selectedWorkOrderId}`}
                name="status"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priorityUpdate">Priority</Label>
              <select
                className="h-11 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 text-sm"
                defaultValue={selectedWorkOrder?.priority ?? 'MEDIUM'}
                id="priorityUpdate"
                key={`priority-${selectedWorkOrderId}`}
                name="priority"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="issueDescriptionUpdate">Issue description</Label>
              <textarea
                className="min-h-20 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm outline-none"
                defaultValue={selectedWorkOrder?.issueDescription ?? ''}
                id="issueDescriptionUpdate"
                key={`issue-${selectedWorkOrderId}`}
                name="issueDescription"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partsCostUpdate">Parts cost</Label>
              <Input id="partsCostUpdate" name="partsCost" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labourCostUpdate">Labour cost</Label>
              <Input id="labourCostUpdate" name="labourCost" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currencyUpdate">Currency</Label>
              <Input defaultValue={selectedWorkOrder?.currency ?? 'NGN'} id="currencyUpdate" key={`currency-${selectedWorkOrderId}`} name="currency" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notesUpdate">Notes</Label>
              <textarea
                className="min-h-20 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm outline-none"
                id="notesUpdate"
                name="notes"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button disabled={updatePending || !selectedWorkOrder} type="submit">
                {updatePending ? 'Updating...' : 'Update work order'}
              </Button>
              <Message state={updateState} />
            </div>
          </form>
        ) : (
          <div className="mt-4 rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
            <Text tone="strong">No work orders yet</Text>
            <Text tone="muted">Create the first work order on this page to start tracking repair execution.</Text>
          </div>
        )}
      </div>
    </div>
  );
}
