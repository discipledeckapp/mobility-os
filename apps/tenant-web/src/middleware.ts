import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_REFRESH_COOKIE_NAME,
  getSelfServiceContinuationPath,
  getTenantAccessCookieOptions,
  getTenantRefreshCookieOptions,
  isTenantJwtUsable,
  parseTenantJwtPayload,
} from './lib/auth';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

async function refreshTenantSession(refreshToken: string) {
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
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

function applySessionCookies(
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(TENANT_AUTH_COOKIE_NAME)?.value;
  const refreshCookie = request.cookies.get(TENANT_REFRESH_COOKIE_NAME)?.value;
  const isPublicRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/driver-kyc/payment-return') ||
    pathname.startsWith('/driver-self-service') ||
    pathname.startsWith('/guarantor-self-service');

  let activeAccessToken = authCookie;
  let activeRefreshToken = refreshCookie;

  if (!isTenantJwtUsable(activeAccessToken) && activeRefreshToken) {
    const refreshedSession = await refreshTenantSession(activeRefreshToken);
    if (refreshedSession) {
      activeAccessToken = refreshedSession.accessToken;
      activeRefreshToken = refreshedSession.refreshToken;
      const payload = parseTenantJwtPayload(activeAccessToken);
      const continuationPath = getSelfServiceContinuationPath(payload);
      const isLoginRoute = pathname === '/login';

      if (
        continuationPath &&
        !pathname.startsWith('/driver-self-service') &&
        !pathname.startsWith('/guarantor-self-service') &&
        !pathname.startsWith('/driver-kyc/payment-return')
      ) {
        const response = NextResponse.redirect(new URL(continuationPath, request.url));
        applySessionCookies(response, refreshedSession);
        return response;
      }

      if (isLoginRoute) {
        const response = NextResponse.redirect(new URL(continuationPath ?? '/', request.url));
        applySessionCookies(response, refreshedSession);
        return response;
      }

      const response = NextResponse.next();
      applySessionCookies(response, refreshedSession);
      return response;
    }
  }

  const hasUsableSession = isTenantJwtUsable(activeAccessToken);
  const payload = parseTenantJwtPayload(activeAccessToken);
  const continuationPath = getSelfServiceContinuationPath(payload);

  if (!hasUsableSession && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    const currentPath = `${pathname}${request.nextUrl.search}`;
    if (currentPath && currentPath !== '/login') {
      loginUrl.searchParams.set('next', currentPath);
    }
    const response = NextResponse.redirect(loginUrl);
    if (activeAccessToken) {
      response.cookies.delete(TENANT_AUTH_COOKIE_NAME);
    }
    response.cookies.delete(TENANT_REFRESH_COOKIE_NAME);
    return response;
  }

  if (!hasUsableSession && isPublicRoute) {
    if (!authCookie || refreshCookie) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.cookies.delete(TENANT_AUTH_COOKIE_NAME);
    response.cookies.delete(TENANT_REFRESH_COOKIE_NAME);
    return response;
  }

  const isLoginRoute = pathname === '/login';
  if (
    hasUsableSession &&
    continuationPath &&
    !pathname.startsWith('/driver-self-service') &&
    !pathname.startsWith('/guarantor-self-service') &&
    !pathname.startsWith('/driver-kyc/payment-return')
  ) {
    return NextResponse.redirect(new URL(continuationPath, request.url));
  }

  if (hasUsableSession && isLoginRoute) {
    return NextResponse.redirect(new URL(continuationPath ?? '/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
