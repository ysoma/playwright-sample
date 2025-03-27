import { defineConfig, devices } from '@playwright/test';

/**
 * Playwrightの設定ファイル
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストファイルがあるディレクトリ
  testDir: './tests',

  // 各テストのタイムアウト（ミリ秒）
  timeout: 30000,

  // expect関数のタイムアウト設定
  expect: {
    timeout: 10000,
  },

  // テスト実行のレポーター
  reporter: [
    ['list'],                 // コンソール出力用
    ['html'],                 // HTML形式のレポート
    ['allure-playwright']     // Allureレポート用
  ],

  // すべてのテストプロジェクト共通の設定
  use: {
    // ベースURL（すべてのページナビゲーションの基準）
    baseURL: 'https://hotel.testplanisphere.dev',

    // ヘッドレスモード（true=ブラウザを表示しない、false=ブラウザを表示）
    headless: true,

    // スクリーンショット設定（失敗時のみ撮影）
    screenshot: 'only-on-failure',

    // トレース設定（最初の失敗時のみ記録）
    trace: 'on-first-retry',

    // アクションのタイムアウト設定
    actionTimeout: 15000,

    // ナビゲーションのタイムアウト設定
    navigationTimeout: 30000,

    // ビデオ記録（最初の失敗時のみ記録）
    video: 'on-first-retry',
  },

  // 並列実行の設定
  fullyParallel: process.env.CI ? false : true,

  // CI環境では「only」マークされたテストを禁止
  forbidOnly: !!process.env.CI,

  // 失敗したテストの再試行回数（CI環境では2回、それ以外は0回）
  retries: process.env.CI ? 2 : 0,

  // 並列実行するワーカー数
  workers: process.env.CI ? 1 : '100%',

  // プロジェクト（ブラウザ）ごとの設定
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* スマートフォン用のテスト設定
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    */
  ],
});