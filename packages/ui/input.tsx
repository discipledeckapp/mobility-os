import { type InputHTMLAttributes, forwardRef } from 'react';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...props },
  ref,
) {
  return (
    <input
      className={cx(
        'flex h-11 w-full rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white/95 px-3.5 py-2.5 text-sm text-[var(--mobiris-ink)] shadow-[0_8px_22px_-18px_rgba(15,23,42,0.3)] outline-none transition-all placeholder:text-slate-400 focus:border-[var(--mobiris-primary-light)] focus:ring-4 focus:ring-[var(--mobiris-primary-tint)] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  );
});
