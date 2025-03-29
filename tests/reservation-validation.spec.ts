/**
 * 宿泊予約フォームの.invalid-feedbackメッセージのテスト
 * 
 * 無効な入力に対する.invalid-feedbackメッセージが表示されることを検証します
 * 各入力フィールドのバリデーションルールが正しく機能することを確認します
 */

import { test, expect } from './hooks';
import { Page } from '@playwright/test';
import { PlansPage } from '../pages/plansPage';
import { ReservePage } from '../pages/reservePage';
import { allure } from 'allure-playwright';

// テスト共通の定数
const TEST_PLAN_NAME = 'お得な特典付きプラン';
const TEST_USER_NAME = 'テスト太郎';
const TEST_EMAIL = 'test@example.com';
const TEST_PHONE = '03-1234-5678';
const INVALID_FEEDBACK_SELECTOR = '.invalid-feedback:visible';

/**
 * ReservePageの拡張クラス
 * バリデーションテスト用のヘルパーメソッドを追加
 */
class ValidationTestReservePage extends ReservePage {
    /**
     * 表示されているinvalid-feedbackメッセージの数を取得
     */
    async getVisibleInvalidFeedbackCount(): Promise<number> {
        return this.page.evaluate(() => {
            const visibleInvalidFeedbacks = Array.from(document.querySelectorAll('.invalid-feedback'))
                .filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none';
                });
            return visibleInvalidFeedbacks.length;
        });
    }

    /**
     * 特定のフィールドに対するinvalid-feedbackメッセージを取得
     * @param fieldId フィールドのID
     */
    async getFieldErrorMessage(fieldId: string): Promise<string | null> {
        return this.page.evaluate((id) => {
            const field = document.getElementById(id);
            if (!field) return null;

            // フィールドの親要素を取得
            const parent = field.parentElement;
            if (!parent) return null;

            // 親要素内のinvalid-feedback要素を取得
            const invalidFeedback = parent.querySelector('.invalid-feedback');
            if (!invalidFeedback) return null;

            // invalid-feedbackが表示されているか確認
            const style = window.getComputedStyle(invalidFeedback);
            return style.display !== 'none' ? invalidFeedback.textContent : null;
        }, fieldId);
    }

    /**
     * フォームを送信し、バリデーションエラーの表示を待機
     */
    async submitAndWaitForValidation(): Promise<void> {
        await this.proceedToConfirm();

        // invalid-feedbackが表示されるか、ページ遷移するまで待機
        await Promise.race([
            this.page.waitForSelector(INVALID_FEEDBACK_SELECTOR, { state: 'visible', timeout: 3000 })
                .catch(() => { }), // エラーを無視
            this.page.waitForURL(/.*confirm\.html/, { timeout: 3000 })
                .catch(() => { }) // エラーを無視
        ]);

        // 処理が安定するまで少し待機
        await this.page.waitForTimeout(100);
    }
}

/**
 * 予約ページを開くヘルパー関数
 */
async function openReservationPage(page: Page) {
    const plansPage = new PlansPage(page);
    await plansPage.goto();

    const reservationPage = await plansPage.selectPlanByName(TEST_PLAN_NAME);
    await reservationPage.waitForLoadState('networkidle');

    return {
        reservationPage,
        reservePage: new ValidationTestReservePage(reservationPage)
    };
}

test.describe('宿泊予約フォームのバリデーション', () => {
    // Allureレポートのメタデータを設定
    test.beforeEach(() => {
        allure.epic('予約システム');
        allure.feature('宿泊予約フォームバリデーション');
        allure.story('入力バリデーションが正しく機能すること');
    });

    test('宿泊数に0を入力するとエラーメッセージが表示される', async ({ page }) => {
        // Allureレポート用メタデータの詳細設定
        allure.description('宿泊数に0を入力した場合、適切なバリデーションエラーメッセージが表示されることを検証します');
        allure.severity('critical');
        allure.tag('validation');
        allure.tag('negative');
        allure.tag('form');
        allure.owner('ysoma');
        allure.link('バリデーション仕様', 'https://example.com/spec/validation', 'specification');
        allure.issue('VAL-101', 'https://example.com/issues/VAL-101');

        // 予約ページを開く
        const result = await openReservationPage(page);
        const reservationPage = result.reservationPage;
        const reservePage = result.reservePage;
        
        await allure.step('予約ページを開く', async () => {
            // 既に予約ページを開いています
        });

        // 宿泊数に0を入力
        await allure.step('宿泊数に0を入力', async () => {
            await reservePage.selectStayDays('0');
        });

        // 他の必須項目に有効な値を入力
        await allure.step('他の必須項目に有効な値を入力', async () => {
            await reservePage.fillName(TEST_USER_NAME);
            await reservePage.selectContactMethod('email');
            await reservePage.fillEmail(TEST_EMAIL);
        });

        // フォームを送信し、バリデーション結果を待機
        await allure.step('フォームを送信', async () => {
            await reservePage.submitAndWaitForValidation();
        });

        // スクリーンショットを撮影
        await allure.step('バリデーション結果のスクリーンショット', async () => {
            const screenshot = await reservationPage.screenshot();
            allure.attachment('invalid-stay-days-screenshot', screenshot, 'image/png');
        });

        // 宿泊数フィールドのエラーメッセージを検証
        await allure.step('宿泊数フィールドのエラーメッセージを検証', async () => {
            const stayDaysErrorMessage = await reservePage.getFieldErrorMessage('term');
            expect(stayDaysErrorMessage).not.toBeNull();
            expect(stayDaysErrorMessage).toContain('1以上の値を入力してください');
        });
    });

    test('氏名を入力しないとエラーメッセージが表示される', async ({ page }) => {
        // Allureレポート用メタデータの詳細設定
        allure.description('氏名を入力せずにフォームを送信した場合、適切なバリデーションエラーメッセージが表示されることを検証します');
        allure.severity('critical');
        allure.tag('validation');
        allure.tag('negative');
        allure.tag('form');
        allure.owner('ysoma');
        allure.link('バリデーション仕様', 'https://example.com/spec/validation', 'specification');
        allure.issue('VAL-102', 'https://example.com/issues/VAL-102');

        // 予約ページを開く
        const result = await openReservationPage(page);
        const reservationPage = result.reservationPage;
        const reservePage = result.reservePage;
        
        await allure.step('予約ページを開く', async () => {
            // 既に予約ページを開いています
        });

        // 氏名は入力しない
        await allure.step('氏名フィールドは空のままにする', async () => {
            // 意図的に氏名を入力しない
        });

        // 他の必須項目に有効な値を入力
        await allure.step('他の必須項目に有効な値を入力', async () => {
            await reservePage.selectContactMethod('email');
            await reservePage.fillEmail(TEST_EMAIL);
        });

        // フォームを送信し、バリデーション結果を待機
        await allure.step('フォームを送信', async () => {
            await reservePage.submitAndWaitForValidation();
        });

        // スクリーンショットを撮影
        await allure.step('バリデーション結果のスクリーンショット', async () => {
            const screenshot = await reservationPage.screenshot();
            allure.attachment('invalid-name-screenshot', screenshot, 'image/png');
        });

        // 氏名フィールドのエラーメッセージを検証
        await allure.step('氏名フィールドのエラーメッセージを検証', async () => {
            const nameErrorMessage = await reservePage.getFieldErrorMessage('username');
            expect(nameErrorMessage).not.toBeNull();
            expect(nameErrorMessage).toBe('このフィールドを入力してください。');
        });
    });

    test('メールアドレスの形式が不正な場合にエラーメッセージが表示される', async ({ page }) => {
        // Allureレポート用メタデータの詳細設定
        allure.description('不正な形式のメールアドレスを入力した場合、適切なバリデーションエラーメッセージが表示されることを検証します');
        allure.severity('critical');
        allure.tag('validation');
        allure.tag('negative');
        allure.tag('form');
        allure.owner('ysoma');
        allure.link('バリデーション仕様', 'https://example.com/spec/validation', 'specification');
        allure.issue('VAL-103', 'https://example.com/issues/VAL-103');

        // 予約ページを開く
        const result = await openReservationPage(page);
        const reservationPage = result.reservationPage;
        const reservePage = result.reservePage;
        
        await allure.step('予約ページを開く', async () => {
            // 既に予約ページを開いています
        });

        // 必須項目に値を入力（メールアドレスは不正な形式）
        await allure.step('必須項目に値を入力', async () => {
            await reservePage.fillName(TEST_USER_NAME);
            await reservePage.selectContactMethod('email');
        });

        await allure.step('不正な形式のメールアドレスを入力', async () => {
            await reservePage.fillEmail('invalid-email');  // 不正な形式
        });

        // フォームを送信し、バリデーション結果を待機
        await allure.step('フォームを送信', async () => {
            await reservePage.submitAndWaitForValidation();
        });

        // スクリーンショットを撮影
        await allure.step('バリデーション結果のスクリーンショット', async () => {
            const screenshot = await reservationPage.screenshot();
            allure.attachment('invalid-email-screenshot', screenshot, 'image/png');
        });

        // メールアドレスフィールドのエラーメッセージを検証
        await allure.step('メールアドレスフィールドのエラーメッセージを検証', async () => {
            const emailErrorMessage = await reservePage.getFieldErrorMessage('email');
            expect(emailErrorMessage).not.toBeNull();
            expect(emailErrorMessage).toContain('メールアドレスを入力してください。');
        });
    });

    test('電話番号を選択したが入力しない場合にエラーメッセージが表示される', async ({ page }) => {
        // Allureレポート用メタデータの詳細設定
        allure.description('連絡方法として電話番号を選択したが電話番号を入力しない場合、適切なバリデーションエラーメッセージが表示されることを検証します');
        allure.severity('critical');
        allure.tag('validation');
        allure.tag('negative');
        allure.tag('form');
        allure.owner('ysoma');
        allure.link('バリデーション仕様', 'https://example.com/spec/validation', 'specification');
        allure.issue('VAL-104', 'https://example.com/issues/VAL-104');

        // 予約ページを開く
        const result = await openReservationPage(page);
        const reservationPage = result.reservationPage;
        const reservePage = result.reservePage;
        
        await allure.step('予約ページを開く', async () => {
            // 既に予約ページを開いています
        });

        // 必須項目に値を入力（電話番号は入力しない）
        await allure.step('氏名を入力', async () => {
            await reservePage.fillName(TEST_USER_NAME);
        });

        await allure.step('連絡方法として電話番号を選択', async () => {
            await reservePage.selectContactMethod('tel');
        });

        await allure.step('電話番号は入力しない', async () => {
            // 意図的に電話番号を入力しない
        });

        // フォームを送信し、バリデーション結果を待機
        await allure.step('フォームを送信', async () => {
            await reservePage.submitAndWaitForValidation();
        });

        // スクリーンショットを撮影
        await allure.step('バリデーション結果のスクリーンショット', async () => {
            const screenshot = await reservationPage.screenshot();
            allure.attachment('invalid-tel-screenshot', screenshot, 'image/png');
        });

        // 電話番号フィールドのエラーメッセージを検証
        await allure.step('電話番号フィールドのエラーメッセージを検証', async () => {
            const telErrorMessage = await reservePage.getFieldErrorMessage('tel');
            expect(telErrorMessage).not.toBeNull();
            expect(telErrorMessage).toBe('このフィールドを入力してください。');
        });
    });

    test('すべての必須項目に有効な値を入力すると確認ページに遷移する', async ({ page }) => {
        // Allureレポート用メタデータの詳細設定
        allure.description('すべての必須項目に有効な値を入力した場合、バリデーションが通過し確認ページに遷移することを検証します');
        allure.severity('critical');
        allure.tag('validation');
        allure.tag('positive');
        allure.tag('form');
        allure.owner('ysoma');
        allure.link('バリデーション仕様', 'https://example.com/spec/validation', 'specification');
        allure.issue('VAL-105', 'https://example.com/issues/VAL-105');

        // 予約ページを開く
        const result = await openReservationPage(page);
        const reservationPage = result.reservationPage;
        const reservePage = result.reservePage;
        
        await allure.step('予約ページを開く', async () => {
            // 既に予約ページを開いています
        });

        // すべての必須項目に有効な値を入力
        await allure.step('すべての必須項目に有効な値を入力', async () => {
            await reservePage.fillName(TEST_USER_NAME);
            await reservePage.selectContactMethod('email');
            await reservePage.fillEmail(TEST_EMAIL);
        });

        // フォームを送信
        await allure.step('フォームを送信', async () => {
            await reservePage.proceedToConfirm();
        });

        try {
            // 確認ページへの遷移を待機
            await allure.step('確認ページへの遷移を待機', async () => {
                await reservationPage.waitForURL(/.*confirm\.html/, { timeout: 10000 });
            });

            // スクリーンショットを撮影
            await allure.step('確認ページのスクリーンショット', async () => {
                const screenshot = await reservationPage.screenshot();
                allure.attachment('confirmation-page-screenshot', screenshot, 'image/png');
            });

            // 確認ページに遷移していることを検証
            await allure.step('確認ページへの遷移を検証', async () => {
                const currentUrl = reservationPage.url();
                expect(currentUrl).toContain('confirm.html');
            });
        } catch (error) {
            // タイムアウトした場合、現在のページをチェック
            await allure.step('遷移失敗時の状態を確認', async () => {
                const screenshot = await reservationPage.screenshot();
                allure.attachment('page-after-submit', screenshot, 'image/png');

                // エラーメッセージの有無を確認
                const invalidFeedbackCount = await reservePage.getVisibleInvalidFeedbackCount();

                // エラーメッセージがないことを確認
                expect(invalidFeedbackCount).toBe(0);
            });

            // より詳細なエラーメッセージを付けて再スロー
            throw new Error(`確認ページへの遷移に失敗しました: ${error instanceof Error ? error.message : '未知のエラー'}`);
        }
    });

    test('複数のフィールドにエラーがある場合、すべてのエラーメッセージが表示される', async ({ page }) => {
        // Allureレポート用メタデータの詳細設定
        allure.description('複数のフィールドに無効な値がある場合、すべてのフィールドに対応するエラーメッセージが表示されることを検証します');
        allure.severity('high');
        allure.tag('validation');
        allure.tag('negative');
        allure.tag('form');
        allure.owner('ysoma');
        allure.link('バリデーション仕様', 'https://example.com/spec/validation', 'specification');
        allure.issue('VAL-106', 'https://example.com/issues/VAL-106');

        // 予約ページを開く
        const result = await openReservationPage(page);
        const reservationPage = result.reservationPage;
        const reservePage = result.reservePage;
        
        await allure.step('予約ページを開く', async () => {
            // 既に予約ページを開いています
        });

        // 複数のフィールドに無効な値を設定
        await allure.step('宿泊数に0を入力', async () => {
            await reservePage.selectStayDays('0');
        });

        await allure.step('氏名は入力しない', async () => {
            // 意図的に氏名を入力しない
        });

        await allure.step('連絡方法をメールに設定するが、メールアドレスは入力しない', async () => {
            await reservePage.selectContactMethod('email');
            // メールアドレスは意図的に入力しない
        });

        // フォームを送信し、バリデーション結果を待機
        await allure.step('フォームを送信', async () => {
            await reservePage.submitAndWaitForValidation();
        });

        // スクリーンショットを撮影
        await allure.step('バリデーション結果のスクリーンショット', async () => {
            const screenshot = await reservationPage.screenshot();
            allure.attachment('multiple-errors-screenshot', screenshot, 'image/png');
        });

        // 表示されているエラーメッセージの数を検証
        await allure.step('複数のエラーメッセージが表示されていることを検証', async () => {
            const invalidFeedbackCount = await reservePage.getVisibleInvalidFeedbackCount();
            expect(invalidFeedbackCount).toBeGreaterThanOrEqual(3); // 少なくとも3つのエラー
        });

        // 各フィールドのエラーメッセージを検証
        await allure.step('各フィールドのエラーメッセージを個別に検証', async () => {
            const stayDaysError = await reservePage.getFieldErrorMessage('term');
            const nameError = await reservePage.getFieldErrorMessage('username');
            const emailError = await reservePage.getFieldErrorMessage('email');

            expect(stayDaysError).not.toBeNull();
            expect(nameError).not.toBeNull();
            expect(emailError).not.toBeNull();
        });
    });
});
