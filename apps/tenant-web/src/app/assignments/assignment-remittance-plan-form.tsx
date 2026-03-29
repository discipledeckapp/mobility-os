'use client';

import { describeRemittanceSchedule } from '@mobility-os/domain-config';
import { useActionState, useState } from 'react';
import { Button, Input, Label, Text } from '@mobility-os/ui';
import {
  type AssignmentRemittancePlanActionState,
  updateAssignmentRemittancePlanAction,
} from './actions';

const initialState: AssignmentRemittancePlanActionState = {};

function MinorCurrencyField({
  id,
  name,
  currency,
  initialMinorUnits,
  label,
}: {
  id: string;
  name: string;
  currency: string;
  initialMinorUnits?: number | null;
  label: string;
}) {
  const [display, setDisplay] = useState(
    initialMinorUnits ? (initialMinorUnits / 100).toFixed(2) : '',
  );
  const minorUnits = Math.round((parseFloat(display.replace(/,/g, '')) || 0) * 100);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="decimal"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDisplay(event.target.value)}
        placeholder="2,500.00"
        value={display}
      />
      <input name={name} type="hidden" value={minorUnits} />
      <Text tone="muted">
        {minorUnits > 0
          ? new Intl.NumberFormat('en-NG', {
              style: 'currency',
              currency,
              minimumFractionDigits: 2,
            }).format(minorUnits / 100)
          : 'Leave empty when this amount is not part of the contract.'}
      </Text>
    </div>
  );
}

function AmountField({
  currency,
  initialMinorUnits,
}: {
  currency: string;
  initialMinorUnits?: number | null;
}) {
  const [display, setDisplay] = useState(
    initialMinorUnits ? (initialMinorUnits / 100).toFixed(2) : '',
  );
  const majorUnits = parseFloat(display.replace(/,/g, '')) || 0;
  const minorUnits = Math.round(majorUnits * 100);
  const formatted =
    majorUnits > 0
      ? new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: currency || 'NGN',
          minimumFractionDigits: 2,
        }).format(majorUnits)
      : null;

  return (
    <div className="space-y-1.5">
      <Input
        id="remittanceAmountDisplay"
        inputMode="decimal"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplay(e.target.value)}
        placeholder="2,500.00"
        required
        value={display}
      />
      <input name="remittanceAmountMinorUnits" type="hidden" value={minorUnits} />
      {formatted ? (
        <Text tone="muted">{formatted} = {minorUnits.toLocaleString()} minor units</Text>
      ) : (
        <Text tone="muted">Enter in major units, e.g. 2500 for ₦2,500.</Text>
      )}
    </div>
  );
}

export function AssignmentRemittancePlanForm({
  assignmentId,
  contractType,
  remittanceAmountMinorUnits,
  remittanceCurrency,
  remittanceFrequency,
  remittanceStartDate,
  remittanceCollectionDay,
  principalAmountMinorUnits,
  totalTargetAmountMinorUnits,
  depositAmountMinorUnits,
  contractDurationPeriods,
  contractEndDate,
}: {
  assignmentId: string;
  contractType?: 'regular_hire' | 'hire_purchase';
  remittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  remittanceFrequency?: string | null;
  remittanceStartDate?: string | null;
  remittanceCollectionDay?: number | null;
  principalAmountMinorUnits?: number | null;
  totalTargetAmountMinorUnits?: number | null;
  depositAmountMinorUnits?: number | null;
  contractDurationPeriods?: number | null;
  contractEndDate?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateAssignmentRemittancePlanAction,
    initialState,
  );
  const [currency, setCurrency] = useState(remittanceCurrency ?? 'NGN');
  const [nextContractType, setNextContractType] = useState<'regular_hire' | 'hire_purchase'>(
    contractType === 'hire_purchase' ? 'hire_purchase' : 'regular_hire',
  );
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(
    remittanceFrequency === 'weekly'
      ? 'weekly'
      : remittanceFrequency === 'monthly'
        ? 'monthly'
        : 'daily',
  );

  return (
    <form action={formAction} className="space-y-3">
      <input name="assignmentId" type="hidden" value={assignmentId} />
      <div className="space-y-2">
        <Label htmlFor="contractType">Financial model</Label>
        <select
          className="h-11 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm text-slate-900"
          id="contractType"
          name="contractType"
          onChange={(event) =>
            setNextContractType(event.target.value === 'hire_purchase' ? 'hire_purchase' : 'regular_hire')
          }
          value={nextContractType}
        >
          <option value="regular_hire">Regular hire</option>
          <option value="hire_purchase">Hire purchase</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remittanceAmountDisplay">
          {nextContractType === 'hire_purchase' ? 'Expected installment amount' : 'Expected remittance amount'}
        </Label>
        <AmountField
          currency={currency}
          {...(remittanceAmountMinorUnits !== undefined
            ? { initialMinorUnits: remittanceAmountMinorUnits }
            : {})}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remittanceCurrency">Currency</Label>
        <Input
          id="remittanceCurrency"
          maxLength={3}
          name="remittanceCurrency"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCurrency(e.target.value.toUpperCase())
          }
          required
          value={currency}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remittanceFrequency">Schedule</Label>
        <select
          className="h-11 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm text-slate-900"
          id="remittanceFrequency"
          name="remittanceFrequency"
          onChange={(event) =>
            setFrequency(event.target.value === 'weekly' ? 'weekly' : 'daily')
          }
          value={frequency}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <Text tone="muted">
          {describeRemittanceSchedule({
            remittanceFrequency: frequency,
            ...(frequency === 'weekly'
              ? { remittanceCollectionDay: remittanceCollectionDay ?? 1 }
              : {}),
          })}
        </Text>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remittanceStartDate">First due date</Label>
        <Input
          defaultValue={remittanceStartDate ?? ''}
          id="remittanceStartDate"
          name="remittanceStartDate"
          required
          type="date"
        />
      </div>

      {frequency === 'weekly' ? (
        <div className="space-y-2">
          <Label htmlFor="remittanceCollectionDay">Weekly collection day</Label>
          <select
            className="h-11 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 text-sm text-slate-900"
            defaultValue={String(remittanceCollectionDay ?? 1)}
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

      {nextContractType === 'hire_purchase' ? (
        <>
          <div className="space-y-2">
            <MinorCurrencyField
              currency={currency}
              id="totalTargetAmountMinorUnitsDisplay"
              label="Total target amount"
              name="totalTargetAmountMinorUnits"
              {...(totalTargetAmountMinorUnits !== undefined
                ? { initialMinorUnits: totalTargetAmountMinorUnits }
                : {})}
            />
          </div>
          <div className="space-y-2">
            <MinorCurrencyField
              currency={currency}
              id="principalAmountMinorUnitsDisplay"
              label="Principal amount"
              name="principalAmountMinorUnits"
              {...(principalAmountMinorUnits !== undefined
                ? { initialMinorUnits: principalAmountMinorUnits }
                : {})}
            />
          </div>
          <div className="space-y-2">
            <MinorCurrencyField
              currency={currency}
              id="depositAmountMinorUnitsDisplay"
              label="Deposit amount"
              name="depositAmountMinorUnits"
              {...(depositAmountMinorUnits !== undefined
                ? { initialMinorUnits: depositAmountMinorUnits }
                : {})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractDurationPeriods">Repayment periods</Label>
            <Input
              defaultValue={contractDurationPeriods ? String(contractDurationPeriods) : ''}
              id="contractDurationPeriods"
              inputMode="numeric"
              name="contractDurationPeriods"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractEndDate">Contract end date</Label>
            <Input defaultValue={contractEndDate ?? ''} id="contractEndDate" name="contractEndDate" type="date" />
          </div>
        </>
      ) : null}

      <Button disabled={isPending} type="submit">
        {isPending ? 'Saving...' : 'Update remittance plan'}
      </Button>

      {state.error ? <Text tone="danger">{state.error}</Text> : null}
      {state.success ? <Text tone="success">{state.success}</Text> : null}
    </form>
  );
}
