import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[linear-gradient(135deg,#1e3a8a_0%,#2563eb_60%,#3b82f6_100%)] px-12 py-10">
        {/* Logo */}
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

        {/* Hero copy */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight tracking-[-0.03em] text-white">
              Run your fleet.
              <br />
              Verify drivers. <span className="text-blue-200">Keep operations moving.</span>
            </h1>
            <p className="text-base leading-relaxed text-blue-100/70">
              Add vehicles, onboard drivers, manage assignments, and track daily operations from one mobile-friendly workspace.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-3">
            {[
              'Driver identity verification & risk scoring',
              'Structured vehicle assignment and completion records',
              'Daily remittance workflow & collections',
              'Guarantor management & watchlist alerts',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-1 h-4 w-4 flex-shrink-0 rounded-full bg-blue-400/30 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                </div>
                <p className="text-sm text-blue-100/80">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-blue-200/40">
          © {new Date().getFullYear()} Mobiris. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        {/* Mobile logo */}
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
              Organisation access
            </p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--mobiris-ink)]">
              Sign in to your workspace
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and password to continue with Mobiris Fleet OS.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
