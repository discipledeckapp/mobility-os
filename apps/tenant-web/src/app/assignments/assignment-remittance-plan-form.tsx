'use client';

import { describeRemittanceSchedule } from '@mobility-os/domain-config';
import { useActionState, useState } from 'react';
import { Button, Input, Label, Text } from '@mobility-os/ui';
import {
  type AssignmentRemittancePlanActionState,
  updateAssignmentRemittancePlanAction,
} from './actions';

const initialState: AssignmentRemittancePlanActionState = {};

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
  remittanceAmountMinorUnits,
  remittanceCurrency,
  remittanceFrequency,
  remittanceStartDate,
  remittanceCollectionDay,
}: {
  assignmentId: string;
  remittanceAmountMinorUnits?: number | null;
  remittanceCurrency?: string | null;
  remittanceFrequency?: string | null;
  remittanceStartDate?: string | null;
  remittanceCollectionDay?: number | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateAssignmentRemittancePlanAction,
    initialState,
  );
  const [currency, setCurrency] = useState(remittanceCurrency ?? 'NGN');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(
    remittanceFrequency === 'weekly' ? 'weekly' : 'daily',
  );

  return (
    <form action={formAction} className="space-y-3">
      <input name="assignmentId" type="hidden" value={assignmentId} />

      <div className="space-y-2">
        <Label htmlFor="remittanceAmountDisplay">Expected remittance amount</Label>
        <AmountField currency={currency} initialMinorUnits={remittanceAmountMinorUnits} />
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

      <Button disabled={isPending} type="submit">
        {isPending ? 'Saving...' : 'Update remittance plan'}
      </Button>

      {state.error ? <Text tone="danger">{state.error}</Text> : null}
      {state.success ? <Text tone="success">{state.success}</Text> : null}
    </form>
  );
}
