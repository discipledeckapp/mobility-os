'use server';

import { revalidatePath } from 'next/cache';
import { changeTenantPassword, updateTenantProfile } from '../../lib/api-core';

export interface SettingsActionState {
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
