/**
 * @name LoginPage
 * @description ログインページのページオブジェクト
 * ログイン関連の操作とアサーションを提供します。
 */

import { BasePage } from './basePage';
import { Locator, Page, expect } from '@playwright/test';

/**
 * ログインテストケースのインターフェース
 * すべてのテストケースは以下の情報を持つ
 */
export interface LoginTestCase {
    testName: string;                        // テストの説明
    email: string;                           // 入力するメールアドレス
    password: string;                        // 入力するパスワード
    expectedOutcome: 'success' | 'failure';  // 期待される結果
    expectedEmailError: string;              // 期待されるメールエラー（空文字=エラーなし）
    expectedPasswordError: string;           // 期待されるパスワードエラー（空文字=エラーなし）
    tags: string[];                          // テストのタグ（分類）
}

export class LoginPage extends BasePage {
    // ページ要素のロケーター
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly emailErrorMessage: Locator;
    private readonly passwordErrorMessage: Locator;

    /**
     * LoginPage コンストラクタ
     * @param page Playwrightのページオブジェクト
     */
    constructor(page: Page) {
        super(page);

        // 要素ロケーターの初期化
        this.emailInput = this.page.getByRole('textbox', { name: 'メールアドレス' });
        this.passwordInput = this.page.getByRole('textbox', { name: 'パスワード' });
        this.loginButton = this.page.locator('#login-button');
        this.emailErrorMessage = this.page.locator('#email-message');
        this.passwordErrorMessage = this.page.locator('#password-message');
    }

    /**
     * ログインページにアクセス
     */
    async goto() {
        await this.page.goto('/ja/login');
        await this.waitForPageLoad();
    }

    /**
     * メールアドレスを入力
     * @param email 入力するメールアドレス
     */
    async fillEmail(email: string) {
        await this.emailInput.fill(email);
    }

    /**
     * パスワードを入力
     * @param password 入力するパスワード
     */
    async fillPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    /**
     * ログインボタンをクリック
     */
    async submit() {
        await this.loginButton.click();
        await this.waitForPageLoad();
    }

    /**
     * 指定された認証情報でログイン
     * @param email メールアドレス
     * @param password パスワード
     */
    async loginAs(email: string, password: string) {
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.submit();
    }

    /**
     * エラーメッセージを取得
     * @returns エラーメッセージのテキスト
     */
    async getEmailErrorMessage() {
        return await this.getLocatorTextWithRetry(this.emailErrorMessage);
    }

    /**
     * パスワードエラーメッセージを取得
     * @returns パスワードエラーメッセージのテキスト
     */
    async getPasswordErrorMessage() {
        return await this.getLocatorTextWithRetry(this.passwordErrorMessage);
    }

    /**
     * エラーメッセージが表示されているか確認
     * @param expectedEmailError 期待されるメールエラーメッセージ
     * @param expectedPasswordError 期待されるパスワードエラーメッセージ
     */
    async assertErrorMessages(expectedEmailError: string, expectedPasswordError: string) {
        const emailError = await this.getEmailErrorMessage();
        const passwordError = await this.getPasswordErrorMessage();

        expect(emailError).toContain(expectedEmailError);
        expect(passwordError).toContain(expectedPasswordError);
    }

    /**
     * 特定のフィールドのエラーメッセージの有無を検証
     * @param field 検証対象のフィールド ('email' または 'password')
     * @param shouldExist エラーメッセージが存在すべきか
     * @param expectedText 期待されるエラーメッセージテキスト（省略可）
     */
    async assertErrorMessagePresence(field: 'email' | 'password', shouldExist: boolean, expectedText?: string) {
        const errorElement = field === 'email' ? this.emailErrorMessage : this.passwordErrorMessage;
        
        if (shouldExist) {
            await expect(errorElement).toBeVisible();
            if (expectedText) {
                const errorText = await this.getLocatorTextWithRetry(errorElement);
                expect(errorText).toContain(expectedText);
            }
        } else {
            try {
                const isVisible = await errorElement.isVisible();
                if (isVisible) {
                    const errorText = await this.getLocatorTextWithRetry(errorElement);
                    expect(errorText.trim()).toBe('');
                }
            } catch (e) {
                // 要素が見つからない場合はOK（エラーなし）
                console.log(`${field}エラーメッセージ要素が存在しません（エラーなしの場合はOK）`);
            }
        }
    }

    /**
     * テストケースに基づいてログインテストを実行
     * @param testCase ログインテストケース
     */
    async executeLoginTest(testCase: LoginTestCase) {
        // ログイン情報を入力して送信
        await this.loginAs(testCase.email, testCase.password);

        // 期待される結果を検証
        if (testCase.expectedOutcome === 'success') {
            await this.assertLoginSuccess();
        } else {
            await this.assertLoginFailure();

            // エラーメッセージの検証
            if (testCase.expectedEmailError) {
                await this.assertErrorMessagePresence('email', true, testCase.expectedEmailError);
            } else {
                await this.assertErrorMessagePresence('email', false);
            }

            if (testCase.expectedPasswordError) {
                await this.assertErrorMessagePresence('password', true, testCase.expectedPasswordError);
            } else {
                await this.assertErrorMessagePresence('password', false);
            }
        }
    }

    /**
     * ログイン成功後、マイページに遷移したことを確認
     */
    async assertLoginSuccess() {
        await this.assertCurrentUrl(/mypage/);
        await this.assertElementVisible('h2:has-text("マイページ")');
    }

    /**
     * ログイン失敗後、ログインページに留まっていることを確認
     */
    async assertLoginFailure() {
        await this.assertCurrentUrl(/\/login/);
    }
}
