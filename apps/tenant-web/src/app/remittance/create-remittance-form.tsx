'use client';

import { computeNextRemittanceDueDate, describeRemittanceSchedule } from '@mobility-os/domain-config';
import { useActionState, useEffect, useMemo, useState } from 'react';
import {
  ActionPendingButtonState,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  InlineLoadingState,
  CardTitle,
  Input,
  Label,
  SearchableSelect,
  Text,
} from '@mobility-os/ui';
import type { SearchableSelectOption } from '@mobility-os/ui';
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
  const selectedAssignment = useMemo(
    () => fleetAssignments.find((assignment) => assignment.id === assignmentId) ?? null,
    [assignmentId, fleetAssignments],
  );
  const assignmentOptions = useMemo<SearchableSelectOption[]>(
    () =>
      fleetAssignments.map((assignment) => ({
        value: assignment.id,
        label: `${driverLabels.get(assignment.driverId) ?? assignment.driverId} · ${
          vehicleLabels.get(assignment.vehicleId) ?? assignment.vehicleId
        }`,
      })),
    [driverLabels, fleetAssignments, vehicleLabels],
  );
  const suggestedDueDate = useMemo(
    () =>
      selectedAssignment
        ? computeNextRemittanceDueDate({
            ...(selectedAssignment.remittanceFrequency !== undefined
              ? { remittanceFrequency: selectedAssignment.remittanceFrequency }
              : {}),
            ...(selectedAssignment.remittanceAmountMinorUnits !== undefined
              ? {
                  remittanceAmountMinorUnits:
                    selectedAssignment.remittanceAmountMinorUnits,
                }
              : {}),
            ...(selectedAssignment.remittanceCurrency !== undefined
              ? { remittanceCurrency: selectedAssignment.remittanceCurrency }
              : {}),
            ...(selectedAssignment.remittanceStartDate !== undefined
              ? { remittanceStartDate: selectedAssignment.remittanceStartDate }
              : {}),
            ...(selectedAssignment.remittanceCollectionDay !== undefined
              ? { remittanceCollectionDay: selectedAssignment.remittanceCollectionDay }
              : {}),
          }) ?? ''
        : '',
    [selectedAssignment],
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

          <SearchableSelect
            disabled={!fleetId}
            emptyText={
              fleetId
                ? 'No active assignments are available in the selected fleet.'
                : 'Select a fleet first.'
            }
            helperText="Search by driver or vehicle. Only assignments that can accept collections are listed."
            inputId="assignmentId"
            label="Assignment"
            name="assignmentId"
            onChange={setAssignmentId}
            options={assignmentOptions}
            placeholder="Select assignment"
            required
            value={assignmentId}
          />
          <div className="space-y-2">
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
              key={`${assignmentId || 'none'}-amount`}
              id="amount"
              min="0.01"
              name="amount"
              placeholder="2500.00"
              required
              step="0.01"
              type="number"
              defaultValue={
                selectedAssignment?.remittanceAmountMinorUnits
                  ? String(selectedAssignment.remittanceAmountMinorUnits / 100)
                  : ''
              }
              readOnly={Boolean(selectedAssignment?.remittanceAmountMinorUnits)}
            />
            <Text tone="muted">
              {selectedAssignment?.remittanceAmountMinorUnits
                ? 'This amount is pulled from the assignment remittance plan.'
                : 'Enter the amount in the major currency unit (e.g. 1500 for ₦1,500).'}
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              key={`${assignmentId || 'none'}-currency`}
              id="currency"
              maxLength={3}
              name="currency"
              placeholder="NGN"
              required
              defaultValue={selectedAssignment?.remittanceCurrency ?? ''}
              readOnly={Boolean(selectedAssignment?.remittanceCurrency)}
            />
            <Text tone="muted">
              {selectedAssignment?.remittanceCurrency
                ? 'This currency is locked to the assignment remittance plan.'
                : '3-letter ISO code, e.g. NGN, USD, GBP.'}
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              key={`${assignmentId || 'none'}-dueDate`}
              id="dueDate"
              name="dueDate"
              required
              type="date"
              defaultValue={suggestedDueDate}
              readOnly={Boolean(suggestedDueDate)}
            />
            {selectedAssignment ? (
              <Text tone="muted">
                {describeRemittanceSchedule({
                  ...(selectedAssignment.remittanceFrequency !== undefined
                    ? { remittanceFrequency: selectedAssignment.remittanceFrequency }
                    : {}),
                  ...(selectedAssignment.remittanceCollectionDay !== undefined
                    ? { remittanceCollectionDay: selectedAssignment.remittanceCollectionDay }
                    : {}),
                })}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="End-of-day collections pending" />
          </div>

          <div className="flex items-end">
            <ActionPendingButtonState
              label="Record remittance"
              pending={isPending}
              pendingLabel="Recording remittance"
              className={
                selectableFleets.length === 0 || !fleetId || !assignmentId
                  ? 'pointer-events-none opacity-55'
                  : undefined
              }
            />
          </div>
        </form>

        {isPending ? (
          <div className="mt-4">
            <InlineLoadingState
              message="Recording the collection, validating the assignment context, and updating remittance history."
              title="Recording remittance"
              variant="remittance"
            />
          </div>
        ) : null}

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
