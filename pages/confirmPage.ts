/**
 * @name ConfirmPage
 * @description Confirm page object
 */

import { BasePage } from './basePage';
import { expect } from '@playwright/test';

export class ConfirmPage extends BasePage {
    async confirm() {
        await this.page.click('text=この内容で予約する');
    }

    async expectModalVisible() {
        await expect(this.page.locator('.modal')).toBeVisible();
    }

    async closeModal() {
        await this.page.click('.modal button:has-text("閉じる")');
    }

    // 要素のテキストを取得するメソッド
    async getPlanNameText() {
        return await this.page.locator('[id="plan-name"]').textContent();
    }

    async getGuestNameText() {
        return await this.page.locator('[id="username"]').textContent();
    }

    async getContactText() {
        return await this.page.locator('[id="contact"]').textContent();
    }

    async getModalText() {
        return await this.page.locator('.modal-body').textContent();
    }
}
