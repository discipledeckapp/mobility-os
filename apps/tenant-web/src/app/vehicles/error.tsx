'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';

export default function VehiclesError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <TenantAppShell
      description="Search and manage the organisation vehicle registry, then drill into each asset for identification, valuation, assignment, and VIN context."
      eyebrow="Assets"
      title="Vehicles"
    >
      <Card>
        <CardHeader>
          <CardTitle>Unable to load the vehicle registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Text tone="danger">The vehicle registry could not be loaded right now.</Text>
          <Text tone="muted">{error.message}</Text>
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}
