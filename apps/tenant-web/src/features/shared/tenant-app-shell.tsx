import { getTenantSession, type TenantAuthSessionRecord } from '../../lib/api-core';
import { TenantShellChrome } from './tenant-shell-chrome';

interface TenantAppShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export async function TenantAppShell({
  eyebrow,
  title,
  description,
  children,
}: TenantAppShellProps) {
  let session: TenantAuthSessionRecord | null = null;

  try {
    session = await getTenantSession();
  } catch {
    session = null;
  }

  return (
    <TenantShellChrome
      description={description}
      eyebrow={eyebrow}
      session={session}
      title={title}
    >
      {children}
    </TenantShellChrome>
  );
}
