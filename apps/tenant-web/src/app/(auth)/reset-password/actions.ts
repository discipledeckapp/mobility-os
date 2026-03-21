'use server';

import { confirmPasswordReset } from '../../../lib/api-core';

export interface ResetPasswordState {
  success?: boolean;
  error?: string;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = (formData.get('token') as string | null)?.trim() ?? '';
  const newPassword = (formData.get('newPassword') as string | null) ?? '';
  const confirmPassword = (formData.get('confirmPassword') as string | null) ?? '';

  if (!token) {
    return { error: 'Reset token is missing. Use the link from your email.' };
  }
  if (!newPassword || newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    await confirmPasswordReset(token, newPassword);
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'This reset link is invalid or has expired. Request a new one.',
    };
  }
}
