'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/tenants', label: 'Organisations' },
  { href: '/tenant-lifecycle', label: 'Lifecycle' },
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/billing-operations', label: 'Billing operations' },
  { href: '/wallets', label: 'Platform wallets' },
  { href: '/feature-flags', label: 'Feature flags' },
] as const;

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Control-plane navigation" className="space-y-1">
      {navigationItems.map((item) => {
        const isActive =
          item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            className={cx(
              'block rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-white/12 text-white shadow-[0_10px_20px_-12px_rgba(15,23,42,0.9)]'
                : 'text-blue-50/55 hover:bg-white/8 hover:text-white',
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
