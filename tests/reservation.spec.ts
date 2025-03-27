/**
 * 宿泊予約フローE2Eテスト
 * 
 * このテストでは、以下の一連のユーザーフローを検証します：
 * 1. プラン選択ページでの宿泊プラン選択
 * 2. 予約情報入力フォームの入力
 * 3. 予約内容確認
 * 4. 予約完了
 */

import { test, expect, Page } from '@playwright/test';
import { PlansPage } from '../pages/plansPage';
import { ReservePage } from '../pages/reservePage';
import { ConfirmPage } from '../pages/confirmPage';
import { allure } from 'allure-playwright';

// ----------------------------------------------------------------------------
// テスト用宿泊予約データ
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
test('宿泊予約の一連フローが正常に完了すること', async ({ page }) => {
    // テストのメタデータを設定
    allure.label('feature', '宿泊予約');
    allure.description('プラン選択から予約入力、確認、完了までの一連のE2Eフロー検証');
    allure.severity('critical');

    // GIVEN: プラン一覧ページにアクセスする
    const plansPage = new PlansPage(page);
    await plansPage.goto();

    // WHEN: 特定のプランを選択する
    const reservationPage: Page = await plansPage.selectPlanByName(reservationTestData.planName);

    // AND: 予約情報を入力する
    const reserveForm = new ReservePage(reservationPage);
    await reserveForm.fillReservationForm(reservationTestData);

    // AND: 予約確認画面へ進む
    await reserveForm.proceedToConfirm();

    // THEN: 確認画面に遷移し、入力した予約内容が正しく表示されている
    const confirmPage = new ConfirmPage(reservationPage);
    await confirmPage.assertCurrentUrl(/.*\/confirm\.html/);

    // 新しく追加したアサーションメソッドを使用して予約詳細を検証
    await confirmPage.assertReservationDetails(
        reservationTestData.planName,
        reservationTestData.guestName,
        reservationTestData.email
    );

    // WHEN: 予約を確定する
    await confirmPage.confirm();

    // THEN: 予約完了のモーダルが表示され、適切なメッセージが含まれている
    await confirmPage.assertCompletionModal('ご来館、心よりお待ちしております');
});

// 将来的に追加すべきテストケース：
// - 必須項目が未入力の場合のバリデーション確認
// - 異なるプラン選択での予約フロー
// - 連絡方法を電話番号に設定した場合の予約フロー