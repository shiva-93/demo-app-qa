import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { SignupPage } from '../pages/signup.page.js';
import { AdminDashboardPage } from '../pages/admin-dashboard.page.js';
import { AdminClaimsPage } from '../pages/admin-claims.page.js';
import { ClaimsPage } from '../pages/claims.page.js';
import { env, hasAdminCredentials, hasClaimantCredentials } from '../config/env.js';
import { attachFailureScreenshot, attachFailureVideo } from '../helpers/artifacts.js';

/** Shared claim payload used when seeding a claim for admin verification. */
export const seedClaimData = {
  incidentDate: '01/11/2026',
  incidentDateLabel: 'November 1, 2026',
  listDateLabel: 'Nov 1, 2026',
  location: '123, Main road, Hyderabad',
  amount: '50000',
  amountLabel: '$50,000.00',
  description: 'Accident occured due to driver reckless driving etc',
};

/**
 * Custom Playwright fixtures: page objects + optional login helpers.
 * Import these in specs instead of `@playwright/test` directly.
 *
 * Example:
 *   import { test, expect } from '../../fixtures/index.js';
 *   test('login page loads', async ({ loginPage }) => { … });
 *
 * Failure teardown (auto):
 *   If a test fails → full-page screenshot + recorded video are attached to Allure.
 *   No per-spec afterEach needed — every test that imports `test` from here gets it.
 *
 * Credentials come from env (see `.env.example`) — never hardcode secrets.
 */
export const test = base.extend({
  /**
   * Auto teardown (runs after every test): screenshot on failure while the page is open.
   * Example: assertion fails on login → "Failure screenshot" appears in Allure.
   */
  _attachFailureScreenshot: [
    async ({ page }, use, testInfo) => {
      await use();
      await attachFailureScreenshot(page, testInfo);
    },
    { auto: true },
  ],

  /**
   * Auto teardown (runs after every test): close context to finish the video, then
   * attach any `.webm` from the test output dir to Allure on failure.
   * Example: failed smoke test → "Failure video" playable in the Allure report.
   *
   * Requires playwright.config.js → use.video: 'on' | 'retain-on-failure' | 'on-first-retry'
   */
  _attachFailureVideo: [
    async ({ context }, use, testInfo) => {
      await use();
      await attachFailureVideo(context, testInfo);
    },
    { auto: true },
  ],

  /** App base URL from env (default http://localhost:3001). */
  baseURL: async ({}, use) => {
    await use(env.baseURL);
  },

  /** Fresh LoginPage bound to the current browser tab. */
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  /** Fresh SignupPage bound to the current browser tab. */
  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  /** Fresh AdminDashboardPage bound to the current browser tab. */
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },

  /** Fresh AdminClaimsPage bound to the current browser tab. */
  adminClaimsPage: async ({ page }, use) => {
    await use(new AdminClaimsPage(page));
  },

  /** Fresh ClaimsPage bound to the current browser tab. */
  claimsPage: async ({ page }, use) => {
    await use(new ClaimsPage(page));
  },

  /**
   * Logs in as admin when credentials are present; otherwise skips the test.
   * Example:
   *   test('admin lands on dashboard', async ({ asAdmin }) => {
   *     const { adminDashboardPage } = asAdmin;
   *     await expect(adminDashboardPage.title(/admin dashboard/i)).toBeVisible();
   *   });
   */
  asAdmin: async ({ page, loginPage, adminDashboardPage }, use, testInfo) => {
    testInfo.skip(!hasAdminCredentials(), 'Set E2E_ADMIN_USER and E2E_ADMIN_PASSWORD');
    await loginPage.open();
    await loginPage.login(env.admin.email, env.admin.password);

    const loginError = loginPage.errorMessage('Invalid email or password');
    await Promise.race([
      adminDashboardPage.expectLoaded(),
      loginError.waitFor({ state: 'visible' }).then(async () => {
        throw new Error(
          `Admin login failed for ${env.admin.email}. Check E2E_ADMIN_USER / E2E_ADMIN_PASSWORD and that auth + API are running.`,
        );
      }),
    ]);

    await use({ page, loginPage, adminDashboardPage });
  },

  /**
   * Logs in as claimant when credentials are present; otherwise skips the test.
   * Example:
   *   test('claimant sees My Claims', async ({ asClaimant }) => {
   *     const { claimsPage } = asClaimant;
   *     await expect(claimsPage.title(/my claims/i)).toBeVisible();
   *   });
   */
  asClaimant: async ({ page, loginPage, claimsPage }, use, testInfo) => {
    testInfo.skip(!hasClaimantCredentials(), 'Set E2E_CLAIMANT_USER and E2E_CLAIMANT_PASSWORD');
    await loginPage.open();
    await loginPage.login(env.claimant.email, env.claimant.password);

    // Fail fast if credentials are rejected (instead of waiting 30s for /claims)
    const loginError = loginPage.errorMessage('Invalid email or password');
    await Promise.race([
      claimsPage.expectLoaded(),
      loginError.waitFor({ state: 'visible' }).then(async () => {
        throw new Error(
          `Claimant login failed for ${env.claimant.email}. Check E2E_CLAIMANT_USER / E2E_CLAIMANT_PASSWORD and that auth + API are running.`,
        );
      }),
    ]);

    await use({ page, loginPage, claimsPage });
  },

  /**
   * Ensures a claim exists, then leaves you logged in as admin on the dashboard.
   * Flow: claimant submits a claim → logout → admin login.
   * Use this so admin verify tests do not depend on claims.submit.spec.js order.
   *
   * Example:
   *   test('admin sees submitted claim', async ({ adminWithSubmittedClaim }) => {
   *     const { adminClaimsPage } = adminWithSubmittedClaim;
   *     await adminClaimsPage.openFromNav();
   *     await adminClaimsPage.expectSubmittedClaimRow();
   *   });
   */
  adminWithSubmittedClaim: async (
    { page, loginPage, claimsPage, adminDashboardPage, adminClaimsPage },
    use,
    testInfo,
  ) => {
    testInfo.skip(
      !hasAdminCredentials() || !hasClaimantCredentials(),
      'Set E2E_ADMIN_* and E2E_CLAIMANT_* in .env',
    );

    // 1) Claimant submits a claim (same flow as TCID-003)
    await loginPage.open();
    await loginPage.login(env.claimant.email, env.claimant.password);
    const claimantLoginError = loginPage.errorMessage('Invalid email or password');
    await Promise.race([
      claimsPage.expectLoaded(),
      claimantLoginError.waitFor({ state: 'visible' }).then(async () => {
        throw new Error(`Claimant login failed for ${env.claimant.email}`);
      }),
    ]);
    await claimsPage.submitNewClaim(seedClaimData);
    await claimsPage.logout();

    // 2) Admin logs in
    await loginPage.login(env.admin.email, env.admin.password);
    const adminLoginError = loginPage.errorMessage('Invalid email or password');
    await Promise.race([
      adminDashboardPage.expectLoaded(),
      adminLoginError.waitFor({ state: 'visible' }).then(async () => {
        throw new Error(`Admin login failed for ${env.admin.email}`);
      }),
    ]);

    await use({ page, loginPage, adminDashboardPage, adminClaimsPage, claimsPage });
  },
});

export { expect, env, hasAdminCredentials, hasClaimantCredentials };
