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

    // ヘッドレスモードでも安定して要素のテキストを取得するメソッド
    async getPlanNameText() {
        // 要素が表示され、内容が読み込まれるのを明示的に待機
        await this.page.waitForSelector('[id="plan-name"]', { state: 'visible' });

        // 要素のテキスト内容が空でなくなるまで待機
        let text = '';
        let attempts = 0;
        const maxAttempts = 10;

        while (text.trim() === '' && attempts < maxAttempts) {
            text = await this.page.locator('[id="plan-name"]').textContent() || '';
            if (text.trim() === '') {
                // 短い間隔で再試行
                await this.page.waitForTimeout(200);
                attempts++;
            }
        }

        return text;
    }

    async getGuestNameText() {
        await this.page.waitForSelector('[id="username"]', { state: 'visible' });

        let text = '';
        let attempts = 0;
        const maxAttempts = 10;

        while (text.trim() === '' && attempts < maxAttempts) {
            text = await this.page.locator('[id="username"]').textContent() || '';
            if (text.trim() === '') {
                await this.page.waitForTimeout(200);
                attempts++;
            }
        }

        return text;
    }

    async getContactText() {
        await this.page.waitForSelector('[id="contact"]', { state: 'visible' });

        let text = '';
        let attempts = 0;
        const maxAttempts = 10;

        while (text.trim() === '' && attempts < maxAttempts) {
            text = await this.page.locator('[id="contact"]').textContent() || '';
            if (text.trim() === '') {
                await this.page.waitForTimeout(200);
                attempts++;
            }
        }

        return text;
    }

    async getModalText() {
        await this.page.waitForSelector('.modal-body', { state: 'visible' });
        return await this.page.locator('.modal-body').textContent();
    }
}