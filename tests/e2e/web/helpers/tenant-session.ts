import { expect, type BrowserContext, type Page } from '@playwright/test';

const tenantBaseUrl = process.env.TENANT_WEB_BASE_URL ?? 'http://localhost:3000';
const tenantApiBaseUrl = process.env.TENANT_API_BASE_URL ?? 'http://localhost:3001/api/v1';
let tenantSessionPromise:
  | Promise<{ accessToken: string; refreshToken: string }>
  | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildExpiredAccessToken() {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encodeBase64Url(
    JSON.stringify({
      sub: 'e2e-user',
      tenantId: 'e2e-tenant',
      role: 'TENANT_OWNER',
      exp: Math.floor(Date.now() / 1000) - 120,
    }),
  );
  return `${header}.${payload}.signature`;
}

async function createTenantSessionTokens(page: Page) {
  const tenantEmail = process.env.TENANT_WEB_TEST_EMAIL;
  const tenantPassword = process.env.TENANT_WEB_TEST_PASSWORD;

  expect(
    tenantEmail,
    'TENANT_WEB_TEST_EMAIL is required for authenticated tenant-web E2E.',
  ).toBeTruthy();
  expect(
    tenantPassword,
    'TENANT_WEB_TEST_PASSWORD is required for authenticated tenant-web E2E.',
  ).toBeTruthy();

  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const response = await page.request.post(`${tenantApiBaseUrl}/auth/login`, {
      data: {
        identifier: tenantEmail,
        password: tenantPassword,
      },
    });

    if (response.ok()) {
      const payload = (await response.json()) as {
        accessToken?: string;
        token?: string;
        jwt?: string;
        refreshToken?: string;
      };
      const accessToken = payload.accessToken ?? payload.token ?? payload.jwt;
      expect(accessToken, 'Tenant API login did not return an access token.').toBeTruthy();
      expect(payload.refreshToken, 'Tenant API login did not return a refresh token.').toBeTruthy();

      return {
        accessToken: accessToken!,
        refreshToken: payload.refreshToken!,
      };
    }

    if (response.status() === 429 && attempt < 8) {
      await sleep(Math.min(20_000, attempt * 4_000));
      continue;
    }

    expect(response.ok(), `Tenant API login failed with ${response.status()}`).toBeTruthy();
  }

  throw new Error('Tenant API login retry loop ended unexpectedly.');
}

async function getTenantSessionTokens(page: Page) {
  if (!tenantSessionPromise) {
    tenantSessionPromise = createTenantSessionTokens(page).catch((error) => {
      tenantSessionPromise = null;
      throw error;
    });
  }

  return tenantSessionPromise;
}

async function rotateTenantSessionTokens(page: Page) {
  const session = await getTenantSessionTokens(page);
  const response = await page.request.post(`${tenantApiBaseUrl}/auth/refresh`, {
    data: {
      refreshToken: session.refreshToken,
    },
  });

  if (!response.ok()) {
    tenantSessionPromise = null;
    return createTenantSessionTokens(page);
  }

  const payload = (await response.json()) as {
    accessToken?: string;
    token?: string;
    jwt?: string;
    refreshToken?: string;
  };
  const accessToken = payload.accessToken ?? payload.token ?? payload.jwt;
  expect(accessToken, 'Tenant API refresh did not return an access token.').toBeTruthy();
  expect(payload.refreshToken, 'Tenant API refresh did not return a refresh token.').toBeTruthy();

  const nextSession = {
    accessToken: accessToken!,
    refreshToken: payload.refreshToken!,
  };
  tenantSessionPromise = Promise.resolve(nextSession);
  return nextSession;
}

export async function seedTenantSession(context: BrowserContext, page: Page) {
  const session = await getTenantSessionTokens(page);

  await context.addCookies([
    {
      name: 'mobility_os_tenant_jwt',
      value: session.accessToken,
      url: tenantBaseUrl,
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    },
    {
      name: 'mobility_os_refresh',
      value: session.refreshToken,
      url: tenantBaseUrl,
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    },
  ]);
}

export async function seedTenantSessionWithExpiredAccess(
  context: BrowserContext,
  page: Page,
) {
  const session = await rotateTenantSessionTokens(page);

  await context.addCookies([
    {
      name: 'mobility_os_tenant_jwt',
      value: buildExpiredAccessToken(),
      url: tenantBaseUrl,
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    },
    {
      name: 'mobility_os_refresh',
      value: session.refreshToken,
      url: tenantBaseUrl,
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
    },
  ]);
}
