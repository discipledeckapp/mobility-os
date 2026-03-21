import { type HTMLAttributes, forwardRef } from 'react';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      className={cx(
        'rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-card)] shadow-[0_22px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        className={cx('border-b border-[var(--mobiris-border)] px-6 py-5', className)}
        ref={ref}
        {...props}
      />
    );
  },
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div className={cx('px-6 py-5', className)} ref={ref} {...props} />;
  },
);

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        className={cx(
          'text-base font-semibold tracking-[-0.02em] text-[var(--mobiris-ink)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      className={cx('mt-1 text-sm leading-6 text-[var(--mobiris-ink-soft)]', className)}
      ref={ref}
      {...props}
    />
  );
});
