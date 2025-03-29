/**
 * 宿泊予約フォームの.invalid-feedbackメッセージのテスト
 * 
 * 無効な入力に対する.invalid-feedbackメッセージが表示されることを検証します
 * 各入力フィールドのバリデーションルールが正しく機能することを確認します
 */

import { test, expect } from './hooks';
import { allure } from 'allure-playwright';
import {
    openReservationPage,
    VALIDATION_TEST_CASES,
} from '../helpers/validationHelpers';

test.describe('宿泊予約フォームのバリデーション', () => {
    // Allureレポートのメタデータを設定
    test.beforeEach(() => {
        allure.epic('予約システム');
        allure.feature('宿泊予約フォームバリデーション');
        allure.story('入力バリデーションが正しく機能すること');
    });

    // データ駆動テスト：各バリデーションケースを実行
    for (const testCase of VALIDATION_TEST_CASES) {
        test(testCase.name, async ({ page }) => {
            // Allureレポート用メタデータの詳細設定
            allure.description(testCase.description);
            allure.severity(testCase.severity);
            allure.tag('validation');
            allure.tag(testCase.isPositive ? 'positive' : 'negative');
            allure.tag('form');
            allure.owner('ysoma');
            allure.link('バリデーション仕様', 'https://example.com/spec/validation', 'specification');
            allure.issue(testCase.issueId, `https://example.com/issues/${testCase.issueId}`);

            // 予約ページを開く
            const result = await openReservationPage(page);
            const reservationPage = result.reservationPage;
            const reservePage = result.reservePage;

            await allure.step('予約ページを開く', async () => {
                // 既に予約ページを開いています
            });

            // テストケースのセットアップを実行
            await allure.step('テストデータを設定', async () => {
                await testCase.setup(reservePage);
            });

            // フォームを送信
            await allure.step('フォームを送信', async () => {
                if (testCase.isPositive) {
                    await reservePage.proceedToConfirm();
                } else {
                    await reservePage.submitAndWaitForValidation();
                }
            });

            // スクリーンショットを撮影
            await allure.step('結果のスクリーンショット', async () => {
                const screenshot = await reservationPage.screenshot();
                allure.attachment(`${testCase.name}-screenshot`, screenshot, 'image/png');
            });

            // 結果を検証
            if (testCase.isPositive) {
                // 正常系：確認ページへの遷移を検証
                await allure.step('確認ページへの遷移を検証', async () => {
                    await reservePage.assertNavigationToConfirmPage();
                });
            } else {
                // 異常系：エラーメッセージを検証
                await allure.step('エラーメッセージを検証', async () => {
                    // 複数のフィールドエラーを検証する場合
                    if (Object.keys(testCase.expectedErrors).length > 1) {
                        // 表示されているエラーメッセージの数を検証
                        const invalidFeedbackCount = await reservePage.getVisibleInvalidFeedbackCount();
                        expect(invalidFeedbackCount).toBeGreaterThanOrEqual(Object.keys(testCase.expectedErrors).length);
                    }

                    // 各フィールドのエラーメッセージを検証
                    await reservePage.assertMultipleFieldErrors(testCase.expectedErrors);
                });
            }
        });
    }
});
