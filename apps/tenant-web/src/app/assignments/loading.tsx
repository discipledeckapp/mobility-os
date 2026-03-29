import { Card, CardContent } from '@mobility-os/ui';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';

export default function AssignmentsLoading() {
  return (
    <TenantAppShell
      description="Search, filter, and open assignment records across the organisation."
      eyebrow="Operations"
      title="Assignments"
    >
      <div className="space-y-6">
        <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.2)]">
          <CardContent className="space-y-4 px-5 py-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="h-3 w-36 animate-pulse rounded-full bg-slate-200" />
                <div className="h-8 w-56 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-3 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="h-11 w-44 animate-pulse rounded-[var(--mobiris-radius-button)] bg-slate-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-[0_4px_16px_-8px_rgba(15,23,42,0.12)]">
          <CardContent className="space-y-5 px-5 py-5">
            <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr,auto]">
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                <div className="h-11 w-full animate-pulse rounded-[var(--mobiris-radius-button)] bg-slate-100" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-11 w-full animate-pulse rounded-[var(--mobiris-radius-button)] bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-11 w-full animate-pulse rounded-[var(--mobiris-radius-button)] bg-slate-100" />
                </div>
              </div>
              <div className="h-10 w-28 animate-pulse self-end rounded-[var(--mobiris-radius-button)] bg-slate-200" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  className="rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/70 p-4"
                  key={index}
                >
                  <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
                  <div className="mt-3 h-8 w-16 animate-pulse rounded-xl bg-slate-200" />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  className="grid gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/60 p-4 md:grid-cols-6"
                  key={index}
                >
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <div
                      className="h-4 animate-pulse rounded-full bg-slate-200"
                      key={cellIndex}
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TenantAppShell>
  );
}
