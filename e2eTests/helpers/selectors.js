/**
 * Stable selector helpers — prefer roles, labels, and data-testid over CSS/XPath.
 */

/**
 * Find an element by its `data-testid` attribute.
 * Example: byTestId(page, 'login-form') → matches <form data-testid="login-form">
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} testId
 */
export function byTestId(page, testId) {
  return page.getByTestId(testId);
}

/**
 * Find a heading by its visible text (h1–h6).
 * Example: byRoleHeading(page, /log in/i) → matches <h1>Log in</h1>
 *
 * @param {import('@playwright/test').Page} page
 * @param {string|RegExp} name
 */
export function byRoleHeading(page, name) {
  return page.getByRole('heading', { name });
}

/**
 * Find a button by its accessible name (label text).
 * Example: byRoleButton(page, /log in/i) → matches <button>Log in</button>
 * Example with exact match: byRoleButton(page, 'Save', { exact: true })
 *
 * @param {import('@playwright/test').Page} page
 * @param {string|RegExp} name
 * @param {import('@playwright/test').LocatorOptions & { exact?: boolean }} [options]
 */
export function byRoleButton(page, name, options) {
  return page.getByRole('button', { name, ...options });
}

/**
 * Find an input (or control) by its associated label text.
 * Example: byLabel(page, 'Email') → matches the field labeled "Email"
 *
 * @param {import('@playwright/test').Page} page
 * @param {string|RegExp} name
 */
export function byLabel(page, name) {
  return page.getByLabel(name);
}
