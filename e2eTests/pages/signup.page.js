import { BasePage } from './base.page.js';
import { byRoleButton } from '../helpers/selectors.js';

/**
 * Signup / Create Account screen (`/signup`).
 * Example: await signupPage.openFromLogin(); await signupPage.signUp('User1', 'a@b.com', 'Password1');
 *
 * Shared helpers from BasePage: title(name), errorMessage(message), waitForUrl(), goto().
 */
export class SignupPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page, '/signup');
  }

  /** Name field (`input#name`). */
  get nameInput() {
    return this.page.locator('input#name');
  }

  /** Email field (`input#email`). */
  get emailInput() {
    return this.page.locator('input#email');
  }

  /** Password field (`input#password`). */
  get passwordInput() {
    return this.page.locator('input#password');
  }

  /** Primary submit button — getByRole('button', { name: … }). */
  get submitButton() {
    return byRoleButton(this.page, /sign up/i);
  }

  /** "Sign up" anchor on the login page. */
  get signUpLink() {
    return this.page.getByRole('link', { name: /sign up/i });
  }

  /**
   * Open app login, click Sign up, wait for Create Account.
   * Example: await signupPage.openFromLogin();
   */
  async openFromLogin() {
    await this.goto('/login');
    await this.signUpLink.click();
    await this.expectLoaded();
  }

  /**
   * Assert Create Account heading and name / email / password fields are present.
   * Example: await signupPage.expectLoaded();
   */
  async expectLoaded() {
    await this.waitForUrl(/\/signup/);
    await this.title(/create account/i).waitFor({ state: 'visible' });
    await this.nameInput.waitFor({ state: 'visible' });
    await this.emailInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill name, email, and password (does not submit).
   *
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  async fillForm(name, email, password) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Fill the form and click Sign Up.
   * Example: await signupPage.signUp('User1', 'user1@demo.com', 'Password1');
   *
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  async signUp(name, email, password) {
    await this.fillForm(name, email, password);
    await this.submitButton.click();
  }
}
