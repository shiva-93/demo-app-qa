import { byRoleHeading } from '../helpers/selectors.js';

/**
 * Shared helpers that every page object inherits.
 * Example: LoginPage extends BasePage and reuses goto(), title(), errorMessage(), waitForUrl().
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
}
