import { Card, CardContent } from '@mobility-os/ui';
import { TenantAppShell } from '../../../features/shared/tenant-app-shell';

export default function VehicleDetailsLoading() {
  return (
    <TenantAppShell
      description="Vehicle state, assignment, remittance, and maintenance in one command center."
      eyebrow="Assets"
      title="Vehicle record"
    >
      <div className="space-y-6">
        <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.2)]">
          <CardContent className="space-y-5 px-5 py-5">
            <div className="space-y-2">
              <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
              <div className="h-9 w-56 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-4 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="h-8 w-28 animate-pulse rounded-full bg-slate-200" key={index} />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.12)]"
              key={index}
            >
              <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-3 h-6 w-32 animate-pulse rounded-full bg-slate-100" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded-full bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex gap-1 overflow-hidden rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="h-10 flex-1 animate-pulse rounded-[calc(var(--mobiris-radius-card)-0.2rem)] bg-white" key={index} />
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.2fr,0.9fr]">
            <Card className="border-slate-200 bg-white">
              <CardContent className="space-y-4 px-5 py-5">
                <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
                <div className="h-64 animate-pulse rounded-[var(--mobiris-radius-card)] bg-slate-100" />
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      className="rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/70 p-4"
                      key={index}
                    >
                      <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                      <div className="mt-3 h-4 w-28 animate-pulse rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardContent className="space-y-4 px-5 py-5">
                <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/70 p-4"
                    key={index}
                  >
                    <div className="h-3 w-16 animate-pulse rounded-full bg-slate-200" />
                    <div className="mt-3 h-5 w-24 animate-pulse rounded-full bg-slate-100" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TenantAppShell>
  );
}
