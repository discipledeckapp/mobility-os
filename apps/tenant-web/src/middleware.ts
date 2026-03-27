import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  TENANT_AUTH_COOKIE_NAME,
  TENANT_REFRESH_COOKIE_NAME,
  getSelfServiceContinuationPath,
  isTenantJwtUsable,
  parseTenantJwtPayload,
} from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(TENANT_AUTH_COOKIE_NAME)?.value;
  const hasUsableSession = isTenantJwtUsable(authCookie);
  const payload = parseTenantJwtPayload(authCookie);
  const continuationPath = getSelfServiceContinuationPath(payload);
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

  if (!hasUsableSession && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    if (authCookie) {
      response.cookies.delete(TENANT_AUTH_COOKIE_NAME);
    }
    response.cookies.delete(TENANT_REFRESH_COOKIE_NAME);
    return response;
  }

  if (!hasUsableSession && isPublicRoute) {
    if (!authCookie) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.cookies.delete(TENANT_AUTH_COOKIE_NAME);
    response.cookies.delete(TENANT_REFRESH_COOKIE_NAME);
    return response;
  }

  const isLoginRoute = pathname === '/login';
  if (hasUsableSession && continuationPath && !pathname.startsWith('/driver-self-service') && !pathname.startsWith('/guarantor-self-service') && !pathname.startsWith('/driver-kyc/payment-return')) {
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
