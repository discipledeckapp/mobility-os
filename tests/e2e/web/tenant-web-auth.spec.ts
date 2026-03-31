import { expect, test } from '@playwright/test';

const tenantBaseUrl = process.env.TENANT_WEB_BASE_URL ?? 'https://app.mobiris.ng';

test.describe('tenant-web auth shell', () => {
  test('redirects protected routes to login when unauthenticated', async ({ page }) => {
    await page.goto(`${tenantBaseUrl}/drivers`, { waitUntil: 'networkidle' });

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('allows tenant admin login and lands inside the app when credentials are provided', async ({
    page,
  }) => {
    test.skip(
      !process.env.TENANT_WEB_TEST_EMAIL || !process.env.TENANT_WEB_TEST_PASSWORD,
      'TENANT_WEB_TEST_EMAIL and TENANT_WEB_TEST_PASSWORD are required for authenticated tenant-web E2E.',
    );

    await page.goto(`${tenantBaseUrl}/login`, { waitUntil: 'networkidle' });

    const emailField = page
      .locator('input[name="identifier"], input[name="email"], input[type="email"]')
      .first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();

    await emailField.fill(process.env.TENANT_WEB_TEST_EMAIL!);
    await passwordField.fill(process.env.TENANT_WEB_TEST_PASSWORD!);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 });

    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole('link', { name: /drivers|assignments|remittance|subscription/i }).first(),
    ).toBeVisible();
  });
});
