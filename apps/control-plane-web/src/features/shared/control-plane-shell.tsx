import { AppShell, Content, ContentSection, Header, Heading, Sidebar, Text } from '@mobility-os/ui';
import { NavLinks, ResponsiveNavLinks } from './nav-links';
import { GlobalSearch } from './global-search';
import { LogoutButton } from './logout-button';

interface ControlPlaneShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ControlPlaneShell({
  eyebrow,
  title,
  description,
  children,
}: ControlPlaneShellProps) {
  return (
    <AppShell>
      <div className="flex min-h-screen">
        <Sidebar className="flex flex-col px-4 py-6">
          <div className="mb-6 px-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--mobiris-radius-button)] bg-white/12 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.9)]">
                <span className="text-sm font-bold tracking-tight text-white">M</span>
              </div>
              <div>
                <Heading className="text-white" size="h3">
                  Mobiris
                </Heading>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-100/35">
                  Control plane
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-[calc(var(--mobiris-radius-card)-2px)] border border-white/10 bg-white/6 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/35">
              Governance
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Platform staff console</p>
            <p className="mt-1 text-xs leading-5 text-blue-50/55">
              Manage organisations, subscriptions, wallet posture, and feature rollout controls.
            </p>
          </div>

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/30">
            Platform operations
          </p>
          <NavLinks />

          <div className="mt-auto">
            <div className="mb-3 border-t border-white/8" />
            <LogoutButton className="flex w-full items-center gap-2.5 rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-medium text-blue-50/50 transition-all hover:bg-white/8 hover:text-white" />
          </div>
        </Sidebar>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header>
            <div className="flex items-start justify-between gap-4">
              <div>
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
              </div>
            </div>
          </Header>

          <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <div className="mb-3">
              <ResponsiveNavLinks variant="mobile" />
            </div>
            <div className="flex items-center gap-3">
              <GlobalSearch />
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
