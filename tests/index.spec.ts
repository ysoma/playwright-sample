/**
 * トップページE2Eテスト
 * 
 * このテストでは、以下を検証します：
 * 1. トップページが正しく表示されること
 * 2. ナビゲーションメニューから各ページへの遷移が正しく機能すること
 */

import { test, expect } from '@playwright/test';
import { IndexPage } from '../pages/indexPage';
import { allure } from 'allure-playwright';

// ----------------------------------------------------------------------------
// テストケース
// ----------------------------------------------------------------------------

test('トップページが正しく表示される', async ({ page }) => {
    // テストのメタデータを設定
    allure.label('feature', 'トップページ');
    allure.description('タイトルが表示されていること');
    allure.severity('normal');

    // GIVEN: ユーザーがトップページにアクセスする
    const indexPage = new IndexPage(page);
    await indexPage.goto();

    // THEN: ページタイトルが正しく表示される
    await expect(page).toHaveTitle(/HOTEL PLANISPHERE/);
});

test('ナビゲーションメニューで各ページに遷移できる', async ({ page }) => {
    // テストのメタデータを設定
    allure.label('feature', 'ナビゲーション');
    allure.description('ナビゲーションから各ページに遷移できること');
    allure.severity('critical');

    // GIVEN: ユーザーがトップページにアクセスする
    const indexPage = new IndexPage(page);
    await indexPage.goto();

    // WHEN: 宿泊予約ページへのリンクをクリックする
    await indexPage.navigateToPlans();

    // THEN: 宿泊予約ページに遷移する
    await expect(page).toHaveURL(/\/plans/);

    // WHEN: トップページに戻る
    await indexPage.navigateToHome();

    // WHEN: 会員登録ページへのリンクをクリックする
    await indexPage.navigateToSignup();

    // THEN: 会員登録ページに遷移する
    await expect(page).toHaveURL(/\/signup/);

    // WHEN: トップページに戻る
    await indexPage.navigateToHome();

    // WHEN: ログインページへのリンクをクリックする
    await indexPage.navigateToLogin();

    // THEN: ログインページに遷移する
    await expect(page).toHaveURL(/\/login/);
});

// 将来的に追加すべきテストケース：
// - 多言語切り替え機能の検証
// - フッターリンクの動作確認
// - レスポンシブデザインの検証（モバイル表示）