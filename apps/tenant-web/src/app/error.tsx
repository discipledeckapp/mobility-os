'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../features/shared/tenant-app-shell';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <TenantAppShell
      description="Fleet and driver operations."
      eyebrow="Operations"
      title="Dashboard"
    >
      <Card>
        <CardHeader>
          <CardTitle>Unable to load dashboard</CardTitle>
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
