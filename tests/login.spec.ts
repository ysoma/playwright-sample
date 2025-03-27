/**
 * ログイン機能E2Eテスト
 * 
 * このテストでは、以下を検証します：
 * 1. 正しい認証情報でログインが成功すること
 * 2. 誤った認証情報でログインが失敗し、適切なエラーメッセージが表示されること
 * 3. 未認証状態でのページアクセス制御が機能すること
 * 4. ログアウト機能が正しく動作すること
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { allure } from 'allure-playwright';

// ----------------------------------------------------------------------------
// テスト用認証データ
// ----------------------------------------------------------------------------
const loginCredentials = {
    validUser: {
        email: 'ichiro@example.com',
        password: 'password'
    },
    invalidUser: {
        email: 'ichiro@example.com',
        password: 'wrongpassword'
    }
};

// ----------------------------------------------------------------------------
// テストケース
// ----------------------------------------------------------------------------

test('正しい認証情報でログインできる', async ({ page }) => {
    // テストのメタデータを設定
    allure.label('feature', 'ログイン');
    allure.description('登録済みユーザーが正しいメールアドレスとパスワードでログインできる');
    allure.severity('critical');

    // GIVEN: ログインページにアクセスする
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // WHEN: 正しいメールアドレスとパスワードを入力してログインする
    await loginPage.loginAs(
        loginCredentials.validUser.email,
        loginCredentials.validUser.password
    );

    // THEN: マイページに正常に遷移している
    await loginPage.assertLoginSuccess();
});

test('間違ったパスワードでログインできない', async ({ page }) => {
    // テストのメタデータを設定
    allure.label('feature', 'ログイン');
    allure.description('誤ったパスワードではログインできず、エラーメッセージが表示される');
    allure.severity('critical');

    // GIVEN: ログインページにアクセスする
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // WHEN: 正しいメールアドレスと誤ったパスワードを入力してログインする
    await loginPage.loginAs(
        loginCredentials.invalidUser.email,
        loginCredentials.invalidUser.password
    );

    // THEN: ログインに失敗し、適切なエラーメッセージが表示される
    await loginPage.assertLoginFailure();
    await loginPage.assertErrorMessages(
        'メールアドレスまたはパスワードが違います',
        'メールアドレスまたはパスワードが違います'
    );
});

test('未ログイン状態でマイページにアクセスするとリダイレクトされる', async ({ page }) => {
    // テストのメタデータを設定
    allure.label('feature', 'ログイン制御');
    allure.description('認証されていない状態で /mypage にアクセスすると /index にリダイレクトされる');
    allure.severity('high');

    // GIVEN: 未ログイン状態

    // WHEN: マイページに直接アクセスする
    await page.goto('/ja/mypage');

    // THEN: トップページにリダイレクトされる
    await expect(page).toHaveURL(/\/index/);
});

test('ログイン後にログアウトするとトップページに戻る', async ({ page }) => {
    // テストのメタデータを設定
    allure.label('feature', 'ログアウト');
    allure.description('ログアウト機能が正しく動作し、トップページにリダイレクトされる');
    allure.severity('high');

    // GIVEN: ログインページにアクセスする
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // WHEN: ログインする
    await loginPage.loginAs(
        loginCredentials.validUser.email,
        loginCredentials.validUser.password
    );

    // THEN: マイページに遷移する
    await loginPage.assertLoginSuccess();

    // WHEN: ログアウトする
    await loginPage.logout();

    // THEN: トップページにリダイレクトされる
    await loginPage.assertCurrentUrl(/\/index/);

    // AND: ログインボタンが表示される（ログアウト状態の確認）
    await page.waitForLoadState('networkidle'); // ページが完全に読み込まれるのを待つ
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
});

// 将来的に追加すべきテストケース：
// - 存在しないユーザーでのログイン試行
// - パスワードリセット機能のテスト
// - 認証状態の永続化（リロード後も維持）の検証
// - セッションタイムアウトの検証