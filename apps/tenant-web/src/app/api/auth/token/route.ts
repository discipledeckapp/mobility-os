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

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

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

  const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!refreshResponse.ok) {
    if (refreshResponse.status !== 401 && refreshResponse.status !== 403) {
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

  const payload = (await refreshResponse.json()) as {
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    jwt?: string;
  };
  const nextAccessToken = payload.accessToken ?? payload.token ?? payload.jwt;
  const nextRefreshToken = payload.refreshToken;

  if (!nextAccessToken || !nextRefreshToken) {
    return NextResponse.json(
      { error: 'Unable to refresh the tenant session. Log in again.' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ accessToken: nextAccessToken });
  setSessionCookies(response, {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  });
  return response;
}
