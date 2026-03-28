import type { TenantRole } from '@mobility-os/authz-model';
import type { SupportedLanguage } from '../tenants/tenant-settings';

export const NOTIFICATION_TOPICS = [
  'verification_payment_receipt',
  'driver_verification_status',
  'driver_licence_review_pending',
  'driver_licence_review_resolved',
  'guarantor_status',
  'assignment_issued',
  'assignment_accepted',
  'assignment_changed',
  'assignment_ended',
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

export interface SelfServiceLinkage {
  subjectType: 'driver' | 'guarantor';
  driverId: string;
}

export interface UserSettings {
  preferredLanguage: SupportedLanguage;
  notificationPreferences: NotificationPreferenceMap;
  assignedFleetIds: string[];
  assignedVehicleIds: string[];
  customPermissions: string[];
  accessMode: 'tenant_user' | 'driver_mobile';
  selfServiceLinkage: SelfServiceLinkage | null;
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

  if (topic === 'verification_payment_receipt') {
    return {
      email: true,
      inApp: true,
      push: isDriverAudience,
    };
  }

  if (
    topic === 'driver_verification_status' ||
    topic === 'driver_licence_review_pending' ||
    topic === 'driver_licence_review_resolved' ||
    topic === 'guarantor_status' ||
    topic === 'assignment_issued' ||
    topic === 'assignment_accepted' ||
    topic === 'assignment_changed' ||
    topic === 'assignment_ended'
  ) {
    return {
      email: true,
      inApp: true,
      push: true,
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
      accessMode: defaults.hasLinkedDriver ? 'driver_mobile' : 'tenant_user',
      selfServiceLinkage: null,
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

  const selfServiceLinkage =
    candidate.selfServiceLinkage &&
    typeof candidate.selfServiceLinkage === 'object' &&
    !Array.isArray(candidate.selfServiceLinkage)
      ? (candidate.selfServiceLinkage as Record<string, unknown>)
      : null;

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
    accessMode:
      candidate.accessMode === 'driver_mobile' || candidate.accessMode === 'tenant_user'
        ? candidate.accessMode
        : defaults.hasLinkedDriver
          ? 'driver_mobile'
          : 'tenant_user',
    selfServiceLinkage:
      selfServiceLinkage &&
      (selfServiceLinkage.subjectType === 'driver' ||
        selfServiceLinkage.subjectType === 'guarantor') &&
      typeof selfServiceLinkage.driverId === 'string' &&
      selfServiceLinkage.driverId.trim().length > 0
        ? {
            subjectType: selfServiceLinkage.subjectType,
            driverId: selfServiceLinkage.driverId,
          }
        : null,
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
    accessMode:
      nextSettings.accessMode === 'driver_mobile' || nextSettings.accessMode === 'tenant_user'
        ? nextSettings.accessMode
        : current.accessMode,
    selfServiceLinkage:
      'selfServiceLinkage' in nextSettings
        ? nextSettings.selfServiceLinkage
        : current.selfServiceLinkage,
  };
}
