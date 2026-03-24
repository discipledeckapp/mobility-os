'use client';

import { describeRemittanceSchedule } from '@mobility-os/domain-config';
import { useActionState, useState } from 'react';
import { Button, Input, Label, Text } from '@mobility-os/ui';
import {
  type AssignmentRemittancePlanActionState,
  updateAssignmentRemittancePlanAction,
} from './actions';

const initialState: AssignmentRemittancePlanActionState = {};

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
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(
    remittanceFrequency === 'weekly' ? 'weekly' : 'daily',
  );

  return (
    <form action={formAction} className="space-y-3">
      <input name="assignmentId" type="hidden" value={assignmentId} />

      <div className="space-y-2">
        <Label htmlFor="remittanceAmountMinorUnits">Expected amount (minor units)</Label>
        <Input
          defaultValue={String(remittanceAmountMinorUnits ?? '')}
          id="remittanceAmountMinorUnits"
          min="1"
          name="remittanceAmountMinorUnits"
          required
          step="1"
          type="number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remittanceCurrency">Currency</Label>
        <Input
          defaultValue={remittanceCurrency ?? 'NGN'}
          id="remittanceCurrency"
          maxLength={3}
          name="remittanceCurrency"
          required
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
