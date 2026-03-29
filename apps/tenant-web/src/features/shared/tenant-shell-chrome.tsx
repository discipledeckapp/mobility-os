'use client';

import { useEffect, useState } from 'react';
import {
  AppShell,
  Content,
  ContentSection,
  Header,
  Heading,
  Sidebar,
  Text,
} from '@mobility-os/ui';
import {
  getTenantBillingSummary,
  type TenantAuthSessionRecord,
  type TenantBillingSummaryRecord,
  type UserNotificationRecord,
} from '../../lib/api-core';
import { NavLinks } from './nav-links';
import { NotificationCenter } from './notification-center';
import { LogoutButton } from './logout-button';
import { GlobalSearch } from './global-search';

interface TenantShellChromeProps {
  eyebrow: string;
  title: string;
  description: string;
  session?: TenantAuthSessionRecord | null;
  notifications?: UserNotificationRecord[];
  children: React.ReactNode;
}

export function TenantShellChrome({
  eyebrow,
  title,
  description,
  session = null,
  notifications = [],
  children,
}: TenantShellChromeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [billingSummary, setBillingSummary] = useState<TenantBillingSummaryRecord | null>(null);

  useEffect(() => {
    const stored = globalThis.localStorage?.getItem('tenant-shell-collapsed');
    if (stored === '1') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    globalThis.localStorage?.setItem('tenant-shell-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    let mounted = true;
    void getTenantBillingSummary()
      .then((summary) => {
        if (mounted) {
          setBillingSummary(summary);
        }
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const organisationName =
    session?.organisationDisplayName || session?.tenantName || 'Organisation workspace';
  const enforcement = billingSummary?.subscription.enforcement;
  const blockedFeatures = enforcement?.blockedFeatures ?? [];
  const showLifecycleBanner = enforcement?.stage === 'grace' || enforcement?.stage === 'expired';

  return (
    <AppShell>
      <div className="flex min-h-screen">
        <Sidebar className={`flex flex-col px-4 py-6 transition-all ${collapsed ? 'w-24' : 'w-72'}`}>
          <div className="mb-6 flex items-start justify-between gap-3 px-2">
            <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--mobiris-radius-button)] bg-[var(--mobiris-primary)] shadow-[0_8px_20px_-8px_rgba(37,99,235,0.8)]">
                <span className="text-sm font-bold tracking-tight text-white">M</span>
              </div>
              {!collapsed ? (
                <div>
                  <Heading className="text-white" size="h3">
                    Mobiris
                  </Heading>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-100/40">
                    {organisationName}
                  </p>
                </div>
              ) : null}
            </div>
            <button
              className="rounded-[var(--mobiris-radius-button)] p-2 text-blue-50/60 transition hover:bg-white/8 hover:text-white"
              onClick={() => setCollapsed((value) => !value)}
              type="button"
            >
              {collapsed ? '»' : '«'}
            </button>
          </div>

          {!collapsed ? (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/30">
              Operations
            </p>
          ) : null}

          <NavLinks collapsed={collapsed} />

          <div className="mt-auto">
            <div className="mb-3 border-t border-white/8" />
            <LogoutButton className="flex w-full items-center gap-2.5 rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-medium text-blue-50/50 transition-all hover:bg-white/8 hover:text-white" />
          </div>
        </Sidebar>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header>
            <div className="flex min-w-0 items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
                  {eyebrow}
                </p>
                <Heading className="mt-0.5 text-[1.6rem] leading-tight" size="h2">
                  {title}
                </Heading>
                <Text tone="muted">{description}</Text>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <GlobalSearch />
                <NotificationCenter initialNotifications={notifications} />
              </div>
            </div>
          </Header>

          {showLifecycleBanner ? (
            <div
              className={`border-b px-4 py-3 ${
                enforcement?.stage === 'grace'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {enforcement?.stage === 'grace'
                      ? `Subscription expired. Renew within ${enforcement.graceDaysRemaining} day(s).`
                      : 'Subscription expired. Workspace is running in degraded mode.'}
                  </p>
                  <p className="text-sm opacity-90">
                    {enforcement?.stage === 'grace'
                      ? 'Existing operations continue for now, but new drivers and new vehicles are blocked until renewal.'
                      : 'Drivers can still log in, view assignments, and log remittance. New drivers, new vehicles, and new assignments are blocked until you upgrade.'}
                  </p>
                  {blockedFeatures.length > 0 ? (
                    <p className="text-xs opacity-80">
                      Blocked features: {blockedFeatures.join(', ').replaceAll('_', ' ')}
                    </p>
                  ) : null}
                </div>
                <a
                  className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-current px-4 text-sm font-medium"
                  href="/subscription"
                >
                  Review plan and upgrade
                </a>
              </div>
            </div>
          ) : null}

          <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <div className="mb-3">
              <NavLinks variant="mobile" />
            </div>
            <div className="flex items-center gap-3">
              <GlobalSearch />
              <NotificationCenter initialNotifications={notifications} />
              <LogoutButton
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                mobile
              />
            </div>
          </div>

          <Content>
            <ContentSection>{children}</ContentSection>
          </Content>
        </div>
      </div>
    </AppShell>
  );
}
