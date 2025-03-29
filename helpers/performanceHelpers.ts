/**
 * @name performanceHelpers.ts
 * @description パフォーマンステスト用のヘルパー関数とデータ
 */

import { Page } from '@playwright/test';
import { allure } from 'allure-playwright';

/**
 * パフォーマンス閾値の設定
 * 環境変数から値を取得するか、デフォルト値を使用
 */
export const PERFORMANCE_THRESHOLDS = {
    PAGE_LOAD: process.env.PERF_THRESHOLD_PAGE_LOAD 
        ? parseInt(process.env.PERF_THRESHOLD_PAGE_LOAD) 
        : 3000,        // ページ読み込み時間閾値（ミリ秒）
    NAVIGATION: process.env.PERF_THRESHOLD_NAVIGATION 
        ? parseInt(process.env.PERF_THRESHOLD_NAVIGATION) 
        : 2000,       // ページ遷移時間閾値（ミリ秒）
    FORM_SUBMIT: process.env.PERF_THRESHOLD_FORM_SUBMIT 
        ? parseInt(process.env.PERF_THRESHOLD_FORM_SUBMIT) 
        : 2500       // フォーム送信時間閾値（ミリ秒）
};

/**
 * 主要ページ情報
 */
export const MAIN_PAGES = [
    { url: '/ja/index', name: 'トップページ' },
    { url: '/ja/plans', name: 'プラン一覧ページ' },
    { url: '/ja/login', name: 'ログインページ' }
];

/**
 * ナビゲーションアクション情報
 */
export interface NavigationAction {
    action: () => Promise<void>;
    description: string;
}

/**
 * パフォーマンス測定ユーティリティクラス
 */
export class PerformanceMetrics {
    constructor(private page: Page) {}

    /**
     * ページ読み込み時間を測定する
     * @param url アクセスするURL
     * @param description 測定の説明
     * @returns 読み込み時間（ミリ秒）
     */
    async measurePageLoad(url: string, description: string): Promise<number> {
        const startTime = Date.now();
        await this.page.goto(url);
        await this.page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Allureレポートにパフォーマンスメトリクスを記録
        allure.parameter(`${description} 読み込み時間`, `${loadTime}ms`);

        return loadTime;
    }

    /**
     * ナビゲーション時間を測定
     * @param action 実行するアクション
     * @param description 測定の説明
     * @returns ナビゲーション時間（ミリ秒）
     */
    async measureNavigation(action: () => Promise<void>, description: string): Promise<number> {
        const startTime = Date.now();
        await action();
        await this.page.waitForLoadState('networkidle');
        const navTime = Date.now() - startTime;

        // Allureレポートにナビゲーション時間を記録
        allure.parameter(`${description} 遷移時間`, `${navTime}ms`);

        return navTime;
    }

    /**
     * 複数ページの読み込み時間を測定
     * @param pages 測定対象ページの配列
     * @param threshold 閾値（ミリ秒）
     */
    async measureMultiplePageLoads(pages: { url: string, name: string }[], threshold: number): Promise<void> {
        for (const pageInfo of pages) {
            await allure.step(`${pageInfo.name}の読み込み時間を測定`, async () => {
                const loadTime = await this.measurePageLoad(pageInfo.url, pageInfo.name);

                // パフォーマンス基準を満たしているか検証
                if (loadTime >= threshold) {
                    throw new Error(`${pageInfo.name}の読み込み時間(${loadTime}ms)が閾値(${threshold}ms)を超えています`);
                }
            });
        }
    }

    /**
     * 複数のナビゲーションアクションの応答時間を測定
     * @param actions 測定対象アクションの配列
     * @param threshold 閾値（ミリ秒）
     */
    async measureMultipleNavigations(actions: NavigationAction[], threshold: number): Promise<void> {
        for (const navAction of actions) {
            await allure.step(`${navAction.description}の応答時間を測定`, async () => {
                const navTime = await this.measureNavigation(navAction.action, navAction.description);

                // パフォーマンス基準を満たしているか検証
                if (navTime >= threshold) {
                    throw new Error(`${navAction.description}の応答時間(${navTime}ms)が閾値(${threshold}ms)を超えています`);
                }
            });
        }
    }
}
