'use server';

import { requestPlatformPasswordReset } from '../../../lib/api-control-plane';

export interface ForgotPasswordActionState {
  success?: string;
  error?: string;
}

export async function forgotPasswordAction(
  _previousState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    return { error: 'Enter your platform staff email address.' };
  }

  try {
    const result = await requestPlatformPasswordReset(email);
    return { success: result.message };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Unable to start password recovery right now.',
    };
  }
}
