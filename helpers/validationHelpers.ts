/**
 * @name validationHelpers.ts
 * @description フォームバリデーションテスト用のヘルパー関数とデータ
 */

import { Page } from '@playwright/test';
import { PlansPage } from '../pages/plansPage';
import { ReservePage } from '../pages/reservePage';
import { reservationData } from './testData';

// バリデーションテスト用の定数
export const VALIDATION_CONSTANTS = {
    INVALID_FEEDBACK_SELECTOR: '.invalid-feedback:visible',
    TEST_USER_NAME: 'テスト太郎',
    TEST_EMAIL: 'test@example.com',
    TEST_PHONE: '03-1234-5678',
    INVALID_EMAIL: 'invalid-email',
    ZERO_STAY_DAYS: '0'
};

/**
 * フィールドエラーメッセージの期待値
 */
export const EXPECTED_ERROR_MESSAGES = {
    REQUIRED_FIELD: 'このフィールドを入力してください。',
    INVALID_STAY_DAYS: '1以上の値を入力してください',
    INVALID_EMAIL: 'メールアドレスを入力してください。'
};

/**
 * バリデーションテスト用のReservePageの拡張クラス
 */
export class ValidationTestReservePage extends ReservePage {
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
            this.page.waitForSelector(VALIDATION_CONSTANTS.INVALID_FEEDBACK_SELECTOR, { state: 'visible', timeout: 3000 })
                .catch(() => { }), // エラーを無視
            this.page.waitForURL(/.*confirm\.html/, { timeout: 3000 })
                .catch(() => { }) // エラーを無視
        ]);

        // 処理が安定するまで少し待機
        await this.page.waitForTimeout(100);
    }

    /**
     * 特定のフィールドのエラーメッセージを検証
     * @param fieldId フィールドのID
     * @param expectedMessage 期待されるエラーメッセージ
     */
    async assertFieldError(fieldId: string, expectedMessage: string): Promise<void> {
        const errorMessage = await this.getFieldErrorMessage(fieldId);
        if (!errorMessage) {
            throw new Error(`フィールド "${fieldId}" にエラーメッセージが表示されていません`);
        }
        if (!errorMessage.includes(expectedMessage)) {
            throw new Error(`フィールド "${fieldId}" のエラーメッセージが期待と異なります。期待: "${expectedMessage}", 実際: "${errorMessage}"`);
        }
    }

    /**
     * 複数のフィールドのエラーメッセージを検証
     * @param fieldErrors フィールドIDとエラーメッセージのマップ
     */
    async assertMultipleFieldErrors(fieldErrors: Record<string, string>): Promise<void> {
        for (const [fieldId, expectedMessage] of Object.entries(fieldErrors)) {
            await this.assertFieldError(fieldId, expectedMessage);
        }
    }

    /**
     * 確認ページへの遷移を検証
     */
    async assertNavigationToConfirmPage(): Promise<void> {
        try {
            await this.page.waitForURL(/.*confirm\.html/, { timeout: 10000 });
            const currentUrl = this.page.url();
            if (!currentUrl.includes('confirm.html')) {
                throw new Error(`確認ページに遷移していません。現在のURL: ${currentUrl}`);
            }
        } catch (error) {
            // エラーメッセージの有無を確認
            const invalidFeedbackCount = await this.getVisibleInvalidFeedbackCount();
            if (invalidFeedbackCount > 0) {
                throw new Error(`バリデーションエラーが表示されているため確認ページに遷移できません。エラー数: ${invalidFeedbackCount}`);
            }
            throw new Error(`確認ページへの遷移に失敗しました: ${error instanceof Error ? error.message : '未知のエラー'}`);
        }
    }
}

/**
 * 予約ページを開くヘルパー関数
 * @param page Playwrightのページオブジェクト
 * @returns 予約ページと拡張された予約ページオブジェクト
 */
export async function openReservationPage(page: Page) {
    const plansPage = new PlansPage(page);
    await plansPage.goto();

    const reservationPage = await plansPage.selectPlanByName(reservationData.planName);
    await reservationPage.waitForLoadState('networkidle');

    return {
        reservationPage,
        reservePage: new ValidationTestReservePage(reservationPage)
    };
}

/**
 * バリデーションテストケースの定義
 */
export interface ValidationTestCase {
    name: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'trivial';
    issueId: string;
    setup: (reservePage: ValidationTestReservePage) => Promise<void>;
    expectedErrors: Record<string, string>;
    isPositive?: boolean;
}

/**
 * バリデーションテストケース
 */
export const VALIDATION_TEST_CASES: ValidationTestCase[] = [
    {
        name: '宿泊数に0を入力するとエラーメッセージが表示される',
        description: '宿泊数に0を入力した場合、適切なバリデーションエラーメッセージが表示されることを検証します',
        severity: 'critical',
        issueId: 'VAL-101',
        setup: async (reservePage) => {
            await reservePage.selectStayDays(VALIDATION_CONSTANTS.ZERO_STAY_DAYS);
            await reservePage.fillName(VALIDATION_CONSTANTS.TEST_USER_NAME);
            await reservePage.selectContactMethod('email');
            await reservePage.fillEmail(VALIDATION_CONSTANTS.TEST_EMAIL);
        },
        expectedErrors: {
            'term': EXPECTED_ERROR_MESSAGES.INVALID_STAY_DAYS
        }
    },
    {
        name: '氏名を入力しないとエラーメッセージが表示される',
        description: '氏名を入力せずにフォームを送信した場合、適切なバリデーションエラーメッセージが表示されることを検証します',
        severity: 'critical',
        issueId: 'VAL-102',
        setup: async (reservePage) => {
            // 氏名は意図的に入力しない
            await reservePage.selectContactMethod('email');
            await reservePage.fillEmail(VALIDATION_CONSTANTS.TEST_EMAIL);
        },
        expectedErrors: {
            'username': EXPECTED_ERROR_MESSAGES.REQUIRED_FIELD
        }
    },
    {
        name: 'メールアドレスの形式が不正な場合にエラーメッセージが表示される',
        description: '不正な形式のメールアドレスを入力した場合、適切なバリデーションエラーメッセージが表示されることを検証します',
        severity: 'critical',
        issueId: 'VAL-103',
        setup: async (reservePage) => {
            await reservePage.fillName(VALIDATION_CONSTANTS.TEST_USER_NAME);
            await reservePage.selectContactMethod('email');
            await reservePage.fillEmail(VALIDATION_CONSTANTS.INVALID_EMAIL);
        },
        expectedErrors: {
            'email': EXPECTED_ERROR_MESSAGES.INVALID_EMAIL
        }
    },
    {
        name: '電話番号を選択したが入力しない場合にエラーメッセージが表示される',
        description: '連絡方法として電話番号を選択したが電話番号を入力しない場合、適切なバリデーションエラーメッセージが表示されることを検証します',
        severity: 'critical',
        issueId: 'VAL-104',
        setup: async (reservePage) => {
            await reservePage.fillName(VALIDATION_CONSTANTS.TEST_USER_NAME);
            await reservePage.selectContactMethod('tel');
            // 電話番号は意図的に入力しない
        },
        expectedErrors: {
            'tel': EXPECTED_ERROR_MESSAGES.REQUIRED_FIELD
        }
    },
    {
        name: 'すべての必須項目に有効な値を入力すると確認ページに遷移する',
        description: 'すべての必須項目に有効な値を入力した場合、バリデーションが通過し確認ページに遷移することを検証します',
        severity: 'critical',
        issueId: 'VAL-105',
        setup: async (reservePage) => {
            await reservePage.fillName(VALIDATION_CONSTANTS.TEST_USER_NAME);
            await reservePage.selectContactMethod('email');
            await reservePage.fillEmail(VALIDATION_CONSTANTS.TEST_EMAIL);
        },
        expectedErrors: {},
        isPositive: true
    },
    {
        name: '複数のフィールドにエラーがある場合、すべてのエラーメッセージが表示される',
        description: '複数のフィールドに無効な値がある場合、すべてのフィールドに対応するエラーメッセージが表示されることを検証します',
        severity: 'high',
        issueId: 'VAL-106',
        setup: async (reservePage) => {
            await reservePage.selectStayDays(VALIDATION_CONSTANTS.ZERO_STAY_DAYS);
            // 氏名は意図的に入力しない
            await reservePage.selectContactMethod('email');
            // メールアドレスは意図的に入力しない
        },
        expectedErrors: {
            'term': EXPECTED_ERROR_MESSAGES.INVALID_STAY_DAYS,
            'username': EXPECTED_ERROR_MESSAGES.REQUIRED_FIELD,
            'email': EXPECTED_ERROR_MESSAGES.REQUIRED_FIELD
        }
    }
];
