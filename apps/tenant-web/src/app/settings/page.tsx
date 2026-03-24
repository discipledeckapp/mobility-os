import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getNotificationPreferences,
  getTenantMe,
  getTenantSession,
  listFleets,
  listTeamMembers,
  listUserNotifications,
} from '../../lib/api-core';
import { SettingsPanel } from './settings-panel';
import { TeamPanel } from './team-panel';

export default async function SettingsPage() {
  const [tenant, session, members, fleets, notificationPreferences, notifications] = await Promise.all([
    getTenantMe(),
    getTenantSession(),
    listTeamMembers().catch(() => []),
    listFleets().catch(() => []),
    getNotificationPreferences().catch(() => null),
    listUserNotifications().catch(() => []),
  ]);

  const canManage = session.permissions.includes('tenants:write');

  return (
    <TenantAppShell
      description="Manage your operator profile, security credentials, and organisation reference details."
      eyebrow="Workspace"
      title="Settings"
    >
      <div className="space-y-8">
        <SettingsPanel
          notificationPreferences={notificationPreferences ?? session.notificationPreferences ?? null}
          notifications={notifications}
          session={session}
          tenant={tenant}
        />
        <TeamPanel canManage={canManage} fleets={fleets} members={members} />
      </div>
    </TenantAppShell>
  );
}
