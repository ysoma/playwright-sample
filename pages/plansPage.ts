/**
 * @name PlansPage
 * @description プラン一覧ページのページオブジェクト
 * 宿泊プランの一覧表示と選択操作を提供します。
 */

import { BasePage } from './basePage';
import { Locator, Page } from '@playwright/test';

export class PlansPage extends BasePage {
    /**
     * PlansPage コンストラクタ
     * @param page Playwrightのページオブジェクト
     */
    constructor(page: Page) {
        super(page);
    }

    /**
     * プラン一覧ページにアクセス
     */
    async goto() {
        await this.page.goto('/ja/plans');
        await this.waitForPageLoad();
    }

    /**
     * プラン名からカードロケーターを取得
     * @param planName プラン名
     * @returns プランカードのロケーター
     */
    private getPlanCard(planName: string): Locator {
        return this.page.locator(`.card-body:has(h5.card-title:text-is("${planName}"))`);
    }

    /**
     * 指定された名前のプランを選択
     * @param planName 選択するプラン名
     * @returns 新しいページ（ポップアップ）
     */
    async selectPlanByName(planName: string): Promise<Page> {
        try {
            // プランカードを特定
            const cardSelector = `.card-body:has(h5.card-title:text-is("${planName}"))`;
            await this.page.waitForSelector(cardSelector, { timeout: 5000 });
            const card = this.page.locator(cardSelector);

            // 予約ボタンを特定
            const reserveButton = card.locator('a.btn, a[role="button"]');
            await reserveButton.waitFor({ state: 'visible', timeout: 5000 });

            // ポップアップを待機してボタンをクリック
            const popupPromise = this.page.waitForEvent('popup');
            await reserveButton.click();

            // ポップアップページを取得
            const reservationPage = await popupPromise;
            await reservationPage.waitForLoadState('networkidle');

            return reservationPage;
        } catch (error) {
            console.error(`プラン「${planName}」の選択中にエラーが発生しました: ${error instanceof Error ? error.message : '未知のエラー'}`);

            // エラーの詳細情報を出力
            await this.debugPlanSelection(planName);

            // スクリーンショットを撮影してデバッグ情報として保存
            await this.takeScreenshot('error-plan-selection.png');

            throw new Error(`プラン「${planName}」の選択に失敗しました: ${error instanceof Error ? error.message : '未知のエラー'}`);
        }
    }

    /**
     * 利用可能なすべてのプラン名を取得
     * @returns 利用可能なプラン名の配列
     */
    async getAvailablePlans(): Promise<string[]> {
        await this.waitForPageLoad();
        return this.page.locator('h5.card-title').allTextContents();
    }

    /**
     * 特定のプランの料金を取得
     * @param planName プラン名
     * @returns プランの料金文字列
     */
    async getPlanPrice(planName: string): Promise<string> {
        const card = this.getPlanCard(planName);
        const priceElement = card.locator('.card-text:has-text("お値段")');
        return await this.getLocatorTextWithRetry(priceElement);
    }

    /**
     * プラン選択のデバッグ情報を出力
     * @param planName デバッグ対象のプラン名
     */
    async debugPlanSelection(planName: string) {
        console.log('デバッグモードを開始します...');

        // 全カードタイトルを確認
        const allCardTitles = await this.page.locator('h5.card-title').allTextContents();
        console.log('検出されたカードタイトル:', allCardTitles);

        // カードがあるかチェック
        const cardSelector = `.card-body:has(h5.card-title:text-is("${planName}"))`;
        const cardExists = await this.page.locator(cardSelector).count() > 0;
        console.log(`プラン「${planName}」のカードは存在しますか？: ${cardExists}`);

        if (cardExists) {
            // カード内の全リンクを確認
            const card = this.page.locator(cardSelector);
            const allLinks = await card.locator('a').allTextContents();
            console.log('カード内のリンクテキスト:', allLinks);

            // ボタン風リンクの存在チェック
            const buttonLinks = await card.locator('a.btn, a[role="button"]').count();
            console.log(`ボタン風リンクの数: ${buttonLinks}`);
        }

        console.log('デバッグ情報の収集を完了しました');
    }

    /**
     * 特定の条件でプランをフィルタリング
     * @param keyword 検索キーワード
     * @returns フィルタリングされたプラン名の配列
     */
    async searchPlans(keyword: string): Promise<string[]> {
        const allPlans = await this.getAvailablePlans();
        return allPlans.filter(plan => plan.includes(keyword));
    }

    /**
     * プランの詳細情報を取得
     * @param planName プラン名
     * @returns プランの詳細情報オブジェクト
     */
    async getPlanDetails(planName: string): Promise<{ title: string, price: string, description: string }> {
        const card = this.getPlanCard(planName);

        const title = await this.getLocatorTextWithRetry(card.locator('h5.card-title'));
        const price = await this.getLocatorTextWithRetry(card.locator('.card-text:has-text("お値段")'));
        const description = await this.getLocatorTextWithRetry(card.locator('.card-text').first());

        return {
            title,
            price,
            description
        };
    }

    /**
     * すべてのプランの概要情報を一括取得
     * @returns すべてのプランの概要情報配列
     */
    async getAllPlansSummary(): Promise<{ name: string, price: string }[]> {
        const planNames = await this.getAvailablePlans();
        const result = [];

        for (const name of planNames) {
            const price = await this.getPlanPrice(name);
            result.push({ name, price });
        }

        return result;
    }
}