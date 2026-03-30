'use client';

import { Button, Input, Label, Text } from '@mobility-os/ui';
import { type FormEvent } from 'react';
import { SelectField } from '../../features/shared/select-field';
import { useServerActionState } from '../../lib/use-server-action-state';
import { type TransitionLifecycleActionState, transitionTenantLifecycleAction } from './actions';

const initialState: TransitionLifecycleActionState = {};

const lifecycleStatuses = [
  'prospect',
  'onboarded',
  'active',
  'past_due',
  'grace_period',
  'suspended',
  'terminated',
  'archived',
  'canceled',
] as const;

export function TransitionLifecycleForm({ tenantId }: { tenantId: string }) {
  const [state, formAction, isPending] = useServerActionState(
    transitionTenantLifecycleAction,
    initialState,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const toStatus = formData.get('toStatus');

    if (
      typeof window !== 'undefined' &&
      typeof toStatus === 'string' &&
      !window.confirm(
        `Move organisation '${tenantId}' to '${toStatus}'? This lifecycle transition will be recorded in the control plane audit trail.`,
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} className="space-y-3" onSubmit={handleSubmit}>
      <input name="tenantId" type="hidden" value={tenantId} />
      <div className="space-y-2">
        <Label htmlFor={`toStatus-${tenantId}`}>Transition to</Label>
        <SelectField defaultValue="" id={`toStatus-${tenantId}`} name="toStatus" required>
          <option disabled value="">
            Select status
          </option>
          {lifecycleStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`reason-${tenantId}`}>Reason</Label>
        <Input
          id={`reason-${tenantId}`}
          name="reason"
          placeholder="Why is this lifecycle change needed?"
          type="text"
        />
      </div>
      <Text className="text-xs leading-5 text-slate-500">
        Lifecycle changes affect organisation service posture and are recorded as governed platform
        events.
      </Text>
      <Button disabled={isPending} size="sm" type="submit" variant="secondary">
        {isPending ? 'Updating...' : 'Update lifecycle'}
      </Button>
      {state.error ? <Text className="text-rose-700">{state.error}</Text> : null}
      {state.success ? <Text className="text-emerald-700">{state.success}</Text> : null}
    </form>
  );
}
