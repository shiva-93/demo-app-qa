import {
  test,
  expect,
  env,
  hasAdminCredentials,
  hasClaimantCredentials,
} from '../../fixtures/index.js';

/**
 * Smoke checks for the auth / login UI.
 *
 * Credentials come from `.env` (see `.env.example`):
 *   E2E_ADMIN_USER / E2E_ADMIN_PASSWORD
 *   E2E_CLAIMANT_USER / E2E_CLAIMANT_PASSWORD  ← "client" user
 *
 * Failure teardown (from fixtures, no afterEach needed here):
 *   if this test fails → screenshot + video are attached to the Allure report.
 */
test.describe('TCID-0001 Test Login Page with valid credentials with admin, client and invalid credentials @smoke', () => {
  test('login page loads for the admin user', async ({ loginPage, adminDashboardPage }) => {
    test.skip(!hasAdminCredentials(), 'Set E2E_ADMIN_USER and E2E_ADMIN_PASSWORD in .env');

    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.login(env.admin.email, env.admin.password);

    await adminDashboardPage.expectLoaded();
    await expect(adminDashboardPage.title(/admin dashboard/i)).toBeVisible();
  });

  test('login page loads for the client user', async ({ loginPage, claimsPage }) => {
    test.skip(!hasClaimantCredentials(), 'Set E2E_CLAIMANT_USER and E2E_CLAIMANT_PASSWORD in .env');

    // Client = claimant from .env.example (E2E_CLAIMANT_USER / E2E_CLAIMANT_PASSWORD)
    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.login(env.claimant.email, env.claimant.password);

    await claimsPage.expectLoaded();
    await expect(claimsPage.title(/my claims/i)).toBeVisible();
  });

  test('login page doesnot load for the invalid user', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.expectLoaded();
    await loginPage.login('invalid@demo.com', 'WrongPassword!');

    await expect(loginPage.errorMessage('Invalid email or password')).toBeVisible();
    await expect(loginPage.title(/log in/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
