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
import Link from 'next/link';
import { TenantAppShell } from '../../../../features/shared/tenant-app-shell';
import { getDriver, getTenantMe } from '../../../../lib/api-core';
import { getDriverIdentityLabel, getDriverIdentityTone } from '../../../../lib/driver-identity';
import { getFormattingLocale } from '../../../../lib/locale';
import { DriverLicenceReviewPanel } from '../../driver-licence-review-panel';

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
  const licenceVerification = driver.driverLicenceVerification ?? null;

  return (
    <TenantAppShell
      description="Inspect driver identity evidence, linkage scores, and complete any required manual licence review."
      eyebrow="Operators"
      title="Driver review"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{`${driver.firstName} ${driver.lastName}`}</CardTitle>
            <CardDescription>
              Review guidance and evidence for drivers who need additional identity confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={identityTone}>{identityLabel}</Badge>
              {driver.identityReviewCaseId ? (
                <Badge tone="warning">Identity case {driver.identityReviewCaseId}</Badge>
              ) : null}
              {licenceVerification?.reviewCaseId ? (
                <Badge tone="warning">Licence case {licenceVerification.reviewCaseId}</Badge>
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
          </CardContent>
        </Card>

        {licenceVerification ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Driver licence linkage summary</CardTitle>
                <CardDescription>
                  Review the provider response, linkage evidence, and risk posture before deciding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={licenceVerification.status === 'verified' ? 'success' : 'warning'}>
                    {licenceVerification.status.replace(/_/g, ' ')}
                  </Badge>
                  <Badge tone={licenceVerification.validity === 'valid' ? 'success' : 'warning'}>
                    Validity: {licenceVerification.validity ?? 'unknown'}
                  </Badge>
                  <Badge
                    tone={
                      licenceVerification.linkageDecision === 'auto_pass'
                        ? 'success'
                        : licenceVerification.linkageDecision === 'fail'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {licenceVerification.linkageDecision.replace(/_/g, ' ')}
                  </Badge>
                  {licenceVerification.reviewDecision ? (
                    <Badge
                      tone={
                        licenceVerification.reviewDecision === 'approved' ? 'success' : 'warning'
                      }
                    >
                      Review: {licenceVerification.reviewDecision.replace(/_/g, ' ')}
                    </Badge>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-1">
                    <Text tone="muted">Licence number</Text>
                    <Text>{licenceVerification.maskedLicenceNumber}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Issue date</Text>
                    <Text>{formatDate(licenceVerification.issueDate, locale)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Expiry date</Text>
                    <Text>{formatDate(licenceVerification.expiryDate, locale)}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Licence class</Text>
                    <Text>{licenceVerification.licenceClass ?? 'Not returned'}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Demographic score</Text>
                    <Text>
                      {licenceVerification.demographicMatchScore !== null
                        ? `${licenceVerification.demographicMatchScore}%`
                        : 'Not returned'}
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Biometric score</Text>
                    <Text>
                      {licenceVerification.biometricMatchScore !== null
                        ? `${licenceVerification.biometricMatchScore}%`
                        : 'Not returned'}
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Overall linkage score</Text>
                    <Text>
                      {licenceVerification.overallLinkageScore !== null
                        ? `${licenceVerification.overallLinkageScore}%`
                        : 'Not returned'}
                    </Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Risk impact</Text>
                    <Text>{licenceVerification.riskImpact}</Text>
                  </div>
                </div>

                <div className="space-y-2">
                  <Text tone="strong">Linkage reasons</Text>
                  {licenceVerification.linkageReasons.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {licenceVerification.linkageReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  ) : (
                    <Text tone="muted">No additional linkage notes were returned.</Text>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Text tone="strong">Live selfie</Text>
                    {driver.selfieImageUrl ? (
                      <img
                        alt="Driver live selfie"
                        className="h-48 w-full rounded-xl object-cover"
                        src={driver.selfieImageUrl}
                      />
                    ) : (
                      <Text tone="muted">Not returned</Text>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Text tone="strong">NIN portrait</Text>
                    {driver.providerImageUrl ? (
                      <img
                        alt="Driver NIN portrait"
                        className="h-48 w-full rounded-xl object-cover"
                        src={driver.providerImageUrl}
                      />
                    ) : (
                      <Text tone="muted">Not returned</Text>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Text tone="strong">Licence portrait</Text>
                    {licenceVerification.portraitUrl ? (
                      <img
                        alt="Driver licence portrait"
                        className="h-48 w-full rounded-xl object-cover"
                        src={licenceVerification.portraitUrl}
                      />
                    ) : (
                      <Text tone="muted">Not returned</Text>
                    )}
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Text tone="strong">Risk summary</Text>
                  <Text>{licenceVerification.riskSummary}</Text>
                  {licenceVerification.failureReason ? (
                    <Text tone="danger">{licenceVerification.failureReason}</Text>
                  ) : null}
                  {licenceVerification.reviewDecision ? (
                    <Text tone="muted">
                      {licenceVerification.reviewDecision === 'approved'
                        ? `Manually approved by ${licenceVerification.reviewedBy ?? 'reviewer'} on ${formatDate(licenceVerification.reviewedAt, locale)}.`
                        : `Review decision: ${licenceVerification.reviewDecision.replace(/_/g, ' ')} on ${formatDate(licenceVerification.reviewedAt, locale)}.`}
                    </Text>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <DriverLicenceReviewPanel
              currentDecision={licenceVerification.reviewDecision}
              driverId={driver.id}
            />
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Manual review guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Text>
                Identity resolution returned a manual-review outcome, so this driver should not be
                treated as verified or ready for activation yet.
              </Text>
              <Text tone="muted">
                Confirm the submitted identifier and selfie are correct, collect any missing
                evidence from the driver, and escalate the case to the review team with the case
                reference above.
              </Text>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href={`/drivers/${driver.id}`}>
            <Button variant="secondary">View driver details</Button>
          </Link>
          <Link href="/drivers/review-queue">
            <Button variant="ghost">Back to review queue</Button>
          </Link>
        </div>
      </div>
    </TenantAppShell>
  );
}
