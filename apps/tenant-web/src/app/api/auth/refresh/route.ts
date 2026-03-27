import { NextResponse } from 'next/server';
import { TENANT_AUTH_COOKIE_NAME, TENANT_REFRESH_COOKIE_NAME } from '../../../../lib/auth';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

function setSessionCookies(response: NextResponse, tokens: { accessToken: string; refreshToken: string }) {
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(TENANT_AUTH_COOKIE_NAME, tokens.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
  });
  response.cookies.set(TENANT_REFRESH_COOKIE_NAME, tokens.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { refreshToken?: string } | null;

  if (!body?.refreshToken) {
    return NextResponse.json({ error: 'Refresh token is required.' }, { status: 400 });
  }

  const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: body.refreshToken }),
    cache: 'no-store',
  });

  if (!refreshResponse.ok) {
    const response = NextResponse.json(
      { error: 'Unable to refresh the tenant session.' },
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
  const accessToken = payload.accessToken ?? payload.token ?? payload.jwt;

  if (!accessToken || !payload.refreshToken) {
    return NextResponse.json(
      { error: 'Unable to refresh the tenant session.' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    accessToken,
    refreshToken: payload.refreshToken,
  });
  setSessionCookies(response, {
    accessToken,
    refreshToken: payload.refreshToken,
  });
  return response;
}
