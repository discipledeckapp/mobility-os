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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function refreshTenantSession(
  refreshToken: string,
  options: { retryUnavailableOnce?: boolean } = {},
): Promise<TenantSessionRefreshResult> {
  const attempts = options.retryUnavailableOnce ? 2 : 1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
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
        const status =
          response.status === 401 || response.status === 403 ? 'invalid' : 'unavailable';
        if (status === 'invalid') {
          return { status };
        }
        if (attempt + 1 < attempts) {
          await sleep(250);
          continue;
        }
        return { status };
      }

      const payload = (await response.json()) as {
        accessToken?: string;
        refreshToken?: string;
        token?: string;
        jwt?: string;
      };
      const accessToken = payload.accessToken ?? payload.token ?? payload.jwt;
      if (!accessToken || !payload.refreshToken) {
        if (attempt + 1 < attempts) {
          await sleep(250);
          continue;
        }
        return { status: 'unavailable' };
      }

      return {
        status: 'success',
        accessToken,
        refreshToken: payload.refreshToken,
      };
    } catch {
      if (attempt + 1 < attempts) {
        await sleep(250);
        continue;
      }
      return { status: 'unavailable' };
    }
  }

  return { status: 'unavailable' };
}
