'use client';

import { useActionState, useMemo } from 'react';
import { Button, Input, Label, Text } from '@mobility-os/ui';
import type { TenantInspectionRecord, VehicleRecord } from '../../lib/api-core';
import {
  createInspectionAction,
  type InspectionWorkbenchActionState,
} from './actions';

const initialState: InspectionWorkbenchActionState = {};

function Message({ state }: { state: InspectionWorkbenchActionState }) {
  if (state.error) {
    return <Text tone="danger">{state.error}</Text>;
  }

  if (state.success) {
    return <Text tone="success">{state.success}</Text>;
  }

  return null;
}

function getVehicleLabel(vehicle: VehicleRecord) {
  return `${vehicle.tenantVehicleCode || vehicle.systemVehicleCode} · ${vehicle.make} ${vehicle.model}`;
}

export function InspectionWorkbench({
  inspections,
  vehicles,
}: {
  inspections: TenantInspectionRecord[];
  vehicles: VehicleRecord[];
}) {
  const [state, action, pending] = useActionState(createInspectionAction, initialState);
  const vehicleOptions = useMemo(
    () =>
      [...vehicles].sort((left, right) =>
        getVehicleLabel(left).localeCompare(getVehicleLabel(right)),
      ),
    [vehicles],
  );
  const inspectionHoldVehicleIds = new Set(
    inspections
      .filter((inspection) => ['submitted', 'under_review', 'escalated'].includes(inspection.status))
      .map((inspection) => inspection.vehicleId),
  );
  const defaultVehicleId =
    vehicleOptions.find((vehicle) => inspectionHoldVehicleIds.has(vehicle.id))?.id ??
    vehicleOptions[0]?.id ??
    '';

  return (
    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4">
      <div className="space-y-1">
        <Text tone="strong">Capture inspection directly</Text>
        <Text tone="muted">
          Log a fresh inspection without leaving this workspace, especially when a vehicle is still on an inspection hold and your team needs to update the latest outcome quickly.
        </Text>
      </div>
      <form action={action} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="vehicleId">Vehicle</Label>
          <select
            className="h-11 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 text-sm"
            defaultValue={defaultVehicleId}
            id="vehicleId"
            name="vehicleId"
          >
            {vehicleOptions.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {getVehicleLabel(vehicle)}
                {inspectionHoldVehicleIds.has(vehicle.id) ? ' · inspection hold' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inspectionType">Inspection type</Label>
          <select
            className="h-11 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 text-sm"
            defaultValue="routine"
            id="inspectionType"
            name="inspectionType"
          >
            <option value="routine">Routine</option>
            <option value="handover">Handover</option>
            <option value="return_to_service">Return to service</option>
            <option value="incident_follow_up">Incident follow-up</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Outcome</Label>
          <select
            className="h-11 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 text-sm"
            defaultValue="submitted"
            id="status"
            name="status"
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inspectionDate">Inspection date</Label>
          <Input id="inspectionDate" name="inspectionDate" type="datetime-local" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="odometerKm">Odometer (km)</Label>
          <Input id="odometerKm" min="0" name="odometerKm" step="1" type="number" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary">Summary</Label>
          <textarea
            className="min-h-24 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm outline-none"
            id="summary"
            name="summary"
            placeholder="Summarise what was checked, what passed, and what still needs attention."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issuesFoundCount">Issues found</Label>
          <Input id="issuesFoundCount" min="0" name="issuesFoundCount" step="1" type="number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextInspectionDueAt">Next inspection due</Label>
          <Input id="nextInspectionDueAt" name="nextInspectionDueAt" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reportSource">Report source</Label>
          <Input defaultValue="inspection_workbench" id="reportSource" name="reportSource" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reportUrl">External report link</Label>
          <Input id="reportUrl" name="reportUrl" placeholder="https://..." />
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <Button disabled={pending || vehicleOptions.length === 0} type="submit">
            {pending ? 'Saving...' : 'Save inspection'}
          </Button>
          <Message state={state} />
        </div>
      </form>
    </div>
  );
}
