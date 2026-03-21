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

export default function RemittanceError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <TenantAppShell
      description="Daily collections recording and reconciliation for transport operators."
      eyebrow="Collections"
      title="Remittance"
    >
      <Card>
        <CardHeader>
          <CardTitle>Unable to load remittance</CardTitle>
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
