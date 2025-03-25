/**
 * @name captureSnapshot
 * @description Captures a screenshot of the page and saves it with the given name.
 * @param {Page} page - The page to capture the screenshot from.
 * @param {string} name - The name of the screenshot.
 */

import { Page, expect } from '@playwright/test';

export async function captureSnapshot(page: Page, name: string) {
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(name, { fullPage: true });
}
