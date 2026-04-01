import { expect, test, type Page } from '@playwright/test';
import { seedTenantSession } from './helpers/tenant-session';

const tenantBaseUrl = process.env.TENANT_WEB_BASE_URL ?? 'http://localhost:3000';

async function loginAsTenantAdmin(page: Page) {
  test.skip(
    !process.env.TENANT_WEB_TEST_EMAIL || !process.env.TENANT_WEB_TEST_PASSWORD,
    'TENANT_WEB_TEST_EMAIL and TENANT_WEB_TEST_PASSWORD are required for tenant-web regression E2E.',
  );
  await seedTenantSession(page.context(), page);
  await page.goto(`${tenantBaseUrl}/`, { waitUntil: 'networkidle' });
}

test.describe('tenant-web regressions', () => {
  test('keeps the tenant session active across a reload on the subscription page', async ({
    page,
  }) => {
    await loginAsTenantAdmin(page);

    await page.goto(`${tenantBaseUrl}/subscription`, { waitUntil: 'networkidle' });
    await expect(page.getByText(/Drivers are uncapped/i).first()).toBeVisible();

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page).toHaveURL(/\/subscription/);
    await expect(page.getByText(/Drivers are uncapped/i).first()).toBeVisible();
    await expect(page.getByText(/Subscription status/i)).toBeVisible();
  });

  test('logs the tenant user out from the confirmation modal and protects the next route', async ({
    page,
  }) => {
    await loginAsTenantAdmin(page);

    await page.goto(`${tenantBaseUrl}/subscription`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /^Log out$/i }).click();
    await expect(page.getByText(/Log out of Mobiris\?/i)).toBeVisible();
    await page.getByRole('button', { name: /^Log out$/i }).last().click();

    await page.waitForURL(/\/login/, { timeout: 20_000 });
    await page.goto(`${tenantBaseUrl}/drivers`, { waitUntil: 'networkidle' });

    await expect(page).toHaveURL(/\/login/);
  });

  test('renders verification funding with either live state or a recovery state, not a blank failure', async ({
    page,
  }) => {
    await loginAsTenantAdmin(page);

    await page.goto(`${tenantBaseUrl}/verification-funding`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /Verification Funding/i }).first()).toBeVisible();
    await expect(
      page.getByText(/Ready to verify|Funding action needed|Funding data needs attention/i),
    ).toBeVisible();
    await expect(
      page.getByText(
        /Paystack and Flutterwave|Refresh this page to retry/i,
      ),
    ).toBeVisible();
  });
});
