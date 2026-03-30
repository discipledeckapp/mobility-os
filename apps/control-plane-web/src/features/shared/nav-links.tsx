'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navigationGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ href: '/', label: 'Dashboard' }],
  },
  {
    label: 'Platform ops',
    items: [
      { href: '/tenants', label: 'Organisations' },
      { href: '/operations', label: 'Operations' },
      { href: '/tenant-lifecycle', label: 'Lifecycle' },
      { href: '/staff', label: 'Staff' },
    ],
  },
  {
    label: 'Billing and rollout',
    items: [
      { href: '/subscriptions', label: 'Subscriptions' },
      { href: '/billing-operations', label: 'Billing operations' },
      { href: '/wallets', label: 'Platform wallets' },
      { href: '/feature-flags', label: 'Feature flags' },
      { href: '/platform-settings', label: 'Platform settings' },
    ],
  },
  {
    label: 'Intelligence and governance',
    items: [{ href: '/governance', label: 'Governance' }],
  },
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

  if (isMobile) {
    return (
      <nav aria-label="Control-plane navigation" className="flex gap-2 overflow-x-auto pb-1">
        {navigationGroups.flatMap((group) => group.items).map((item) => {
          const isActive =
            item.href === '/' ? currentPath === item.href : currentPath.startsWith(item.href);

          return (
            <Link
              className={cx(
                'shrink-0 rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[var(--mobiris-primary)] text-white shadow-[0_12px_24px_-16px_rgba(37,99,235,0.55)]'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-[var(--mobiris-primary-light)] hover:text-[var(--mobiris-primary-dark)]',
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

  return (
    <nav aria-label="Control-plane navigation" className="space-y-5">
      {navigationGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/30">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                item.href === '/' ? currentPath === item.href : currentPath.startsWith(item.href);

              return (
                <Link
                  className={cx(
                    'block rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white/12 text-white shadow-[0_10px_20px_-12px_rgba(15,23,42,0.9)]'
                      : 'text-blue-50/55 hover:bg-white/8 hover:text-white',
                  )}
                  href={item.href as Route}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
