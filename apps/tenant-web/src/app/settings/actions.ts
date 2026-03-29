'use server';

import { revalidatePath } from 'next/cache';
import {
  createDataSubjectRequest,
  changeTenantPassword,
  deactivateTeamMember,
  resendTeamInvite,
  syncMaintenanceReminders,
  syncRemittanceReminders,
  inviteTeamMember,
  updateTeamMemberAccess,
  updateNotificationPreferences,
  updateTenantProfile,
  updateTenantSettings,
} from '../../lib/api-core';

export interface SettingsActionState {
  success?: string;
  error?: string;
}

export interface TeamActionState {
  success?: string;
  error?: string;
}

export async function updateProfileAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const preferredLanguage = String(formData.get('preferredLanguage') ?? '').trim();

  if (!name) {
    return { error: 'Name is required.' };
  }

  try {
    await updateTenantProfile({
      name,
      ...(phone ? { phone } : {}),
      ...(preferredLanguage === 'en' || preferredLanguage === 'fr'
        ? { preferredLanguage }
        : {}),
    });
    revalidatePath('/settings');
    return { success: 'Profile updated.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update profile.',
    };
  }
}

export async function updateOrganisationSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const readBoolean = (key: string): boolean => {
    const value = formData.get(key);
    return value === 'on' || value === 'true';
  };
  const displayName = String(formData.get('displayName') ?? '').trim();
  const logoUrl = String(formData.get('logoUrl') ?? '').trim();
  const defaultLanguage = String(formData.get('defaultLanguage') ?? '').trim();
  const guarantorMaxActiveDrivers = Number(formData.get('guarantorMaxActiveDrivers') ?? 2);
  const autoSendDriverSelfServiceLinkOnCreate = readBoolean(
    'autoSendDriverSelfServiceLinkOnCreate',
  );
  const requireIdentityVerificationForActivation = readBoolean(
    'requireIdentityVerificationForActivation',
  );
  const requireBiometricVerification = readBoolean('requireBiometricVerification');
  const requireGovernmentVerificationLookup = readBoolean(
    'requireGovernmentVerificationLookup',
  );
  const driverPaysKyc = formData.get('driverPaysKyc') === 'true';
  const requireGuarantor = readBoolean('requireGuarantor');
  const guarantorBlocking = readBoolean('guarantorBlocking');
  const requireGuarantorVerification = readBoolean('requireGuarantorVerification');
  const requiredDriverDocumentSlugs = formData
    .getAll('requiredDriverDocumentSlugs')
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);
  const requiredVehicleDocumentSlugs = String(formData.get('requiredVehicleDocumentSlugs') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  try {
    await updateTenantSettings({
      ...(displayName ? { displayName } : {}),
      ...(logoUrl ? { logoUrl } : {}),
      ...(defaultLanguage === 'en' || defaultLanguage === 'fr' ? { defaultLanguage } : {}),
      ...(Number.isFinite(guarantorMaxActiveDrivers)
        ? { guarantorMaxActiveDrivers }
        : {}),
      autoSendDriverSelfServiceLinkOnCreate,
      requireIdentityVerificationForActivation,
      requireBiometricVerification,
      requireGovernmentVerificationLookup,
      driverPaysKyc,
      requireGuarantor,
      guarantorBlocking,
      requireGuarantorVerification,
      customDriverDocumentTypes: [],
      requiredDriverDocumentSlugs: Array.from(new Set(requiredDriverDocumentSlugs)),
      ...(requiredVehicleDocumentSlugs.length > 0 ? { requiredVehicleDocumentSlugs } : {}),
      allowAdminAssignmentOverride: readBoolean('allowAdminAssignmentOverride'),
    });
    revalidatePath('/settings');
    revalidatePath('/');
    return { success: 'Organisation settings updated.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update organisation settings.',
    };
  }
}

const NOTIFICATION_TOPICS = [
  'remittance_due',
  'remittance_overdue',
  'remittance_reconciled',
  'late_remittance_risk',
  'compliance_risk',
  'maintenance_due',
  'maintenance_overdue',
  'vehicle_incident_reported',
  'self_service_invite',
  'billing_updates',
  'trial_guidance',
  'product_updates',
  'marketing_updates',
] as const;

const NOTIFICATION_CHANNELS = ['email', 'inApp', 'push'] as const;

export async function updateNotificationPreferencesAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const payload = Object.fromEntries(
    NOTIFICATION_TOPICS.map((topic) => [
      topic,
      Object.fromEntries(
        NOTIFICATION_CHANNELS.map((channel) => [
          channel,
          formData.get(`${topic}.${channel}`) === 'on',
        ]),
      ),
    ]),
  );

  try {
    await updateNotificationPreferences(payload);
    revalidatePath('/settings');
    return { success: 'Notification preferences updated.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update notification preferences.',
    };
  }
}

export async function syncRemittanceRemindersAction(
  _previousState: SettingsActionState,
  _formData: FormData,
): Promise<SettingsActionState> {
  try {
    const result = await syncRemittanceReminders();
    revalidatePath('/settings');
    return { success: `${result.created} reminders refreshed.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to refresh reminders.',
    };
  }
}

export async function syncMaintenanceRemindersAction(
  _previousState: SettingsActionState,
  _formData: FormData,
): Promise<SettingsActionState> {
  try {
    const result = await syncMaintenanceReminders();
    revalidatePath('/settings');
    return { success: `${result.created} maintenance reminders refreshed.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to refresh maintenance reminders.',
    };
  }
}

export async function changePasswordAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const currentPassword = String(formData.get('currentPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Complete all password fields.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New password and confirmation do not match.' };
  }

  try {
    const result = await changeTenantPassword({
      currentPassword,
      newPassword,
    });
    return { success: result.message };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to change password.',
    };
  }
}

export async function createDataSubjectRequestAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const requestType = String(formData.get('requestType') ?? '').trim();
  const details = String(formData.get('details') ?? '').trim();

  if (
    requestType !== 'access' &&
    requestType !== 'correction' &&
    requestType !== 'deletion' &&
    requestType !== 'restriction'
  ) {
    return { error: 'Choose the type of privacy request you want to submit.' };
  }

  try {
    await createDataSubjectRequest({
      requestType,
      ...(details ? { details } : {}),
    });
    revalidatePath('/settings');
    return { success: 'Privacy request submitted. Our support team will review it.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to submit your privacy request.',
    };
  }
}

export async function inviteTeamMemberAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const assignedFleetIds = formData
    .getAll('assignedFleetIds')
    .map((value) => String(value).trim())
    .filter(Boolean);
  const assignedVehicleIds = formData
    .getAll('assignedVehicleIds')
    .map((value) => String(value).trim())
    .filter(Boolean);
  const customPermissions = formData
    .getAll('customPermissions')
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!name || !email || !role) {
    return { error: 'Name, email, and role are required.' };
  }

  try {
    await inviteTeamMember({
      name,
      email,
      role,
      ...(phone ? { phone } : {}),
      ...(assignedFleetIds.length > 0 ? { assignedFleetIds } : {}),
      ...(assignedVehicleIds.length > 0 ? { assignedVehicleIds } : {}),
      ...(customPermissions.length > 0 ? { customPermissions } : {}),
    });
    revalidatePath('/settings');
    return { success: `Invite sent to ${email}. They will receive an email to set their password.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to send invite.',
    };
  }
}

export async function updateTeamMemberAccessAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const userId = String(formData.get('userId') ?? '').trim();
  const assignedFleetIds = formData
    .getAll('assignedFleetIds')
    .map((value) => String(value).trim())
    .filter(Boolean);
  const assignedVehicleIds = formData
    .getAll('assignedVehicleIds')
    .map((value) => String(value).trim())
    .filter(Boolean);
  const customPermissions = formData
    .getAll('customPermissions')
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!userId) {
    return { error: 'User ID is required.' };
  }

  try {
    await updateTeamMemberAccess(userId, {
      assignedFleetIds,
      assignedVehicleIds,
      customPermissions,
    });
    revalidatePath('/settings');
    return { success: 'Access updated.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update team member access.',
    };
  }
}

export async function deactivateTeamMemberAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const userId = String(formData.get('userId') ?? '').trim();

  if (!userId) {
    return { error: 'User ID is required.' };
  }

  try {
    await deactivateTeamMember(userId);
    revalidatePath('/settings');
    return { success: 'Team member deactivated.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to deactivate team member.',
    };
  }
}

export async function resendTeamInviteAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const userId = String(formData.get('userId') ?? '').trim();

  if (!userId) {
    return { error: 'User ID is required.' };
  }

  try {
    const result = await resendTeamInvite(userId);
    revalidatePath('/settings');
    return { success: result.message };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to resend invite.',
    };
  }
}
