interface ControlPlaneAuthShellProps {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}

const governancePoints = [
  'Provision organisations, plans, and initial platform balances',
  'Review subscriptions, wallet posture, and feature rollout controls',
  'Operate the SaaS governance plane without leaking into tenant operations',
];

export function ControlPlaneAuthShell({
  children,
  eyebrow,
  title,
  subtitle,
}: ControlPlaneAuthShellProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[linear-gradient(150deg,#020617_0%,#0f172a_38%,#1d4ed8_100%)] px-12 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/12 shadow-[0_10px_24px_-10px_rgba(15,23,42,0.9)]">
            <span className="text-sm font-bold tracking-tight text-white">M</span>
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white">Mobiris</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/40">
              Control plane
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight tracking-[-0.03em] text-white">
              Govern the platform
              <br />
              <span className="text-blue-200">without blurring planes.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-blue-100/70">
              Use the control plane to onboard organisations, review SaaS posture, and manage
              platform-wide controls from one disciplined staff console.
            </p>
          </div>

          <div className="space-y-3">
            {governancePoints.map((item) => (
              <div className="flex items-start gap-3" key={item}>
                <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-300/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-200" />
                </div>
                <p className="text-sm text-blue-100/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-blue-100/35">
          © {new Date().getFullYear()} Mobiris. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--mobiris-primary)]">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-base font-bold tracking-tight text-[var(--mobiris-ink)]">
            Mobiris
          </span>
        </div>

        <div className="w-full max-w-[420px]">
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
