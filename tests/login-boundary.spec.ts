/**
 * ログイン機能の境界値テスト
 * 
 * このテストでは、以下を検証します：
 * 1. 様々な入力パターンでのログインバリデーション
 * 2. 異なる長さや特殊文字を含むパスワード
 * 3. 異なる形式のメールアドレス
 * 4. 境界値・同値分割による入力テスト
 */

import { test } from './hooks';
import { LoginPage } from '../pages/loginPage';
import { allure } from 'allure-playwright';
import { loginTestCases } from '../helpers/testData';

// ----------------------------------------------------------------------------
// データ駆動テスト
// ----------------------------------------------------------------------------

for (const testCase of loginTestCases) {
    test(`ログイン - ${testCase.testName}`, async ({ page }) => {
        // Allureレポート用メタデータの詳細設定
        allure.epic('認証システム');
        allure.feature('ログイン');
        allure.story('入力バリデーション');
        allure.description(`ログイン入力テスト: ${testCase.testName}`);
        allure.severity(testCase.tags.includes('smoke') ? 'critical' : 'high');

        for (const tag of testCase.tags) {
            allure.tag(tag);
        }

        allure.parameter('メールアドレス', testCase.email);
        allure.parameter('パスワード', testCase.password.replace(/./g, '*')); // マスクして表示
        allure.parameter('期待結果', testCase.expectedOutcome);

        // GIVEN: ログインページにアクセスする
        const loginPage = new LoginPage(page);
        await allure.step('ログインページにアクセス', async () => {
            await loginPage.goto();
        });

        // WHEN & THEN: テストケースを実行して結果を検証
        await allure.step('テスト対象の認証情報でログインし結果を検証', async () => {
            try {
                await loginPage.executeLoginTest(testCase);
            } catch (error) {
                // エラー発生時にスクリーンショットを撮影
                await page.screenshot({ path: `error-${testCase.testName.replace(/\s+/g, '-')}.png` });
                throw error;
            }
        });
    });
}
