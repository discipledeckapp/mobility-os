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
import { Modal } from './modal';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingSummary, setBillingSummary] = useState<TenantBillingSummaryRecord | null>(null);

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
    session?.organisationDisplayName?.trim() ||
    session?.tenantName?.trim() ||
    'Mobiris workspace';
  const enforcement = billingSummary?.subscription.enforcement;
  const blockedFeatures = enforcement?.blockedFeatures ?? [];
  const showLifecycleBanner = enforcement?.stage === 'grace' || enforcement?.stage === 'expired';

  return (
    <AppShell>
      <div className="flex min-h-screen">
        <Sidebar
          className={`group/sidebar hidden flex-col py-6 transition-all lg:flex ${
            collapsed ? 'w-[5.5rem] px-2' : 'w-72 px-4'
          }`}
        >
          <div className="mb-6 flex flex-col gap-3 px-2">
            <div className={`relative flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
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
              {collapsed ? (
                <div className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-[0_20px_35px_-24px_rgba(15,23,42,0.45)] group-hover/sidebar:block">
                  <p className="text-sm font-semibold text-slate-950">Mobiris</p>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                    {organisationName}
                  </p>
                </div>
              ) : null}
            </div>
            <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
              <button
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-white/10 bg-white/5 text-blue-50/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                onClick={() => setCollapsed((value) => !value)}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                type="button"
              >
                {collapsed ? '»' : '«'}
              </button>
            </div>
          </div>

          {!collapsed ? (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/30">
              Operations
            </p>
          ) : null}

          <NavLinks collapsed={collapsed} />

          <div className="mt-auto">
            <div className="mb-3 border-t border-white/8" />
            <div className="relative">
              <LogoutButton
                className={`flex w-full items-center rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-medium text-blue-50/50 transition-all hover:bg-white/8 hover:text-white ${
                  collapsed ? 'justify-center' : 'gap-2.5'
                }`}
              />
              {collapsed ? (
                <div className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_20px_35px_-24px_rgba(15,23,42,0.45)] group-hover/sidebar:block">
                  Sign out
                </div>
              ) : null}
            </div>
          </div>
        </Sidebar>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
                  {eyebrow}
                </p>
                <Heading className="mt-0.5 text-xl leading-tight" size="h3">
                  {title}
                </Heading>
                <Text className="line-clamp-2 text-sm" tone="muted">
                  {description}
                </Text>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <GlobalSearch />
                <NotificationCenter initialNotifications={notifications} />
                <button
                  aria-label="Open navigation menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => setMobileMenuOpen(true)}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    width="18"
                  >
                    <line x1="4" x2="20" y1="7" y2="7" />
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="17" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <Header className="hidden lg:flex">
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

          <Content className="pb-24 lg:pb-8">
            <ContentSection>{children}</ContentSection>
          </Content>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/96 px-3 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-md">
          <NavLinks variant="bottom" />
        </div>
      </div>

      <Modal
        description="Move between drivers, vehicles, assignments, billing, and settings from one place."
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        title={organisationName}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <Text className="font-semibold text-[var(--mobiris-ink)]">Menu</Text>
            <Text tone="muted">Choose a workspace or account action.</Text>
          </div>
          <NavLinks variant="mobile" />
          <div className="border-t border-slate-200 pt-4">
            <LogoutButton
              className="inline-flex h-11 w-full items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              mobile
            />
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
