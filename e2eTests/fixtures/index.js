import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { SignupPage } from '../pages/signup.page.js';
import { AdminDashboardPage } from '../pages/admin-dashboard.page.js';
import { ClaimsPage } from '../pages/claims.page.js';
import { env, hasAdminCredentials, hasClaimantCredentials } from '../config/env.js';
import { attachFailureScreenshot, attachFailureVideo } from '../helpers/artifacts.js';

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
    await adminDashboardPage.expectLoaded();
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
    await claimsPage.expectLoaded();
    await use({ page, loginPage, claimsPage });
  },
});

export { expect, env, hasAdminCredentials, hasClaimantCredentials };
