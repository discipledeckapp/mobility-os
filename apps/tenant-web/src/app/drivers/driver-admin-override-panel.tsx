'use client';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { setDriverAdminOverride } from '../../lib/api-core';

interface Props {
  driverId: string;
  adminAssignmentOverride: boolean;
  allowAdminAssignmentOverride: boolean;
  /** True when fraud flags are active — override cannot be set regardless of settings */
  hasFraudFlag: boolean;
}

export function DriverAdminOverridePanel({
  driverId,
  adminAssignmentOverride,
  allowAdminAssignmentOverride,
  hasFraudFlag,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!allowAdminAssignmentOverride) {
    return null;
  }

  const canEnable = !hasFraudFlag;

  const handleToggle = async () => {
    setError(null);
    setSaving(true);
    try {
      await setDriverAdminOverride(driverId, !adminAssignmentOverride);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update assignment override.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={adminAssignmentOverride ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'}>
      <CardHeader>
        <CardTitle>Admin assignment override</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge tone={adminAssignmentOverride ? 'success' : 'neutral'}>
            {adminAssignmentOverride ? 'Override active' : 'Not overridden'}
          </Badge>
          {hasFraudFlag ? (
            <Badge tone="danger">Blocked — fraud flags present</Badge>
          ) : null}
        </div>
        <Text tone="muted">
          {adminAssignmentOverride
            ? 'This driver is marked as eligible for assignment regardless of incomplete readiness checks. This override is not applied if fraud flags become active.'
            : 'Enable to allow this driver to be assigned even when standard readiness checks (e.g. liveness not completed) are still outstanding. Blocked automatically if fraud flags are present.'}
        </Text>
        {error ? <Text tone="danger">{error}</Text> : null}
        <Button
          disabled={saving || (!adminAssignmentOverride && !canEnable)}
          onClick={handleToggle}
          size="sm"
          variant={adminAssignmentOverride ? 'destructive' : 'default'}
        >
          {saving
            ? 'Saving…'
            : adminAssignmentOverride
              ? 'Clear override'
              : 'Mark as ready for assignment'}
        </Button>
      </CardContent>
    </Card>
  );
}
