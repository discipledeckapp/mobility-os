import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_REFRESH_COOKIE_NAME,
  getSelfServiceContinuationPath,
  isTenantJwtUsable,
  parseTenantJwtPayload,
} from './lib/auth';

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

function isInternalAuthRoute(pathname: string) {
  return pathname === '/api/auth/token' || pathname === '/api/auth/refresh';
}

function buildTenantLoginRedirect(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (currentPath && currentPath !== '/login') {
    loginUrl.searchParams.set('next', currentPath);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(TENANT_AUTH_COOKIE_NAME);
  response.cookies.delete(TENANT_REFRESH_COOKIE_NAME);
  return response;
}

function buildSessionRefreshRedirect(request: NextRequest) {
  const refreshUrl = new URL('/api/auth/refresh', request.url);
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (currentPath && currentPath !== '/api/auth/refresh') {
    refreshUrl.searchParams.set('returnTo', currentPath);
  }

  return NextResponse.redirect(refreshUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(TENANT_AUTH_COOKIE_NAME)?.value;
  const refreshCookie = request.cookies.get(TENANT_REFRESH_COOKIE_NAME)?.value;
  const isInternalApiRoute = pathname.startsWith('/api/');
  const isPublicRoute =
    isAuthEntryRoute(pathname) ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/session-recovery' ||
    isInternalAuthRoute(pathname) ||
    isSelfServiceRoute(pathname);
  const shouldAttemptSessionRefresh =
    !isInternalApiRoute &&
    pathname !== '/privacy' &&
    pathname !== '/terms' &&
    pathname !== '/session-recovery' &&
    !isSelfServiceRoute(pathname);

  let activeAccessToken = authCookie;
  let activeRefreshToken = refreshCookie;

  if (!isTenantJwtUsable(activeAccessToken) && activeRefreshToken && shouldAttemptSessionRefresh) {
    return buildSessionRefreshRedirect(request);
  }

  const hasUsableSession = isTenantJwtUsable(activeAccessToken);
  const payload = parseTenantJwtPayload(activeAccessToken);
  const continuationPath = getSelfServiceContinuationPath(payload);

  if (!hasUsableSession && !isPublicRoute) {
    return buildTenantLoginRedirect(request);
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
