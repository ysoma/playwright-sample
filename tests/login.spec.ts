import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { allure } from 'allure-playwright';

test('正しい資格情報でログインできる', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    allure.label('feature', 'ログイン');
    allure.description('登録済みユーザーが正しいメールアドレスとパスワードでログインできる');

    await loginPage.loginAs('ichiro@example.com', 'password');

    await expect(page).toHaveURL(/mypage/); // ログイン後のマイページへ遷移する
    await expect(page.getByRole('heading', { name: /マイページ/ })).toBeVisible();
});

test('間違ったパスワードでログインできない', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    allure.label('feature', 'ログイン');
    allure.description('誤ったパスワードではログインできず、エラーメッセージが表示される');

    await loginPage.loginAs('ichiro@example.com', 'wrongpassword');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#email-message')).toContainText('メールアドレスまたはパスワードが違います');
    await expect(page.locator('#password-message')).toContainText('メールアドレスまたはパスワードが違います');
});

test('未ログイン状態でマイページにアクセスするとリダイレクトされる', async ({ page }) => {
    allure.label('feature', 'ログイン制御');
    allure.description('認証されていない状態で /mypage にアクセスすると /index にリダイレクトされる');

    await page.goto('/ja/mypage');
    await expect(page).toHaveURL(/\/index/);
});

test('ログイン後にログアウトするとトップページに戻る', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.loginAs('ichiro@example.com', 'password');    // ログイン
    await expect(page).toHaveURL(/mypage/);   // マイページに遷移
    await loginPage.logout();    // ログアウト

    await expect(page).toHaveURL(/\/index/);
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
});

