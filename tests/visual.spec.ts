/**
 * ビジュアルリグレッションテスト
 * 
 * このテストでは、以下を検証します：
 * 1. 各ページのビジュアルデザインが期待通りであること
 * 2. 宿泊予約フロー全体を通したUIの一貫性
 * 
 * テスト実行方法：
 * - 通常実行: npx playwright test tests/visual.spec.ts
 * - 期待画像の更新: npx playwright test tests/visual.spec.ts --update-snapshots
 * 
 * 注意点：
 * - ビジュアルテストはCI環境での表示差異に注意が必要です
 * - 期待画像はリポジトリに含め、変更時は意図的な更新であることを確認してください
 */

import { test, expect } from './hooks';
import { PlansPage } from '../pages/plansPage';
import { ReservePage } from '../pages/reservePage';
import { ConfirmPage } from '../pages/confirmPage';
import { captureSnapshot } from '../helpers/visualHelpers';
import { allure } from 'allure-playwright';

// ----------------------------------------------------------------------------
// テスト用予約データ
// ----------------------------------------------------------------------------
const reservationTestData = {
  planName: 'お得な特典付きプラン',
  checkInDate: '2025/04/01',
  stayDays: '2',
  guests: '2',
  additionalPlans: ['朝食バイキング', 'お得な観光プラン'],
  guestName: 'テスト太郎',
  email: 'test@example.com',
  remarks: '静かな部屋を希望します'
};

// ----------------------------------------------------------------------------
// テストケース
// ----------------------------------------------------------------------------
test('宿泊予約フローの各画面が視覚的に正しく表示される', async ({ page }) => {
  // Allureレポート用メタデータの詳細設定
  allure.epic('UI品質保証');
  allure.feature('ビジュアルリグレッション');
  allure.story('予約フローのUI一貫性');
  allure.description('宿泊予約フロー全体のUIデザインが期待通りであることを視覚的に検証します');
  allure.severity('normal');
  allure.tag('visual');
  allure.tag('ui');
  allure.tag('regression');
  allure.owner('ysoma');
  allure.parameter('テスト環境', process.env.CI ? 'CI' : 'ローカル');
  allure.parameter('ブラウザ', process.env.BROWSER || 'chromium');
  allure.link('デザインガイドライン', 'https://example.com/design-system', 'design');

  // STEP 1: プラン一覧ページのビジュアル検証
  await allure.step('プラン一覧ページのビジュアル検証', async () => {
    // GIVEN: プラン一覧ページにアクセスする
    const plansPage = new PlansPage(page);
    await plansPage.goto();

    // WHEN: ページが完全に読み込まれる
    await plansPage.waitForPageLoad();

    // THEN: ビジュアルが期待通りである
    await captureSnapshot(page, 'plans.png');
    await allure.attachment('plans-page', await page.screenshot(), 'image/png');
  });

  // STEP 2: 予約ページのビジュアル検証
  // 変数をステップの外で宣言して初期化
  const plansPage = new PlansPage(page);
  const reservationPage = await plansPage.selectPlanByName(reservationTestData.planName);

  await allure.step('予約ページのビジュアル検証', async () => {
    // GIVEN: 特定のプランを選択し予約ページに遷移する
    const reserveForm = new ReservePage(reservationPage);

    // WHEN: 予約フォームに情報を入力する
    await reserveForm.fillReservationForm(reservationTestData);
    await reserveForm.waitForPageLoad();

    // THEN: ビジュアルが期待通りである
    await captureSnapshot(reservationPage, 'reserve.png');
    await allure.attachment('reservation-page', await reservationPage.screenshot(), 'image/png');
  });

  // STEP 3: 確認ページのビジュアル検証
  await allure.step('確認ページのビジュアル検証', async () => {
    // WHEN: 確認ページに進む
    const reserveForm = new ReservePage(reservationPage);
    await reserveForm.proceedToConfirm();

    // THEN: ビジュアルが期待通りである
    const confirmPage = new ConfirmPage(reservationPage);
    await confirmPage.waitForPageLoad();
    await captureSnapshot(reservationPage, 'confirm.png');
    await allure.attachment('confirm-page', await reservationPage.screenshot(), 'image/png');
  });

  // STEP 4: 予約完了モーダルのビジュアル検証
  await allure.step('予約完了モーダルのビジュアル検証', async () => {
    // WHEN: 予約を確定する
    const confirmPage = new ConfirmPage(reservationPage);
    await confirmPage.confirm();

    // THEN: 予約完了モーダルが表示され、ビジュアルが期待通りである
    await confirmPage.expectModalVisible();
    await captureSnapshot(reservationPage, 'complete-modal.png');
    await allure.attachment('completion-modal', await reservationPage.screenshot(), 'image/png');
  });
});

// 将来的に追加すべきテストケース：
// - 異なるビューポートサイズ（モバイル、タブレット）での表示検証
// - ダークモードでの表示検証（サイトがダークモードに対応している場合）
// - アニメーション要素の視覚的検証
// - フォーム入力エラー時の表示検証