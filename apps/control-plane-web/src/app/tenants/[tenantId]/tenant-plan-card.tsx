'use client';

import {
  ActionPendingButtonState,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InlineLoadingState,
  Text,
} from '@mobility-os/ui';
import { useServerActionState } from '../../../lib/use-server-action-state';
import type { PlanRecord, TenantDetailRecord } from '../../../lib/api-control-plane';
import { assignTenantPlanAction, type TenantDetailActionState } from './actions';

const initialState: TenantDetailActionState = {};

export function TenantPlanCard({
  tenant,
  plans,
}: {
  tenant: TenantDetailRecord;
  plans: PlanRecord[];
}) {
  const [state, formAction, pending] = useServerActionState(
    assignTenantPlanAction.bind(null, tenant.id, Boolean(tenant.subscription)),
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan and subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tenant.subscription ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">{tenant.subscription.status}</Badge>
              <Text tone="muted">{tenant.subscription.planName}</Text>
              <Text tone="muted">{tenant.subscription.planTier}</Text>
            </div>
            <Text className="mt-2" tone="muted">
              {new Date(tenant.subscription.currentPeriodStart).toLocaleDateString()} to{' '}
              {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString()}
            </Text>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
            <Text className="font-medium text-amber-950">No subscription attached yet.</Text>
            <Text className="mt-1 text-amber-900/75">
              Assign a plan here instead of leaving the organisation in broken “no tier” posture.
            </Text>
          </div>
        )}

        <form action={formAction} className="space-y-3">
          <select
            className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
            defaultValue={tenant.subscription?.planId ?? ''}
            name="planId"
            required
          >
            <option disabled value="">
              Select plan
            </option>
            {plans
              .filter((plan) => plan.isActive)
              .map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} · {plan.tier} · {plan.currency}
                </option>
              ))}
          </select>
          {!tenant.subscription ? (
            <select
              className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
              defaultValue="trialing"
              name="onboardingMode"
            >
              <option value="trialing">Start as trialing</option>
              <option value="active">Start as active</option>
            </select>
          ) : null}
          {state.error ? <Text tone="danger">{state.error}</Text> : null}
          {state.success ? <Text tone="success">{state.success}</Text> : null}
          {pending ? (
            <InlineLoadingState
              message="Updating the plan posture and refreshing subscription state."
              title="Updating subscription"
              variant="generic_action"
            />
          ) : null}
          <ActionPendingButtonState
            label={tenant.subscription ? 'Change plan' : 'Assign plan'}
            pending={pending}
            pendingLabel={tenant.subscription ? 'Changing plan' : 'Assigning plan'}
          />
        </form>
      </CardContent>
    </Card>
  );
}
