'use client';

import {
  ActionPendingButtonState,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InlineLoadingState,
  Input,
  Text,
} from '@mobility-os/ui';
import { useActionState } from 'react';
import { type TenantDetailActionState, transitionTenantAction } from './actions';

const initialState: TenantDetailActionState = {};

export function TransitionTenantCard({ tenantId }: { tenantId: string }) {
  const [state, formAction, pending] = useActionState(
    transitionTenantAction.bind(null, tenantId),
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle controls</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-3">
          <select
            className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
            defaultValue=""
            name="toStatus"
            required
          >
            <option disabled value="">
              Select transition
            </option>
            <option value="active">Activate</option>
            <option value="suspended">Suspend</option>
            <option value="terminated">Terminate</option>
          </select>
          <Input name="reason" placeholder="Reason (optional)" />
          {state.error ? <Text tone="danger">{state.error}</Text> : null}
          {state.success ? <Text tone="success">{state.success}</Text> : null}
          {pending ? (
            <InlineLoadingState
              message="Applying the lifecycle transition and updating tenant status across control-plane records."
              title="Applying transition"
              variant="generic_action"
            />
          ) : null}
          <ActionPendingButtonState
            label="Apply transition"
            pending={pending}
            pendingLabel="Applying transition"
          />
        </form>
      </CardContent>
    </Card>
  );
}
