/**
 * @name testHelpers.ts
 * @description テスト実行に関連するヘルパー関数
 */

import { Page, TestInfo } from '@playwright/test';
import { allure } from 'allure-playwright';

/**
 * テスト失敗時にスクリーンショットを自動的に添付
 * @param page Playwrightのページオブジェクト
 * @param testInfo テスト情報
 */
export async function attachScreenshotOnFailure(page: Page, testInfo: TestInfo) {
    if (testInfo.status !== 'passed') {
        try {
            // スクリーンショットを取得
            const screenshot = await page.screenshot({
                fullPage: true,
                timeout: 5000
            });

            // Allureレポートに添付
            await allure.attachment(
                `screenshot-on-failure-${Date.now()}`,
                screenshot,
                'image/png'
            );

            // テスト結果にも添付（Playwrightのレポート用）
            await testInfo.attach('screenshot-on-failure', {
                body: screenshot,
                contentType: 'image/png'
            });

            console.log(`スクリーンショットを添付しました: ${testInfo.title}`);
        } catch (error) {
            console.error('スクリーンショットの取得に失敗しました:', error);
        }
    }
}