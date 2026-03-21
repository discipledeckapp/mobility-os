'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';

export default function AssignmentsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <TenantAppShell
      description="Pair drivers and vehicles, then track assignment completion and cancellation."
      eyebrow="Operations"
      title="Assignments"
    >
      <Card>
        <CardHeader>
          <CardTitle>Unable to load assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Text>{error.message}</Text>
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}
