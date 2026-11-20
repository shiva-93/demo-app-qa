// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env.js';

/**
 * Playwright settings for the e2eTests package.
 * Start the app stack first (see root README / start-*.sh), then run:
 *   npm test
 *
 * Key options:
 * - timeout: 45_000 → each test may run up to 45 seconds
 * - expect.timeout: 10_000 → assertions wait up to 10 seconds
 * - baseURL: from E2E_BASE_URL (default http://localhost:3001)
 */
export default defineConfig({
  // Specs live under ./tests
  testDir: './tests',
  fullyParallel: true,
  // Fail the build if test.only was left in CI
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: true,
        environmentInfo: {
          baseURL: env.baseURL,
          nodeVersion: process.version,
        },
      },
    ],
  ],
  use: {
    baseURL: env.baseURL,
    // Failure artifacts (also attached to Allure via fixtures/_attachFailure*):
    // - screenshot on fail → PNG in Allure
    // - video retained on fail → .webm in Allure after context closes
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
