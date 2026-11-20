import { BasePage } from './base.page.js';

/**
 * Admin Claims Management page (`/admin/claims`).
 * Example: await adminClaimsPage.openFromNav(); await adminClaimsPage.expectSubmittedClaimRow();
 *
 * Shared helpers from BasePage: title(), button(), text(), testId().
 */
export class AdminClaimsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, '/admin/claims');
  }

  /**
   * Status dropdown for a claim row.
   * data-testid is `status-select-` + first 8 hex chars of the claim id
   * (e.g. status-select-9ad08a1f).
   *
   * Example: adminClaimsPage.statusSelect()
   */
  statusSelect() {
    return this.page.getByTestId(/^status-select-[a-f0-9]{8}$/i);
  }

  /**
   * Short claim id text in the table (8 hex chars), e.g. 9ad08a1f.
   */
  claimIdCell() {
    return this.page.getByText(/^[a-f0-9]{8}$/i);
  }

  /**
   * Status badge for a submitted claim.
   * Uses aria-label (avoids matching hidden <option>Submitted</option> in the select).
   * Example: adminClaimsPage.submittedStatusBadge()
   */
  submittedStatusBadge() {
    return this.page.locator('[aria-label="Claim status: Submitted"]');
  }

  /**
   * From the admin header, click Claims and wait for Claims Management.
   * Example: await adminClaimsPage.openFromNav();
   */
  async openFromNav() {
    await this.button(/^Claims$/i).click();
    await this.expectLoaded();
  }

  /**
   * Assert Claims Management page is loaded.
   */
  async expectLoaded() {
    await this.waitForUrl(/\/admin\/claims/);
    await this.title(/claims management/i).waitFor({ state: 'visible' });
  }

  /**
   * Assert at least one claim shows status "Submitted" and a status-select-* control.
   * Example: await adminClaimsPage.expectSubmittedClaimRow();
   */
  async expectSubmittedClaimRow() {
    await this.submittedStatusBadge().first().waitFor({ state: 'visible' });
    await this.statusSelect().first().waitFor({ state: 'visible' });
    await this.claimIdCell().first().waitFor({ state: 'visible' });
  }
}
