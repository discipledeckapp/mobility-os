import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getNotificationPreferences,
  getTenantMe,
  getTenantSession,
  listFleets,
  listTeamMembers,
  listUserNotifications,
  listVehicles,
} from '../../lib/api-core';
import { SettingsPanel } from './settings-panel';
import { TeamPanel } from './team-panel';

export default async function SettingsPage() {
  const [tenant, session, members, fleets, vehiclesPage, notificationPreferences, notifications] = await Promise.all([
    getTenantMe(),
    getTenantSession(),
    listTeamMembers().catch(() => []),
    listFleets().catch(() => []),
    listVehicles({ limit: 200 }).catch(() => ({ data: [], total: 0, page: 1, limit: 200 })),
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
        <TeamPanel
          canManage={canManage}
          fleets={fleets}
          members={members}
          vehicles={vehiclesPage.data}
        />
      </div>
    </TenantAppShell>
  );
}
