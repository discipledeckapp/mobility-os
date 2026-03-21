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

export default function DriversError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <TenantAppShell
      description="Search and manage the organisation driver registry, then drill into each driver record for verification, review, assignment, and remittance context."
      eyebrow="Operators"
      title="Drivers"
    >
      <Card>
        <CardHeader>
          <CardTitle>Unable to load drivers</CardTitle>
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
