import { type ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariantClasses = {
  primary:
    'border border-transparent bg-[var(--mobiris-primary)] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] hover:bg-[var(--mobiris-primary-dark)] focus-visible:ring-[var(--mobiris-primary)]',
  secondary:
    'border border-[var(--mobiris-border)] bg-white/90 text-[var(--mobiris-ink)] shadow-[0_12px_28px_-20px_rgba(15,23,42,0.35)] hover:border-[var(--mobiris-primary-tint)] hover:bg-[var(--mobiris-primary-tint)] focus-visible:ring-[var(--mobiris-primary)]',
  ghost:
    'border border-transparent bg-transparent text-[var(--mobiris-ink-soft)] hover:bg-[var(--mobiris-primary-tint)] hover:text-[var(--mobiris-primary-dark)] focus-visible:ring-[var(--mobiris-primary)]',
} as const;

const buttonSizeClasses = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-4.5 text-sm',
  lg: 'h-11 px-5.5 text-sm',
} as const;

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariantClasses;
  size?: keyof typeof buttonSizeClasses;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    type = 'button' as ButtonHTMLAttributes<HTMLButtonElement>['type'],
    ...props
  },
  ref,
) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center rounded-[var(--mobiris-radius-button)] font-semibold tracking-[-0.01em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50',
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  );
});
