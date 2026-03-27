import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PLATFORM_AUTH_COOKIE_NAME, isPlatformJwtUsable } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(PLATFORM_AUTH_COOKIE_NAME)?.value;
  const hasUsableSession = isPlatformJwtUsable(authCookie);
  const isLoginRoute = pathname === '/login';
  const isPublicInviteRoute = pathname === '/staff/accept';
  const isForgotPasswordRoute = pathname === '/forgot-password';
  const isResetPasswordRoute = pathname === '/reset-password';
  const isLegalRoute = pathname === '/privacy' || pathname === '/terms';
  const isPublicRoute =
    isLoginRoute || isPublicInviteRoute || isForgotPasswordRoute || isResetPasswordRoute || isLegalRoute;

  if (!hasUsableSession && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    if (authCookie) {
      response.cookies.delete(PLATFORM_AUTH_COOKIE_NAME);
    }
    return response;
  }

  if (!hasUsableSession && isPublicRoute) {
    if (!authCookie) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.cookies.delete(PLATFORM_AUTH_COOKIE_NAME);
    return response;
  }

  if (hasUsableSession && (isLoginRoute || isForgotPasswordRoute || isResetPasswordRoute)) {
    return NextResponse.redirect(new URL('/tenants', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
