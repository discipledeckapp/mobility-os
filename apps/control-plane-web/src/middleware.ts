import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PLATFORM_AUTH_COOKIE_NAME, isPlatformJwtUsable } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(PLATFORM_AUTH_COOKIE_NAME)?.value;
  const hasUsableSession = isPlatformJwtUsable(authCookie);
  const isLoginRoute = pathname === '/login';

  if (!hasUsableSession && !isLoginRoute) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    if (authCookie) {
      response.cookies.delete(PLATFORM_AUTH_COOKIE_NAME);
    }
    return response;
  }

  if (!hasUsableSession && isLoginRoute) {
    if (!authCookie) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.cookies.delete(PLATFORM_AUTH_COOKIE_NAME);
    return response;
  }

  if (hasUsableSession && isLoginRoute) {
    return NextResponse.redirect(new URL('/tenants', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
