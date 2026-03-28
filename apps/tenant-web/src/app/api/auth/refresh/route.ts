import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_REFRESH_COOKIE_NAME,
  getTenantAccessCookieOptions,
  getTenantRefreshCookieOptions,
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

async function refreshSession(refreshToken: string) {
  const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const payload = (await refreshResponse.json()) as {
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    jwt?: string;
  };
  const accessToken = payload.accessToken ?? payload.token ?? payload.jwt;

  if (!accessToken || !payload.refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken: payload.refreshToken,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { refreshToken?: string } | null;

  if (!body?.refreshToken) {
    return NextResponse.json({ error: 'Refresh token is required.' }, { status: 400 });
  }

  const refreshedSession = await refreshSession(body.refreshToken);
  if (!refreshedSession) {
    const response = NextResponse.json(
      { error: 'Unable to refresh the tenant session.' },
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

  const refreshedSession = await refreshSession(refreshToken);
  if (!refreshedSession) {
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
