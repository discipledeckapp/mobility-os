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
import { useActionState, useState, useTransition } from 'react';
import type { FeatureFlagRecord, TenantListItemRecord } from '../../lib/api-control-plane';
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
  const [state, formAction, pending] = useActionState(
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

  const enabledFlags = flags.filter((flag) => flag.isEnabled).length;
  const overrideCount = flags.reduce((sum, flag) => sum + flag.overrides.length, 0);

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Flags configured</CardDescription>
              <CardTitle>{flags.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Globally enabled</CardDescription>
              <CardTitle>{enabledFlags}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Scoped overrides</CardDescription>
              <CardTitle>{overrideCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {error ? <Text tone="danger">{error}</Text> : null}
        {feedback ? <Text tone="success">{feedback}</Text> : null}
        {pending ? (
          <InlineLoadingState
            message="Applying the latest control-plane change and refreshing the registry."
            title="Updating feature posture"
            variant="generic_action"
          />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Flag registry</CardTitle>
            <CardDescription>
              Review global posture, toggle a flag, and add tenant-scoped overrides without leaving
              the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {flags.map((flag) => (
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
                                  startTransition(async () => {
                                    const result = await removeFeatureFlagOverrideAction(
                                      override.id,
                                    );
                                    setError(result.error ?? null);
                                    setFeedback(result.success ?? null);
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
                              startTransition(async () => {
                                const result = await toggleFeatureFlagAction(
                                  flag.key,
                                  !flag.isEnabled,
                                );
                                setError(result.error ?? null);
                                setFeedback(result.success ?? null);
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
          </CardContent>
        </Card>
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
