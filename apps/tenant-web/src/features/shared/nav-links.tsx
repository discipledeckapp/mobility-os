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

const OperatingUnitsIcon: NavIcon = ({ className }) => (
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
    <rect height="4" rx="1" width="5" x="1.5" y="2" />
    <rect height="4" rx="1" width="5" x="9.5" y="2" />
    <rect height="4" rx="1" width="5" x="5.5" y="10" />
    <path d="M4 6v2.2h8V6M8 8.2v1.8" />
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

const SubscriptionIcon: NavIcon = ({ className }) => (
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
    <rect height="10" rx="1.5" width="12" x="2" y="3" />
    <path d="M4.5 6h7M4.5 9h4" />
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

const InspectionsIcon: NavIcon = ({ className }) => (
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
    <rect height="11" rx="1.5" width="9" x="3.5" y="2.5" />
    <path d="M6 2.5V1.6M10 2.5V1.6M5.5 6h5M5.5 8.5h3" />
    <path d="m8 11.2 1 1 2-2.2" />
  </svg>
);

const RecordsIcon: NavIcon = ({ className }) => (
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
    <rect height="11" rx="1.5" width="10" x="3" y="2.5" />
    <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
  </svg>
);

const AuditIcon: NavIcon = ({ className }) => (
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
    <path d="M8 1.8 3 3.6v3.7c0 3.2 2 5.9 5 6.9 3-1 5-3.7 5-6.9V3.6L8 1.8Z" />
    <path d="M6.2 7.9 7.4 9l2.5-2.6" />
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

type NavLinksProps = {
  variant?: 'sidebar' | 'mobile' | 'bottom';
  collapsed?: boolean;
};

const navigationSections = [
  {
    label: 'Overview',
    items: [{ href: '/', label: 'Dashboard', Icon: DashboardIcon }],
  },
  {
    label: 'Operations',
    items: [
      { href: '/drivers', label: 'Drivers', Icon: DriversIcon },
      { href: '/vehicles', label: 'Vehicles', Icon: VehiclesIcon },
      { href: '/maintenance' as Route, label: 'Maintenance', Icon: VehiclesIcon },
      { href: '/inspections' as Route, label: 'Inspections', Icon: InspectionsIcon },
      { href: '/assignments', label: 'Assignments', Icon: AssignmentsIcon },
      { href: '/remittance', label: 'Remittance', Icon: RemittanceIcon },
    ],
  },
  {
    label: 'Structure',
    items: [
      { href: '/business-entities', label: 'Business entities', Icon: BusinessEntitiesIcon },
      { href: '/operating-units' as Route, label: 'Operating units', Icon: OperatingUnitsIcon },
      { href: '/fleets', label: 'Fleets', Icon: FleetsIcon },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/subscription' as Route, label: 'Subscription', Icon: SubscriptionIcon },
      { href: '/wallet', label: 'Operational wallet', Icon: WalletIcon },
      { href: '/verification-funding' as Route, label: 'Verification funding', Icon: WalletIcon },
      { href: '/records' as Route, label: 'Records', Icon: RecordsIcon },
      { href: '/audit' as Route, label: 'Audit', Icon: AuditIcon },
      { href: '/reports' as Route, label: 'Operations Insights', Icon: ReportsIcon },
      { href: '/settings', label: 'Settings', Icon: SettingsIcon },
    ],
  },
] as const satisfies ReadonlyArray<{
  label: string;
  items: ReadonlyArray<{ href: Route; label: string; Icon: NavIcon }>;
}>;

export function NavLinks({ variant = 'sidebar', collapsed = false }: NavLinksProps) {
  const pathname = usePathname();
  const isMobile = variant === 'mobile';
  const isBottom = variant === 'bottom';

  const bottomItems = [
    { href: '/' as Route, label: 'Home', Icon: DashboardIcon },
    { href: '/drivers' as Route, label: 'Drivers', Icon: DriversIcon },
    { href: '/assignments' as Route, label: 'Assignments', Icon: AssignmentsIcon },
    { href: '/remittance' as Route, label: 'Remittance', Icon: RemittanceIcon },
    { href: '/reports' as Route, label: 'Insights', Icon: ReportsIcon },
  ] as const;

  if (isBottom) {
    return (
      <nav
        aria-label="Primary mobile navigation"
        className="grid grid-cols-5 gap-2"
      >
        {bottomItems.map(({ href, label, Icon }) => {
          const isActive = href === '/' ? pathname === '/' : (pathname ?? '').startsWith(href);
          return (
            <Link
              className={`flex min-h-[62px] flex-col items-center justify-center rounded-2xl px-2 py-2 text-center text-[11px] font-semibold transition-all ${
                isActive
                  ? 'bg-[var(--mobiris-primary)] text-white shadow-[0_18px_35px_-20px_rgba(37,99,235,0.82)]'
                  : 'bg-slate-50 text-slate-600'
              }`}
              href={href}
              key={href}
            >
              <Icon className={isActive ? 'mb-1 opacity-100' : 'mb-1 opacity-70'} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Tenant navigation"
      className={isMobile ? 'space-y-4' : 'space-y-0.5'}
    >
      {navigationSections.map((section) => (
        <div className={isMobile ? 'space-y-2' : 'space-y-1'} key={section.label}>
          {isMobile ? (
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {section.label}
            </p>
          ) : !collapsed ? (
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/25 first:pt-0">
              {section.label}
            </p>
          ) : null}
          {section.items.map(({ href, label, Icon }) => {
            const isActive = href === '/' ? pathname === '/' : (pathname ?? '').startsWith(href);
            return (
              <div className="group/nav relative" key={href}>
                <Link
                  className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-2.5'} rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-semibold tracking-[-0.01em] transition-all ${
                    isActive
                      ? isMobile
                        ? 'bg-[var(--mobiris-primary)] text-white shadow-[0_14px_28px_-18px_rgba(37,99,235,0.55)]'
                        : 'bg-[var(--mobiris-primary)] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)]'
                      : isMobile
                        ? 'border border-slate-200 bg-white text-slate-600 hover:border-[var(--mobiris-primary-light)] hover:text-[var(--mobiris-primary-dark)]'
                        : 'text-blue-50/70 hover:bg-white/8 hover:text-white'
                  }`}
                  href={href as Route}
                  title={collapsed && !isMobile ? label : undefined}
                >
                  <Icon className={isActive ? 'opacity-100' : 'opacity-60'} />
                  {!collapsed || isMobile ? label : null}
                </Link>
                {collapsed && !isMobile ? (
                  <div className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-20 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_20px_35px_-24px_rgba(15,23,42,0.45)] group-hover/nav:block">
                    {label}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
