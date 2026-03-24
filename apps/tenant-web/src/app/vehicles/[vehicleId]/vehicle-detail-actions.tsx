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

function LifecycleMessage({ state }: { state: VehicleLifecycleActionState }) {
  if (state.error) {
    return <Text tone="danger">{state.error}</Text>;
  }

  if (state.success) {
    return <Text tone="success">{state.success}</Text>;
  }

  return null;
}

export function VehicleDetailActions({
  vehicle,
}: {
  vehicle: VehicleDetailRecord;
}) {
  const [isEditing, setIsEditing] = useState(false);
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
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Vehicle operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Text tone="muted">Status and maintenance</Text>
            <VehicleStatusActions vehicle={vehicle} />
          </div>

          <div className="space-y-2">
            <Text tone="muted">Assignments</Text>
            <Text tone="muted">
              Use the assignments workspace when you need to reassign or unassign this vehicle.
            </Text>
            <Link href="/assignments">
              <Button size="sm" variant="ghost">
                Open assignments
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <Text tone="muted">Edit record</Text>
            <Button
              onClick={() => setIsEditing((current) => !current)}
              size="sm"
              type="button"
              variant={isEditing ? 'secondary' : 'ghost'}
            >
              {isEditing ? 'Close vehicle editor' : 'Edit vehicle'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isEditing ? <EditVehicleForm vehicle={vehicle} /> : null}

      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardHeader>
          <CardTitle>Log inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={inspectionAction} className="grid gap-4 md:grid-cols-2">
            <input name="vehicleId" type="hidden" value={vehicle.id} />
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
              <Button disabled={inspectionPending} type="submit">
                {inspectionPending ? 'Saving...' : 'Save inspection'}
              </Button>
              <LifecycleMessage state={inspectionState} />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/40">
        <CardHeader>
          <CardTitle>Preventive maintenance schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={scheduleAction} className="grid gap-4 md:grid-cols-2">
            <input name="vehicleId" type="hidden" value={vehicle.id} />
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
              <Input
                id="firstDueOdometerKm"
                min="0"
                name="firstDueOdometerKm"
                step="1"
                type="number"
              />
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
              <Button disabled={schedulePending} type="submit">
                {schedulePending ? 'Saving...' : 'Save maintenance schedule'}
              </Button>
              <LifecycleMessage state={scheduleState} />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/35">
        <CardHeader>
          <CardTitle>Maintenance activity</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={eventAction} className="grid gap-4 md:grid-cols-2">
            <input name="vehicleId" type="hidden" value={vehicle.id} />
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
              <Button disabled={eventPending} type="submit">
                {eventPending ? 'Saving...' : 'Save maintenance activity'}
              </Button>
              <LifecycleMessage state={eventState} />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-rose-200 bg-rose-50/35">
        <CardHeader>
          <CardTitle>Incident report</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={incidentAction} className="grid gap-4 md:grid-cols-2">
            <input name="vehicleId" type="hidden" value={vehicle.id} />
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
              <Button disabled={incidentPending} type="submit">
                {incidentPending ? 'Saving...' : 'Log incident'}
              </Button>
              <LifecycleMessage state={incidentState} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
