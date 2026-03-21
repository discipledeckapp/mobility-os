import { type HTMLAttributes, forwardRef } from 'react';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export const AppShell = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AppShell({ className, ...props }, ref) {
    return (
      <div
        className={cx(
          'min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#f3f7fc_42%,_#eef4fb_100%)] text-[var(--mobiris-ink)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

export const Sidebar = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Sidebar(
  { className, ...props },
  ref,
) {
  return (
    <aside
      className={cx(
        'hidden w-64 shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.98)_0%,_rgba(30,41,59,0.96)_100%)] text-white shadow-[28px_0_60px_-42px_rgba(15,23,42,0.7)] lg:block',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export const Header = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Header(
  { className, ...props },
  ref,
) {
  return (
    <header
      className={cx(
        'sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-white/60 bg-white/80 px-6 backdrop-blur-xl',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export const Content = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Content(
  { className, ...props },
  ref,
) {
  return (
    <main className={cx('mx-auto w-full max-w-7xl px-6 py-8', className)} ref={ref} {...props} />
  );
});

export const ContentSection = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ContentSection({ className, ...props }, ref) {
    return <section className={cx('space-y-6', className)} ref={ref} {...props} />;
  },
);
