/**
 * ログイン機能E2Eテスト
 * 
 * このテストでは、以下を検証します：
 * 1. 正しい認証情報でログインが成功すること
 * 2. 誤った認証情報でログインが失敗し、適切なエラーメッセージが表示されること
 * 3. 未認証状態でのページアクセス制御が機能すること
 * 4. ログアウト機能が正しく動作すること
 */

import { test, expect } from './hooks';
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
    // Allureレポート用メタデータの詳細設定
    allure.epic('認証システム');
    allure.feature('ログイン');
    allure.story('基本認証フロー');
    allure.description('登録済みユーザーが正しいメールアドレスとパスワードでログインできることを検証します');
    allure.severity('critical');  // critical, blocker, normal, minor, trivial
    allure.tag('smoke');
    allure.tag('regression');
    allure.tag('authentication');
    allure.owner('ysoma');
    allure.link('テスト仕様書', 'https://example.com/spec/login', 'specification');
    allure.issue('AUTH-123', 'https://example.com/issues/AUTH-123');

    // GIVEN: ログインページにアクセスする
    const loginPage = new LoginPage(page);
    await allure.step('ログインページにアクセス', async () => {
        await loginPage.goto();
    });

    // WHEN: 正しいメールアドレスとパスワードを入力してログインする
    await allure.step('有効な認証情報でログイン', async () => {
        await loginPage.loginAs(
            loginCredentials.validUser.email,
            loginCredentials.validUser.password
        );
    });

    // THEN: マイページに正常に遷移している
    await allure.step('ログイン成功の検証', async () => {
        await loginPage.assertLoginSuccess();
    });
});

test('間違ったパスワードでログインできない', async ({ page }) => {
    // Allureレポート用メタデータの詳細設定
    allure.epic('認証システム');
    allure.feature('ログイン');
    allure.story('バリデーション');
    allure.description('誤ったパスワードではログインできず、適切なエラーメッセージが表示されることを検証します');
    allure.severity('critical');
    allure.tag('negative')
    allure.tag('security');
    allure.tag('authentication');
    allure.owner('ysoma');

    // GIVEN: ログインページにアクセスする
    const loginPage = new LoginPage(page);
    await allure.step('ログインページにアクセス', async () => {
        await loginPage.goto();
    });

    // WHEN: 正しいメールアドレスと誤ったパスワードを入力してログインする
    await allure.step('無効なパスワードでログイン試行', async () => {
        await loginPage.loginAs(
            loginCredentials.invalidUser.email,
            loginCredentials.invalidUser.password
        );
    });

    // THEN: ログインに失敗し、適切なエラーメッセージが表示される
    await allure.step('ログイン失敗とエラーメッセージの検証', async () => {
        await loginPage.assertLoginFailure();
        await loginPage.assertErrorMessages(
            'メールアドレスまたはパスワードが違います',
            'メールアドレスまたはパスワードが違います'
        );
    });
});

test('未ログイン状態でマイページにアクセスするとリダイレクトされる', async ({ page }) => {
    // Allureレポート用メタデータの詳細設定
    allure.epic('認証システム');
    allure.feature('ログイン制御');
    allure.story('アクセス制限');
    allure.description('認証されていない状態で保護されたページにアクセスすると適切にリダイレクトされることを検証します');
    allure.severity('high');
    allure.tag('security');
    allure.tag('authentication');
    allure.owner('ysoma');

    // GIVEN: 未ログイン状態
    await allure.step('未ログイン状態を確認', async () => {
        // 未ログイン状態であることを前提条件として明示
    });

    // WHEN: マイページに直接アクセスする
    await allure.step('保護されたページに直接アクセス', async () => {
        await page.goto('/ja/mypage');
    });

    // THEN: トップページにリダイレクトされる
    await allure.step('リダイレクトの検証', async () => {
        await expect(page).toHaveURL(/\/index/);
    });
});

test('ログイン後にログアウトするとトップページに戻る', async ({ page }) => {
    // Allureレポート用メタデータの詳細設定
    allure.epic('認証システム');
    allure.feature('ログアウト');
    allure.story('セッション終了');
    allure.description('ログアウト機能が正しく動作し、トップページにリダイレクトされることを検証します');
    allure.severity('high');
    allure.tag('smoke');
    allure.tag('security');
    allure.tag('authentication');
    allure.owner('ysoma');

    // GIVEN: ログインページにアクセスする
    const loginPage = new LoginPage(page);
    await allure.step('ログインページにアクセス', async () => {
        await loginPage.goto();
    });

    // WHEN: ログインする
    await allure.step('有効な認証情報でログイン', async () => {
        await loginPage.loginAs(
            loginCredentials.validUser.email,
            loginCredentials.validUser.password
        );
    });

    // THEN: マイページに遷移する
    await allure.step('ログイン成功の検証', async () => {
        await loginPage.assertLoginSuccess();
    });

    // WHEN: ログアウトする
    await allure.step('ログアウト実行', async () => {
        await loginPage.logout();
    });

    // THEN: トップページにリダイレクトされる
    await allure.step('ログアウト後の状態検証', async () => {
        await loginPage.assertCurrentUrl(/\/index/);
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    });
});

// 将来的に追加すべきテストケース：
// - 存在しないユーザーでのログイン試行
// - パスワードリセット機能のテスト
// - 認証状態の永続化（リロード後も維持）の検証
// - セッションタイムアウトの検証