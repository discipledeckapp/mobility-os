import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import { getTenantMe, getTenantSession, listTeamMembers } from '../../lib/api-core';
import { SettingsPanel } from './settings-panel';
import { TeamPanel } from './team-panel';

export default async function SettingsPage() {
  const [tenant, session, members] = await Promise.all([
    getTenantMe(),
    getTenantSession(),
    listTeamMembers().catch(() => []),
  ]);

  const canManage = session.permissions.includes('tenants:write');

  return (
    <TenantAppShell
      description="Manage your operator profile, security credentials, and organisation reference details."
      eyebrow="Workspace"
      title="Settings"
    >
      <div className="space-y-8">
        <SettingsPanel session={session} tenant={tenant} />
        <TeamPanel canManage={canManage} members={members} />
      </div>
    </TenantAppShell>
  );
}
