'use server';

import type { Route } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginTenantUser } from '../../../lib/api-core';
import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_REFRESH_COOKIE_NAME,
  getSelfServiceContinuationPath,
  getTenantAccessCookieOptions,
  getTenantRefreshCookieOptions,
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

  let accessToken: string;
  try {
    const { accessToken: nextAccessToken, refreshToken } = await loginTenantUser({
      identifier,
      password,
    });
    accessToken = nextAccessToken;
    const cookieStore = await cookies();
    cookieStore.set(
      TENANT_AUTH_COOKIE_NAME,
      accessToken,
      getTenantAccessCookieOptions(accessToken),
    );
    cookieStore.set(
      TENANT_REFRESH_COOKIE_NAME,
      refreshToken,
      getTenantRefreshCookieOptions(refreshToken),
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to log in at this time.',
    };
  }

  const continuationPath = getSelfServiceContinuationPath(parseTenantJwtPayload(accessToken));
  redirect((continuationPath ?? '/') as Route);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TENANT_AUTH_COOKIE_NAME);
  cookieStore.delete(TENANT_REFRESH_COOKIE_NAME);
  redirect('/login' as Route);
}
