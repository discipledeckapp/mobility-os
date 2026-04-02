import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_REFRESH_COOKIE_NAME,
  getTenantAccessCookieOptions,
  getTenantRefreshCookieOptions,
} from '../../../../lib/auth';
import { refreshTenantSession } from '../../../../lib/tenant-session-refresh';

function setSessionCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set(
    TENANT_AUTH_COOKIE_NAME,
    tokens.accessToken,
    getTenantAccessCookieOptions(tokens.accessToken),
  );
  response.cookies.set(
    TENANT_REFRESH_COOKIE_NAME,
    tokens.refreshToken,
    getTenantRefreshCookieOptions(tokens.refreshToken),
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { refreshToken?: string } | null;

  if (!body?.refreshToken) {
    return NextResponse.json({ error: 'Refresh token is required.' }, { status: 400 });
  }

  const refreshedSession = await refreshTenantSession(body.refreshToken, {
    retryUnavailableOnce: true,
  });
  if (refreshedSession.status !== 'success') {
    if (refreshedSession.status === 'unavailable') {
      return NextResponse.json(
        { error: 'We could not refresh the tenant session right now. Please try again shortly.' },
        { status: 503 },
      );
    }

    const response = NextResponse.json(
      { error: 'Your session has expired. Log in again to continue.' },
      { status: 401 },
    );
    response.cookies.delete(TENANT_AUTH_COOKIE_NAME);
    response.cookies.delete(TENANT_REFRESH_COOKIE_NAME);
    return response;
  }

  const response = NextResponse.json({
    accessToken: refreshedSession.accessToken,
    refreshToken: refreshedSession.refreshToken,
  });
  setSessionCookies(response, refreshedSession);
  return response;
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(TENANT_REFRESH_COOKIE_NAME)?.value;
  const requestUrl = new URL(request.url);
  const returnTo = requestUrl.searchParams.get('returnTo') || '/';

  if (!refreshToken) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(TENANT_AUTH_COOKIE_NAME);
    response.cookies.delete(TENANT_REFRESH_COOKIE_NAME);
    return response;
  }

  const refreshedSession = await refreshTenantSession(refreshToken, {
    retryUnavailableOnce: true,
  });
  if (refreshedSession.status !== 'success') {
    if (refreshedSession.status === 'unavailable') {
      const recoveryUrl = new URL('/session-recovery', request.url);
      if (returnTo && returnTo !== '/session-recovery') {
        recoveryUrl.searchParams.set('next', returnTo);
      }
      return NextResponse.redirect(recoveryUrl);
    }

    const loginUrl = new URL('/login', request.url);
    if (returnTo && returnTo !== '/login') {
      loginUrl.searchParams.set('next', returnTo);
    }
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(TENANT_AUTH_COOKIE_NAME);
    response.cookies.delete(TENANT_REFRESH_COOKIE_NAME);
    return response;
  }

  const destination = new URL(returnTo, request.url);
  const response = NextResponse.redirect(destination);
  setSessionCookies(response, refreshedSession);
  return response;
}
