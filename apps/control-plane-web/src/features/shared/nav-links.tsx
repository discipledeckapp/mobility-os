'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/tenants', label: 'Organisations' },
  { href: '/operations', label: 'Operations' },
  { href: '/governance', label: 'Governance' },
  { href: '/intelligence/review-cases', label: 'Review cases' },
  { href: '/intelligence/persons', label: 'Persons' },
  { href: '/platform-settings', label: 'Platform settings' },
  { href: '/tenant-lifecycle', label: 'Lifecycle' },
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/billing-operations', label: 'Billing operations' },
  { href: '/wallets', label: 'Platform wallets' },
  { href: '/feature-flags', label: 'Feature flags' },
  { href: '/staff', label: 'Staff' },
] as const;

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function NavLinks() {
  return <ResponsiveNavLinks variant="sidebar" />;
}

type NavLinksProps = {
  variant?: 'sidebar' | 'mobile';
};

export function ResponsiveNavLinks({ variant = 'sidebar' }: NavLinksProps) {
  const pathname = usePathname();
  const isMobile = variant === 'mobile';
  const currentPath = pathname ?? '/';

  return (
    <nav
      aria-label="Control-plane navigation"
      className={isMobile ? 'flex gap-2 overflow-x-auto pb-1' : 'space-y-1'}
    >
      {navigationItems.map((item) => {
        const isActive =
          item.href === '/' ? currentPath === item.href : currentPath.startsWith(item.href);

        return (
          <Link
            className={cx(
              'rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? isMobile
                  ? 'shrink-0 bg-[var(--mobiris-primary)] text-white shadow-[0_12px_24px_-16px_rgba(37,99,235,0.55)]'
                  : 'bg-white/12 text-white shadow-[0_10px_20px_-12px_rgba(15,23,42,0.9)]'
                : isMobile
                  ? 'shrink-0 border border-slate-200 bg-white text-slate-600 hover:border-[var(--mobiris-primary-light)] hover:text-[var(--mobiris-primary-dark)]'
                  : 'block text-blue-50/55 hover:bg-white/8 hover:text-white',
            )}
            href={item.href as Route}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
