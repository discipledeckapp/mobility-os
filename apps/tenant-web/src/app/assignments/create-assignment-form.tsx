'use client';

import { describeRemittanceSchedule } from '@mobility-os/domain-config';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
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
import type { DriverRecord, FleetRecord, VehicleRecord } from '../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../lib/vehicle-display';
import { FleetSelectField } from '../../features/shared/fleet-select-field';
import {
  createAssignmentAction,
  type CreateAssignmentActionState,
} from './actions';

const initialState: CreateAssignmentActionState = {};

// ---------------------------------------------------------------------------
// Currency amount field — accepts decimal input (e.g. "2500" or "2,500.00")
// and submits the value in minor units as a hidden field.
// ---------------------------------------------------------------------------

function RemittanceAmountField({ currency }: { currency: string }) {
  const [display, setDisplay] = useState('');

  const majorUnits = parseFloat(display.replace(/,/g, '')) || 0;
  const minorUnits = Math.round(majorUnits * 100);

  const formatted = majorUnits > 0
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 2 }).format(majorUnits)
    : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id="remittanceAmountDisplay"
          inputMode="decimal"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplay(e.target.value)}
          placeholder="2,500.00"
          required
          value={display}
        />
        <input name="remittanceAmountMinorUnits" type="hidden" value={minorUnits} />
      </div>
      {formatted ? (
        <Text tone="muted">{formatted} = {minorUnits.toLocaleString()} minor units</Text>
      ) : (
        <Text tone="muted">Enter the amount in major units (e.g. 2500 for ₦2,500). Decimals are supported.</Text>
      )}
    </div>
  );
}

function MoneyMinorInputField({
  currency,
  name,
  id,
  label,
  helperText,
  required = false,
}: {
  currency: string;
  name: string;
  id: string;
  label: string;
  helperText: string;
  required?: boolean;
}) {
  const [display, setDisplay] = useState('');
  const majorUnits = parseFloat(display.replace(/,/g, '')) || 0;
  const minorUnits = Math.round(majorUnits * 100);
  const formatted =
    majorUnits > 0
      ? new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
        }).format(majorUnits)
      : null;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true" className="text-red-500"> *</span> : null}
      </Label>
      <Input
        id={id}
        inputMode="decimal"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDisplay(event.target.value)}
        placeholder="2,500.00"
        required={required}
        value={display}
      />
      <input name={name} type="hidden" value={minorUnits} />
      <Text tone="muted">{formatted ? `${formatted} = ${minorUnits.toLocaleString()} minor units` : helperText}</Text>
    </div>
  );
}

function computeInstallmentSummary(input: {
  totalTargetMinorUnits: number;
  durationPeriods: number;
}) {
  if (!input.totalTargetMinorUnits || !input.durationPeriods) {
    return null;
  }
  const baseAmountMinorUnits = Math.floor(input.totalTargetMinorUnits / input.durationPeriods);
  const finalAmountMinorUnits =
    input.totalTargetMinorUnits - baseAmountMinorUnits * Math.max(input.durationPeriods - 1, 0);
  return {
    baseAmountMinorUnits,
    finalAmountMinorUnits,
  };
}

export function CreateAssignmentForm({
  fleets,
  fleetError,
  activeDrivers,
  availableVehicles,
  helperNote,
}: {
  fleets: FleetRecord[];
  fleetError?: string | null;
  activeDrivers: DriverRecord[];
  availableVehicles: VehicleRecord[];
  helperNote?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    createAssignmentAction,
    initialState,
  );
  const [fleetId, setFleetId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [paymentModel, setPaymentModel] = useState<
    'remittance' | 'salary' | 'commission' | 'hire_purchase'
  >('remittance');
  const [remittanceFrequency, setRemittanceFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hirePurchaseTargetDisplay, setHirePurchaseTargetDisplay] = useState('');
  const [hirePurchaseDurationPeriods, setHirePurchaseDurationPeriods] = useState('20');
  const selectableFleets = useMemo(
    () => fleets.filter((fleet) => fleet.status !== 'inactive'),
    [fleets],
  );
  const fleetDrivers = useMemo(
    () => activeDrivers.filter((driver) => !fleetId || driver.fleetId === fleetId),
    [activeDrivers, fleetId],
  );
  const fleetVehicles = useMemo(
    () => availableVehicles.filter((vehicle) => !fleetId || vehicle.fleetId === fleetId),
    [availableVehicles, fleetId],
  );
  const selectedDriver = useMemo(
    () => activeDrivers.find((driver) => driver.id === driverId) ?? null,
    [activeDrivers, driverId],
  );
  const driverOptions = useMemo<SearchableSelectOption[]>(
    () =>
      fleetDrivers.map((driver) => ({
        value: driver.id,
        label: `${driver.firstName} ${driver.lastName} · ${driver.phone}`,
      })),
    [fleetDrivers],
  );
  const vehicleOptions = useMemo<SearchableSelectOption[]>(
    () =>
      fleetVehicles.map((vehicle) => ({
        value: vehicle.id,
        label: `${getVehiclePrimaryLabel(vehicle)}${vehicle.plate ? ` · ${vehicle.plate}` : ''}`,
      })),
    [fleetVehicles],
  );

  useEffect(() => {
    if (driverId && !fleetDrivers.some((driver) => driver.id === driverId)) {
      setDriverId('');
    }
  }, [driverId, fleetDrivers]);

  useEffect(() => {
    if (vehicleId && !fleetVehicles.some((vehicle) => vehicle.id === vehicleId)) {
      setVehicleId('');
    }
  }, [fleetVehicles, vehicleId]);

  const [displaySuccess, setDisplaySuccess] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.success) {
      setDisplaySuccess(state.success);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setDisplaySuccess(null), 4000);
    }
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [state.success]);

  const totalTargetMinorUnits = Math.round((parseFloat(hirePurchaseTargetDisplay.replace(/,/g, '')) || 0) * 100);
  const durationPeriods = Number.parseInt(hirePurchaseDurationPeriods, 10) || 0;
  const generatedInstallment = useMemo(
    () =>
      computeInstallmentSummary({
        totalTargetMinorUnits,
        durationPeriods,
      }),
    [durationPeriods, totalTargetMinorUnits],
  );
  const usesRemittance = paymentModel === 'remittance' || paymentModel === 'hire_purchase';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create assignment</CardTitle>
        <CardDescription>
          Pair an active driver with an available vehicle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-blue-800">Before you start:</span> Both the driver and vehicle must be active and available. Only eligible options appear in the quick-picks below. Drivers also need an approved licence on file.
        </div>
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
                ? 'No active drivers are available in the selected fleet.'
                : 'Select a fleet first.'
            }
            helperText="Search by driver name or phone. Only active drivers in the selected fleet are available."
            inputId="driverId"
            label="Driver"
            name="driverId"
            onChange={setDriverId}
            options={driverOptions}
            placeholder="Select driver"
            required
            value={driverId}
          />
          <div className="space-y-2">
            {fleetDrivers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fleetDrivers.slice(0, 4).map((driver) => (
                  <Button
                    className="max-w-full"
                    key={driver.id}
                    onClick={() => setDriverId(driver.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {driver.firstName} {driver.lastName}
                  </Button>
                ))}
              </div>
            ) : (
              <Text tone="muted">
                {fleetId
                  ? 'No active drivers are available in the selected fleet.'
                  : 'Select a fleet to see active drivers.'}
              </Text>
            )}
            {selectedDriver &&
            selectedDriver.verificationTierComponents?.includes('drivers_license') &&
            !selectedDriver.hasApprovedLicence ? (
              <Text tone="danger">
                This driver cannot be assigned yet because no approved driver licence is on file.
              </Text>
            ) : null}
          </div>

          <SearchableSelect
            disabled={!fleetId}
            emptyText={
              fleetId
                ? 'No available vehicles are in the selected fleet.'
                : 'Select a fleet first.'
            }
            helperText="Search by vehicle code or plate. Vehicles already assigned are excluded."
            inputId="vehicleId"
            label="Vehicle"
            name="vehicleId"
            onChange={setVehicleId}
            options={vehicleOptions}
            placeholder="Select vehicle"
            required
            value={vehicleId}
          />
          <div className="space-y-2">
            {fleetVehicles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fleetVehicles.slice(0, 4).map((vehicle) => (
                  <Button
                    className="max-w-full"
                    key={vehicle.id}
                    onClick={() => setVehicleId(vehicle.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {getVehiclePrimaryLabel(vehicle)}
                  </Button>
                ))}
              </div>
            ) : (
              <Text tone="muted">
                {fleetId
                  ? 'No available vehicles are in the selected fleet.'
                  : 'Select a fleet to see available vehicles.'}
              </Text>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentModel">Payment model</Label>
            <select
              className="h-11 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm text-slate-900"
              id="paymentModel"
              name="paymentModel"
              onChange={(event) =>
                setPaymentModel(
                  event.target.value === 'salary'
                    ? 'salary'
                    : event.target.value === 'commission'
                      ? 'commission'
                      : event.target.value === 'hire_purchase'
                        ? 'hire_purchase'
                        : 'remittance',
                )
              }
              value={paymentModel}
            >
              <option value="remittance">Remittance</option>
              <option value="salary">Salary</option>
              <option value="commission">Commission</option>
              <option value="hire_purchase">Hire purchase</option>
            </select>
            <input name="contractType" type="hidden" value={paymentModel === 'hire_purchase' ? 'hire_purchase' : 'regular_hire'} />
            <input name="remittanceModel" type="hidden" value={paymentModel === 'hire_purchase' ? 'hire_purchase' : 'fixed'} />
            <Text tone="muted">
              {paymentModel === 'salary'
                ? 'Salary assignments keep driver and vehicle pairing active without showing remittance collection workflows.'
                : paymentModel === 'commission'
                  ? 'Commission assignments track operational pairing without transport remittance collection.'
                  : paymentModel === 'hire_purchase'
                    ? 'Hire purchase tracks payoff progress, balance, and ownership milestones.'
                    : 'Remittance tracks recurring collections for transport-style operations.'}
            </Text>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Morning dispatch rotation" />
          </div>

          {paymentModel === 'remittance' ? (
            <div className="space-y-2">
              <Label htmlFor="remittanceAmountDisplay">Expected remittance amount <span aria-hidden="true" className="text-red-500">*</span></Label>
              <RemittanceAmountField currency="NGN" />
            </div>
          ) : paymentModel === 'hire_purchase' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="totalTargetAmountMinorUnitsDisplay">Total target amount <span aria-hidden="true" className="text-red-500">*</span></Label>
                <Input
                  id="totalTargetAmountMinorUnitsDisplay"
                  inputMode="decimal"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setHirePurchaseTargetDisplay(event.target.value)
                  }
                  placeholder="2,500,000.00"
                  required
                  value={hirePurchaseTargetDisplay}
                />
                <input name="totalTargetAmountMinorUnits" type="hidden" value={totalTargetMinorUnits} />
                <Text tone="muted">
                  {totalTargetMinorUnits > 0
                    ? `${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(totalTargetMinorUnits / 100)} target payable`
                    : 'Enter the full contract payoff target in major units.'}
                </Text>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractDurationPeriods">Repayment periods <span aria-hidden="true" className="text-red-500">*</span></Label>
                <Input
                  id="contractDurationPeriods"
                  inputMode="numeric"
                  min="1"
                  name="contractDurationPeriods"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setHirePurchaseDurationPeriods(event.target.value)
                  }
                  placeholder="20"
                  required
                  type="number"
                  value={hirePurchaseDurationPeriods}
                />
                <Text tone="muted">Use the number of daily, weekly, or monthly periods the driver should repay across.</Text>
              </div>
            </>
          ) : (
            <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
              <Text tone="strong">
                {paymentModel === 'salary' ? 'Salary assignment' : 'Commission assignment'}
              </Text>
              <Text tone="muted">
                This assignment will support onboarding, verification, and fleet operations without requiring remittance terms or collection tracking.
              </Text>
            </div>
          )}

          {usesRemittance ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="remittanceCurrency">Remittance currency <span aria-hidden="true" className="text-red-500">*</span></Label>
                <Input
                  defaultValue="NGN"
                  id="remittanceCurrency"
                  maxLength={3}
                  name="remittanceCurrency"
                  placeholder="NGN"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remittanceFrequency">Remittance schedule</Label>
                <select
                  className="h-11 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  id="remittanceFrequency"
                  name="remittanceFrequency"
                  onChange={(event) =>
                    setRemittanceFrequency(
                      event.target.value === 'weekly'
                        ? 'weekly'
                        : event.target.value === 'monthly'
                          ? 'monthly'
                          : 'daily',
                    )
                  }
                  value={remittanceFrequency}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <Text tone="muted">
                  {describeRemittanceSchedule({ remittanceFrequency, remittanceCollectionDay: 1 })}
                </Text>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remittanceStartDate">First remittance due date <span aria-hidden="true" className="text-red-500">*</span></Label>
                <Input id="remittanceStartDate" name="remittanceStartDate" required type="date" />
              </div>
            </>
          ) : null}

          {paymentModel === 'hire_purchase' ? (
            <>
              <MoneyMinorInputField
                currency="NGN"
                helperText="Optional upfront deposit to recognize against the contract."
                id="depositAmountMinorUnitsDisplay"
                label="Deposit amount"
                name="depositAmountMinorUnits"
              />
              <MoneyMinorInputField
                currency="NGN"
                helperText="Optional principal amount for principal-aware hire purchase reporting."
                id="principalAmountMinorUnitsDisplay"
                label="Principal amount"
                name="principalAmountMinorUnits"
              />
              <div className="space-y-2">
                <Label htmlFor="contractEndDate">Contract end date</Label>
                <Input id="contractEndDate" name="contractEndDate" type="date" />
                <Text tone="muted">Optional if you prefer a fixed end date instead of only counting periods.</Text>
              </div>
              <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-200 bg-emerald-50/70 px-4 py-3 md:col-span-2">
                <Text tone="strong">Generated installment</Text>
                {generatedInstallment ? (
                  <Text tone="muted">
                    Base installment: {(generatedInstallment.baseAmountMinorUnits / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGN.
                    {' '}Final installment: {(generatedInstallment.finalAmountMinorUnits / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGN.
                  </Text>
                ) : (
                  <Text tone="muted">Enter the total target and repayment periods to generate the installment amount.</Text>
                )}
                <input
                  name="remittanceAmountMinorUnits"
                  type="hidden"
                  value={generatedInstallment?.baseAmountMinorUnits ?? 0}
                />
              </div>
            </>
          ) : null}

          {usesRemittance && remittanceFrequency === 'weekly' ? (
            <div className="space-y-2">
              <Label htmlFor="remittanceCollectionDay">Weekly collection day</Label>
              <select
                className="h-11 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm text-slate-900"
                id="remittanceCollectionDay"
                name="remittanceCollectionDay"
                required
              >
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="7">Sunday</option>
              </select>
            </div>
          ) : null}

          <div className="flex items-end">
            <ActionPendingButtonState
              label="Create assignment"
              pending={isPending}
              pendingLabel="Creating assignment"
              type="submit"
              className={
                selectableFleets.length === 0 ||
                !fleetId ||
                !driverId ||
                !vehicleId ||
                Boolean(
                selectedDriver &&
                  selectedDriver.verificationTierComponents?.includes('drivers_license') &&
                  !selectedDriver.hasApprovedLicence,
              )
                  ? 'pointer-events-none opacity-55'
                  : undefined
              }
            />
          </div>
        </form>

        {isPending ? (
          <div className="mt-4">
            <InlineLoadingState
              message="Checking driver eligibility, vehicle availability, and assignment readiness before we lock this pairing."
              title="Creating assignment"
              variant="assignment"
            />
          </div>
        ) : null}

        {state.error ? (
          <Text className="mt-4" tone="danger">{state.error}</Text>
        ) : null}

        {displaySuccess ? (
          <Text className="mt-4" tone="success">{displaySuccess}</Text>
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
