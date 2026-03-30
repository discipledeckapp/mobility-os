import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Text } from '@mobility-os/ui';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function ControlPlaneHeroPanel({
  eyebrow,
  title,
  description,
  badges = [],
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badges?: Array<{ label: string; tone?: 'success' | 'warning' | 'danger' | 'neutral' }>;
  children?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)+0.25rem)] border border-[var(--mobiris-primary-light)] bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(239,246,255,0.98)_42%,rgba(219,234,254,0.86))] p-5 shadow-[0_28px_60px_-40px_rgba(37,99,235,0.55)]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mobiris-primary-dark)]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          {badges.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={`${badge.label}-${badge.tone ?? 'neutral'}`} tone={badge.tone ?? 'neutral'}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        {children ? <div className="w-full max-w-xl">{children}</div> : null}
      </div>
    </section>
  );
}

export function ControlPlaneMetricGrid({ children, columns = 4 }: { children: React.ReactNode; columns?: 3 | 4 | 5 }) {
  const className =
    columns === 5
      ? 'grid gap-4 xl:grid-cols-5'
      : columns === 3
        ? 'grid gap-4 md:grid-cols-3'
        : 'grid gap-4 xl:grid-cols-4';
  return <div className={className}>{children}</div>;
}

export function ControlPlaneMetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const accentClass =
    tone === 'success'
      ? 'bg-emerald-500'
      : tone === 'warning'
        ? 'bg-amber-500'
        : tone === 'danger'
          ? 'bg-rose-500'
          : 'bg-[var(--mobiris-primary)]';

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.2)]">
      <div className={cx('h-1.5 w-full', accentClass)} />
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-[1.8rem] tracking-[-0.05em]">{value}</CardTitle>
      </CardHeader>
      {detail ? (
        <CardContent className="pt-0">
          <Text tone="muted">{detail}</Text>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function ControlPlaneSectionShell({
  title,
  description,
  helper,
  children,
}: {
  title: string;
  description?: string;
  helper?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.18)]">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {helper ? <div className="shrink-0">{helper}</div> : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ControlPlaneToolbarPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200/80 bg-slate-50/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      {children}
    </div>
  );
}

export function ControlPlaneEmptyStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-300 bg-slate-50/75 px-5 py-10 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
