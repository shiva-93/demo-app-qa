import { BasePage } from './base.page.js';

/**
 * Claimant "My Claims" list + new-claim wizard (`/claims`, `/claims/new`).
 * Example: await claimsPage.expectLoaded(); await claimsPage.openNewClaimWizard();
 *
 * Shared helpers from BasePage: title(), button(), testId(), text(), errorMessage().
 */
export class ClaimsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, '/claims');
  }

  /**
   * Incident date field (`input#incidentDate`).
   * UI shows placeholder dd/mm/yyyy (e.g. 01/11/2026 for 1st Nov 2026).
   */
  get incidentDateInput() {
    return this.page.locator('input#incidentDate');
  }

  /**
   * Fill the incident date using the UI format dd/mm/yyyy.
   * Example: await claimsPage.fillIncidentDate('01/11/2026'); // 1st Nov 2026
   *
   * Under the hood the browser date input still needs yyyy-mm-dd, so this converts
   * dd/mm/yyyy → yyyy-mm-dd before fill.
   *
   * @param {string} dateDdMmYyyy - e.g. '01/11/2026'
   */
  async fillIncidentDate(dateDdMmYyyy) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateDdMmYyyy.trim());
    if (!match) {
      throw new Error(`Expected incident date as dd/mm/yyyy, got: ${dateDdMmYyyy}`);
    }
    const [, dd, mm, yyyy] = match;
    await this.incidentDateInput.fill(`${yyyy}-${mm}-${dd}`);
  }

  /** Incident location field (`input#incidentLocation`). */
  get incidentLocationInput() {
    return this.page.locator('input#incidentLocation');
  }

  /** Claim amount field (`input#claimAmount`). */
  get claimAmountInput() {
    return this.page.locator('input#claimAmount');
  }

  /** Description field (`#description` — textarea on step 2). */
  get descriptionInput() {
    return this.page.locator('#description');
  }

  /**
   * Assert we landed on the claims list.
   * Example: after login → URL is /claims and the title is visible.
   */
  async expectLoaded() {
    await this.waitForUrl(/\/claims/);
    await this.title(/my claims/i).waitFor({ state: 'visible' });
  }

  /**
   * Assert claim submit CTAs on the list page (getByRole button).
   * "Submit New Claim" is always in the header; "Submit Your First Claim" shows when the list is empty.
   */
  async expectSubmitClaimButtons() {
    await this.button(/submit new claim/i).waitFor({ state: 'visible' });
    await this.button(/submit your first claim/i).waitFor({ state: 'visible' });
  }

  /**
   * Click "Submit New Claim" and wait for wizard step 1.
   * Example: await claimsPage.openNewClaimWizard();
   */
  async openNewClaimWizard() {
    await this.button(/submit new claim/i).click();
    await this.testId('wizard-step-1').waitFor({ state: 'visible' });
  }

  /**
   * Fill wizard step 1 (incident details) and click Next.
   * Date uses the UI format dd/mm/yyyy (placeholder on the field).
   *
   * Example: await claimsPage.fillStep1('01/11/2026', '123, Main road, Hyderabad', '50000');
   *
   * @param {string} incidentDateDdMmYyyy - e.g. '01/11/2026'
   * @param {string} incidentLocation
   * @param {string|number} claimAmount
   */
  async fillStep1(incidentDateDdMmYyyy, incidentLocation, claimAmount) {
    await this.fillIncidentDate(incidentDateDdMmYyyy);
    await this.incidentLocationInput.fill(incidentLocation);
    await this.claimAmountInput.fill(String(claimAmount));
    await this.button(/^next$/i).click();
    await this.testId('wizard-step-2').waitFor({ state: 'visible' });
  }

  /**
   * Fill wizard step 2 (description) and click Next.
   * Example: await claimsPage.fillStep2('Accident occurred due to reckless driving');
   *
   * @param {string} description
   */
  async fillStep2(description) {
    await this.descriptionInput.fill(description);
    await this.button(/^next$/i).click();
    await this.testId('wizard-step-3').waitFor({ state: 'visible' });
  }

  /**
   * Primary "Submit Claim" on wizard step 3 (not the header nav "Submit Claim").
   */
  get wizardSubmitClaimButton() {
    return this.testId('wizard-step-3').getByRole('button', { name: /^Submit Claim$/i });
  }

  /**
   * Assert review step shows the values entered in the wizard, then submit.
   *
   * @param {{ incidentDateLabel: string|RegExp, location: string, amountLabel: string|RegExp, description: string }} data
   */
  async reviewAndSubmitClaim(data) {
    await this.testId('wizard-step-3').waitFor({ state: 'visible' });
    await this.wizardSubmitClaimButton.waitFor({ state: 'visible' });
    await this.text(data.incidentDateLabel).waitFor({ state: 'visible' });
    await this.text(data.location).waitFor({ state: 'visible' });
    await this.text(data.amountLabel).waitFor({ state: 'visible' });
    await this.text(data.description).waitFor({ state: 'visible' });
    await this.wizardSubmitClaimButton.click();
  }

  /**
   * Full happy path: open wizard → fill steps → review → submit → back on My Claims.
   *
   * Example:
   *   await claimsPage.submitNewClaim({
   *     incidentDate: '01/11/2026',
   *     incidentDateLabel: 'November 1, 2026',
   *     location: '123, Main road, Hyderabad',
   *     amount: '50000',
   *     amountLabel: '$50,000.00',
   *     description: 'Accident occurred due to driver reckless driving etc',
   *   });
   *
   * @param {{
   *   incidentDate: string,
   *   incidentDateLabel: string|RegExp,
   *   location: string,
   *   amount: string|number,
   *   amountLabel: string|RegExp,
   *   description: string,
   * }} data
   */
  async submitNewClaim(data) {
    await this.openNewClaimWizard();
    await this.fillStep1(data.incidentDate, data.location, data.amount);
    await this.fillStep2(data.description);
    await this.reviewAndSubmitClaim({
      incidentDateLabel: data.incidentDateLabel,
      location: data.location,
      amountLabel: data.amountLabel,
      description: data.description,
    });
    await this.expectLoaded();
  }

  /**
   * After submit: assert claim data and "View Details" on the My Claims list.
   * List shows short date (e.g. "Nov 1, 2026"), amount, and View Details.
   * Description is truncated on the list (e.g. "…et...") so it is not asserted here.
   *
   * @param {{ listDateLabel: string|RegExp, amountLabel: string|RegExp }} data
   */
  async expectClaimVisibleOnList(data) {
    await this.text(data.listDateLabel).first().waitFor({ state: 'visible' });
    await this.text(data.amountLabel).first().waitFor({ state: 'visible' });
    // Prefer data-testid — there can be multiple "View Details" rows
    await this.page.getByTestId('view-details-button').first().waitFor({ state: 'visible' });
  }
}
