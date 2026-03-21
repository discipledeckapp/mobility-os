import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { TenantAppShell } from '../../../../features/shared/tenant-app-shell';
import { getDriver, getTenantMe } from '../../../../lib/api-core';
import {
  getDriverIdentityLabel,
  getDriverIdentityTone,
} from '../../../../lib/driver-identity';
import { getFormattingLocale } from '../../../../lib/locale';

function formatDate(value?: string | null, locale = 'en-US'): string {
  if (!value) return 'Not recorded';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(date);
}

export default async function DriverReviewPage({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await params;
  const [driver, tenant] = await Promise.all([
    getDriver(driverId),
    getTenantMe().catch(() => null),
  ]);
  const locale = getFormattingLocale(tenant?.country);
  const identityTone = getDriverIdentityTone(driver.identityStatus);
  const identityLabel = getDriverIdentityLabel(driver.identityStatus);

  return (
    <TenantAppShell
      description="Manual review guidance for blocked driver identity cases."
      eyebrow="Operators"
      title="Driver review"
    >
      <Card>
        <CardHeader>
          <CardTitle>{`${driver.firstName} ${driver.lastName}`}</CardTitle>
          <CardDescription>Review guidance for a driver who needs manual identity review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={identityTone}>{identityLabel}</Badge>
            {driver.identityReviewCaseId ? (
              <Badge tone="warning">Case {driver.identityReviewCaseId}</Badge>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Text tone="muted">Recorded review status</Text>
              <Text>{driver.identityReviewStatus ?? 'No review case is attached.'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Last decision</Text>
              <Text>{driver.identityLastDecision ?? 'No decision recorded yet'}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Last verification update</Text>
              <Text>{formatDate(driver.identityLastVerifiedAt, locale)}</Text>
            </div>
            <div className="space-y-1">
              <Text tone="muted">Confidence</Text>
              <Text>{driver.identityVerificationConfidence ?? 'Not provided'}</Text>
            </div>
          </div>

          <div className="space-y-2">
            <Text tone="strong">Why this driver is blocked</Text>
            <Text>
              Identity resolution returned a manual-review outcome, so this driver
              should not be treated as verified or ready for activation yet.
            </Text>
          </div>

          <div className="space-y-2">
            <Text tone="strong">What the operator should do next</Text>
            <Text>
              Confirm the submitted identifier and selfie are correct, collect any
              missing identity evidence from the driver, and escalate the case to the
              review team with the case reference above.
            </Text>
            <Text tone="muted">
              Use this page to understand what blocked the driver and what evidence to gather next.
            </Text>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/drivers/${driver.id}`}>
              <Button variant="secondary">View driver details</Button>
            </Link>
            <Link href="/drivers">
              <Button variant="ghost">Back to drivers</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}
