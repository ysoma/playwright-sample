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

import { test, Page } from '@playwright/test';
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
  // テストのメタデータを設定
  allure.label('feature', 'ビジュアルリグレッション');
  allure.description('宿泊予約フロー全体のUIデザインが期待通りであること');
  allure.severity('normal');

  // STEP 1: プラン一覧ページのビジュアル検証
  // GIVEN: プラン一覧ページにアクセスする
  const plansPage = new PlansPage(page);
  await plansPage.goto();

  // WHEN: ページが完全に読み込まれる
  await page.waitForLoadState('networkidle');

  // THEN: ビジュアルが期待通りである
  await captureSnapshot(page, 'plans.png');

  // STEP 2: 予約ページのビジュアル検証
  // GIVEN: 特定のプランを選択し予約ページに遷移する
  const reservationPage: Page = await plansPage.selectPlanByName(reservationTestData.planName);
  const reserveForm = new ReservePage(reservationPage);

  // WHEN: 予約フォームに情報を入力する
  await reserveForm.fillReservationForm(reservationTestData);
  await reservationPage.waitForLoadState('networkidle');

  // THEN: ビジュアルが期待通りである
  await captureSnapshot(reservationPage, 'reserve.png');

  // STEP 3: 確認ページのビジュアル検証
  // WHEN: 確認ページに進む
  await reserveForm.proceedToConfirm();
  await reservationPage.waitForLoadState('networkidle');

  // THEN: ビジュアルが期待通りである
  await captureSnapshot(reservationPage, 'confirm.png');

  // STEP 4: 予約完了モーダルのビジュアル検証
  // WHEN: 予約を確定する
  const confirmPage = new ConfirmPage(reservationPage);
  await confirmPage.confirm();

  // THEN: 予約完了モーダルが表示され、ビジュアルが期待通りである
  await confirmPage.expectModalVisible();
  await reservationPage.waitForLoadState('networkidle');
  await captureSnapshot(reservationPage, 'complete-modal.png');
});

// 将来的に追加すべきテストケース：
// - 異なるビューポートサイズ（モバイル、タブレット）での表示検証
// - アニメーション要素の視覚的検証
// - フォーム入力エラー時の表示検証