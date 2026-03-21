'use server';

import type { Route } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginPlatformUser } from '../../../lib/api-control-plane';
import { PLATFORM_AUTH_COOKIE_NAME } from '../../../lib/auth';

export interface LoginActionState {
  error?: string;
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = getTrimmedValue(formData, 'email');
  const password = getTrimmedValue(formData, 'password');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    const { accessToken } = await loginPlatformUser({ email, password });
    const cookieStore = await cookies();
    cookieStore.set(PLATFORM_AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to log in at this time.',
    };
  }

  redirect('/tenants');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PLATFORM_AUTH_COOKIE_NAME);
  redirect('/login' as Route);
}
