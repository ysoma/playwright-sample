import { test, expect } from '@playwright/test';
import { IndexPage } from '../pages/indexPage';
import { allure } from 'allure-playwright';

test('トップページが正しく表示される', async ({ page }) => {
    const index = new IndexPage(page);
    await index.goto();

    allure.label('feature', 'トップページ');
    allure.description('タイトルが表示されていること');

    await expect(page).toHaveTitle(/HOTEL PLANISPHERE/);
});

test('ナビゲーションメニューで各ページに遷移できる', async ({ page }) => {
    const index = new IndexPage(page);
    await index.goto();

    allure.label('feature', 'ナビゲーション');
    allure.description('ナビゲーションから各ページに遷移できること');

    await index.navigateToPlans();
    await expect(page).toHaveURL(/\/plans/);

    await index.navigateToHome(); // 戻る

    await index.navigateToSignup();
    await expect(page).toHaveURL(/\/signup/);

    await index.navigateToHome(); // 戻る

    await index.navigateToLogin();
    await expect(page).toHaveURL(/\/login/);
});
