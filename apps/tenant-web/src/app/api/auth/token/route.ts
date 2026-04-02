import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_FORWARDED_AUTH_HEADER,
  TENANT_FORWARDED_REFRESH_HEADER,
  TENANT_REFRESH_COOKIE_NAME,
  getTenantAccessCookieOptions,
  getTenantRefreshCookieOptions,
  isTenantJwtUsable,
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

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const forwardedAccessToken = request.headers.get(TENANT_FORWARDED_AUTH_HEADER) ?? undefined;
  const accessToken = forwardedAccessToken ?? cookieStore.get(TENANT_AUTH_COOKIE_NAME)?.value;

  if (isTenantJwtUsable(accessToken)) {
    return NextResponse.json({ accessToken });
  }

  const refreshToken =
    request.headers.get(TENANT_FORWARDED_REFRESH_HEADER) ??
    cookieStore.get(TENANT_REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return NextResponse.json(
      { error: 'No tenant auth token is available. Log in to continue.' },
      { status: 401 },
    );
  }

  const refreshedSession = await refreshTenantSession(refreshToken, {
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

  const response = NextResponse.json({ accessToken: refreshedSession.accessToken });
  setSessionCookies(response, {
    accessToken: refreshedSession.accessToken,
    refreshToken: refreshedSession.refreshToken,
  });
  return response;
}
