import type { HTMLAttributes, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

type TenantHeroPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function TenantHeroPanel({
  eyebrow,
  title,
  description,
  actions,
  children,
}: TenantHeroPanelProps) {
  return (
    <Card className="mb-4 overflow-hidden border-slate-200 bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(239,246,255,0.95)_45%,rgba(219,234,254,0.84))] shadow-[0_16px_36px_-30px_rgba(37,99,235,0.26)] sm:mb-6 sm:shadow-[0_22px_48px_-34px_rgba(37,99,235,0.34)]">
      <CardContent className="space-y-4 py-4 sm:space-y-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2rem]">
              {title}
            </h2>
            <p className="mt-2 hidden text-sm leading-5 text-slate-600 sm:block sm:leading-6">
              {description}
            </p>
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

type TenantSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
};

export function TenantSectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: TenantSectionHeaderProps) {
  return (
    <div className={cx('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
          {title}
        </h3>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

type MetricAccent = 'primary' | 'success' | 'warning' | 'sky' | 'violet' | 'slate' | 'danger';

const metricAccentClasses: Record<MetricAccent, { border: string; bar: string }> = {
  primary: { border: 'border-slate-200', bar: 'bg-[var(--mobiris-primary)]' },
  success: { border: 'border-emerald-200', bar: 'bg-emerald-400' },
  warning: { border: 'border-amber-200', bar: 'bg-amber-400' },
  sky: { border: 'border-sky-200', bar: 'bg-sky-400' },
  violet: { border: 'border-violet-200', bar: 'bg-violet-400' },
  slate: { border: 'border-slate-200', bar: 'bg-slate-300' },
  danger: { border: 'border-rose-200', bar: 'bg-rose-400' },
};

export function TenantMetricGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>{children}</div>;
}

type TenantMetricCardProps = {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  accent?: MetricAccent;
};

export function TenantMetricCard({
  label,
  value,
  note,
  accent = 'primary',
}: TenantMetricCardProps) {
  const accentClasses = metricAccentClasses[accent];
  return (
    <div className={cx('overflow-hidden rounded-[var(--mobiris-radius-card)] border bg-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.10)]', accentClasses.border)}>
      <div className={cx('h-0.5', accentClasses.bar)} />
      <div className="space-y-1 px-5 py-4">
        <Text tone="muted">{label}</Text>
        <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--mobiris-ink)]">
          {value}
        </p>
        {note ? <Text tone="muted">{note}</Text> : null}
      </div>
    </div>
  );
}

type TenantInlineSummaryItem = {
  label: string;
  value: ReactNode;
  tone?: 'primary' | 'neutral' | 'success' | 'warning' | 'danger';
};

const inlineSummaryToneClasses: Record<NonNullable<TenantInlineSummaryItem['tone']>, string> = {
  primary: 'border-[var(--mobiris-primary)]/20 bg-[var(--mobiris-primary)]/5 text-[var(--mobiris-primary-dark)]',
  neutral: 'border-slate-200 bg-white text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function TenantInlineSummary({
  items,
  className,
}: {
  items: TenantInlineSummaryItem[];
  className?: string;
}) {
  return (
    <div className={cx('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <div
          className={cx(
            'inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium',
            inlineSummaryToneClasses[item.tone ?? 'neutral'],
          )}
          key={item.label}
        >
          <span className="text-base font-semibold text-[var(--mobiris-ink)]">{item.value}</span>
          <span className="text-xs uppercase tracking-[0.14em]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

type TenantEmptyStateCardProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  tone?: 'neutral' | 'warning';
};

export function TenantEmptyStateCard({
  title,
  description,
  actions,
  tone = 'neutral',
}: TenantEmptyStateCardProps) {
  return (
    <Card
      className={cx(
        'border-dashed shadow-none',
        tone === 'warning' ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50/70',
      )}
    >
      <CardContent className="space-y-3 py-6">
        <Text className="font-semibold text-[var(--mobiris-ink)]">{title}</Text>
        <Text tone="muted">{description}</Text>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}

type TenantSurfaceCardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function TenantSurfaceCard({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: TenantSurfaceCardProps) {
  return (
    <Card className={cx('border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.28)]', className)}>
      {title || description || actions ? (
        <CardHeader className="space-y-4 border-b border-[var(--mobiris-border)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              {title ? <CardTitle>{title}</CardTitle> : null}
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
          </div>
        </CardHeader>
      ) : null}
      <CardContent className={cx('space-y-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export function TenantToolbarPanel({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-[var(--mobiris-surface-subtle,#f8fafc)] p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
