export default function AuthLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[linear-gradient(135deg,#1e3a8a_0%,#2563eb_60%,#3b82f6_100%)] px-12 py-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[10px] bg-white/20" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded-full bg-white/20" />
            <div className="h-2.5 w-48 rounded-full bg-blue-200/20" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-10 w-64 rounded-full bg-white/15" />
          <div className="h-10 w-72 rounded-full bg-white/10" />
          <div className="h-4 w-80 rounded-full bg-blue-100/20" />
          <div className="h-4 w-72 rounded-full bg-blue-100/15" />
        </div>

        <div className="h-3 w-40 rounded-full bg-blue-100/15" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="h-8 w-8 rounded-[8px] bg-[var(--mobiris-primary)]/20" />
          <div className="h-4 w-32 rounded-full bg-slate-200" />
        </div>

        <div className="w-full max-w-[400px] space-y-6">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded-full bg-blue-100" />
            <div className="h-8 w-56 rounded-full bg-slate-200" />
            <div className="h-4 w-72 rounded-full bg-slate-100" />
          </div>

          <div className="rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-card)] px-6 py-5 shadow-[0_22px_50px_-28px_rgba(15,23,42,0.35)]">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-3.5 w-32 rounded-full bg-slate-200" />
                <div className="h-11 w-full rounded-[var(--mobiris-radius-button)] bg-slate-100" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-24 rounded-full bg-slate-200" />
                <div className="h-11 w-full rounded-[var(--mobiris-radius-button)] bg-slate-100" />
              </div>
              <div className="h-10 w-full rounded-[var(--mobiris-radius-button)] bg-blue-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
