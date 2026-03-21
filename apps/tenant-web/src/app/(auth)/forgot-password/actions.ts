'use server';

import { requestPasswordReset } from '../../../lib/api-core';

export interface ForgotPasswordState {
  success?: boolean;
  error?: string;
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';

  if (!email) {
    return { error: 'Email address is required.' };
  }

  try {
    await requestPasswordReset(email);
    return { success: true };
  } catch {
    // Always return success to prevent email enumeration
    return { success: true };
  }
}
