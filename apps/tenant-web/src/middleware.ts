import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_FORWARDED_AUTH_HEADER,
  TENANT_FORWARDED_REFRESH_HEADER,
  TENANT_REFRESH_COOKIE_NAME,
  getSelfServiceContinuationPath,
  getTenantAccessCookieOptions,
  getTenantRefreshCookieOptions,
  isTenantJwtUsable,
  parseTenantJwtPayload,
} from './lib/auth';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

function isAuthEntryRoute(pathname: string) {
  return (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/reset-password')
  );
}

function isSelfServiceRoute(pathname: string) {
  return (
    pathname.startsWith('/driver-self-service') ||
    pathname.startsWith('/guarantor-self-service') ||
    pathname.startsWith('/driver-kyc/payment-return')
  );
}

async function refreshTenantSession(refreshToken: string) {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        status: response.status === 401 || response.status === 403 ? 'invalid' : 'unavailable',
      } as const;
    }

    const payload = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
      token?: string;
      jwt?: string;
    };
    const accessToken = payload.accessToken ?? payload.token ?? payload.jwt;
    if (!accessToken || !payload.refreshToken) {
      return { status: 'unavailable' } as const;
    }

    return {
      status: 'success',
      accessToken,
      refreshToken: payload.refreshToken,
    } as const;
  } catch {
    return { status: 'unavailable' } as const;
  }
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

function withForwardedSessionHeaders(
  request: NextRequest,
  tokens: { accessToken: string; refreshToken: string },
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_FORWARDED_AUTH_HEADER, tokens.accessToken);
  requestHeaders.set(TENANT_FORWARDED_REFRESH_HEADER, tokens.refreshToken);
  return requestHeaders;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(TENANT_AUTH_COOKIE_NAME)?.value;
  const refreshCookie = request.cookies.get(TENANT_REFRESH_COOKIE_NAME)?.value;
  const isPublicRoute =
    isAuthEntryRoute(pathname) ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    isSelfServiceRoute(pathname);

  let activeAccessToken = authCookie;
  let activeRefreshToken = refreshCookie;

  if (!isTenantJwtUsable(activeAccessToken) && activeRefreshToken) {
    const refreshedSession = await refreshTenantSession(activeRefreshToken);
    if (refreshedSession.status === 'success') {
      activeAccessToken = refreshedSession.accessToken;
      activeRefreshToken = refreshedSession.refreshToken;
      const payload = parseTenantJwtPayload(activeAccessToken);
      const continuationPath = getSelfServiceContinuationPath(payload);
      const isAuthRoute = isAuthEntryRoute(pathname);
      const forwardedHeaders = withForwardedSessionHeaders(request, refreshedSession);

      if (continuationPath && !isSelfServiceRoute(pathname)) {
        const response = NextResponse.redirect(new URL(continuationPath, request.url));
        applySessionCookies(response, refreshedSession);
        return response;
      }

      if (isAuthRoute) {
        const response = NextResponse.redirect(new URL(continuationPath ?? '/', request.url));
        applySessionCookies(response, refreshedSession);
        return response;
      }

      const response = NextResponse.next({
        request: {
          headers: forwardedHeaders,
        },
      });
      applySessionCookies(response, refreshedSession);
      return response;
    }

    if (refreshedSession.status === 'unavailable') {
      if (!isPublicRoute) {
        return NextResponse.next();
      }
    }
  }

  const hasUsableSession = isTenantJwtUsable(activeAccessToken);
  const payload = parseTenantJwtPayload(activeAccessToken);
  const continuationPath = getSelfServiceContinuationPath(payload);

  if (!hasUsableSession && !isPublicRoute) {
    if (activeRefreshToken) {
      return NextResponse.next();
    }
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

  const isAuthRoute = isAuthEntryRoute(pathname);
  if (hasUsableSession && continuationPath && !isSelfServiceRoute(pathname)) {
    return NextResponse.redirect(new URL(continuationPath, request.url));
  }

  if (hasUsableSession && isAuthRoute) {
    return NextResponse.redirect(new URL(continuationPath ?? '/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
