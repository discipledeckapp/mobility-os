import { TenantShellChrome } from './tenant-shell-chrome';

interface TenantAppShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function TenantAppShell({
  eyebrow,
  title,
  description,
  children,
}: TenantAppShellProps) {
  return (
    <TenantShellChrome description={description} eyebrow={eyebrow} title={title}>
      {children}
    </TenantShellChrome>
  );
}
