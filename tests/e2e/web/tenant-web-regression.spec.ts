import { expect, test, type Page } from '@playwright/test';
import { seedTenantSession, seedTenantSessionWithExpiredAccess } from './helpers/tenant-session';

const tenantBaseUrl = process.env.TENANT_WEB_BASE_URL ?? 'http://localhost:3000';

async function loginAsTenantAdmin(page: Page) {
  test.skip(
    !process.env.TENANT_WEB_TEST_EMAIL || !process.env.TENANT_WEB_TEST_PASSWORD,
    'TENANT_WEB_TEST_EMAIL and TENANT_WEB_TEST_PASSWORD are required for tenant-web regression E2E.',
  );
  await seedTenantSession(page.context(), page);
  await page.goto(`${tenantBaseUrl}/`, { waitUntil: 'domcontentloaded' });
}

test.describe('tenant-web regressions', () => {
  test('keeps the tenant session active across a reload on the subscription page', async ({
    page,
  }) => {
    await loginAsTenantAdmin(page);

    await page.goto(`${tenantBaseUrl}/subscription`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Drivers are uncapped/i).first()).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/subscription/);
    await expect(page.getByRole('heading', { name: /Billing & Subscription/i }).first()).toBeVisible();
    await expect(page.getByText(/Current plan/i).first()).toBeVisible();
    await expect(page.getByText(/Drivers are uncapped/i).first()).toBeVisible();
  });

  test('recovers an expired access token with the refresh cookie instead of bouncing to login', async ({
    page,
  }) => {
    test.skip(
      !process.env.TENANT_WEB_TEST_EMAIL || !process.env.TENANT_WEB_TEST_PASSWORD,
      'TENANT_WEB_TEST_EMAIL and TENANT_WEB_TEST_PASSWORD are required for tenant-web regression E2E.',
    );

    await seedTenantSessionWithExpiredAccess(page.context(), page);
    await page.goto(`${tenantBaseUrl}/subscription`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/subscription/);
    await expect(page.getByRole('heading', { name: /Billing & Subscription/i }).first()).toBeVisible();
    await expect(page.getByText(/Current plan/i).first()).toBeVisible();
    await expect(page.getByText(/Drivers are uncapped/i).first()).toBeVisible();
  });

  test('logs the tenant user out from the confirmation modal and protects the next route', async ({
    page,
  }) => {
    await loginAsTenantAdmin(page);

    await page.goto(`${tenantBaseUrl}/subscription`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /^Log out$/i }).click();
    await expect(page.getByText(/Log out of Mobiris\?/i)).toBeVisible();
    await page.getByRole('button', { name: /^Log out$/i }).last().click();

    await page.waitForURL(/\/login/, { timeout: 20_000 });
    await page.goto(`${tenantBaseUrl}/drivers`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login/);
  });

  test('renders verification funding with either live state or a recovery state, not a blank failure', async ({
    page,
  }) => {
    await loginAsTenantAdmin(page);

    await page.goto(`${tenantBaseUrl}/verification-funding`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/subscription/);
    await expect(page.getByRole('heading', { name: /Billing & Subscription/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Verification credit/i }).first()).toBeVisible();
    await expect(
      page.getByText(
        /You can verify 1 driver now|You need more verification credit to continue|You need funding before you can continue/i,
      ),
    ).toBeVisible();
  });
});
