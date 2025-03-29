/**
 * 宿泊予約フローE2Eテスト
 * 
 * このテストでは、以下の一連のユーザーフローを検証します：
 * 1. プラン選択ページでの宿泊プラン選択
 * 2. 予約情報入力フォームの入力
 * 3. 予約内容確認
 * 4. 予約完了
 */

import { test, expect } from './hooks';
import { allure } from 'allure-playwright';
import {
    executeReservationFlow,
    RESERVATION_TEST_CASES
} from '../helpers/reservationHelpers';

// ----------------------------------------------------------------------------
// テストケース
// ----------------------------------------------------------------------------

// データ駆動テスト：各予約フローテストケースを実行
for (const testCase of RESERVATION_TEST_CASES) {
    test(testCase.name, async ({ page }) => {
        // Allureレポート用メタデータの詳細設定
        allure.epic('予約システム');
        allure.feature('宿泊予約');
        allure.story('予約フロー');
        allure.description(testCase.description);
        allure.severity(testCase.severity);
        
        // タグを設定
        for (const tag of testCase.tags) {
            allure.tag(tag);
        }

        // オプションからパラメータを設定
        if (testCase.options.planName) {
            allure.parameter('プラン名', testCase.options.planName);
        }
        if (testCase.options.checkInDate) {
            allure.parameter('宿泊日', testCase.options.checkInDate);
        }
        if (testCase.options.guests) {
            allure.parameter('宿泊人数', testCase.options.guests);
        }
        if (testCase.options.contactMethod) {
            allure.parameter('連絡方法', testCase.options.contactMethod);
        }

        // 予約フローを実行
        const result = await executeReservationFlow(page, testCase.options);

        // 結果を検証
        if (testCase.expectedResult.success) {
            expect(result.success, '予約フローが成功すること').toBe(true);
            if (result.errorMessage) {
                console.error(`予約フローでエラーが発生しました: ${result.errorMessage}`);
            }
        } else {
            expect(result.success, '予約フローが失敗すること').toBe(false);
            if (testCase.expectedResult.errorMessage) {
                expect(result.errorMessage).toContain(testCase.expectedResult.errorMessage);
            }
        }
    });
}

// 将来的に追加すべきテストケース：
// - 必須項目が未入力の場合のバリデーション確認
// - 異なるプラン選択での予約フロー
// - 連絡方法を電話番号に設定した場合の予約フロー
// これらは helpers/reservationHelpers.ts の RESERVATION_TEST_CASES に追加することで実装可能
