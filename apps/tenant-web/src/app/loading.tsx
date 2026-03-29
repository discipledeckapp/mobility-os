import { Card, CardContent } from '@mobility-os/ui';
import { TenantAppShell } from '../features/shared/tenant-app-shell';

function DashboardSkeletonCard() {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_4px_16px_-8px_rgba(15,23,42,0.12)]">
      <div className="h-0.5 w-full bg-slate-200" />
      <CardContent className="space-y-3 px-5 py-4">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-8 w-16 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-3 w-32 animate-pulse rounded-full bg-slate-100" />
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <TenantAppShell
      description="Fleet and driver operations."
      eyebrow="Operations"
      title="Dashboard"
    >
      <div className="space-y-6">
        <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.2)]">
          <CardContent className="space-y-4 px-5 py-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Loading dashboard...</p>
              <p className="text-sm text-slate-500">Getting things ready...</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/5 animate-pulse rounded-full bg-[var(--mobiris-primary)]" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <DashboardSkeletonCard key={index} />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr,0.9fr]">
          <Card className="border-slate-200 bg-white shadow-[0_4px_16px_-8px_rgba(15,23,42,0.12)]">
            <CardContent className="space-y-4 px-5 py-5">
              <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/70 p-4"
                    key={index}
                  >
                    <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-100" />
                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-[0_4px_16px_-8px_rgba(15,23,42,0.12)]">
            <CardContent className="space-y-4 px-5 py-5">
              <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/70 p-3"
                  key={index}
                >
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
                    <div className="mt-2 h-3 w-20 animate-pulse rounded-full bg-slate-100" />
                  </div>
                  <div className="h-8 w-16 animate-pulse rounded-full bg-slate-200" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantAppShell>
  );
}
