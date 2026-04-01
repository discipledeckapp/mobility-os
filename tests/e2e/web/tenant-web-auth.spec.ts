import { expect, test } from '@playwright/test';
import { seedTenantSession } from './helpers/tenant-session';

const tenantBaseUrl = process.env.TENANT_WEB_BASE_URL ?? 'http://localhost:3000';

test.describe('tenant-web auth shell', () => {
  test('redirects protected routes to login when unauthenticated', async ({ page }) => {
    await page.goto(`${tenantBaseUrl}/drivers`, { waitUntil: 'networkidle' });

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('allows tenant admin login and lands inside the app when credentials are provided', async ({
    context,
    page,
  }) => {
    test.skip(
      !process.env.TENANT_WEB_TEST_EMAIL || !process.env.TENANT_WEB_TEST_PASSWORD,
      'TENANT_WEB_TEST_EMAIL and TENANT_WEB_TEST_PASSWORD are required for authenticated tenant-web E2E.',
    );

    await seedTenantSession(context, page);
    await page.goto(`${tenantBaseUrl}/`, { waitUntil: 'networkidle' });

    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole('link', { name: /drivers|assignments|remittance|subscription/i }).first(),
    ).toBeVisible();
  });
});
