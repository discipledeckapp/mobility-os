import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getTenantApiToken,
  getPrivacySupport,
  getNotificationPreferences,
  getTenantMe,
  getTenantSession,
  listDataSubjectRequests,
  listFleets,
  listPushDevices,
  listTeamMembers,
  listUserNotifications,
  listVehicles,
} from '../../lib/api-core';
import { SettingsPanel } from './settings-panel';

interface SettingsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSection(value: string | string[] | undefined) {
  const first = Array.isArray(value) ? value[0] : value;
  if (
    first === 'account' ||
    first === 'organisation' ||
    first === 'drivers' ||
    first === 'fleet' ||
    first === 'notifications' ||
    first === 'team' ||
    first === 'privacy'
  ) {
    return first;
  }
  return undefined;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialSection = getSection(resolvedSearchParams.section);
  const token = await getTenantApiToken().catch(() => undefined);
  const [tenant, session, members, fleets, vehiclesPage, notificationPreferences, notifications, pushDevices, privacySupport, dataRequests] = await Promise.all([
    getTenantMe(token),
    getTenantSession(token),
    listTeamMembers(token).catch(() => []),
    listFleets(token).catch(() => []),
    listVehicles({ limit: 200 }, token).catch(() => ({ data: [], total: 0, page: 1, limit: 200 })),
    getNotificationPreferences(token).catch(() => null),
    listUserNotifications(token).catch(() => []),
    listPushDevices(token).catch(() => []),
    getPrivacySupport(token).catch(() => null),
    listDataSubjectRequests(token).catch(() => []),
  ]);

  const canManage = session.permissions.includes('tenants:write');

  return (
    <TenantAppShell
      description="Manage your operator profile, security credentials, and organisation reference details."
      eyebrow="Workspace"
      title="Settings"
    >
      <SettingsPanel
        canManage={canManage}
        fleets={fleets}
        members={members}
        notificationPreferences={notificationPreferences ?? session.notificationPreferences ?? null}
        notifications={notifications}
        pushDevices={pushDevices}
        privacySupport={privacySupport}
        session={session}
        tenant={tenant}
        {...(initialSection ? { initialSection } : {})}
        dataRequests={dataRequests}
        vehicles={vehiclesPage.data}
      />
    </TenantAppShell>
  );
}
