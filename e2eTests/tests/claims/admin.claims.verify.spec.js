import { test, expect } from '../../fixtures/index.js';

/**
 * Admin verification of submitted claims (@functional).
 *
 * Does not rely on claims.submit.spec.js run order — the `adminWithSubmittedClaim`
 * fixture submits a claim as the claimant, then logs in as admin.
 *
 * TCID-004 — verify the submitted claims for the admin user
 */
test.describe('TCID-004 Verify the submitted claims for the admin user @functional', () => {
  test('admin sees submitted claim on Claims Management', async ({ adminWithSubmittedClaim }) => {
    const { adminClaimsPage } = adminWithSubmittedClaim;

    // Login already done by fixture — open Claims from the admin header
    await adminClaimsPage.openFromNav();
    await expect(adminClaimsPage.title(/claims management/i)).toBeVisible();

    await expect(adminClaimsPage.submittedStatusBadge().first()).toBeVisible();

    // data-testid="status-select-9ad08a1f" — claim id prefix is dynamic → regex
    await expect(adminClaimsPage.statusSelect().first()).toBeVisible();

    // Short claim id text in the table (8 hex chars), e.g. 9ad08a1f
    await expect(adminClaimsPage.claimIdCell().first()).toBeVisible();
  });
});
