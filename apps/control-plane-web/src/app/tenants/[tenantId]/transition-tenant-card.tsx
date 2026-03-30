'use client';

import {
  ActionPendingButtonState,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InlineLoadingState,
  Input,
  Text,
} from '@mobility-os/ui';
import { useServerActionState } from '../../../lib/use-server-action-state';
import { type TenantDetailActionState, transitionTenantAction } from './actions';

const initialState: TenantDetailActionState = {};

const ALLOWED_TRANSITIONS: Record<string, Array<{ value: string; label: string }>> = {
  trialing: [
    { value: 'onboarded', label: 'Mark onboarded' },
    { value: 'active', label: 'Activate' },
    { value: 'past_due', label: 'Mark past due' },
    { value: 'canceled', label: 'Cancel' },
  ],
  prospect: [
    { value: 'onboarded', label: 'Mark onboarded' },
    { value: 'active', label: 'Activate' },
    { value: 'canceled', label: 'Cancel' },
  ],
  onboarded: [
    { value: 'active', label: 'Activate' },
    { value: 'past_due', label: 'Mark past due' },
    { value: 'canceled', label: 'Cancel' },
  ],
  active: [
    { value: 'past_due', label: 'Mark past due' },
    { value: 'grace_period', label: 'Move to grace period' },
    { value: 'suspended', label: 'Suspend' },
    { value: 'terminated', label: 'Terminate' },
    { value: 'canceled', label: 'Cancel' },
  ],
  past_due: [
    { value: 'active', label: 'Reactivate' },
    { value: 'grace_period', label: 'Move to grace period' },
    { value: 'suspended', label: 'Suspend' },
    { value: 'terminated', label: 'Terminate' },
    { value: 'canceled', label: 'Cancel' },
  ],
  grace_period: [
    { value: 'active', label: 'Reactivate' },
    { value: 'past_due', label: 'Mark past due' },
    { value: 'suspended', label: 'Suspend' },
    { value: 'terminated', label: 'Terminate' },
  ],
  suspended: [
    { value: 'active', label: 'Reactivate' },
    { value: 'terminated', label: 'Terminate' },
    { value: 'archived', label: 'Archive' },
  ],
  terminated: [{ value: 'archived', label: 'Archive' }],
  canceled: [{ value: 'archived', label: 'Archive' }],
  archived: [],
};

export function TransitionTenantCard({
  tenantId,
  currentStatus,
}: {
  tenantId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useServerActionState(
    transitionTenantAction.bind(null, tenantId),
    initialState,
  );
  const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Text tone="muted">Current state</Text>
          <Badge tone="neutral">{currentStatus}</Badge>
        </div>
        <form
          action={formAction}
          className="space-y-3"
          onSubmit={(event) => {
            const formData = new FormData(event.currentTarget);
            const toStatus = String(formData.get('toStatus') ?? '');
            if (!toStatus) {
              return;
            }
            const confirmed = window.confirm(
              `Move organisation '${tenantId}' from '${currentStatus}' to '${toStatus}'?`,
            );
            if (!confirmed) {
              event.preventDefault();
            }
          }}
        >
          <select
            className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
            defaultValue=""
            name="toStatus"
            required
          >
            <option disabled value="">
              Select transition
            </option>
            {allowedTransitions.map((transition) => (
              <option key={transition.value} value={transition.value}>
                {transition.label}
              </option>
            ))}
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
