const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

export type TenantSessionRefreshResult =
  | {
      status: 'success';
      accessToken: string;
      refreshToken: string;
    }
  | {
      status: 'invalid' | 'unavailable';
    };

export async function refreshTenantSession(
  refreshToken: string,
): Promise<TenantSessionRefreshResult> {
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
      };
    }

    const payload = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
      token?: string;
      jwt?: string;
    };
    const accessToken = payload.accessToken ?? payload.token ?? payload.jwt;
    if (!accessToken || !payload.refreshToken) {
      return { status: 'unavailable' };
    }

    return {
      status: 'success',
      accessToken,
      refreshToken: payload.refreshToken,
    };
  } catch {
    return { status: 'unavailable' };
  }
}
