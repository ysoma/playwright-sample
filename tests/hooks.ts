/**
 * @name hooks.ts
 * @description テスト実行時のグローバルフック
 */

import { test as base } from '@playwright/test';
import { attachScreenshotOnFailure } from '../helpers/testHelpers';

// スクリーンショット自動添付フックを追加したテスト関数
export const test = base.extend({
    // 各テストケースの処理
    page: async ({ page }, use, testInfo) => {
        // 標準のページオブジェクトを使用
        await use(page);

        // テスト完了後（成功/失敗に関わらず）に実行
        if (testInfo.status !== 'passed') {
            await attachScreenshotOnFailure(page, testInfo);
        }
    }
});

// 標準のexpectを再エクスポート
export { expect } from '@playwright/test';