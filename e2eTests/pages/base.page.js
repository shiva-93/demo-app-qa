import { byRoleHeading, byRoleButton, byTestId } from '../helpers/selectors.js';

/**
 * Shared helpers that every page object inherits.
 * Example: LoginPage extends BasePage and reuses goto(), title(), button(), errorMessage().
 */
export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page for this browser tab
   * @param {string} [path='/'] - Default route for this page, e.g. '/login'
   */
  constructor(page, path = '/') {
    this.page = page;
    this.path = path;
  }

  /**
   * Open a path in the browser.
   * Example: await this.goto('/login') → navigates to http://…/login
   *
   * @param {string} [path=this.path]
   */
  async goto(path = this.path) {
    await this.page.goto(path);
  }

  /**
   * Find a heading on the current page by its text.
   * Example: this.heading(/log in/i) → matches <h1>Log in</h1>
   *
   * @param {string|RegExp} name
   */
  heading(name) {
    return byRoleHeading(this.page, name);
  }

  /**
   * Find the page title / heading by its visible text.
   * Pass the expected copy from the test or page object so this stays reusable.
   *
   * Example: this.title(/create account/i)
   * Example: this.title('My Claims')
   *
   * @param {string|RegExp} name
   */
  title(name) {
    return this.heading(name);
  }

  /**
   * Find a button by its accessible name (getByRole('button')).
   * Example: this.button(/submit new claim/i)
   * Example: this.button('Next')
   *
   * @param {string|RegExp} name
   * @param {import('@playwright/test').LocatorOptions & { exact?: boolean }} [options]
   */
  button(name, options) {
    return byRoleButton(this.page, name, options);
  }

  /**
   * Find an element by data-testid.
   * Example: this.testId('wizard-step-1')
   *
   * @param {string} testId
   */
  testId(testId) {
    return byTestId(this.page, testId);
  }

  /**
   * Find an error / validation message by its visible text (plain text on the page).
   * Pass the expected copy from the test so this method stays reusable when messages change.
   *
   * Example: this.errorMessage('Invalid email format')
   * Example: this.errorMessage(/password must contain a number/i)
   *
   * @param {string|RegExp} message
   */
  errorMessage(message) {
    return this.page.getByText(message);
  }

  /**
   * Find visible text on the page (for asserting filled form values after submit).
   * Example: this.text('123, Main road, Hyderabad')
   *
   * @param {string|RegExp} value
   */
  text(value) {
    return this.page.getByText(value);
  }

  /**
   * Wait until the browser URL matches a path or pattern.
   * Example: await this.waitForUrl(/\/claims/) → waits for …/claims
   *
   * @param {string|RegExp} pathOrRegex
   * @param {object} [options]
   */
  async waitForUrl(pathOrRegex, options = {}) {
    await this.page.waitForURL(pathOrRegex, {
      timeout: 30_000,
      ...options,
    });
  }

  /**
   * Click Logout in the app header and wait for the login screen.
   * Example: await this.logout();
   */
  async logout() {
    await this.button(/^Logout$/i).click();
    await this.waitForUrl(/\/login/);
    await this.title(/log in/i).waitFor({ state: 'visible' });
  }
}
