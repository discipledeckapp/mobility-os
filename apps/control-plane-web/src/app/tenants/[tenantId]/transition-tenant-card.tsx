'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Text } from '@mobility-os/ui';
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
          <Button disabled={pending} type="submit">
            {pending ? 'Applying…' : 'Apply transition'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
