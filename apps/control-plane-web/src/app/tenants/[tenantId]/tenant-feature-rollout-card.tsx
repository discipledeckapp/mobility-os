'use client';

import {
  ActionPendingButtonState,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InlineLoadingState,
  Text,
} from '@mobility-os/ui';
import { useActionState, useState, useTransition } from 'react';
import {
  addTenantFeatureOverrideAction,
  removeTenantFeatureOverrideAction,
  type TenantDetailActionState,
} from './actions';

const initialState: TenantDetailActionState = {};

export function TenantFeatureRolloutCard({
  tenantId,
  effectiveFlags,
}: {
  tenantId: string;
  effectiveFlags: Array<{
    key: string;
    description?: string | null;
    effectiveEnabled: boolean;
    source: 'tenant_override' | 'plan_default' | 'country_default' | 'global_default';
    tenantOverrideId?: string;
  }>;
}) {
  const [state, formAction, pending] = useActionState(
    addTenantFeatureOverrideAction.bind(null, tenantId),
    initialState,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removing, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature rollout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-3">
          <select
            className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
            defaultValue=""
            name="flagKey"
            required
          >
            <option disabled value="">
              Select feature flag
            </option>
            {effectiveFlags.map((flag) => (
              <option key={flag.key} value={flag.key}>
                {flag.key}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
            defaultValue="true"
            name="isEnabled"
          >
            <option value="true">Enable for tenant</option>
            <option value="false">Disable for tenant</option>
          </select>
          {state.error ? <Text tone="danger">{state.error}</Text> : null}
          {state.success ? <Text tone="success">{state.success}</Text> : null}
          {pending ? (
            <InlineLoadingState
              message="Saving the tenant-specific rollout override and refreshing effective posture."
              title="Saving override"
              variant="generic_action"
            />
          ) : null}
          <ActionPendingButtonState
            label="Save tenant override"
            pending={pending}
            pendingLabel="Saving override"
            variant="secondary"
          />
        </form>

        {error ? <Text tone="danger">{error}</Text> : null}
        {feedback ? <Text tone="success">{feedback}</Text> : null}
        {removing ? (
          <InlineLoadingState
            message="Removing the tenant-scoped override and recalculating the effective flag posture."
            title="Removing override"
            variant="generic_action"
          />
        ) : null}

        <div className="space-y-3">
          {effectiveFlags.map((flag) => (
            <div className="rounded-2xl border border-slate-200 px-4 py-3" key={flag.key}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{flag.key}</p>
                  <Text tone="muted">
                    {flag.description ?? 'No operator description has been documented yet.'}
                  </Text>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={flag.effectiveEnabled ? 'success' : 'warning'}>
                    {flag.effectiveEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Badge tone="neutral">{flag.source.replaceAll('_', ' ')}</Badge>
                  {flag.tenantOverrideId ? (
                    <Button
                      onClick={() => {
                        startTransition(async () => {
                          const result = await removeTenantFeatureOverrideAction(
                            tenantId,
                            flag.tenantOverrideId ?? '',
                          );
                          setError(result.error ?? null);
                          setFeedback(result.success ?? null);
                        });
                      }}
                      type="button"
                      variant="secondary"
                    >
                      Remove override
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
