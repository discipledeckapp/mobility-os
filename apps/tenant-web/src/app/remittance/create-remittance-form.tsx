'use client';

import { computeNextRemittanceDueDate, describeRemittanceSchedule } from '@mobility-os/domain-config';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionPendingButtonState,
  Button,
  InlineLoadingState,
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
  TenantEmptyStateCard,
  TenantSurfaceCard,
  TenantToolbarPanel,
} from '../../features/shared/tenant-page-patterns';
import {
  recordRemittanceAction,
  type RecordRemittanceActionState,
} from './actions';
import { useRouter } from 'next/navigation';

const initialState: RecordRemittanceActionState = {};

function formatAmount(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

export function CreateRemittanceForm({
  fleets,
  fleetError,
  activeAssignments,
  drivers,
  vehicles,
  helperNote,
  initialAssignmentId,
  initialFleetId,
}: {
  fleets: FleetRecord[];
  fleetError?: string | null;
  activeAssignments: AssignmentRecord[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  helperNote?: string | null;
  initialAssignmentId?: string | null;
  initialFleetId?: string | null;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    recordRemittanceAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const [fleetId, setFleetId] = useState(initialFleetId ?? '');
  const [assignmentId, setAssignmentId] = useState(initialAssignmentId ?? '');
  const hasActiveAssignments = activeAssignments.length > 0;
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
  const suggestedAmountMajorUnits = useMemo(() => {
    const nextDueAmountMinorUnits =
      selectedAssignment?.financialContract?.summary.nextDueAmountMinorUnits ??
      selectedAssignment?.financialContract?.summary.expectedPerPeriodAmountMinorUnits ??
      selectedAssignment?.remittanceAmountMinorUnits ??
      null;
    return nextDueAmountMinorUnits ? String(nextDueAmountMinorUnits / 100) : '';
  }, [selectedAssignment]);

  useEffect(() => {
    if (
      assignmentId &&
      !fleetAssignments.some((assignment) => assignment.id === assignmentId)
    ) {
      setAssignmentId('');
    }
  }, [assignmentId, fleetAssignments]);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    formRef.current?.reset();
    setAssignmentId(initialAssignmentId ?? '');
    setFleetId(initialFleetId ?? '');
    router.refresh();
  }, [initialAssignmentId, initialFleetId, router, state.success]);

  return (
    <TenantSurfaceCard
      contentClassName="space-y-4"
      description={
        hasActiveAssignments
          ? 'Choose an active assignment, review its collection context, then record the remittance.'
          : 'Remittance becomes available once a driver has an active assignment.'
      }
      title="Record remittance"
    >
        {!hasActiveAssignments ? (
          <div className="space-y-4">
            <TenantEmptyStateCard
              actions={
                <a
                  className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] bg-[var(--mobiris-primary)] px-4.5 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all duration-150 hover:bg-[var(--mobiris-primary-dark)]"
                  href="/assignments"
                >
                  Go to Assignments
                </a>
              }
              description="Remittance must be recorded against an active assignment that uses the remittance or hire purchase payment model. Create or activate a remittance-enabled assignment first, then return here to log collections."
              title="No active assignments found"
            />
            {helperNote ? (
              <Text tone="muted">{helperNote}</Text>
            ) : null}
          </div>
        ) : (
        <form action={formAction} className="grid gap-4 md:grid-cols-2" ref={formRef}>
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
              <div className="flex flex-wrap gap-2 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-slate-50/75 p-3">
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

          {selectedAssignment ? (
            <TenantToolbarPanel className="md:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-1">
                  <Text tone="muted">Driver</Text>
                  <Text tone="strong">
                    {driverLabels.get(selectedAssignment.driverId) ?? selectedAssignment.driverId}
                  </Text>
                </div>
                <div className="space-y-1">
                  <Text tone="muted">Vehicle</Text>
                  <Text tone="strong">
                    {vehicleLabels.get(selectedAssignment.vehicleId) ?? selectedAssignment.vehicleId}
                  </Text>
                </div>
                <div className="space-y-1">
                  <Text tone="muted">Expected remittance</Text>
                  <Text tone="strong">
                    {selectedAssignment.financialContract?.summary.nextDueAmountMinorUnits
                      ? formatAmount(
                          selectedAssignment.financialContract.summary.nextDueAmountMinorUnits,
                          selectedAssignment.financialContract.currency,
                        )
                      : selectedAssignment.remittanceAmountMinorUnits &&
                          selectedAssignment.remittanceCurrency
                        ? formatAmount(
                            selectedAssignment.remittanceAmountMinorUnits,
                            selectedAssignment.remittanceCurrency,
                          )
                        : 'Set on assignment'}
                  </Text>
                </div>
                <div className="space-y-1">
                  <Text tone="muted">Due date</Text>
                  <Text tone="strong">
                    {selectedAssignment.financialContract?.summary.nextDueDate ??
                      suggestedDueDate ??
                      'Set on assignment'}
                  </Text>
                </div>
              </div>
            </TenantToolbarPanel>
          ) : (
            <TenantToolbarPanel className="border-dashed border-slate-300 bg-white md:col-span-2">
              <Text tone="muted">
                Select an active assignment to load the driver, vehicle, expected remittance, and due date before recording a collection.
              </Text>
            </TenantToolbarPanel>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              key={`${assignmentId || 'none'}-amount`}
              disabled={!selectedAssignment}
              id="amount"
              min="0.01"
              name="amount"
              placeholder="2500.00"
              required
              step="0.01"
              type="number"
              defaultValue={
                suggestedAmountMajorUnits
              }
              readOnly={Boolean(suggestedAmountMajorUnits)}
            />
            <Text tone="muted">
              {selectedAssignment?.financialContract
                ? `${selectedAssignment.financialContract.display.summaryLabel}: ${selectedAssignment.financialContract.summary.scheduleLabel}.`
                : 'Enter the amount in the major currency unit (e.g. 1500 for ₦1,500).'}
            </Text>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              key={`${assignmentId || 'none'}-currency`}
              disabled={!selectedAssignment}
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
              disabled={!selectedAssignment}
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

          {selectedAssignment?.financialContract ? (
            <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-200 bg-emerald-50/70 px-4 py-3 md:col-span-2">
              <Text tone="strong">Contract summary</Text>
              <Text tone="muted">
                {selectedAssignment.financialContract.display.summaryLabel} · Paid so far {(
                  selectedAssignment.financialContract.summary.cumulativePaidAmountMinorUnits / 100
                ).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                {selectedAssignment.financialContract.currency}.
                {selectedAssignment.financialContract.summary.outstandingBalanceMinorUnits !== null &&
                selectedAssignment.financialContract.summary.outstandingBalanceMinorUnits !== undefined
                  ? ` Remaining balance ${(selectedAssignment.financialContract.summary.outstandingBalanceMinorUnits / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${selectedAssignment.financialContract.currency}.`
                  : ''}
              </Text>
            </div>
          ) : null}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              disabled={!selectedAssignment}
              id="notes"
              name="notes"
              placeholder="End-of-day collections pending"
            />
          </div>

          <div className="flex items-end">
            <ActionPendingButtonState
              label="Record remittance"
              pending={isPending}
              pendingLabel="Recording remittance"
              type="submit"
              className={
                selectableFleets.length === 0 || !fleetId || !assignmentId
                  ? 'pointer-events-none opacity-55'
                  : undefined
              }
            />
          </div>
        </form>
        )}

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
          <div className="mt-4 space-y-2 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-200 bg-emerald-50/80 px-4 py-3">
            <Text tone="success">{state.success}</Text>
            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex text-sm font-medium text-emerald-700 underline"
                href="/remittance"
              >
                View remittance history
              </a>
              {state.assignmentId ? (
                <a
                  className="inline-flex text-sm font-medium text-emerald-700 underline"
                  href={`/assignments/${state.assignmentId}`}
                >
                  Return to assignment
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {helperNote ? (
          <Text className="mt-4" tone="muted">
            {helperNote}
          </Text>
        ) : null}
    </TenantSurfaceCard>
  );
}
