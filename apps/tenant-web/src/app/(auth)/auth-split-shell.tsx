 'use client';

import { MobirisMark } from '@mobility-os/ui';

interface AuthSplitShellProps {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  brandLabel?: string;
  brandCaption?: string;
  heroTitle?: React.ReactNode;
  heroDescription?: string;
  heroBullets?: string[];
  accentClassName?: string;
  panelClassName?: string;
  mobileBrandLabel?: string;
  footerText?: string;
}

const DEFAULT_BULLETS = [
  'Driver identity verification & risk scoring',
  'Structured vehicle assignment and completion records',
  'Daily remittance workflow & collections',
  'Guarantor management & watchlist alerts',
];

export function AuthSplitShell({
  children,
  eyebrow,
  title,
  subtitle,
  brandLabel = 'Mobiris Fleet OS',
  brandCaption = 'Fleet & Driver Operations Platform',
  heroTitle = (
    <>
      Fleet and driver
      <br />
      operations, <span className="text-blue-200">simplified.</span>
    </>
  ),
  heroDescription = 'Manage drivers, vehicles, assignments, and driver verification from one platform built for fleet operations.',
  heroBullets = DEFAULT_BULLETS,
  accentClassName = 'text-blue-200',
  panelClassName = 'bg-[linear-gradient(135deg,#1e3a8a_0%,#2563eb_60%,#3b82f6_100%)]',
  mobileBrandLabel,
  footerText,
}: AuthSplitShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className={`hidden lg:flex lg:w-[45%] flex-col justify-between px-12 py-10 ${panelClassName}`}>
        <div className="flex items-center gap-3">
          <div className="shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)]">
            <MobirisMark className="h-9 w-9" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white">{brandLabel}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-200/50">
              {brandCaption}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight tracking-[-0.03em] text-white">
              {heroTitle}
            </h1>
            <p className="text-base leading-relaxed text-blue-100/70">{heroDescription}</p>
          </div>
          <div className="space-y-3">
            {heroBullets.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
                  <div className={`h-1.5 w-1.5 rounded-full ${accentClassName.replace('text-', 'bg-')}`} />
                </div>
                <p className="text-sm text-blue-100/80">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-blue-200/40">
          {footerText ?? `© ${new Date().getFullYear()} Mobiris. All rights reserved.`}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <MobirisMark className="h-8 w-8" />
          <span className="text-base font-bold tracking-tight text-[var(--mobiris-ink)]">
            {mobileBrandLabel ?? brandLabel}
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
