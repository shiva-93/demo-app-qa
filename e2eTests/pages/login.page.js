import { BasePage } from './base.page.js';
import { byTestId, byLabel, byRoleButton } from '../helpers/selectors.js';

/**
 * Login screen (`/login`) — form, fields, and submit.
 * Example: await loginPage.open(); await loginPage.login('a@b.com', 'secret');
 *
 * Shared helpers from BasePage: title(name), errorMessage(message), waitForUrl(), goto().
 */
export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, '/login');
  }

  /** The login form container (`data-testid="login-form"`). */
  get form() {
    return byTestId(this.page, 'login-form');
  }

  /** Email field, found by its "Email" label. */
  get emailInput() {
    return byLabel(this.page, 'Email');
  }

  /**
   * Password field.
   * Uses #password — getByLabel('Password') also matches the "Show password" toggle.
   */
  get passwordInput() {
    return this.page.locator('input#password');
  }

  /** Primary submit button, e.g. "Log in". */
  get submitButton() {
    return byRoleButton(this.page, /log in/i);
  }

  /**
   * Navigate to /login and wait for the heading.
   * Example: await loginPage.open();
   */
  async open() {
    await this.goto('/login');
    await this.title(/log in/i).waitFor({ state: 'visible' });
  }

  /**
   * Fill credentials and click Log in.
   * Example: await loginPage.login('admin@example.com', 'password');
   *
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Assert the login form is ready (title, form, email, password visible).
   * Example: await loginPage.expectLoaded();
   */
  async expectLoaded() {
    await this.title(/log in/i).waitFor({ state: 'visible' });
    await this.form.waitFor({ state: 'visible' });
    await this.emailInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
  }
}
