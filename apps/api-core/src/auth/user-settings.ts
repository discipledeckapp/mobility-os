import type { TenantRole } from '@mobility-os/authz-model';
import type { SupportedLanguage } from '../tenants/tenant-settings';

export const NOTIFICATION_TOPICS = [
  'remittance_due',
  'remittance_overdue',
  'remittance_reconciled',
  'late_remittance_risk',
  'maintenance_due',
  'maintenance_overdue',
  'vehicle_incident_reported',
  'compliance_risk',
  'self_service_invite',
  'billing_updates',
  'trial_guidance',
  'product_updates',
  'marketing_updates',
] as const;

export type NotificationTopic = (typeof NOTIFICATION_TOPICS)[number];

export interface NotificationChannelPreference {
  email: boolean;
  inApp: boolean;
  push: boolean;
}

export type NotificationPreferenceMap = Record<NotificationTopic, NotificationChannelPreference>;

export interface UserSettings {
  preferredLanguage: SupportedLanguage;
  notificationPreferences: NotificationPreferenceMap;
  assignedFleetIds: string[];
  assignedVehicleIds: string[];
  customPermissions: string[];
}

function buildDefaultTopicPreference(
  topic: NotificationTopic,
  role?: string | null,
  hasLinkedDriver?: boolean,
): NotificationChannelPreference {
  const isOperatorRole =
    role === 'TENANT_OWNER' || role === 'FLEET_MANAGER' || role === 'FINANCE_OFFICER';
  const isDriverAudience = hasLinkedDriver || role === 'FIELD_OFFICER';

  if (topic === 'remittance_reconciled') {
    return {
      email: isOperatorRole,
      inApp: true,
      push: isDriverAudience,
    };
  }

  if (topic === 'self_service_invite') {
    return {
      email: true,
      inApp: isOperatorRole,
      push: false,
    };
  }

  if (topic === 'marketing_updates') {
    return {
      email: false,
      inApp: false,
      push: false,
    };
  }

  if (topic === 'product_updates' || topic === 'trial_guidance') {
    return {
      email: true,
      inApp: isOperatorRole,
      push: false,
    };
  }

  return {
    email: true,
    inApp: true,
    push: isDriverAudience || isOperatorRole,
  };
}

export function buildDefaultNotificationPreferences(
  role?: string | null,
  hasLinkedDriver?: boolean,
): NotificationPreferenceMap {
  return Object.fromEntries(
    NOTIFICATION_TOPICS.map((topic) => [
      topic,
      buildDefaultTopicPreference(topic, role, hasLinkedDriver),
    ]),
  ) as NotificationPreferenceMap;
}

export function readUserSettings(
  rawSettings: unknown,
  defaults: {
    preferredLanguage: SupportedLanguage;
    role?: TenantRole | string | null;
    hasLinkedDriver?: boolean;
  },
): UserSettings {
  const defaultNotificationPreferences = buildDefaultNotificationPreferences(
    defaults.role,
    defaults.hasLinkedDriver,
  );

  if (!rawSettings || typeof rawSettings !== 'object' || Array.isArray(rawSettings)) {
    return {
      preferredLanguage: defaults.preferredLanguage,
      notificationPreferences: defaultNotificationPreferences,
      assignedFleetIds: [],
      assignedVehicleIds: [],
      customPermissions: [],
    };
  }

  const candidate = rawSettings as Record<string, unknown>;
  const preferredLanguage =
    candidate.preferredLanguage === 'fr' || candidate.preferredLanguage === 'en'
      ? candidate.preferredLanguage
      : defaults.preferredLanguage;

  const notificationPreferences =
    candidate.notificationPreferences &&
    typeof candidate.notificationPreferences === 'object' &&
    !Array.isArray(candidate.notificationPreferences)
      ? (candidate.notificationPreferences as Record<string, unknown>)
      : {};

  const mergedPreferences = Object.fromEntries(
    NOTIFICATION_TOPICS.map((topic) => {
      const configured = notificationPreferences[topic];
      const defaultValue = defaultNotificationPreferences[topic];
      if (!configured || typeof configured !== 'object' || Array.isArray(configured)) {
        return [topic, defaultValue];
      }
      const candidatePreference = configured as Record<string, unknown>;
      return [
        topic,
        {
          email:
            typeof candidatePreference.email === 'boolean'
              ? candidatePreference.email
              : defaultValue.email,
          inApp:
            typeof candidatePreference.inApp === 'boolean'
              ? candidatePreference.inApp
              : defaultValue.inApp,
          push:
            typeof candidatePreference.push === 'boolean'
              ? candidatePreference.push
              : defaultValue.push,
        },
      ];
    }),
  ) as NotificationPreferenceMap;

  return {
    preferredLanguage,
    notificationPreferences: mergedPreferences,
    assignedFleetIds: Array.isArray(candidate.assignedFleetIds)
      ? candidate.assignedFleetIds.filter(
          (value): value is string => typeof value === 'string' && value.trim().length > 0,
        )
      : [],
    assignedVehicleIds: Array.isArray(candidate.assignedVehicleIds)
      ? candidate.assignedVehicleIds.filter(
          (value): value is string => typeof value === 'string' && value.trim().length > 0,
        )
      : [],
    customPermissions: Array.isArray(candidate.customPermissions)
      ? candidate.customPermissions.filter(
          (value): value is string => typeof value === 'string' && value.trim().length > 0,
        )
      : [],
  };
}

export function writeUserSettings(
  currentSettings: unknown,
  nextSettings: Partial<UserSettings>,
  defaults: {
    preferredLanguage: SupportedLanguage;
    role?: TenantRole | string | null;
    hasLinkedDriver?: boolean;
  },
): Record<string, unknown> {
  const current = readUserSettings(currentSettings, defaults);
  const mergedPreferences = {
    ...current.notificationPreferences,
    ...(nextSettings.notificationPreferences ?? {}),
  };

  return {
    ...(currentSettings && typeof currentSettings === 'object' && !Array.isArray(currentSettings)
      ? (currentSettings as Record<string, unknown>)
      : {}),
    preferredLanguage: nextSettings.preferredLanguage ?? current.preferredLanguage,
    notificationPreferences: mergedPreferences,
    assignedFleetIds:
      'assignedFleetIds' in nextSettings && Array.isArray(nextSettings.assignedFleetIds)
        ? nextSettings.assignedFleetIds
        : current.assignedFleetIds,
    assignedVehicleIds:
      'assignedVehicleIds' in nextSettings && Array.isArray(nextSettings.assignedVehicleIds)
        ? nextSettings.assignedVehicleIds
        : current.assignedVehicleIds,
    customPermissions:
      'customPermissions' in nextSettings && Array.isArray(nextSettings.customPermissions)
        ? nextSettings.customPermissions
        : current.customPermissions,
  };
}
