import { test, expect } from '../../fixtures/index.js';

/**
 * Claimant submit-claim journey (@functional).
 *
 * Login via `asClaimant` (E2E_CLAIMANT_USER / E2E_CLAIMANT_PASSWORD).
 * Runs serially so both tests don't fight over the same demo claimant session.
 *
 * Date field UI shows placeholder dd/mm/yyyy — tests pass dates like '01/11/2026'
 * (1st Nov 2026); ClaimsPage.fillIncidentDate converts for the browser date input.
 */
test.describe('TCID-003 Validate submit claim functionality or Verify whether the user is able to submit the claim @functional', () => {
  // Avoid parallel logins with the same claimant account
  test.describe.configure({ mode: 'serial' });

  const claimData = {
    // UI format dd/mm/yyyy (matches the date field placeholder)
    incidentDate: '01/11/2026',
    // Review step uses long month name
    incidentDateLabel: 'November 1, 2026',
    // List table/cards use short month name
    listDateLabel: 'Nov 1, 2026',
    location: '123, Main road, Hyderabad',
    amount: '50000',
    amountLabel: '$50,000.00',
    description: 'Accident occured due to driver reckless driving etc',
  };

  test('navigate to the claims page', async ({ asClaimant }) => {
    const { claimsPage } = asClaimant;

    // Header CTA on My Claims
    await expect(claimsPage.button(/submit new claim/i)).toBeVisible();

    // Empty-state CTA only when the user has no claims yet
    const firstClaimBtn = claimsPage.button(/submit your first claim/i);
    if ((await firstClaimBtn.count()) > 0) {
      await expect(firstClaimBtn).toBeVisible();
    }
  });

  test('submit a new claim', async ({ asClaimant }) => {
    const { claimsPage } = asClaimant;

    // Already on /claims — go straight into the wizard
    await claimsPage.submitNewClaim(claimData);

    await claimsPage.expectClaimVisibleOnList({
      listDateLabel: claimData.listDateLabel,
      amountLabel: claimData.amountLabel,
    });
    await expect(claimsPage.page.getByTestId('view-details-button').first()).toBeVisible();
  });
});
