'use client';

import {
  ActionPendingButtonState,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  InlineLoadingState,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
  Text,
} from '@mobility-os/ui';
import { useMemo, useState, useTransition } from 'react';
import {
  ControlPlaneEmptyStateCard,
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
  ControlPlaneSectionShell,
  ControlPlaneToolbarPanel,
} from '../../features/shared/control-plane-page-patterns';
import type { FeatureFlagRecord, TenantListItemRecord } from '../../lib/api-control-plane';
import { useServerActionState } from '../../lib/use-server-action-state';
import {
  type FeatureFlagActionState,
  createFeatureFlagOverrideAction,
  removeFeatureFlagOverrideAction,
  toggleFeatureFlagAction,
} from './actions';

const initialState: FeatureFlagActionState = {};

function OverrideModal({
  flagKey,
  tenants,
  onClose,
}: {
  flagKey: string;
  tenants: TenantListItemRecord[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useServerActionState(
    createFeatureFlagOverrideAction.bind(null, flagKey),
    initialState,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create override</CardTitle>
          <CardDescription>
            Scope this feature flag to a tenant, plan tier, or country.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <select
              className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
              defaultValue=""
              name="tenantId"
            >
              <option value="">No tenant scope</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
              defaultValue=""
              name="planTier"
            >
              <option value="">No plan scope</option>
              <option value="starter">starter</option>
              <option value="growth">growth</option>
              <option value="enterprise">enterprise</option>
            </select>
            <input
              className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
              name="countryCode"
              placeholder="Country code, for example NG"
            />
            <select
              className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
              defaultValue="true"
              name="isEnabled"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            {state.error ? <Text tone="danger">{state.error}</Text> : null}
            {state.success ? <Text tone="success">{state.success}</Text> : null}
            {pending ? (
              <InlineLoadingState
                message="Saving the scoped override and refreshing the feature flag posture."
                title="Saving override"
                variant="generic_action"
              />
            ) : null}
            <div className="flex gap-3">
              <ActionPendingButtonState
                label="Save override"
                pending={pending}
                pendingLabel="Saving override"
              />
              <Button onClick={onClose} type="button" variant="secondary">
                Close
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function FeatureFlagsPanel({
  flags,
  tenants,
}: {
  flags: FeatureFlagRecord[];
  tenants: TenantListItemRecord[];
}) {
  const [activeFlagKey, setActiveFlagKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState('');

  const filteredFlags = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) {
      return flags;
    }

    return flags.filter((flag) => {
      const haystack = `${flag.key} ${flag.description ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [filter, flags]);

  const enabledFlags = flags.filter((flag) => flag.isEnabled).length;
  const overrideCount = flags.reduce((sum, flag) => sum + flag.overrides.length, 0);
  const tenantScopedCount = flags.reduce(
    (sum, flag) => sum + flag.overrides.filter((override) => Boolean(override.tenantId)).length,
    0,
  );

  return (
    <>
      <div className="space-y-6">
        <ControlPlaneHeroPanel
          badges={[
            { label: `${enabledFlags} enabled`, tone: enabledFlags ? 'success' : 'neutral' },
            { label: `${overrideCount} overrides`, tone: overrideCount ? 'warning' : 'neutral' },
            { label: `${tenantScopedCount} tenant-scoped`, tone: tenantScopedCount ? 'warning' : 'neutral' },
          ]}
          description="Feature flags are rollout controls, not decoration. Use this registry to understand what is globally enabled, what is tenant-specific, and where rollout posture is being overridden."
          eyebrow="Rollout governance"
          title="Control feature rollout by global default, plan tier, country, and tenant."
        />

        <ControlPlaneMetricGrid columns={3}>
          <ControlPlaneMetricCard label="Flags configured" value={flags.length} />
          <ControlPlaneMetricCard label="Globally enabled" tone={enabledFlags ? 'success' : 'neutral'} value={enabledFlags} />
          <ControlPlaneMetricCard label="Scoped overrides" tone={overrideCount ? 'warning' : 'neutral'} value={overrideCount} />
        </ControlPlaneMetricGrid>

        {error ? <Text tone="danger">{error}</Text> : null}
        {feedback ? <Text tone="success">{feedback}</Text> : null}
        {pending ? (
          <InlineLoadingState
            message="Applying the latest control-plane change and refreshing the registry."
            title="Updating feature posture"
            variant="generic_action"
          />
        ) : null}

        <ControlPlaneSectionShell
          description="Review global posture, toggle a flag, and add tenant-scoped overrides without leaving the page."
          title="Flag registry"
        >
          <ControlPlaneToolbarPanel>
            <input
              className="w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Search flag key or description"
              value={filter}
            />
          </ControlPlaneToolbarPanel>

          <div className="mt-4">
            {filteredFlags.length === 0 ? (
              <ControlPlaneEmptyStateCard
                description="No feature flags match the current filter."
                title="No flags in this slice"
              />
            ) : (
              <TableViewport>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flag</TableHead>
                      <TableHead>Global posture</TableHead>
                      <TableHead>Overrides</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlags.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{flag.key}</p>
                            <p className="text-sm text-slate-500">
                              {flag.description ?? 'No operator description has been documented yet.'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone={flag.isEnabled ? 'success' : 'warning'}>
                            {flag.isEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-y-2">
                          <p className="text-sm text-slate-600">{flag.overrides.length}</p>
                          <div className="space-y-1">
                            {flag.overrides.slice(0, 3).map((override) => (
                              <div
                                className="flex items-center gap-2 text-xs text-slate-500"
                                key={override.id}
                              >
                                <span>
                                  {override.tenantId ??
                                    override.planTier ??
                                    override.countryCode ??
                                    'Scoped'}
                                </span>
                                <button
                                  className="text-[var(--mobiris-primary)]"
                                  onClick={() => {
                                    startTransition(() => {
                                      void removeFeatureFlagOverrideAction(override.id).then(
                                        (result) => {
                                          setError(result.error ?? null);
                                          setFeedback(result.success ?? null);
                                        },
                                      );
                                    });
                                  }}
                                  type="button"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {flag.expiresAt ? new Date(flag.expiresAt).toLocaleString() : 'No expiry'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              disabled={pending}
                              onClick={() => {
                                startTransition(() => {
                                  void toggleFeatureFlagAction(flag.key, !flag.isEnabled).then(
                                    (result) => {
                                      setError(result.error ?? null);
                                      setFeedback(result.success ?? null);
                                    },
                                  );
                                });
                              }}
                              type="button"
                              variant="secondary"
                            >
                              {flag.isEnabled ? 'Disable' : 'Enable'}
                            </Button>
                            <Button onClick={() => setActiveFlagKey(flag.key)} type="button">
                              Add override
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableViewport>
            )}
          </div>
        </ControlPlaneSectionShell>
      </div>

      {activeFlagKey ? (
        <OverrideModal
          flagKey={activeFlagKey}
          onClose={() => setActiveFlagKey(null)}
          tenants={tenants}
        />
      ) : null}
    </>
  );
}
