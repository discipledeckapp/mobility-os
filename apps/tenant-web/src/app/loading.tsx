export default function AppLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#f3f7fc_42%,_#eef4fb_100%)] px-6 py-12 text-[var(--mobiris-ink)] lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[10px] bg-[var(--mobiris-primary)]/15" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded-full bg-slate-200" />
              <div className="h-3 w-52 rounded-full bg-slate-100" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-10 w-72 rounded-full bg-slate-200" />
            <div className="h-4 w-[28rem] max-w-full rounded-full bg-slate-100" />
            <div className="h-4 w-[24rem] max-w-full rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white/90 p-6 shadow-[0_22px_50px_-28px_rgba(15,23,42,0.18)] backdrop-blur-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 w-40 rounded-full bg-slate-200" />
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/5 animate-pulse rounded-full bg-[var(--mobiris-primary)]" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/80 p-4">
                <div className="h-3 w-28 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-full rounded-full bg-slate-100" />
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/80 p-4">
                <div className="h-3 w-32 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-full rounded-full bg-slate-100" />
              </div>
              <div className="rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/80 p-4">
                <div className="h-3 w-24 rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-full rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
