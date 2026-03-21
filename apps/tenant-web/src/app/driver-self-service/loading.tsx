import { Card, CardContent, CardHeader, CardTitle, DetailPageLoadingState, Text } from '@mobility-os/ui';

export default function DriverSelfServiceLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_28%,#f8fbff_62%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)]">
          <CardHeader className="space-y-2">
            <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
              Mobiris driver verification
            </Text>
            <CardTitle>Preparing verification</CardTitle>
          </CardHeader>
          <CardContent>
            <Text tone="muted">
              Loading the secure verification flow and your current organisation requirements.
            </Text>
          </CardContent>
        </Card>
        <DetailPageLoadingState
          description="Loading the secure verification flow, current identity context, and document checklist."
          sidebarDescription="Preparing verification guidance, evidence panels, and the current organisation requirements."
          sidebarTitle="Loading self-service verification"
          title="Preparing driver verification"
        />
      </div>
    </main>
  );
}
