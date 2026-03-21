import { type HTMLAttributes, type LabelHTMLAttributes, forwardRef } from 'react';

const headingSizeClasses = {
  display: 'text-4xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]',
  h1: 'text-3xl font-semibold tracking-[-0.03em] text-[var(--mobiris-ink)]',
  h2: 'text-2xl font-semibold tracking-[-0.025em] text-[var(--mobiris-ink)]',
  h3: 'text-xl font-semibold tracking-[-0.02em] text-[var(--mobiris-ink)]',
} as const;

const headingTagMap = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
} as const;

const textToneClasses = {
  default: 'text-[var(--mobiris-ink-soft)]',
  muted: 'text-slate-500',
  strong: 'text-[var(--mobiris-ink)]',
  accent: 'text-[var(--mobiris-primary-dark)]',
  success: 'text-[var(--mobiris-success)]',
  danger: 'text-[var(--mobiris-error)]',
} as const;

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: keyof typeof headingSizeClasses;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { className, size = 'h2', ...props },
  ref,
) {
  const Tag = headingTagMap[size];
  return <Tag className={cx(headingSizeClasses[size], className)} ref={ref} {...props} />;
});

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: keyof typeof textToneClasses;
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(function Text(
  { className, tone = 'default', ...props },
  ref,
) {
  return (
    <p className={cx('text-sm leading-5', textToneClasses[tone], className)} ref={ref} {...props} />
  );
});

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  function Label({ className, ...props }, ref) {
    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: this is a generic primitive that forwards htmlFor or nested controls from callers.
      <label
        className={cx(
          'text-sm font-semibold tracking-[-0.01em] text-[var(--mobiris-ink-soft)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
