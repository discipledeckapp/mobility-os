import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Heading, Text } from '@mobility-os/ui';
import {
  getDriverSelfServiceContext,
  listDriverSelfServiceDocuments,
} from '../../../../lib/api-core';
import { DriverDocumentsPanel } from '../../driver-documents-panel';
import { DriverIdentityVerification } from '../../driver-identity-verification';

export default async function DriverPathSelfServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { driverId } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4fb_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <Link
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
            href={`/drivers/${driverId}`}
          >
            ← Back to driver record
          </Link>
          <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
            <CardHeader className="space-y-2">
              <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
                Driver verification
              </Text>
              <CardTitle>Verification link missing</CardTitle>
            </CardHeader>
            <CardContent>
              <Text tone="muted">
                This verification link is incomplete. Ask your organisation operator to send you a fresh link.
              </Text>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const [driver, documents] = await Promise.all([
    getDriverSelfServiceContext(token),
    listDriverSelfServiceDocuments(token).catch(() => []),
  ]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_28%,#f8fbff_62%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
          href={`/drivers/${driverId}`}
        >
          ← Back to driver record
        </Link>
        <section className="space-y-3">
          <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
            Mobiris driver verification
          </Text>
          <div className="space-y-2">
            <Heading size="h1">{`${driver.firstName} ${driver.lastName}`}</Heading>
            <Text tone="muted">
              Complete your identity verification with a live selfie or a manual identifier submission, then upload the supporting documents your organisation needs.
            </Text>
          </div>
        </section>

        <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle>Before you continue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Text>Use this page on the same device that will capture the selfie if you are completing live verification.</Text>
            <Text tone="muted">
              If live liveness is unavailable, continue with manual verification only and let your organisation review the submission outcome.
            </Text>
          </CardContent>
        </Card>

        <DriverIdentityVerification
          defaultCountryCode={driver.nationality ?? null}
          driver={driver}
          mode="self_service"
          selfServiceToken={token}
        />
        <DriverDocumentsPanel
          countryCode={driver.nationality}
          documents={documents}
          driverId={driver.id}
          mode="self_service"
          selfServiceToken={token}
        />
      </div>
    </main>
  );
}
