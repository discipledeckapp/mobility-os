'use server';

import { resetPlatformPassword } from '../../../lib/api-control-plane';

export interface ResetPasswordActionState {
  success?: string;
  error?: string;
}

export async function resetPasswordAction(
  _previousState: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const token = String(formData.get('token') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!token || !password || !confirmPassword) {
    return { error: 'Complete the password reset form to continue.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    const result = await resetPlatformPassword({ token, password });
    return { success: result.message };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to reset password right now.',
    };
  }
}
