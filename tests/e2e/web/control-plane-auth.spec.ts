import { expect, test } from '@playwright/test';

const controlPlaneBaseUrl = process.env.CONTROL_PLANE_BASE_URL ?? 'https://control.mobiris.ng';

test.describe('control-plane auth shell', () => {
  test('redirects protected routes to login when unauthenticated', async ({ page }) => {
    await page.goto(`${controlPlaneBaseUrl}/feature-flags`, { waitUntil: 'networkidle' });

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
  });

  test('renders the login page without server errors', async ({ page }) => {
    await page.goto(`${controlPlaneBaseUrl}/login`, { waitUntil: 'networkidle' });

    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });
});
