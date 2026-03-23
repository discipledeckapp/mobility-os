'use server';

import { revalidatePath } from 'next/cache';
import {
  changeTenantPassword,
  deactivateTeamMember,
  inviteTeamMember,
  updateTenantProfile,
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

  if (!name) {
    return { error: 'Name is required.' };
  }

  try {
    await updateTenantProfile({
      name,
      ...(phone ? { phone } : {}),
    });
    revalidatePath('/settings');
    return { success: 'Profile updated.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update profile.',
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

export async function inviteTeamMemberAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  if (!name || !email || !role) {
    return { error: 'Name, email, and role are required.' };
  }

  try {
    await inviteTeamMember({ name, email, role, ...(phone ? { phone } : {}) });
    revalidatePath('/settings');
    return { success: `Invite sent to ${email}. They will receive an email to set their password.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to send invite.',
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
