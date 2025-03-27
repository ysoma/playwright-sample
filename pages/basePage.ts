/**
 * @name BasePage
 * @description ページオブジェクトモデルの基底クラス
 * すべてのページオブジェクトはこのクラスを継承します。
 * 共通のナビゲーション、要素操作、待機ロジックを提供します。
 */
import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
    // ナビゲーション要素のマップ
    protected nav: Map<string, Locator>;

    /**
     * BasePage コンストラクタ
     * @param page Playwrightのページオブジェクト
     */
    constructor(protected page: Page) {
        // 共通のナビゲーション要素を初期化
        this.nav = new Map();
        this.nav.set('home', page.getByRole('link', { name: 'ホーム' }));
        this.nav.set('plans', page.getByRole('link', { name: '宿泊予約' }));
        this.nav.set('signup', page.getByRole('link', { name: '会員登録' }));
        this.nav.set('login', page.getByRole('button', { name: 'ログイン' }));
        this.nav.set('logout', page.getByRole('button', { name: 'ログアウト' }));
    }

    /**
     * ページが完全に読み込まれるのを待機
     * @param options 待機オプション
     */
    async waitForPageLoad(options = { timeout: 30000 }) {
        await this.page.waitForLoadState('networkidle', { timeout: options.timeout });
    }

    /**
     * 指定されたURLパターンとページのURLが一致することを確認
     * @param urlPattern 期待されるURLパターン（正規表現）
     */
    async assertCurrentUrl(urlPattern: RegExp) {
        await expect(this.page).toHaveURL(urlPattern);
    }

    /**
     * 指定されたセレクタの要素が表示されるのを待機し、表示されていることを確認
     * @param selector 要素のセレクタ
     * @param options 待機オプション
     */
    async assertElementVisible(selector: string, options = { timeout: 5000 }) {
        await expect(this.page.locator(selector)).toBeVisible({ timeout: options.timeout });
    }

    /**
     * 指定されたセレクタの要素にテキストを入力
     * @param selector 入力要素のセレクタ
     * @param value 入力する値
     */
    async fillInput(selector: string, value: string) {
        await this.page.fill(selector, value);
    }

    /**
     * 指定されたセレクタの要素をクリック
     * @param selector クリックする要素のセレクタ
     */
    async clickElement(selector: string) {
        await this.page.click(selector);
    }

    /**
     * 指定されたテキストを含む要素をクリック
     * @param text 検索するテキスト
     */
    async clickByText(text: string) {
        await this.page.click(`text=${text}`);
    }

    /**
     * 指定されたセレクタを持つ要素のテキストを取得（空の場合は再試行）
     * @param selector 要素のセレクタ
     * @param maxAttempts 最大試行回数
     * @returns 要素のテキスト内容
     */
    async getTextWithRetry(selector: string, maxAttempts = 10) {
        await this.page.waitForSelector(selector, { state: 'visible' });

        let text = '';
        let attempts = 0;

        while (text.trim() === '' && attempts < maxAttempts) {
            text = await this.page.locator(selector).textContent() || '';
            if (text.trim() === '') {
                await this.page.waitForTimeout(200);
                attempts++;
            }
        }

        return text;
    }

    /**
     * 指定されたLocatorのテキストを取得（空の場合は再試行）
     * @param locator 対象のLocator
     * @param maxAttempts 最大試行回数
     * @returns 要素のテキスト内容
     */
    async getLocatorTextWithRetry(locator: Locator, maxAttempts = 10) {
        await locator.waitFor({ state: 'visible' });

        let text = '';
        let attempts = 0;

        while (text.trim() === '' && attempts < maxAttempts) {
            text = await locator.textContent() || '';
            if (text.trim() === '') {
                await this.page.waitForTimeout(200);
                attempts++;
            }
        }

        return text;
    }

    /**
     * 要素が特定のテキストを含むことを確認
     * @param selector 要素のセレクタ
     * @param expectedText 期待されるテキスト
     */
    async assertTextContent(selector: string, expectedText: string) {
        const text = await this.getTextWithRetry(selector);
        expect(text).toContain(expectedText);
    }

    /**
     * ナビゲーションメニューの指定された項目をクリック
     * @param nav ナビゲーション項目のキー
     */
    async clickNav(nav: string) {
        const element = this.nav.get(nav);
        if (element) {
            await element.click();
        } else {
            throw new Error(`ナビゲーション要素 "${nav}" が見つかりません`);
        }
    }

    // 共通ナビゲーション操作
    async navigateToHome() {
        await this.clickNav('home');
    }

    async navigateToPlans() {
        await this.clickNav('plans');
    }

    async navigateToSignup() {
        await this.clickNav('signup');
    }

    async navigateToLogin() {
        await this.clickNav('login');
    }

    async navigateToLogout() {
        await this.clickNav('logout');
    }

    async pageTitle() {
        return this.page.title();
    }

    async logout() {
        await this.navigateToLogout();
    }

    /**
     * ページスクリーンショットを取得
     * @param path スクリーンショットの保存パス
     */
    async takeScreenshot(path: string) {
        await this.page.screenshot({ path, fullPage: true });
    }

    /**
     * デバッグ情報をコンソールに出力
     * @param message デバッグメッセージ
     */
    async debug(message: string) {
        console.log(`DEBUG [${await this.pageTitle()}]: ${message}`);
    }
}