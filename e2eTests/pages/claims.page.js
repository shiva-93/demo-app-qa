import { BasePage } from './base.page.js';

/**
 * Claimant "My Claims" list page (`/claims`).
 * Example: after claimant login → await claimsPage.expectLoaded();
 *
 * Shared helpers from BasePage: title(name), errorMessage(message), waitForUrl(), goto().
 */
export class ClaimsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, '/claims');
  }

  /**
   * Assert we landed on the claims list.
   * Example: after login → URL is /claims and the title is visible.
   */
  async expectLoaded() {
    await this.waitForUrl(/\/claims/);
    await this.title(/my claims/i).waitFor({ state: 'visible' });
  }
}
