/**
 * @name plansPage.ts
 * @description Plans page object
 */

import { BasePage } from './basePage';
import { Locator, Page } from '@playwright/test';

export class PlansPage extends BasePage {
    async goto() {
        await this.page.goto('/ja/plans');
    }

    async selectPlanByName(planName: string): Promise<Page> {
        console.log(`プラン「${planName}」を選択しています...`);

        try {
            // まずプランが存在するか確認
            const cardSelector = `.card-body:has(h5.card-title:text-is("${planName}"))`;
            await this.page.waitForSelector(cardSelector, { timeout: 5000 });

            // カードを取得
            const card = this.page.locator(cardSelector);

            // リンクボタンを取得（方法5で成功したアプローチを使用）
            const reserveButton = card.locator('a.btn, a[role="button"]');

            // ボタンが見つかるまで待機
            await reserveButton.waitFor({ state: 'visible', timeout: 5000 });

            // ポップアップを待機してボタンをクリック
            const popupPromise = this.page.waitForEvent('popup');
            await reserveButton.click();

            // ポップアップが表示されるのを待機
            const popup = await popupPromise;

            return popup;
        } catch (error) {
            console.error(`プラン「${planName}」の選択中にエラーが発生しました: ${error instanceof Error ? error.message : '未知のエラー'}`);
            throw error;
        }
    }

    // デバッグ用のメソッド - 問題が発生したときのみ使用
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
}