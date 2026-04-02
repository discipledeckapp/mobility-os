'use client';

import { describeRemittanceSchedule } from '@mobility-os/domain-config';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionPendingButtonState,
  InlineLoadingState,
  Input,
  Label,
  SearchableSelect,
  Text,
} from '@mobility-os/ui';
import type { SearchableSelectOption } from '@mobility-os/ui';
import { useRouter } from 'next/navigation';
import type { DriverRecord, FleetRecord, VehicleRecord } from '../../lib/api-core';
import { getVehiclePrimaryLabel } from '../../lib/vehicle-display';
import { FleetSelectField } from '../../features/shared/fleet-select-field';
import {
  TenantSurfaceCard,
  TenantToolbarPanel,
} from '../../features/shared/tenant-page-patterns';
import { createAssignmentAction, type CreateAssignmentActionState } from './actions';

const initialState: CreateAssignmentActionState = {};
const DEFAULT_CURRENCY = 'NGN';
const DEFAULT_PERIOD_COUNT = '20';

type HirePurchaseFrequency = 'daily' | 'weekly' | 'monthly';
type HirePurchaseDurationMode = 'periods' | 'end_date';
type HirePurchaseOverrideStrategy = 'keep_duration' | 'adjust_duration';

function parseMoneyDisplayToMinorUnits(display: string): number {
  const normalized = display.replace(/,/g, '').trim();
  const majorUnits = Number.parseFloat(normalized);
  return Number.isFinite(majorUnits) ? Math.round(majorUnits * 100) : 0;
}

function formatMoneyMinorUnits(value: number | null | undefined, currency = DEFAULT_CURRENCY): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Not set';
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function formatDateLabel(value: string | null | undefined): string {
  if (!value) {
    return 'Not set';
  }

  const parsed = parseIsoDate(value);
  if (!parsed) {
    return value;
  }

  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(parsed);
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseIsoDate(value?: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parts = value.split('-').map((part) => Number.parseInt(part, 10));
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addSchedulePeriods(
  startDate: string,
  frequency: HirePurchaseFrequency,
  periods: number,
  collectionDay?: number | null,
): string[] {
  const start = parseIsoDate(startDate);
  if (!start || periods < 1) {
    return [];
  }

  const dates: string[] = [];
  let cursor = new Date(start);

  if (frequency === 'weekly' && collectionDay && collectionDay >= 1 && collectionDay <= 7) {
    const currentWeekday = cursor.getUTCDay() === 0 ? 7 : cursor.getUTCDay();
    const diff = (collectionDay - currentWeekday + 7) % 7;
    cursor.setUTCDate(cursor.getUTCDate() + diff);
  }

  for (let index = 0; index < periods; index += 1) {
    dates.push(toIsoDate(cursor));
    if (frequency === 'daily') {
      cursor = new Date(cursor);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      continue;
    }

    if (frequency === 'weekly') {
      cursor = new Date(cursor);
      cursor.setUTCDate(cursor.getUTCDate() + 7);
      continue;
    }

    const anchorDay = start.getUTCDate();
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;
    const nextMonth = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(
      Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 0),
    );
    const nextDay = Math.min(anchorDay, lastDay.getUTCDate());
    cursor = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), nextDay));
  }

  return dates;
}

function calculatePeriodCountFromEndDate(
  startDate: string,
  endDate: string,
  frequency: HirePurchaseFrequency,
  collectionDay?: number | null,
): number | null {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end || end < start) {
    return null;
  }

  for (let periods = 1; periods <= 400; periods += 1) {
    const dueDates = addSchedulePeriods(startDate, frequency, periods, collectionDay);
    const lastDueDate = dueDates[dueDates.length - 1];
    if (!lastDueDate) {
      return null;
    }

    if (lastDueDate >= endDate) {
      return periods;
    }
  }

  return null;
}

function RemittanceAmountField({
  currency,
  value,
  onChange,
}: {
  currency: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const majorUnits = Number.parseFloat(value.replace(/,/g, '')) || 0;
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
      <Input
        id="remittanceAmountDisplay"
        inputMode="decimal"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder="2,500.00"
        required
        value={value}
      />
      <input name="remittanceAmountMinorUnits" type="hidden" value={minorUnits} />
      {formatted ? (
        <Text tone="muted">
          {formatted} = {minorUnits.toLocaleString()} minor units
        </Text>
      ) : (
        <Text tone="muted">
          Enter the amount in major units. Decimals are supported.
        </Text>
      )}
    </div>
  );
}

function MoneyInputField({
  id,
  label,
  value,
  onChange,
  helperText,
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText: string;
  required?: boolean;
}) {
  const minorUnits = parseMoneyDisplayToMinorUnits(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-red-500">
            {' '}
            *
          </span>
        ) : null}
      </Label>
      <Input
        id={id}
        inputMode="decimal"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder="2,500,000.00"
        required={required}
        value={value}
      />
      <Text tone="muted">
        {minorUnits > 0
          ? `${formatMoneyMinorUnits(minorUnits)} = ${minorUnits.toLocaleString()} minor units`
          : helperText}
      </Text>
    </div>
  );
}

function getDriverDisplayName(driver: DriverRecord | null): string {
  if (!driver) {
    return 'Driver not selected';
  }

  return `${driver.firstName} ${driver.lastName}`;
}

function buildRemittancePreviewSummary({
  driver,
  amountMinorUnits,
  frequency,
  startDate,
  collectionDay,
}: {
  driver: DriverRecord | null;
  amountMinorUnits: number;
  frequency: HirePurchaseFrequency;
  startDate: string;
  collectionDay: number;
}): string {
  const driverName = getDriverDisplayName(driver);
  const amountLabel = formatMoneyMinorUnits(amountMinorUnits);
  const scheduleLabel = describeRemittanceSchedule({
    remittanceFrequency: frequency,
    ...(frequency === 'weekly' ? { remittanceCollectionDay: collectionDay } : {}),
  }).toLowerCase();
  const startDateLabel = formatDateLabel(startDate);

  if (amountMinorUnits <= 0 || !startDate) {
    return `${driverName} will begin this remittance assignment once the payment amount and start date are set.`;
  }

  return `${driverName} will pay ${amountLabel} ${scheduleLabel} starting ${startDateLabel}.`;
}

type HirePurchasePlan = {
  totalTargetAmountMinorUnits: number;
  depositAmountMinorUnits: number;
  principalAmountMinorUnits: number;
  periodCount: number;
  contractEndDate: string;
  baseInstallmentAmountMinorUnits: number;
  finalInstallmentAmountMinorUnits: number;
  generatedFromTarget: boolean;
  scheduleSummary: string;
  durationSummary: string;
  sourceSummary: string;
};

function deriveGuidedHirePurchasePlan(input: {
  totalTargetAmountMinorUnits: number;
  depositAmountMinorUnits: number;
  remittanceFrequency: HirePurchaseFrequency;
  remittanceStartDate: string;
  remittanceCollectionDay: number;
  durationMode: HirePurchaseDurationMode;
  contractDurationPeriodsInput: string;
  contractEndDateInput: string;
}): { plan: HirePurchasePlan | null; errors: string[] } {
  const errors: string[] = [];
  const {
    totalTargetAmountMinorUnits,
    depositAmountMinorUnits,
    remittanceFrequency,
    remittanceStartDate,
    remittanceCollectionDay,
    durationMode,
    contractDurationPeriodsInput,
    contractEndDateInput,
  } = input;

  if (totalTargetAmountMinorUnits < 1) {
    errors.push('Total asset value / total target amount must be greater than 0.');
  }

  if (depositAmountMinorUnits < 0) {
    errors.push('Deposit cannot be negative.');
  }

  if (depositAmountMinorUnits > totalTargetAmountMinorUnits) {
    errors.push('Deposit cannot exceed the total asset value / total target amount.');
  }

  if (!parseIsoDate(remittanceStartDate)) {
    errors.push('First repayment date is required.');
  }

  if (
    remittanceFrequency === 'weekly' &&
    (remittanceCollectionDay < 1 || remittanceCollectionDay > 7)
  ) {
    errors.push('Weekly repayment schedules require a valid collection day.');
  }

  const contractDurationPeriods =
    durationMode === 'periods'
      ? Number.parseInt(contractDurationPeriodsInput, 10)
      : calculatePeriodCountFromEndDate(
          remittanceStartDate,
          contractEndDateInput,
          remittanceFrequency,
          remittanceFrequency === 'weekly' ? remittanceCollectionDay : null,
        );

  if (!contractDurationPeriods || contractDurationPeriods < 1) {
    errors.push(
      durationMode === 'periods'
        ? 'Repayment periods must be at least 1.'
        : 'Choose a contract end date that falls after the first repayment date.',
    );
  }

  if (errors.length > 0 || !contractDurationPeriods) {
    return { plan: null, errors };
  }

  const dueDates = addSchedulePeriods(
    remittanceStartDate,
    remittanceFrequency,
    contractDurationPeriods,
    remittanceFrequency === 'weekly' ? remittanceCollectionDay : null,
  );
  const contractEndDate = dueDates[dueDates.length - 1] ?? contractEndDateInput;
  const baseInstallmentAmountMinorUnits = Math.floor(
    totalTargetAmountMinorUnits / contractDurationPeriods,
  );
  const finalInstallmentAmountMinorUnits =
    totalTargetAmountMinorUnits -
    baseInstallmentAmountMinorUnits * Math.max(contractDurationPeriods - 1, 0);

  return {
    plan: {
      totalTargetAmountMinorUnits,
      depositAmountMinorUnits,
      principalAmountMinorUnits: Math.max(totalTargetAmountMinorUnits - depositAmountMinorUnits, 0),
      periodCount: contractDurationPeriods,
      contractEndDate,
      baseInstallmentAmountMinorUnits,
      finalInstallmentAmountMinorUnits,
      generatedFromTarget: true,
      scheduleSummary: describeRemittanceSchedule({
        remittanceFrequency,
        ...(remittanceFrequency === 'weekly'
          ? { remittanceCollectionDay }
          : {}),
      }),
      durationSummary:
        durationMode === 'periods'
          ? `${contractDurationPeriods} repayment periods ending on ${formatDateLabel(contractEndDate)}`
          : `Contract runs until ${formatDateLabel(contractEndDate)} across ${contractDurationPeriods} repayment periods`,
      sourceSummary: 'System-generated from total target, schedule, and duration',
    },
    errors: [],
  };
}

function deriveFinalHirePurchasePlan(input: {
  recommendedPlan: HirePurchasePlan | null;
  overrideEnabled: boolean;
  overrideStrategy: HirePurchaseOverrideStrategy;
  overrideInstallmentAmountMinorUnits: number;
  overrideFinalInstallmentAmountMinorUnits: number;
  overridePrincipalAmountMinorUnits: number;
  remittanceFrequency: HirePurchaseFrequency;
  remittanceStartDate: string;
  remittanceCollectionDay: number;
}): { plan: HirePurchasePlan | null; errors: string[]; overrideDeltaSummary: string[] } {
  const errors: string[] = [];
  const overrideDeltaSummary: string[] = [];
  const { recommendedPlan } = input;

  if (!recommendedPlan) {
    return { plan: null, errors, overrideDeltaSummary };
  }

  if (!input.overrideEnabled) {
    return { plan: recommendedPlan, errors, overrideDeltaSummary };
  }

  const principalAmountMinorUnits =
    input.overridePrincipalAmountMinorUnits > 0
      ? input.overridePrincipalAmountMinorUnits
      : recommendedPlan.principalAmountMinorUnits;

  if (principalAmountMinorUnits < 1) {
    errors.push('Principal amount must be greater than 0 when manually overridden.');
  }

  if (principalAmountMinorUnits > recommendedPlan.totalTargetAmountMinorUnits) {
    errors.push('Principal amount cannot exceed the total asset value / total target amount.');
  }

  const baseInstallmentAmountMinorUnits =
    input.overrideInstallmentAmountMinorUnits > 0
      ? input.overrideInstallmentAmountMinorUnits
      : recommendedPlan.baseInstallmentAmountMinorUnits;

  if (baseInstallmentAmountMinorUnits < 1) {
    errors.push('Installment amount must be greater than 0 when override mode is enabled.');
  }

  let periodCount = recommendedPlan.periodCount;
  let contractEndDate = recommendedPlan.contractEndDate;
  let finalInstallmentAmountMinorUnits = recommendedPlan.finalInstallmentAmountMinorUnits;

  if (input.overrideStrategy === 'keep_duration') {
    finalInstallmentAmountMinorUnits =
      input.overrideFinalInstallmentAmountMinorUnits > 0
        ? input.overrideFinalInstallmentAmountMinorUnits
        : recommendedPlan.totalTargetAmountMinorUnits -
          baseInstallmentAmountMinorUnits * Math.max(periodCount - 1, 0);

    if (finalInstallmentAmountMinorUnits < 1) {
      errors.push(
        'The chosen installment amount is too high for the current duration. Reduce it or switch to adjustable duration.',
      );
    }

    if (
      baseInstallmentAmountMinorUnits * Math.max(periodCount - 1, 0) +
        finalInstallmentAmountMinorUnits !==
      recommendedPlan.totalTargetAmountMinorUnits
    ) {
      errors.push(
        'Installment amount, final installment, and repayment duration must reconcile with the total target amount.',
      );
    }
  } else {
    if (input.overrideFinalInstallmentAmountMinorUnits > 0) {
      finalInstallmentAmountMinorUnits = input.overrideFinalInstallmentAmountMinorUnits;
      const remainingBalance =
        recommendedPlan.totalTargetAmountMinorUnits - finalInstallmentAmountMinorUnits;

      if (remainingBalance < 0) {
        errors.push('Final installment cannot exceed the total target amount.');
      } else if (remainingBalance % baseInstallmentAmountMinorUnits !== 0) {
        errors.push(
          'Final installment does not reconcile with the overridden installment amount. Adjust one of the values so the contract balances exactly.',
        );
      } else {
        periodCount = remainingBalance / baseInstallmentAmountMinorUnits + 1;
      }
    } else {
      periodCount = Math.ceil(
        recommendedPlan.totalTargetAmountMinorUnits / baseInstallmentAmountMinorUnits,
      );
      finalInstallmentAmountMinorUnits =
        recommendedPlan.totalTargetAmountMinorUnits -
        baseInstallmentAmountMinorUnits * Math.max(periodCount - 1, 0);
    }

    if (periodCount < 1 || periodCount > 400) {
      errors.push('The overridden installment amount produces an unsupported repayment duration.');
    } else {
      const dueDates = addSchedulePeriods(
        input.remittanceStartDate,
        input.remittanceFrequency,
        periodCount,
        input.remittanceFrequency === 'weekly' ? input.remittanceCollectionDay : null,
      );
      contractEndDate = dueDates[dueDates.length - 1] ?? contractEndDate;
    }
  }

  if (errors.length > 0) {
    return { plan: null, errors, overrideDeltaSummary };
  }

  if (baseInstallmentAmountMinorUnits !== recommendedPlan.baseInstallmentAmountMinorUnits) {
    overrideDeltaSummary.push(
      `Recommended installment: ${formatMoneyMinorUnits(
        recommendedPlan.baseInstallmentAmountMinorUnits,
      )} ${recommendedPlan.scheduleSummary.toLowerCase()}`,
    );
    overrideDeltaSummary.push(
      `Final override installment: ${formatMoneyMinorUnits(
        baseInstallmentAmountMinorUnits,
      )} ${recommendedPlan.scheduleSummary.toLowerCase()}`,
    );
  }

  if (periodCount !== recommendedPlan.periodCount) {
    overrideDeltaSummary.push(
      `Contract duration adjusted from ${recommendedPlan.periodCount} to ${periodCount} periods.`,
    );
  }

  if (
    finalInstallmentAmountMinorUnits !== recommendedPlan.finalInstallmentAmountMinorUnits &&
    !overrideDeltaSummary.includes(
      `Final installment set to ${formatMoneyMinorUnits(finalInstallmentAmountMinorUnits)}.`,
    )
  ) {
    overrideDeltaSummary.push(
      `Final installment set to ${formatMoneyMinorUnits(finalInstallmentAmountMinorUnits)}.`,
    );
  }

  if (principalAmountMinorUnits !== recommendedPlan.principalAmountMinorUnits) {
    overrideDeltaSummary.push(
      `Principal adjusted from ${formatMoneyMinorUnits(
        recommendedPlan.principalAmountMinorUnits,
      )} to ${formatMoneyMinorUnits(principalAmountMinorUnits)}.`,
    );
  }

  return {
    plan: {
      ...recommendedPlan,
      principalAmountMinorUnits,
      periodCount,
      contractEndDate,
      baseInstallmentAmountMinorUnits,
      finalInstallmentAmountMinorUnits,
      generatedFromTarget: false,
      durationSummary:
        input.overrideStrategy === 'adjust_duration'
          ? `${periodCount} repayment periods ending on ${formatDateLabel(contractEndDate)}`
          : recommendedPlan.durationSummary,
      sourceSummary:
        input.overrideStrategy === 'adjust_duration'
          ? 'Manual override applied. Duration was recalculated from the chosen installment.'
          : 'Manual override applied while keeping the guided repayment duration.',
    },
    errors,
    overrideDeltaSummary,
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
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createAssignmentAction, initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [fleetId, setFleetId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [paymentModel, setPaymentModel] = useState<
    'remittance' | 'salary' | 'commission' | 'hire_purchase'
  >('remittance');
  const [remittanceFrequency, setRemittanceFrequency] =
    useState<HirePurchaseFrequency>('daily');
  const [remittanceAmountDisplay, setRemittanceAmountDisplay] = useState('');
  const [remittanceStartDate, setRemittanceStartDate] = useState(getTodayIsoDate());
  const [hirePurchaseTargetDisplay, setHirePurchaseTargetDisplay] = useState('');
  const [depositAmountDisplay, setDepositAmountDisplay] = useState('');
  const [hirePurchaseStartDate, setHirePurchaseStartDate] = useState(getTodayIsoDate());
  const [weeklyCollectionDay, setWeeklyCollectionDay] = useState('1');
  const [durationMode, setDurationMode] = useState<HirePurchaseDurationMode>('periods');
  const [hirePurchaseDurationPeriods, setHirePurchaseDurationPeriods] =
    useState(DEFAULT_PERIOD_COUNT);
  const [hirePurchaseContractEndDate, setHirePurchaseContractEndDate] = useState('');
  const [overrideSuggestedCalculations, setOverrideSuggestedCalculations] = useState(false);
  const [overrideStrategy, setOverrideStrategy] =
    useState<HirePurchaseOverrideStrategy>('keep_duration');
  const [overrideInstallmentDisplay, setOverrideInstallmentDisplay] = useState('');
  const [overrideFinalInstallmentDisplay, setOverrideFinalInstallmentDisplay] = useState('');
  const [overridePrincipalDisplay, setOverridePrincipalDisplay] = useState('');
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
  const selectedVehicle = useMemo(
    () => availableVehicles.find((vehicle) => vehicle.id === vehicleId) ?? null,
    [availableVehicles, vehicleId],
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
    if (!state.success) {
      return;
    }

    setDisplaySuccess(state.success);
    formRef.current?.reset();
    setFleetId('');
    setDriverId('');
    setVehicleId('');
    setPaymentModel('remittance');
    setRemittanceFrequency('daily');
    setRemittanceAmountDisplay('');
    setRemittanceStartDate(getTodayIsoDate());
    setHirePurchaseTargetDisplay('');
    setDepositAmountDisplay('');
    setHirePurchaseStartDate(getTodayIsoDate());
    setWeeklyCollectionDay('1');
    setDurationMode('periods');
    setHirePurchaseDurationPeriods(DEFAULT_PERIOD_COUNT);
    setHirePurchaseContractEndDate('');
    setOverrideSuggestedCalculations(false);
    setOverrideStrategy('keep_duration');
    setOverrideInstallmentDisplay('');
    setOverrideFinalInstallmentDisplay('');
    setOverridePrincipalDisplay('');
    router.refresh();

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = setTimeout(() => setDisplaySuccess(null), 4_000);

    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, [router, state.success]);

  const totalTargetAmountMinorUnits = parseMoneyDisplayToMinorUnits(hirePurchaseTargetDisplay);
  const depositAmountMinorUnits = parseMoneyDisplayToMinorUnits(depositAmountDisplay);
  const remittanceAmountMinorUnits = parseMoneyDisplayToMinorUnits(remittanceAmountDisplay);
  const remittanceCollectionDay = Number.parseInt(weeklyCollectionDay, 10) || 1;
  const remittancePreviewSummary = buildRemittancePreviewSummary({
    driver: selectedDriver,
    amountMinorUnits: remittanceAmountMinorUnits,
    frequency: remittanceFrequency,
    startDate: remittanceStartDate,
    collectionDay: remittanceCollectionDay,
  });
  const guidedPlanResult = useMemo(
    () =>
      deriveGuidedHirePurchasePlan({
        totalTargetAmountMinorUnits,
        depositAmountMinorUnits,
        remittanceFrequency,
        remittanceStartDate: hirePurchaseStartDate,
        remittanceCollectionDay,
        durationMode,
        contractDurationPeriodsInput: hirePurchaseDurationPeriods,
        contractEndDateInput: hirePurchaseContractEndDate,
      }),
    [
      depositAmountMinorUnits,
      durationMode,
      hirePurchaseContractEndDate,
      hirePurchaseDurationPeriods,
      hirePurchaseStartDate,
      remittanceCollectionDay,
      remittanceFrequency,
      totalTargetAmountMinorUnits,
    ],
  );
  const finalHirePurchasePlanResult = useMemo(
    () =>
      deriveFinalHirePurchasePlan({
        recommendedPlan: guidedPlanResult.plan,
        overrideEnabled: overrideSuggestedCalculations,
        overrideStrategy,
        overrideInstallmentAmountMinorUnits: parseMoneyDisplayToMinorUnits(overrideInstallmentDisplay),
        overrideFinalInstallmentAmountMinorUnits: parseMoneyDisplayToMinorUnits(
          overrideFinalInstallmentDisplay,
        ),
        overridePrincipalAmountMinorUnits: parseMoneyDisplayToMinorUnits(overridePrincipalDisplay),
        remittanceFrequency,
        remittanceStartDate: hirePurchaseStartDate,
        remittanceCollectionDay,
      }),
    [
      guidedPlanResult.plan,
      hirePurchaseStartDate,
      overrideFinalInstallmentDisplay,
      overrideInstallmentDisplay,
      overridePrincipalDisplay,
      overrideStrategy,
      overrideSuggestedCalculations,
      remittanceCollectionDay,
      remittanceFrequency,
    ],
  );
  const hirePurchaseErrors = [
    ...guidedPlanResult.errors,
    ...finalHirePurchasePlanResult.errors,
  ];
  const finalHirePurchasePlan = finalHirePurchasePlanResult.plan;
  const isCreateBlocked =
    selectableFleets.length === 0 ||
    !fleetId ||
    !driverId ||
    !vehicleId ||
    Boolean(
      selectedDriver &&
        selectedDriver.verificationTierComponents?.includes('drivers_license') &&
        !selectedDriver.hasApprovedLicence,
    ) ||
    (paymentModel === 'hire_purchase' && (!finalHirePurchasePlan || hirePurchaseErrors.length > 0));

  return (
    <TenantSurfaceCard
      contentClassName="space-y-6"
      description="Pair an active driver with an available vehicle."
      title="Create assignment"
    >
      <TenantToolbarPanel className="border-blue-100 bg-blue-50/60 text-sm text-slate-600">
        <span className="font-semibold text-blue-800">Before you start:</span> Both the driver and
        vehicle must be active and available. Only eligible options appear below. Drivers also need
        an approved licence on file.
      </TenantToolbarPanel>

      <form action={formAction} className="space-y-6" ref={formRef}>
        <section className="space-y-4 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-slate-200 bg-white p-5">
          <div className="space-y-1">
            <Text tone="strong">1. Assignment context</Text>
            <Text tone="muted">Choose the driver, vehicle, and payment model for this assignment.</Text>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
              <Text tone="muted">
                {paymentModel === 'salary'
                  ? 'Salary assignments keep the pairing active without transport remittance collection.'
                  : paymentModel === 'commission'
                    ? 'Commission assignments track operations without fixed remittance collection.'
                    : paymentModel === 'hire_purchase'
                      ? 'Hire purchase creates a structured payoff contract with installment tracking.'
                      : 'Remittance tracks recurring collections for transport-style operations.'}
              </Text>
            </div>
          </div>

          <div className="space-y-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/75 p-4">
            <div className="space-y-1">
              <Text tone="strong">Selection confirmation</Text>
              <Text tone="muted">
                Review the chosen driver and vehicle here before you move into payment setup.
              </Text>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Text tone="muted">Selected driver</Text>
                <Text>
                  {selectedDriver
                    ? `${selectedDriver.firstName} ${selectedDriver.lastName}`
                    : 'No driver selected yet'}
                </Text>
                {selectedDriver ? <Text tone="muted">{selectedDriver.phone}</Text> : null}
              </div>
              <div className="space-y-1">
                <Text tone="muted">Selected vehicle</Text>
                <Text>
                  {selectedVehicle
                    ? getVehiclePrimaryLabel(selectedVehicle)
                    : 'No vehicle selected yet'}
                </Text>
                {selectedVehicle?.plate ? <Text tone="muted">{selectedVehicle.plate}</Text> : null}
              </div>
            </div>
            {selectedDriver &&
            selectedDriver.verificationTierComponents?.includes('drivers_license') &&
            !selectedDriver.hasApprovedLicence ? (
              <Text tone="danger">
                This driver cannot be assigned yet because no approved driver licence is on file.
              </Text>
            ) : null}
          </div>
        </section>

        <input
          name="contractType"
          type="hidden"
          value={paymentModel === 'hire_purchase' ? 'hire_purchase' : 'regular_hire'}
        />
        <input
          name="remittanceModel"
          type="hidden"
          value={paymentModel === 'hire_purchase' ? 'hire_purchase' : 'fixed'}
        />

        {paymentModel === 'hire_purchase' ? (
          <>
            <section className="space-y-4 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-slate-200 bg-white p-5">
              <div className="space-y-1">
                <Text tone="strong">2. Key contract inputs</Text>
                <Text tone="muted">
                  Start with the essentials. We&apos;ll generate the repayment structure from these
                  values.
                </Text>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <MoneyInputField
                  helperText="Enter the total asset value or full target amount to be repaid."
                  id="totalTargetAmountMinorUnitsDisplay"
                  label="Total asset value / total target amount"
                  onChange={setHirePurchaseTargetDisplay}
                  required
                  value={hirePurchaseTargetDisplay}
                />
                <MoneyInputField
                  helperText="Optional upfront deposit recognized against the contract."
                  id="depositAmountMinorUnitsDisplay"
                  label="Deposit"
                  onChange={setDepositAmountDisplay}
                  value={depositAmountDisplay}
                />
                <div className="space-y-2">
                  <Label htmlFor="remittanceStartDate">
                    First repayment date
                    <span aria-hidden="true" className="text-red-500">
                      {' '}
                      *
                    </span>
                  </Label>
                  <Input
                    id="remittanceStartDate"
                    name="remittanceStartDate"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setHirePurchaseStartDate(event.target.value)
                    }
                    required
                    type="date"
                    value={hirePurchaseStartDate}
                  />
                  <Text tone="muted">
                    This anchors the repayment schedule and the contract end date.
                  </Text>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remittanceFrequency">Repayment frequency</Label>
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
                    {describeRemittanceSchedule({
                      remittanceFrequency,
                      ...(remittanceFrequency === 'weekly'
                        ? { remittanceCollectionDay }
                        : {}),
                    })}
                  </Text>
                </div>
              </div>

              {remittanceFrequency === 'weekly' ? (
                <div className="space-y-2 md:max-w-sm">
                  <Label htmlFor="remittanceCollectionDay">Weekly collection day</Label>
                  <select
                    className="h-11 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    id="remittanceCollectionDay"
                    name="remittanceCollectionDay"
                    onChange={(event) => setWeeklyCollectionDay(event.target.value)}
                    value={weeklyCollectionDay}
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

              <div className="space-y-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/65 p-4">
                <div className="space-y-1">
                  <Text tone="strong">Repayment duration</Text>
                  <Text tone="muted">
                    Choose one primary duration input. The system will derive the other value clearly.
                  </Text>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                      checked={durationMode === 'periods'}
                      name="hirePurchaseDurationMode"
                      onChange={() => setDurationMode('periods')}
                      type="radio"
                    />
                    Number of periods
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <input
                      checked={durationMode === 'end_date'}
                      name="hirePurchaseDurationMode"
                      onChange={() => setDurationMode('end_date')}
                      type="radio"
                    />
                    Contract end date
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {durationMode === 'periods' ? (
                    <div className="space-y-2">
                      <Label htmlFor="contractDurationPeriods">
                        Repayment periods
                        <span aria-hidden="true" className="text-red-500">
                          {' '}
                          *
                        </span>
                      </Label>
                      <Input
                        id="contractDurationPeriods"
                        inputMode="numeric"
                        min="1"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setHirePurchaseDurationPeriods(event.target.value)
                        }
                        required
                        type="number"
                        value={hirePurchaseDurationPeriods}
                      />
                      <Text tone="muted">
                        Use the number of daily, weekly, or monthly periods the driver should repay across.
                      </Text>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="contractEndDate">
                        Contract end date
                        <span aria-hidden="true" className="text-red-500">
                          {' '}
                          *
                        </span>
                      </Label>
                      <Input
                        id="contractEndDate"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setHirePurchaseContractEndDate(event.target.value)
                        }
                        required
                        type="date"
                        value={hirePurchaseContractEndDate}
                      />
                      <Text tone="muted">
                        We&apos;ll derive the number of periods from this date and the repayment schedule.
                      </Text>
                    </div>
                  )}

                  <div className="space-y-2 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-dashed border-slate-300 bg-white/70 p-4">
                    <Text tone="strong">Derived duration summary</Text>
                    <Text tone="muted">
                      {guidedPlanResult.plan
                        ? guidedPlanResult.plan.durationSummary
                        : durationMode === 'periods'
                          ? 'Enter the number of periods to see the projected contract end date.'
                          : 'Choose an end date to see the projected number of periods.'}
                    </Text>
                  </div>
                </div>
              </div>

              {guidedPlanResult.errors.length > 0 ? (
                <div className="space-y-1 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-rose-200 bg-rose-50/70 px-4 py-3">
                  {guidedPlanResult.errors.map((error) => (
                    <Text key={error} tone="danger">
                      {error}
                    </Text>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="space-y-4 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="space-y-1">
                <Text tone="strong">3. System-generated recommendation</Text>
                <Text tone="muted">
                  This is the recommended hire-purchase structure based on the values above.
                </Text>
              </div>

              {guidedPlanResult.plan ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <Text tone="muted">Recommended principal</Text>
                      <Text>{formatMoneyMinorUnits(guidedPlanResult.plan.principalAmountMinorUnits)}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Recommended installment</Text>
                      <Text>
                        {formatMoneyMinorUnits(
                          guidedPlanResult.plan.baseInstallmentAmountMinorUnits,
                        )}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Final installment</Text>
                      <Text>
                        {formatMoneyMinorUnits(
                          guidedPlanResult.plan.finalInstallmentAmountMinorUnits,
                        )}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Total payable</Text>
                      <Text>
                        {formatMoneyMinorUnits(
                          guidedPlanResult.plan.totalTargetAmountMinorUnits,
                        )}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Repayment periods</Text>
                      <Text>{guidedPlanResult.plan.periodCount}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text tone="muted">Projected end date</Text>
                      <Text>{formatDateLabel(guidedPlanResult.plan.contractEndDate)}</Text>
                    </div>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-200 bg-white/80 px-4 py-3">
                    <Text tone="strong">Schedule summary</Text>
                    <Text tone="muted">
                      {guidedPlanResult.plan.scheduleSummary}. {guidedPlanResult.plan.durationSummary}.
                    </Text>
                  </div>
                </>
              ) : (
                <Text tone="muted">
                  Complete the key contract inputs to generate the recommended repayment structure.
                </Text>
              )}
            </section>

            <section className="space-y-4 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-slate-200 bg-white p-5">
              <div className="space-y-1">
                <Text tone="strong">4. Optional override section</Text>
                <Text tone="muted">
                  Override is off by default. Turn it on only when you need to deliberately adjust the suggested contract.
                </Text>
              </div>

              <label className="inline-flex items-center gap-3 rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-800">
                <input
                  checked={overrideSuggestedCalculations}
                  onChange={(event) => setOverrideSuggestedCalculations(event.target.checked)}
                  type="checkbox"
                />
                Override suggested calculations
              </label>

              {overrideSuggestedCalculations ? (
                <div className="space-y-4 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-amber-200 bg-amber-50/60 p-4">
                  <div className="space-y-1">
                    <Text tone="strong">Override controls</Text>
                    <Text tone="muted">
                      Manual changes are validated before the contract can be created.
                    </Text>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overrideStrategy">Override behavior</Label>
                    <select
                      className="h-11 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      id="overrideStrategy"
                      onChange={(event) =>
                        setOverrideStrategy(
                          event.target.value === 'adjust_duration'
                            ? 'adjust_duration'
                            : 'keep_duration',
                        )
                      }
                      value={overrideStrategy}
                    >
                      <option value="keep_duration">Keep the guided duration</option>
                      <option value="adjust_duration">Let the override adjust duration</option>
                    </select>
                    <Text tone="muted">
                      {overrideStrategy === 'adjust_duration'
                        ? 'Your installment override will recalculate the number of periods and projected contract end date.'
                        : 'Your installment override must still reconcile with the current duration.'}
                    </Text>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <MoneyInputField
                      helperText="Optional principal override for reporting or contract exceptions."
                      id="overridePrincipalAmountMinorUnitsDisplay"
                      label="Principal amount override"
                      onChange={setOverridePrincipalDisplay}
                      value={overridePrincipalDisplay}
                    />
                    <MoneyInputField
                      helperText="Required when override mode is on. This becomes the standard installment for the final contract."
                      id="overrideInstallmentAmountMinorUnitsDisplay"
                      label="Installment amount override"
                      onChange={setOverrideInstallmentDisplay}
                      required
                      value={overrideInstallmentDisplay}
                    />
                    <MoneyInputField
                      helperText="Optional final installment override if the last repayment should differ."
                      id="overrideFinalInstallmentAmountMinorUnitsDisplay"
                      label="Final installment override"
                      onChange={setOverrideFinalInstallmentDisplay}
                      value={overrideFinalInstallmentDisplay}
                    />
                  </div>

                  {finalHirePurchasePlanResult.overrideDeltaSummary.length > 0 ? (
                    <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-amber-200 bg-white/80 px-4 py-3">
                      <Text tone="strong">System recommendation vs final contract</Text>
                      <div className="mt-2 space-y-1">
                        {finalHirePurchasePlanResult.overrideDeltaSummary.map((item) => (
                          <Text key={item} tone="muted">
                            {item}
                          </Text>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {finalHirePurchasePlanResult.errors.length > 0 ? (
                    <div className="space-y-1 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-rose-200 bg-rose-50/70 px-4 py-3">
                      {finalHirePurchasePlanResult.errors.map((error) => (
                        <Text key={error} tone="danger">
                          {error}
                        </Text>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/60 px-4 py-3">
                  <Text tone="muted">
                    The system recommendation will be applied as the final contract.
                  </Text>
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-slate-900 bg-slate-950 p-5 text-white">
              <div className="space-y-1">
                <Text className="text-white" tone="strong">
                  5. Final contract preview
                </Text>
                <Text className="text-slate-300" tone="muted">
                  Review the contract that will be created from the current values.
                </Text>
              </div>

              {finalHirePurchasePlan ? (
                <>
                  <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                    {finalHirePurchasePlan.generatedFromTarget
                      ? 'System-generated contract'
                      : 'Manual override applied'}
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <Text className="text-slate-300" tone="muted">
                        Total asset value
                      </Text>
                      <Text className="text-white">
                        {formatMoneyMinorUnits(finalHirePurchasePlan.totalTargetAmountMinorUnits)}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text className="text-slate-300" tone="muted">
                        Deposit
                      </Text>
                      <Text className="text-white">
                        {formatMoneyMinorUnits(finalHirePurchasePlan.depositAmountMinorUnits)}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text className="text-slate-300" tone="muted">
                        Principal
                      </Text>
                      <Text className="text-white">
                        {formatMoneyMinorUnits(finalHirePurchasePlan.principalAmountMinorUnits)}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text className="text-slate-300" tone="muted">
                        Repayment frequency
                      </Text>
                      <Text className="text-white">{finalHirePurchasePlan.scheduleSummary}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text className="text-slate-300" tone="muted">
                        Installment amount
                      </Text>
                      <Text className="text-white">
                        {formatMoneyMinorUnits(
                          finalHirePurchasePlan.baseInstallmentAmountMinorUnits,
                        )}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text className="text-slate-300" tone="muted">
                        Final installment
                      </Text>
                      <Text className="text-white">
                        {formatMoneyMinorUnits(
                          finalHirePurchasePlan.finalInstallmentAmountMinorUnits,
                        )}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text className="text-slate-300" tone="muted">
                        Number of periods
                      </Text>
                      <Text className="text-white">{finalHirePurchasePlan.periodCount}</Text>
                    </div>
                    <div className="space-y-1">
                      <Text className="text-slate-300" tone="muted">
                        Contract end date
                      </Text>
                      <Text className="text-white">
                        {formatDateLabel(finalHirePurchasePlan.contractEndDate)}
                      </Text>
                    </div>
                    <div className="space-y-1">
                      <Text className="text-slate-300" tone="muted">
                        Total expected repayment
                      </Text>
                      <Text className="text-white">
                        {formatMoneyMinorUnits(finalHirePurchasePlan.totalTargetAmountMinorUnits)}
                      </Text>
                    </div>
                  </div>
                  <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-white/10 bg-white/5 px-4 py-3">
                    <Text className="text-white" tone="strong">
                      Contract source
                    </Text>
                    <Text className="text-slate-300" tone="muted">
                      {finalHirePurchasePlan.sourceSummary}
                    </Text>
                  </div>
                </>
              ) : (
                <Text className="text-slate-300" tone="muted">
                  Complete the contract inputs to see the final preview.
                </Text>
              )}
            </section>

            <input
              name="remittanceCurrency"
              type="hidden"
              value={DEFAULT_CURRENCY}
            />
            <input
              name="totalTargetAmountMinorUnits"
              type="hidden"
              value={finalHirePurchasePlan?.totalTargetAmountMinorUnits ?? 0}
            />
            <input
              name="depositAmountMinorUnits"
              type="hidden"
              value={finalHirePurchasePlan?.depositAmountMinorUnits ?? 0}
            />
            <input
              name="principalAmountMinorUnits"
              type="hidden"
              value={finalHirePurchasePlan?.principalAmountMinorUnits ?? 0}
            />
            <input
              name="contractDurationPeriods"
              type="hidden"
              value={finalHirePurchasePlan?.periodCount ?? 0}
            />
            <input
              name="contractEndDate"
              type="hidden"
              value={finalHirePurchasePlan?.contractEndDate ?? ''}
            />
            <input
              name="remittanceAmountMinorUnits"
              type="hidden"
              value={finalHirePurchasePlan?.baseInstallmentAmountMinorUnits ?? 0}
            />
            <input
              name="finalInstallmentAmountMinorUnits"
              type="hidden"
              value={finalHirePurchasePlan?.finalInstallmentAmountMinorUnits ?? ''}
            />
          </>
        ) : paymentModel === 'remittance' ? (
          <>
            <section className="space-y-4 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-slate-200 bg-white p-5">
              <div className="space-y-1">
                <Text tone="strong">2. Payment setup</Text>
                <Text tone="muted">
                  Set how much the driver should pay, how often payment happens, and when it starts.
                </Text>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="remittanceAmountDisplay">
                    Payment amount
                    <span aria-hidden="true" className="text-red-500">
                      {' '}
                      *
                    </span>
                  </Label>
                  <RemittanceAmountField
                    currency={DEFAULT_CURRENCY}
                    onChange={setRemittanceAmountDisplay}
                    value={remittanceAmountDisplay}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remittanceCurrency">
                    Currency
                    <span aria-hidden="true" className="text-red-500">
                      {' '}
                      *
                    </span>
                  </Label>
                  <Input
                    defaultValue={DEFAULT_CURRENCY}
                    id="remittanceCurrency"
                    maxLength={3}
                    name="remittanceCurrency"
                    placeholder="NGN"
                    required
                  />
                  <Text tone="muted">Use the currency the driver will remit in.</Text>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remittanceFrequency">Payment frequency</Label>
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
                    {describeRemittanceSchedule({
                      remittanceFrequency,
                      ...(remittanceFrequency === 'weekly'
                        ? { remittanceCollectionDay }
                        : {}),
                    })}
                  </Text>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remittanceStartDate">
                    Start date
                    <span aria-hidden="true" className="text-red-500">
                      {' '}
                      *
                    </span>
                  </Label>
                  <Input
                    id="remittanceStartDate"
                    name="remittanceStartDate"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setRemittanceStartDate(event.target.value)
                    }
                    required
                    type="date"
                    value={remittanceStartDate}
                  />
                  <Text tone="muted">This is when the first payment becomes due.</Text>
                </div>
              </div>

              {remittanceFrequency === 'weekly' ? (
                <div className="space-y-2 md:max-w-sm">
                  <Label htmlFor="remittanceCollectionDay">Weekly collection day</Label>
                  <select
                    className="h-11 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    id="remittanceCollectionDay"
                    name="remittanceCollectionDay"
                    onChange={(event) => setWeeklyCollectionDay(event.target.value)}
                    required
                    value={weeklyCollectionDay}
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
            </section>

            <section className="space-y-4 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="space-y-1">
                <Text tone="strong">3. Preview</Text>
                <Text tone="muted">
                  Check the assignment summary below before you create it.
                </Text>
              </div>

              <div className="space-y-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-200 bg-white/85 p-4">
                <Text tone="strong">{remittancePreviewSummary}</Text>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <Text tone="muted">Driver</Text>
                    <Text>{getDriverDisplayName(selectedDriver)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Vehicle</Text>
                    <Text>
                      {selectedVehicle ? getVehiclePrimaryLabel(selectedVehicle) : 'Vehicle not selected'}
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Payment plan</Text>
                    <Text>
                      {remittanceAmountMinorUnits > 0
                        ? `${formatMoneyMinorUnits(remittanceAmountMinorUnits)} ${describeRemittanceSchedule({
                            remittanceFrequency,
                            ...(remittanceFrequency === 'weekly'
                              ? { remittanceCollectionDay }
                              : {}),
                          }).toLowerCase()}`
                        : 'Payment amount not set yet'}
                    </Text>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-slate-200 bg-slate-50 px-5 py-4">
            <Text tone="strong">
              {paymentModel === 'salary' ? 'Salary assignment' : 'Commission assignment'}
            </Text>
            <Text tone="muted">
              This assignment supports onboarding, verification, and fleet operations without
              requiring remittance contract terms.
            </Text>
          </section>
        )}

        <section className="space-y-3 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-slate-200 bg-white p-5">
          <div className="space-y-1">
            <Text tone="strong">
              {paymentModel === 'hire_purchase' ? '6. Notes' : paymentModel === 'remittance' ? '4. Notes' : '3. Notes'}
            </Text>
            <Text tone="muted">Optional context for operators and downstream review.</Text>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Morning dispatch rotation" />
          </div>
        </section>

        <section className="space-y-3 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] border border-slate-200 bg-white p-5">
          <div className="space-y-1">
            <Text tone="strong">
              {paymentModel === 'hire_purchase'
                ? '7. Create action'
                : paymentModel === 'remittance'
                  ? '5. Create action'
                  : '4. Create action'}
            </Text>
            <Text tone="muted">
              Review the contract preview above, then create the assignment.
            </Text>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Text tone="muted">
              {paymentModel === 'hire_purchase'
                ? 'The driver will receive a structured hire-purchase contract based on the final preview.'
                : 'The driver will receive the assignment and can continue from their workflow.'}
            </Text>
            <ActionPendingButtonState
              className={isCreateBlocked ? 'pointer-events-none opacity-55' : undefined}
              label="Assign driver to vehicle"
              pending={isPending}
              pendingLabel="Assigning driver to vehicle"
              type="submit"
            />
          </div>
        </section>
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
        <Text className="mt-4" tone="danger">
          {state.error}
        </Text>
      ) : null}

      {displaySuccess ? (
        <div className="mt-4 space-y-2 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-emerald-200 bg-emerald-50/80 px-4 py-3">
          <Text tone="success">{displaySuccess}</Text>
          {state.assignmentId ? (
            <a
              className="inline-flex text-sm font-medium text-emerald-700 underline"
              href={`/assignments/${state.assignmentId}`}
            >
              Open assignment
            </a>
          ) : null}
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
