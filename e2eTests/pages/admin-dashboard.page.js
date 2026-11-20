import { BasePage } from './base.page.js';

/**
 * Admin landing page after a successful admin login (`/admin/dashboard`).
 * Example: await adminDashboardPage.expectLoaded() after logging in as admin.
 *
 * Shared helpers from BasePage: title(name), errorMessage(message), waitForUrl(), goto().
 */
export class AdminDashboardPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, '/admin/dashboard');
  }

  /**
   * Assert we landed on the admin dashboard.
   * Example: after login → URL is /admin/dashboard and the title is visible.
   */
  async expectLoaded() {
    await this.waitForUrl(/\/admin\/dashboard/);
    await this.title(/admin dashboard/i).waitFor({ state: 'visible' });
  }
}
