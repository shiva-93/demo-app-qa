import fs from 'node:fs/promises';
import path from 'node:path';
import { attachment, attachmentPath, ContentType } from 'allure-js-commons';

/**
 * True when the test did not end in the expected status (failed / timed out / etc.).
 * Example: didTestFail(testInfo) → true after an assertion error
 *
 * @param {import('@playwright/test').TestInfo} testInfo
 */
export function didTestFail(testInfo) {
  return testInfo.status !== testInfo.expectedStatus;
}

/**
 * Take a full-page screenshot while the page is still open and attach it to Allure
 * (and to Playwright's own report attachments).
 *
 * Example: called from fixture teardown after a failed login test.
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} testInfo
 */
export async function attachFailureScreenshot(page, testInfo) {
  if (!didTestFail(testInfo)) return;

  try {
    const body = await page.screenshot({ fullPage: true });
    await attachment('Failure screenshot', body, ContentType.PNG);
    await testInfo.attach('Failure screenshot', {
      body,
      contentType: 'image/png',
    });
  } catch {
    // Page may already be closed; Playwright's screenshot: 'only-on-failure' is the backup.
  }
}

/**
 * After the browser context is closed (video file finalized), find `.webm` recordings
 * in the test output folder and attach them to Allure.
 *
 * Example: failed test → Failure video.webm appears under the Allure test result.
 *
 * @param {import('@playwright/test').BrowserContext} context
 * @param {import('@playwright/test').TestInfo} testInfo
 */
export async function attachFailureVideo(context, testInfo) {
  // Finalize the recording so the .webm file is complete on disk.
  try {
    await context.close();
  } catch {
    // Already closed by another teardown step — safe to ignore.
  }

  if (!didTestFail(testInfo)) return;

  let entries = [];
  try {
    entries = await fs.readdir(testInfo.outputDir);
  } catch {
    return;
  }

  for (const name of entries) {
    if (!name.endsWith('.webm')) continue;

    const fullPath = path.join(testInfo.outputDir, name);
    try {
      await attachmentPath('Failure video', fullPath, {
        contentType: ContentType.WEBM,
        fileExtension: 'webm',
      });
      await testInfo.attach('Failure video', {
        path: fullPath,
        contentType: 'video/webm',
      });
    } catch {
      // Missing or incomplete file — skip.
    }
  }
}
