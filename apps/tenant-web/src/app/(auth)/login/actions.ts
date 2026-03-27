'use server';

import type { Route } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginTenantUser } from '../../../lib/api-core';
import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_REFRESH_COOKIE_NAME,
  getSelfServiceContinuationPath,
  parseTenantJwtPayload,
} from '../../../lib/auth';

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
  const identifier = getTrimmedValue(formData, 'identifier');
  const password = getTrimmedValue(formData, 'password');

  if (!identifier || !password) {
    return { error: 'Email or phone number and password are required.' };
  }

  try {
    const { accessToken, refreshToken } = await loginTenantUser({
      identifier,
      password,
    });
    const cookieStore = await cookies();
    cookieStore.set(TENANT_AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    cookieStore.set(TENANT_REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    const continuationPath = getSelfServiceContinuationPath(parseTenantJwtPayload(accessToken));
    redirect((continuationPath ?? '/') as Route);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to log in at this time.',
    };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TENANT_AUTH_COOKIE_NAME);
  cookieStore.delete(TENANT_REFRESH_COOKIE_NAME);
  redirect('/login' as Route);
}
