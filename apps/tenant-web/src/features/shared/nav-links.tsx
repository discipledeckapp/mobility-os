'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavIcon = React.FC<{ className?: string }>;

const DashboardIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <rect height="5" rx="1" width="5" x="1.5" y="1.5" />
    <rect height="5" rx="1" width="5" x="9.5" y="1.5" />
    <rect height="5" rx="1" width="5" x="1.5" y="9.5" />
    <rect height="5" rx="1" width="5" x="9.5" y="9.5" />
  </svg>
);

const DriversIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <circle cx="8" cy="5.5" r="2.5" />
    <path d="M2.5 14.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" />
  </svg>
);

const VehiclesIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <path d="M1 10V8.5L3.5 4h9L15 8.5V10" />
    <path d="M1 10h14" />
    <circle cx="4" cy="12.5" r="1.5" />
    <circle cx="12" cy="12.5" r="1.5" />
    <path d="M5.5 10V8M10.5 10V8" />
  </svg>
);

const BusinessEntitiesIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <rect height="10" rx="1.2" width="6" x="2" y="3" />
    <path d="M10.5 6.5h3M10.5 9.5h3M4.5 5.5h1M4.5 8h1M4.5 10.5h1" />
  </svg>
);

const FleetsIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <path d="M2 10.5h12" />
    <path d="M3.5 10.5V7l1.5-2h6L12.5 7v3.5" />
    <circle cx="5" cy="12.5" r="1.2" />
    <circle cx="11" cy="12.5" r="1.2" />
  </svg>
);

const AssignmentsIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <circle cx="3" cy="8" r="2" />
    <circle cx="13" cy="8" r="2" />
    <path d="M5 8h6" />
    <path d="M9.5 5.5L12.5 8l-3 2.5" />
  </svg>
);

const RemittanceIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <rect height="9" rx="1.5" width="14" x="1" y="4" />
    <circle cx="8" cy="8.5" r="2" />
    <path d="M4 6.5v4M12 6.5v4" />
  </svg>
);

const WalletIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <rect height="10" rx="1.5" width="14" x="1" y="4" />
    <path d="M1 8h14" />
    <rect height="3" rx="1" width="4" x="10" y="9" />
  </svg>
);

const ReportsIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <path d="M2 13.5h12" />
    <path d="M4 12V7.5" />
    <path d="M8 12V4.5" />
    <path d="M12 12V9.5" />
  </svg>
);

const SettingsIcon: NavIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    focusable="false"
    height="16"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.6"
    viewBox="0 0 16 16"
    width="16"
  >
    <circle cx="8" cy="8" r="2.2" />
    <path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.6 3.4 11.5 4.5M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5 3.4 3.4" />
  </svg>
);

const navigationItems = [
  { href: '/', label: 'Dashboard', Icon: DashboardIcon },
  { href: '/drivers', label: 'Drivers', Icon: DriversIcon },
  { href: '/vehicles', label: 'Vehicles', Icon: VehiclesIcon },
  { href: '/business-entities', label: 'Business entities', Icon: BusinessEntitiesIcon },
  { href: '/fleets', label: 'Fleets', Icon: FleetsIcon },
  { href: '/assignments', label: 'Assignments', Icon: AssignmentsIcon },
  { href: '/remittance', label: 'Remittance', Icon: RemittanceIcon },
  { href: '/wallet', label: 'Wallet', Icon: WalletIcon },
  { href: '/reports' as Route, label: 'Reports', Icon: ReportsIcon },
  { href: '/settings', label: 'Settings', Icon: SettingsIcon },
 ] as const satisfies ReadonlyArray<{ href: Route; label: string; Icon: NavIcon }>;

type NavLinksProps = {
  variant?: 'sidebar' | 'mobile';
};

export function NavLinks({ variant = 'sidebar' }: NavLinksProps) {
  const pathname = usePathname();
  const isMobile = variant === 'mobile';

  return (
    <nav
      aria-label="Tenant navigation"
      className={isMobile ? 'flex gap-2 overflow-x-auto pb-1' : 'space-y-0.5'}
    >
      {navigationItems.map(({ href, label, Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            className={`flex items-center gap-2.5 rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-semibold tracking-[-0.01em] transition-all ${
              isActive
                ? isMobile
                  ? 'shrink-0 bg-[var(--mobiris-primary)] text-white shadow-[0_12px_24px_-16px_rgba(37,99,235,0.55)]'
                  : 'bg-[var(--mobiris-primary)] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)]'
                : isMobile
                  ? 'shrink-0 border border-slate-200 bg-white text-slate-600 hover:border-[var(--mobiris-primary-light)] hover:text-[var(--mobiris-primary-dark)]'
                  : 'text-blue-50/70 hover:bg-white/8 hover:text-white'
            }`}
            href={href}
            key={href}
          >
            <Icon className={isActive ? 'opacity-100' : 'opacity-60'} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
