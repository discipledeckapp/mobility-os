'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Text,
} from '@mobility-os/ui';
import type { AssignmentRecord, DriverRecord, FleetRecord, VehicleRecord } from '../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../lib/vehicle-display';
import { FleetSelectField } from '../../features/shared/fleet-select-field';
import {
  recordRemittanceAction,
  type RecordRemittanceActionState,
} from './actions';

const initialState: RecordRemittanceActionState = {};

export function CreateRemittanceForm({
  fleets,
  fleetError,
  activeAssignments,
  drivers,
  vehicles,
  helperNote,
}: {
  fleets: FleetRecord[];
  fleetError?: string | null;
  activeAssignments: AssignmentRecord[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  helperNote?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    recordRemittanceAction,
    initialState,
  );
  const [fleetId, setFleetId] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const selectableFleets = useMemo(
    () => fleets.filter((fleet) => fleet.status !== 'inactive'),
    [fleets],
  );
  const driverLabels = useMemo(
    () => new Map(drivers.map((d) => [d.id, `${d.firstName} ${d.lastName}`])),
    [drivers],
  );
  const vehicleLabels = useMemo(
    () => new Map(vehicles.map((v) => [v.id, getVehiclePrimaryLabel(v)])),
    [vehicles],
  );
  const fleetAssignments = useMemo(
    () =>
      activeAssignments.filter(
        (assignment) => !fleetId || assignment.fleetId === fleetId,
      ),
    [activeAssignments, fleetId],
  );

  useEffect(() => {
    if (
      assignmentId &&
      !fleetAssignments.some((assignment) => assignment.id === assignmentId)
    ) {
      setAssignmentId('');
    }
  }, [assignmentId, fleetAssignments]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record remittance</CardTitle>
        <CardDescription>
          Record a daily collection for an active assignment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <FleetSelectField
            fleetError={fleetError}
            fleets={fleets}
            onChange={setFleetId}
            value={fleetId}
          />

          <div className="space-y-2">
            <Label htmlFor="assignmentId">Assignment ID</Label>
            <Input
              id="assignmentId"
              name="assignmentId"
              onChange={(event) => setAssignmentId(event.target.value)}
              placeholder="asn_123"
              required
              value={assignmentId}
            />
            {fleetAssignments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fleetAssignments.slice(0, 4).map((assignment) => (
                  <Button
                    className="max-w-full"
                    key={assignment.id}
                    onClick={() => setAssignmentId(assignment.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {driverLabels.get(assignment.driverId) ?? assignment.driverId}
                    {' — '}
                    {vehicleLabels.get(assignment.vehicleId) ?? assignment.vehicleId}
                  </Button>
                ))}
              </div>
            ) : (
              <Text tone="muted">
                {fleetId
                  ? 'No active assignments are available in the selected fleet.'
                  : 'Select a fleet to see active assignments.'}
              </Text>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              min="0.01"
              name="amount"
              placeholder="1500.00"
              required
              step="0.01"
              type="number"
            />
            <Text tone="muted">Enter the amount in the major currency unit (e.g. 1500 for ₦1,500).</Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" maxLength={3} name="currency" placeholder="NGN" required />
            <Text tone="muted">3-letter ISO code, e.g. NGN, USD, GBP.</Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" name="dueDate" required type="date" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="End-of-day collections pending" />
          </div>

          <div className="flex items-end">
            <Button
              disabled={
                isPending ||
                selectableFleets.length === 0 ||
                !fleetId ||
                !assignmentId
              }
              type="submit"
            >
              {isPending ? 'Recording...' : 'Record remittance'}
            </Button>
          </div>
        </form>

        {state.error ? (
          <Text className="mt-4" tone="danger">{state.error}</Text>
        ) : null}

        {state.success ? (
          <Text className="mt-4" tone="success">{state.success}</Text>
        ) : null}

        {helperNote ? (
          <Text className="mt-4" tone="muted">
            {helperNote}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
