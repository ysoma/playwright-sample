/**
 * @name LoginPage
 * @description ログインページのページオブジェクト
 * ログイン関連の操作とアサーションを提供します。
 */

import { BasePage } from './basePage';
import { Locator, Page, expect } from '@playwright/test';

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