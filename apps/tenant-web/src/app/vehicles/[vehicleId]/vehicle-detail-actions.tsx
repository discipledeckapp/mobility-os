'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Text,
} from '@mobility-os/ui';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import type { VehicleDetailRecord } from '../../../lib/api-core';
import {
  type VehicleLifecycleActionState,
  createVehicleIncidentAction,
  createVehicleInspectionAction,
  createVehicleMaintenanceEventAction,
  upsertVehicleMaintenanceScheduleAction,
} from '../actions';
import { VehicleStatusActions } from '../vehicle-status-actions';
import { EditVehicleForm } from './edit-vehicle-form';

const initialState: VehicleLifecycleActionState = {};

type ModalKey = 'edit' | 'inspection' | 'maintenance' | 'schedule' | 'incident' | null;

function LifecycleMessage({ state }: { state: VehicleLifecycleActionState }) {
  if (state.error) {
    return <Text tone="danger">{state.error}</Text>;
  }

  if (state.success) {
    return <Text tone="success">{state.success}</Text>;
  }

  return null;
}

function ModalShell({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[220] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white shadow-[0_36px_90px_-30px_rgba(15,23,42,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
          <Button onClick={onClose} size="sm" type="button" variant="ghost">
            Close
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function InspectionForm({
  action,
  pending,
  state,
  vehicleId,
}: {
  action: (formData: FormData) => void;
  pending: boolean;
  state: VehicleLifecycleActionState;
  vehicleId: string;
}) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="vehicleId" type="hidden" value={vehicleId} />
      <div className="space-y-2">
        <Label htmlFor="inspectionType">Inspection type</Label>
        <Input defaultValue="routine" id="inspectionType" name="inspectionType" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Outcome</Label>
        <Input defaultValue="passed" id="status" name="status" />
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
        <Input defaultValue="in_app" id="reportSource" name="reportSource" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reportUrl">External report link</Label>
        <Input id="reportUrl" name="reportUrl" placeholder="https://..." />
      </div>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button disabled={pending} type="submit">
          {pending ? 'Saving...' : 'Save inspection'}
        </Button>
        <LifecycleMessage state={state} />
      </div>
    </form>
  );
}

function MaintenanceScheduleForm({
  action,
  pending,
  state,
  vehicleId,
}: {
  action: (formData: FormData) => void;
  pending: boolean;
  state: VehicleLifecycleActionState;
  vehicleId: string;
}) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="vehicleId" type="hidden" value={vehicleId} />
      <div className="space-y-2">
        <Label htmlFor="name">Schedule label</Label>
        <Input defaultValue="preventive_service" id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input defaultValue="industry_default" id="source" name="source" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="intervalDays">Repeat every (days)</Label>
        <Input id="intervalDays" min="1" name="intervalDays" step="1" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="intervalKm">Repeat every (km)</Label>
        <Input id="intervalKm" min="1" name="intervalKm" step="1" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="firstDueAt">Next due date</Label>
        <Input id="firstDueAt" name="firstDueAt" type="date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="firstDueOdometerKm">Next due odometer (km)</Label>
        <Input id="firstDueOdometerKm" min="0" name="firstDueOdometerKm" step="1" type="number" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Schedule notes</Label>
        <textarea
          className="min-h-24 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm outline-none"
          id="notes"
          name="notes"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="isActive">Active</Label>
        <select
          className="h-11 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 text-sm"
          defaultValue="true"
          id="isActive"
          name="isActive"
        >
          <option value="true">Active</option>
          <option value="false">Paused</option>
        </select>
      </div>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button disabled={pending} type="submit">
          {pending ? 'Saving...' : 'Save maintenance schedule'}
        </Button>
        <LifecycleMessage state={state} />
      </div>
    </form>
  );
}

function MaintenanceEventForm({
  action,
  pending,
  state,
  vehicleId,
}: {
  action: (formData: FormData) => void;
  pending: boolean;
  state: VehicleLifecycleActionState;
  vehicleId: string;
}) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="vehicleId" type="hidden" value={vehicleId} />
      <div className="space-y-2">
        <Label htmlFor="maintenanceType">Maintenance type</Label>
        <Input defaultValue="preventive_service" id="maintenanceType" name="maintenanceType" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input defaultValue="Preventive service" id="title" name="title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Input defaultValue="scheduled" id="status" name="status" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startedAt">Scheduled / started at</Label>
        <Input id="startedAt" name="startedAt" type="datetime-local" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="completedAt">Completed at</Label>
        <Input id="completedAt" name="completedAt" type="datetime-local" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="odometerKm">Odometer (km)</Label>
        <Input id="odometerKm" min="0" name="odometerKm" step="1" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="providerName">Service provider</Label>
        <Input id="providerName" name="providerName" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cost">Cost</Label>
        <Input id="cost" min="0" name="cost" step="0.01" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Input defaultValue="NGN" id="currency" name="currency" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="summary">Summary</Label>
        <Input id="summary" name="summary" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          className="min-h-24 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm outline-none"
          id="notes"
          name="notes"
        />
      </div>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button disabled={pending} type="submit">
          {pending ? 'Saving...' : 'Save maintenance activity'}
        </Button>
        <LifecycleMessage state={state} />
      </div>
    </form>
  );
}

function IncidentForm({
  action,
  pending,
  state,
  vehicleId,
}: {
  action: (formData: FormData) => void;
  pending: boolean;
  state: VehicleLifecycleActionState;
  vehicleId: string;
}) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="vehicleId" type="hidden" value={vehicleId} />
      <div className="space-y-2">
        <Label htmlFor="title">Incident title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="occurredAt">Occurred at</Label>
        <Input id="occurredAt" name="occurredAt" type="datetime-local" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input defaultValue="collision" id="category" name="category" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="severity">Severity</Label>
        <Input defaultValue="moderate" id="severity" name="severity" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="driverId">Driver ID</Label>
        <Input id="driverId" name="driverId" placeholder="Optional linked driver" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="estimatedCost">Estimated cost</Label>
        <Input id="estimatedCost" min="0" name="estimatedCost" step="0.01" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Input defaultValue="NGN" id="currency" name="currency" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          className="min-h-24 w-full rounded-[var(--mobiris-radius-input)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm outline-none"
          id="description"
          name="description"
        />
      </div>
      <div className="md:col-span-2 flex items-center gap-3">
        <Button disabled={pending} type="submit">
          {pending ? 'Saving...' : 'Log incident'}
        </Button>
        <LifecycleMessage state={state} />
      </div>
    </form>
  );
}

export function VehicleDetailActions({
  vehicle,
}: {
  vehicle: VehicleDetailRecord;
}) {
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [inspectionState, inspectionAction, inspectionPending] = useActionState(
    createVehicleInspectionAction,
    initialState,
  );
  const [scheduleState, scheduleAction, schedulePending] = useActionState(
    upsertVehicleMaintenanceScheduleAction,
    initialState,
  );
  const [eventState, eventAction, eventPending] = useActionState(
    createVehicleMaintenanceEventAction,
    initialState,
  );
  const [incidentState, incidentAction, incidentPending] = useActionState(
    createVehicleIncidentAction,
    initialState,
  );

  return (
    <>
      <Card className="border-slate-200 bg-white/95 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.22)]">
        <CardHeader>
          <CardTitle>Next actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/assignments/new">
              <Button className="w-full justify-center" size="sm" variant="primary">
                Assign driver
              </Button>
            </Link>
            <Button
              className="w-full justify-center"
              onClick={() => setActiveModal('maintenance')}
              size="sm"
              type="button"
              variant="secondary"
            >
              Log maintenance
            </Button>
            <Button
              className="w-full justify-center"
              onClick={() => setActiveModal('inspection')}
              size="sm"
              type="button"
              variant="secondary"
            >
              Record inspection
            </Button>
            <Button
              className="w-full justify-center"
              onClick={() => setActiveModal('edit')}
              size="sm"
              type="button"
              variant="ghost"
            >
              Edit vehicle
            </Button>
          </div>

          <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/80 p-4">
            <Text tone="muted">Lifecycle status</Text>
            <div className="mt-2">
              <VehicleStatusActions vehicle={vehicle} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setActiveModal('schedule')} size="sm" type="button" variant="ghost">
              Maintenance schedule
            </Button>
            <Button onClick={() => setActiveModal('incident')} size="sm" type="button" variant="ghost">
              Log incident
            </Button>
            <Link href="/assignments">
              <Button size="sm" variant="ghost">Open assignments</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {activeModal === 'edit' ? (
        <ModalShell onClose={() => setActiveModal(null)} title="Edit vehicle">
          <EditVehicleForm compact vehicle={vehicle} />
        </ModalShell>
      ) : null}

      {activeModal === 'inspection' ? (
        <ModalShell onClose={() => setActiveModal(null)} title="Record inspection">
          <InspectionForm
            action={inspectionAction}
            pending={inspectionPending}
            state={inspectionState}
            vehicleId={vehicle.id}
          />
        </ModalShell>
      ) : null}

      {activeModal === 'maintenance' ? (
        <ModalShell onClose={() => setActiveModal(null)} title="Log maintenance">
          <MaintenanceEventForm
            action={eventAction}
            pending={eventPending}
            state={eventState}
            vehicleId={vehicle.id}
          />
        </ModalShell>
      ) : null}

      {activeModal === 'schedule' ? (
        <ModalShell onClose={() => setActiveModal(null)} title="Set maintenance schedule">
          <MaintenanceScheduleForm
            action={scheduleAction}
            pending={schedulePending}
            state={scheduleState}
            vehicleId={vehicle.id}
          />
        </ModalShell>
      ) : null}

      {activeModal === 'incident' ? (
        <ModalShell onClose={() => setActiveModal(null)} title="Log incident">
          <IncidentForm
            action={incidentAction}
            pending={incidentPending}
            state={incidentState}
            vehicleId={vehicle.id}
          />
        </ModalShell>
      ) : null}
    </>
  );
}
