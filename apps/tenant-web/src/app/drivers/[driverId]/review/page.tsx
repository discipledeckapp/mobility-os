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
import type { Route } from 'next';
import { TenantAppShell } from '../../../../features/shared/tenant-app-shell';
import { getDriver, getTenantMe } from '../../../../lib/api-core';
import { getDriverIdentityLabel, getDriverIdentityTone } from '../../../../lib/driver-identity';
import { getFormattingLocale } from '../../../../lib/locale';
import { DriverEvidenceImage } from '../../driver-evidence-image';

function formatDate(value?: string | null, locale = 'en-US'): string {
  if (!value) return 'Not recorded';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(date);
}

function getDriverIdentityImageProxyUrl(
  driverId: string,
  kind: 'selfie' | 'provider' | 'signature',
  source?: string | null,
): string | null {
  return source ? `/api/drivers/${driverId}/identity-image/${kind}` : null;
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
  const selfieImageSrc = getDriverIdentityImageProxyUrl(driver.id, 'selfie', driver.selfieImageUrl);
  const providerImageSrc = getDriverIdentityImageProxyUrl(
    driver.id,
    'provider',
    driver.providerImageUrl,
  );

  return (
    <TenantAppShell
      description="Inspect driver identity evidence, linkage scores, and provider-returned licence verification details."
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

        <Card>
          <CardHeader>
            <CardTitle>Decision handoff</CardTitle>
            <CardDescription>
              Use this page to inspect evidence, then jump back into the owning workflow to continue the broader document or licence decision.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={`/drivers/${driver.id}` as Route}
            >
              <Text tone="strong">Driver profile</Text>
              <Text tone="muted">Return to the main driver record for broader status and document actions.</Text>
            </Link>
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/drivers/review-queue' as Route}
            >
              <Text tone="strong">Document review queue</Text>
              <Text tone="muted">Go back to the next pending document when you are working through submissions in sequence.</Text>
            </Link>
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/drivers/licence-review' as Route}
            >
              <Text tone="strong">Licence review queue</Text>
              <Text tone="muted">Step into the wider licence backlog when this case is part of a provider-verification watchlist.</Text>
            </Link>
          </CardContent>
        </Card>

        {licenceVerification ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Driver licence linkage summary</CardTitle>
                <CardDescription>
                  Review the provider response, linkage evidence, and risk posture captured during
                  provider verification.
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
                      <DriverEvidenceImage
                        alt="Driver live selfie"
                        className="h-48 w-full rounded-xl object-cover"
                        fallback={<Text tone="muted">Not returned</Text>}
                        src={selfieImageSrc}
                      />
                    ) : (
                      <Text tone="muted">Not returned</Text>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Text tone="strong">NIN portrait</Text>
                    {driver.providerImageUrl ? (
                      <DriverEvidenceImage
                        alt="Driver NIN portrait"
                        className="h-48 w-full rounded-xl object-cover"
                        fallback={<Text tone="muted">Not returned</Text>}
                        src={providerImageSrc}
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
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Verification guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Text>
                This page is for evidence inspection only. Driver&apos;s licence readiness now comes
                directly from the provider verification outcome.
              </Text>
              <Text tone="muted">
                If the licence failed verification, confirm the licence number and verified
                identity details with the driver, then ask them to retry. If the provider is
                unavailable, retry once service recovers.
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
