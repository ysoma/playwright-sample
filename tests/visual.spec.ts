/**
 * ビジュアルリグレッションテスト
 * - ページのビジュアルが変更されていないかを検証する
 * - ページのビジュアルをスクリーンショットで保存し、差分を検出する
 * - ページのビジュアルが変更された場合は、ビジュアルテストが失敗する
 * 
 * テストの実行方法
 * - npx playwright test tests/visual.spec.ts
 * 
 * テストの実行結果
 * - tests/screenshots ディレクトリにスクリーンショットが保存される
 * - テスト結果は、tests/screenshots/screenshots-diff ディレクトリに保存される
 * 
 * テストの注意点
 * - ビジュアルリグレッションテストは、CI/CDパイプラインで実行することを推奨
 * - ローカル環境での実行は、スクリーンショットの保存先に注意すること
 * - テスト実行時にスクリーンショットが保存されるディレクトリは、.gitignore に追加
 * 
 * 期待画像の更新
 * - テスト実行時に、期待画像を更新する場合は、--update-snapshots オプションを追加
 * - npx playwright test tests/visual.spec.ts --update-snapshots
 */

import { test, Page } from '@playwright/test';
import { PlansPage } from '../pages/plansPage';
import { ReservePage } from '../pages/reservePage';
import { ConfirmPage } from '../pages/confirmPage';
import { captureSnapshot } from '../helpers/visualHelpers';

const testData = {
  planName: 'お得な特典付きプラン',
  checkInDate: '2025/04/01',
  stayDays: '2',
  guests: '2',
  additionalPlans: ['朝食バイキング', 'お得な観光プラン'],
  guestName: 'テスト太郎',
  email: 'test@example.com',
  remarks: '静かな部屋を希望します'
};

test('宿泊予約フローのビジュアルが正しいこと', async ({ page }) => {

  /* 1. plansのビジュアルリグレッション */
  const plansPage = new PlansPage(page);
  await plansPage.goto();
  await captureSnapshot(page, 'plans.png');

  /* 2. reserveのビジュアルリグレッション */
  const popup: Page = await plansPage.selectPlanByName(testData.planName);
  const reservePage = new ReservePage(popup);
  await reservePage.fillReservationForm(testData); // 予約フォーム入力
  await captureSnapshot(popup, 'reserve.png');

  /* 3. confirmのビジュアルリグレッション */
  await reservePage.proceedToConfirm();
  await captureSnapshot(popup, 'confirm.png');

  /* 4. 予約完了モーダルのビジュアルリグレッション */
  const confirmPage = new ConfirmPage(popup);
  await confirmPage.confirm();
  await confirmPage.expectModalVisible();
  await captureSnapshot(popup, 'complete-modal.png');
});
