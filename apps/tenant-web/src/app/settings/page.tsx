import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import { getTenantMe, getTenantSession } from '../../lib/api-core';
import { SettingsPanel } from './settings-panel';

export default async function SettingsPage() {
  const [tenant, session] = await Promise.all([getTenantMe(), getTenantSession()]);

  return (
    <TenantAppShell
      description="Manage your operator profile, security credentials, and organisation reference details."
      eyebrow="Workspace"
      title="Settings"
    >
      <SettingsPanel session={session} tenant={tenant} />
    </TenantAppShell>
  );
}
