interface AuthSplitShellProps {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function AuthSplitShell({ children, eyebrow, title, subtitle }: AuthSplitShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[linear-gradient(135deg,#1e3a8a_0%,#2563eb_60%,#3b82f6_100%)] px-12 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/15 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)]">
            <span className="text-sm font-bold tracking-tight text-white">M</span>
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white">Mobiris Fleet OS</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-200/50">
              Fleet & Driver Operations Platform
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight tracking-[-0.03em] text-white">
            Fleet and driver
            <br />
            operations, <span className="text-blue-200">simplified.</span>
          </h1>
          <p className="text-base leading-relaxed text-blue-100/70">
            Manage drivers, vehicles, assignments, and driver verification from one platform built
            for fleet operations.
          </p>
        </div>
        <p className="text-xs text-blue-200/40">
          © {new Date().getFullYear()} Mobiris. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--mobiris-primary)]">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-base font-bold tracking-tight text-[var(--mobiris-ink)]">
            Mobiris Fleet OS
          </span>
        </div>
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mobiris-primary-dark)]">
              {eyebrow}
            </p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--mobiris-ink)]">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
