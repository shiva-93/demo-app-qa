import { test, expect } from '../../fixtures/index.js';

/**
 * Signup / register flows.
 *
 * After a successful Sign Up the app redirects to /login (toast: Account created).
 * New claimants then land on /claims (My Claims) after logging in — that is the user home.
 *
 */
test.describe('TCID-002 Test signup or register new user @smoke', () => {
  test('navigate to signup and show create account form', async ({ loginPage, signupPage }) => {
    await loginPage.open();
    await signupPage.signUpLink.click();

    await expect(signupPage.title(/create account/i)).toBeVisible();
    await expect(signupPage.nameInput).toBeVisible();
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.passwordInput).toBeVisible();
  });

  test('validating error messages for the user signup', async ({ signupPage }) => {
    const randomName = `User${Date.now()}`;

    await signupPage.openFromLogin();

    // Invalid email (special chars, no @) + short password
    await signupPage.signUp(randomName, 'test#gmal.com', 'dummy');
    await expect(signupPage.errorMessage('Invalid email format')).toBeVisible();
    await expect(signupPage.errorMessage('Password must be at least 8 characters')).toBeVisible();

    // Valid email, 8-char password without uppercase → uppercase rule
    await signupPage.fillForm(randomName, 'test@demo.com', 'abcdefgh');
    await signupPage.submitButton.click();
    await expect(signupPage.errorMessage('Password must contain an uppercase letter')).toBeVisible();

    // 8 chars + uppercase, no number → number rule
    await signupPage.passwordInput.fill('Abcdefgh');
    await signupPage.submitButton.click();
    await expect(signupPage.errorMessage('Password must contain a number')).toBeVisible();
  });

  test('create user or register new user', async ({ signupPage, loginPage, claimsPage }) => {
    // Unique email so re-runs do not hit "Email already exists"
    const suffix = Date.now();
    const name = 'User1';
    const email = `user1.${suffix}@demo.com`;
    const password = 'Password1';

    await signupPage.openFromLogin();
    await signupPage.signUp(name, email, password);

    // App redirects to login after account creation (not auto-login to a dashboard)
    await loginPage.expectLoaded();
    await expect(loginPage.title(/log in/i)).toBeVisible();

    // Log in as the new claimant → My Claims is the user landing page
    await loginPage.login(email, password);
    await claimsPage.expectLoaded();
    await expect(claimsPage.title(/my claims/i)).toBeVisible();
  });
});
