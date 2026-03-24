import { AppShell, Content, ContentSection, Header, Heading, Sidebar, Text } from '@mobility-os/ui';
import { logoutAction } from '../../app/(auth)/login/actions';
import { NavLinks } from './nav-links';

interface TenantAppShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function TenantAppShell({ eyebrow, title, description, children }: TenantAppShellProps) {
  return (
    <AppShell>
      <div className="flex min-h-screen">
        <Sidebar className="flex flex-col px-4 py-6">
          {/* Brand */}
          <div className="mb-6 px-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--mobiris-radius-button)] bg-[var(--mobiris-primary)] shadow-[0_8px_20px_-8px_rgba(37,99,235,0.8)]">
                <span className="text-sm font-bold tracking-tight text-white">M</span>
              </div>
              <div>
                <Heading className="text-white" size="h3">
                  Mobiris
                </Heading>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-100/40">
                  Fleet console
                </p>
              </div>
            </div>
          </div>

          {/* Nav section label */}
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/30">
            Operations
          </p>

          {/* Nav */}
          <NavLinks />

          {/* Footer */}
          <div className="mt-auto">
            <div className="mb-3 border-t border-white/8" />
            <form action={logoutAction}>
              <button
                className="flex w-full items-center gap-2.5 rounded-[var(--mobiris-radius-button)] px-3 py-2.5 text-sm font-medium text-blue-50/50 transition-all hover:bg-white/8 hover:text-white"
                type="submit"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  focusable="false"
                  height="15"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                  viewBox="0 0 16 16"
                  width="15"
                >
                  <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" />
                  <path d="M10.5 11L14 8l-3.5-3" />
                  <path d="M14 8H6" />
                </svg>
                Log out
              </button>
            </form>
          </div>
        </Sidebar>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
                    {eyebrow}
                  </p>
                </div>
                <Heading className="mt-0.5 text-[1.6rem] leading-tight" size="h2">
                  {title}
                </Heading>
                <Text tone="muted">{description}</Text>
              </div>
            </div>
          </Header>

          <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <div className="mb-3">
              <NavLinks variant="mobile" />
            </div>
            <form action={logoutAction}>
              <button
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                type="submit"
              >
                Log out
              </button>
            </form>
          </div>

          <Content>
            <ContentSection>{children}</ContentSection>
          </Content>
        </div>
      </div>
    </AppShell>
  );
}
