/**
 * シンプルなパフォーマンステスト
 * 
 * このテストでは、以下を検証します：
 * 1. 主要ページの読み込み速度
 * 2. ページ遷移の応答時間
 * 3. ログイン処理の応答時間
 */

import { test as baseTest, expect } from './hooks';
import { BasePage } from '../pages/basePage';
import { LoginPage } from '../pages/loginPage';
import { PlansPage } from '../pages/plansPage';
import { allure } from 'allure-playwright';

// パフォーマンス測定を行うための拡張テスト関数
const test = baseTest.extend<{
    metrics: {
        measurePageLoad: (url: string, description: string) => Promise<number>;
        measureNavigation: (action: () => Promise<void>, description: string) => Promise<number>;
    };
}>({
    // メトリクス用のユーティリティメソッド
    metrics: async ({ page }, use) => {
        const metrics = {
            // ページ読み込み時間を測定する関数
            async measurePageLoad(url: string, description: string): Promise<number> {
                const startTime = Date.now();
                await page.goto(url);
                await page.waitForLoadState('networkidle');
                const loadTime = Date.now() - startTime;

                // Allureレポートにパフォーマンスメトリクスを記録
                allure.parameter(`${description} 読み込み時間`, `${loadTime}ms`);

                return loadTime;
            },

            // ナビゲーション時間を測定
            async measureNavigation(action: () => Promise<void>, description: string): Promise<number> {
                const startTime = Date.now();
                await action();
                await page.waitForLoadState('networkidle');
                const navTime = Date.now() - startTime;

                // Allureレポートにナビゲーション時間を記録
                allure.parameter(`${description} 遷移時間`, `${navTime}ms`);

                return navTime;
            }
        };

        await use(metrics);
    }
});

// パフォーマンス閾値
const PERFORMANCE_THRESHOLDS = {
    PAGE_LOAD: 3000,        // ページ読み込み時間閾値（ミリ秒）
    NAVIGATION: 2000,       // ページ遷移時間閾値（ミリ秒）
    FORM_SUBMIT: 2500       // フォーム送信時間閾値（ミリ秒）
};

// ----------------------------------------------------------------------------
// テストケース
// ----------------------------------------------------------------------------

test('主要ページの読み込み速度を検証する @performance', async ({ page, metrics }) => {
    // Allureレポート用メタデータの設定
    allure.epic('パフォーマンス');
    allure.feature('ページ読み込み速度');
    allure.description('主要ページの読み込み時間がパフォーマンス基準を満たしていることを検証します');
    allure.severity('critical');
    allure.tag('performance');

    // 主要ページの読み込み時間を測定
    const pages = [
        { url: '/ja/index', name: 'トップページ' },
        { url: '/ja/plans', name: 'プラン一覧ページ' },
        { url: '/ja/login', name: 'ログインページ' }
    ];

    // 各ページの読み込み時間を測定
    for (const pageInfo of pages) {
        await allure.step(`${pageInfo.name}の読み込み時間を測定`, async () => {
            const loadTime = await metrics.measurePageLoad(pageInfo.url, pageInfo.name);

            // パフォーマンス基準を満たしているか検証
            expect(loadTime,
                `${pageInfo.name}の読み込み時間が${PERFORMANCE_THRESHOLDS.PAGE_LOAD}ms以内であること`)
                .toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD);
        });
    }
});

test('ナビゲーション遷移の応答時間を検証する @performance', async ({ page, metrics }) => {
    // Allureレポート用メタデータの設定
    allure.epic('パフォーマンス');
    allure.feature('ナビゲーション応答性');
    allure.description('ナビゲーションメニューからの画面遷移が迅速であることを検証します');
    allure.severity('high');
    allure.tag('performance');

    // トップページに移動
    const basePage = new BasePage(page);
    await page.goto('/ja/index');
    await page.waitForLoadState('networkidle');

    // 各ナビゲーションアクションの応答時間を測定
    const navActions = [
        {
            action: async () => await basePage.navigateToPlans(),
            description: '宿泊プランページへの遷移'
        },
        {
            action: async () => await basePage.navigateToHome(),
            description: 'トップページへの遷移'
        },
        {
            action: async () => await basePage.navigateToLogin(),
            description: 'ログインページへの遷移'
        }
    ];

    for (const navAction of navActions) {
        await allure.step(`${navAction.description}の応答時間を測定`, async () => {
            const navTime = await metrics.measureNavigation(navAction.action, navAction.description);

            // パフォーマンス基準を満たしているか検証
            expect(navTime,
                `${navAction.description}が${PERFORMANCE_THRESHOLDS.NAVIGATION}ms以内であること`)
                .toBeLessThan(PERFORMANCE_THRESHOLDS.NAVIGATION);
        });
    }
});

test('ログイン処理の応答時間を検証する @performance', async ({ page, metrics }) => {
    // Allureレポート用メタデータの設定
    allure.epic('パフォーマンス');
    allure.feature('フォーム送信速度');
    allure.description('ログインフォーム送信から結果表示までの時間を検証します');
    allure.severity('high');
    allure.tag('performance');

    // ログインページにアクセス
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // ログイン情報を入力
    await loginPage.fillEmail('ichiro@example.com');
    await loginPage.fillPassword('password');

    // ログイン送信の応答時間を測定
    await allure.step('ログイン処理の応答時間を測定', async () => {
        const loginAction = async () => await loginPage.submit();
        const responseTime = await metrics.measureNavigation(loginAction, 'ログイン処理');

        // パフォーマンス基準を満たしているか検証
        expect(responseTime,
            `ログイン処理の応答時間が${PERFORMANCE_THRESHOLDS.FORM_SUBMIT}ms以内であること`)
            .toBeLessThan(PERFORMANCE_THRESHOLDS.FORM_SUBMIT);

        // ログイン成功も検証
        await loginPage.assertLoginSuccess();
    });
});

test('プラン予約モーダルの表示速度を検証する @performance', async ({ page, metrics }) => {
    // Allureレポート用メタデータの設定
    allure.epic('パフォーマンス');
    allure.feature('モーダル表示速度');
    allure.description('宿泊プラン選択から予約モーダル表示までの速度を検証します');
    allure.severity('medium');
    allure.tag('performance');

    // プラン一覧ページにアクセス
    const plansPage = new PlansPage(page);
    await plansPage.goto();

    // プラン詳細の表示時間を測定
    await allure.step('プラン詳細表示の応答時間を測定', async () => {
        // プラン詳細を開く時間を計測
        const modalAction = async () => {
            await plansPage.selectPlanByName('お得な特典付きプラン');
        };
        const displayTime = await metrics.measureNavigation(modalAction, 'プラン詳細表示');

        // パフォーマンス基準を満たしているか検証
        expect(displayTime,
            `プラン詳細の表示時間が${PERFORMANCE_THRESHOLDS.NAVIGATION}ms以内であること`)
            .toBeLessThan(PERFORMANCE_THRESHOLDS.NAVIGATION);
    });
});