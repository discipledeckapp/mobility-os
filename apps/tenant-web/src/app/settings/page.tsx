import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  listBusinessEntities,
  listOperatingUnits,
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
    first === 'structure' ||
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
  const [tenant, session, members, fleets, vehiclesPage, notificationPreferences, notifications, pushDevices, privacySupport, dataRequests, businessEntities, operatingUnits] = await Promise.all([
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
    listBusinessEntities(token).catch(() => []),
    listOperatingUnits({}, token).catch(() => []),
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
        businessEntities={businessEntities}
        fleets={fleets}
        members={members}
        notificationPreferences={notificationPreferences ?? session.notificationPreferences ?? null}
        notifications={notifications}
        operatingUnits={operatingUnits}
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
