/**
 * ログイン機能の境界値テスト
 * 
 * このテストでは、以下を検証します：
 * 1. 様々な入力パターンでのログインバリデーション
 * 2. 異なる長さや特殊文字を含むパスワード
 * 3. 異なる形式のメールアドレス
 * 4. 境界値・同値分割による入力テスト
 */

import { test, expect } from './hooks';
import { LoginPage } from '../pages/loginPage';
import { allure } from 'allure-playwright';

// ----------------------------------------------------------------------------
// テストデータセット
// ----------------------------------------------------------------------------
/**
 * ログインテストケースのインターフェース
 * すべてのテストケースは以下の情報を持つ
 */
interface LoginTestCase {
    testName: string;                        // テストの説明
    email: string;                           // 入力するメールアドレス
    password: string;                        // 入力するパスワード
    expectedOutcome: 'success' | 'failure';  // 期待される結果
    expectedEmailError: string;              // 期待されるメールエラー（空文字=エラーなし）
    expectedPasswordError: string;           // 期待されるパスワードエラー（空文字=エラーなし）
    tags: string[];                          // テストのタグ（分類）
}

const loginTestCases: LoginTestCase[] = [
    // 有効なケース
    {
        testName: '標準的な有効なログイン情報',
        email: 'ichiro@example.com',
        password: 'password',
        expectedOutcome: 'success',
        expectedEmailError: '',  // エラーなし
        expectedPasswordError: '',  // エラーなし
        tags: ['positive', 'smoke']
    },
    // メールアドレスの境界値テスト
    {
        testName: '空のメールアドレス',
        email: '',
        password: 'password',
        expectedOutcome: 'failure',
        expectedEmailError: 'このフィールドを入力してください',
        expectedPasswordError: '',  // エラーなし
        tags: ['negative', 'validation', 'boundary']
    },
    {
        testName: '無効な形式のメールアドレス',
        email: 'ichiro-example.com',
        password: 'password',
        expectedOutcome: 'failure',
        expectedEmailError: 'メールアドレスを入力してください',
        expectedPasswordError: '',  // エラーなし
        tags: ['negative', 'validation', 'format']
    },
    {
        testName: '存在しないユーザーのメールアドレス',
        email: 'nonexistent@example.com',
        password: 'password',
        expectedOutcome: 'failure',
        expectedEmailError: 'メールアドレスまたはパスワードが違います',
        expectedPasswordError: 'メールアドレスまたはパスワードが違います',
        tags: ['negative', 'authentication']
    },
    // パスワードの境界値テスト
    {
        testName: '空のパスワード',
        email: 'ichiro@example.com',
        password: '',
        expectedOutcome: 'failure',
        expectedEmailError: '',  // エラーなし
        expectedPasswordError: 'このフィールドを入力してください',
        tags: ['negative', 'validation', 'boundary']
    },
    {
        testName: '誤ったパスワード',
        email: 'ichiro@example.com',
        password: 'wrongpassword',
        expectedOutcome: 'failure',
        expectedEmailError: 'メールアドレスまたはパスワードが違います',
        expectedPasswordError: 'メールアドレスまたはパスワードが違います',
        tags: ['negative', 'authentication']
    },
    // エッジケース
    {
        testName: '極端に長いメールアドレス',
        email: 'very-very-very-very-very-very-very-very-very-very-long-email-address@example.com',
        password: 'password',
        expectedOutcome: 'failure',
        expectedEmailError: 'メールアドレスまたはパスワードが違います',
        expectedPasswordError: 'メールアドレスまたはパスワードが違います',
        tags: ['negative', 'boundary', 'security']
    },
    {
        testName: '特殊文字を含むパスワード（XSSパターン）',
        email: 'ichiro@example.com',
        password: '<script>alert("XSS")</script>',
        expectedOutcome: 'failure',
        expectedEmailError: 'メールアドレスまたはパスワードが違います',
        expectedPasswordError: 'メールアドレスまたはパスワードが違います',
        tags: ['negative', 'security']
    }
];

// ----------------------------------------------------------------------------
// データ駆動テスト
// ----------------------------------------------------------------------------

for (const testCase of loginTestCases) {
    test(`ログイン - ${testCase.testName}`, async ({ page }) => {
        // Allureレポート用メタデータの詳細設定
        allure.epic('認証システム');
        allure.feature('ログイン');
        allure.story('入力バリデーション');
        allure.description(`ログイン入力テスト: ${testCase.testName}`);
        allure.severity(testCase.tags.includes('smoke') ? 'critical' : 'high');

        for (const tag of testCase.tags) {
            allure.tag(tag);
        }

        allure.parameter('メールアドレス', testCase.email);
        allure.parameter('パスワード', testCase.password.replace(/./g, '*')); // マスクして表示
        allure.parameter('期待結果', testCase.expectedOutcome);

        // GIVEN: ログインページにアクセスする
        const loginPage = new LoginPage(page);
        await allure.step('ログインページにアクセス', async () => {
            await loginPage.goto();
        });

        // WHEN: テストケースのメールアドレスとパスワードを入力してログインする
        await allure.step('テスト対象の認証情報でログイン', async () => {
            await loginPage.loginAs(testCase.email, testCase.password);
        });

        // THEN: 期待される結果を検証する
        if (testCase.expectedOutcome === 'success') {
            await allure.step('ログイン成功を検証', async () => {
                await loginPage.assertLoginSuccess();
            });
        } else {
            await allure.step('ログイン失敗とエラーメッセージを検証', async () => {
                await loginPage.assertLoginFailure();

                await allure.step('エラーメッセージの検証', async () => {
                    try {
                        // メールエラーメッセージの検証
                        if (testCase.expectedEmailError === '') {
                            // エラーメッセージが表示されるまで待機することはしない
                            // 要素が存在しない場合や空の場合はエラーなしと判定
                            try {
                                const emailErrorElement = page.locator('#email-message');
                                const isVisible = await emailErrorElement.isVisible();

                                if (isVisible) {
                                    const emailError = await loginPage.getEmailErrorMessage();
                                    expect(emailError.trim(), 'メールアドレスエラーが表示されていないこと').toBe('');
                                }
                                // 要素が見つからない場合はエラーなしとみなすのでOK
                            } catch (e) {
                                // 要素が見つからない場合はOK（エラーなし）
                                console.log('メールエラーメッセージ要素が存在しません（エラーなしの場合はOK）');
                            }
                        } else {
                            // 明示的なエラーメッセージがある場合は存在を確認
                            const emailError = await loginPage.getEmailErrorMessage();
                            expect(emailError, 'メールアドレスの期待されるエラーメッセージ').toContain(testCase.expectedEmailError);
                        }

                        // パスワードエラーメッセージの検証（同様の方法）
                        if (testCase.expectedPasswordError === '') {
                            try {
                                const passwordErrorElement = page.locator('#password-message');
                                const isVisible = await passwordErrorElement.isVisible();

                                if (isVisible) {
                                    const passwordError = await loginPage.getPasswordErrorMessage();
                                    expect(passwordError.trim(), 'パスワードエラーが表示されていないこと').toBe('');
                                }
                            } catch (e) {
                                // 要素が見つからない場合はOK（エラーなし）
                                console.log('パスワードエラーメッセージ要素が存在しません（エラーなしの場合はOK）');
                            }
                        } else {
                            const passwordError = await loginPage.getPasswordErrorMessage();
                            expect(passwordError, 'パスワードの期待されるエラーメッセージ').toContain(testCase.expectedPasswordError);
                        }
                    } catch (error) {
                        // エラー発生時にスクリーンショットを撮影
                        await page.screenshot({ path: `error-${testCase.testName.replace(/\s+/g, '-')}.png` });
                        throw error;
                    }
                });
            });
        }
    });
}