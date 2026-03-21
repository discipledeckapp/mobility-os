import { type HTMLAttributes, forwardRef } from 'react';

const badgeToneClasses = {
  success: 'bg-emerald-50 text-[var(--mobiris-success)] ring-emerald-100',
  warning: 'bg-amber-50 text-[var(--mobiris-warning)] ring-amber-100',
  danger: 'bg-rose-50 text-[var(--mobiris-error)] ring-rose-100',
  neutral: 'bg-[var(--mobiris-primary-tint)] text-[var(--mobiris-primary-dark)] ring-blue-100',
} as const;

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof badgeToneClasses;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, tone = 'neutral', ...props },
  ref,
) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.01em] ring-1 ring-inset',
        badgeToneClasses[tone],
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
