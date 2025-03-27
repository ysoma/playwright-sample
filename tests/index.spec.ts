/**
 * トップページE2Eテスト
 * 
 * このテストでは、以下を検証します：
 * 1. トップページが正しく表示されること
 * 2. ナビゲーションメニューから各ページへの遷移が正しく機能すること
 */

import { test, expect } from './hooks';
import { IndexPage } from '../pages/indexPage';
import { allure } from 'allure-playwright';

// ----------------------------------------------------------------------------
// テストケース
// ----------------------------------------------------------------------------

test('トップページが正しく表示される', async ({ page }) => {
    // Allureレポート用メタデータの詳細設定
    allure.epic('基本UI');
    allure.feature('トップページ');
    allure.story('初期表示');
    allure.description('トップページが正しく読み込まれ、タイトルが表示されていることを検証します');
    allure.severity('normal');
    allure.tag('smoke');
    allure.tag('ui');
    allure.tag('basic');
    allure.owner('ysoma');

    // GIVEN: ユーザーがトップページにアクセスする
    const indexPage = new IndexPage(page);
    await allure.step('トップページにアクセス', async () => {
        await indexPage.goto();
        await indexPage.waitForPageLoad();
    });

    // THEN: ページタイトルが正しく表示される
    await allure.step('ページタイトルを検証', async () => {
        await expect(page).toHaveTitle(/HOTEL PLANISPHERE/);
    });
});

test('ナビゲーションメニューで各ページに遷移できる', async ({ page }) => {
    // Allureレポート用メタデータの詳細設定
    allure.epic('基本UI');
    allure.feature('ナビゲーション');
    allure.story('メニュー操作');
    allure.description('ナビゲーションメニューから各主要ページへ正しく遷移できることを検証します');
    allure.severity('critical');
    allure.tag('smoke');
    allure.tag('navigation');
    allure.tag('ui');
    allure.owner('ysoma');

    // GIVEN: ユーザーがトップページにアクセスする
    const indexPage = new IndexPage(page);
    await allure.step('トップページにアクセス', async () => {
        await indexPage.goto();
        await indexPage.waitForPageLoad();
    });

    // WHEN: 宿泊予約ページへのリンクをクリックする
    await allure.step('宿泊予約ページへ遷移', async () => {
        await indexPage.navigateToPlans();
    });

    // THEN: 宿泊予約ページに遷移する
    await allure.step('宿泊予約ページへの遷移を検証', async () => {
        await indexPage.assertCurrentUrl(/\/plans/);
    });

    // WHEN: トップページに戻る
    await allure.step('トップページに戻る', async () => {
        await indexPage.navigateToHome();
        await indexPage.waitForPageLoad();
    });

    // WHEN: 会員登録ページへのリンクをクリックする
    await allure.step('会員登録ページへ遷移', async () => {
        await indexPage.navigateToSignup();
    });

    // THEN: 会員登録ページに遷移する
    await allure.step('会員登録ページへの遷移を検証', async () => {
        await indexPage.assertCurrentUrl(/\/signup/);
    });

    // WHEN: トップページに戻る
    await allure.step('トップページに戻る', async () => {
        await indexPage.navigateToHome();
        await indexPage.waitForPageLoad();
    });

    // WHEN: ログインページへのリンクをクリックする
    await allure.step('ログインページへ遷移', async () => {
        await indexPage.navigateToLogin();
    });

    // THEN: ログインページに遷移する
    await allure.step('ログインページへの遷移を検証', async () => {
        await indexPage.assertCurrentUrl(/\/login/);
    });
});

// 将来的に追加すべきテストケース：
// - 多言語切り替え機能の検証
// - フッターリンクの動作確認
// - レスポンシブデザインの検証（モバイル表示）