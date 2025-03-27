/**
 * 宿泊予約フローE2Eテスト
 * 
 * このテストでは、以下の一連のユーザーフローを検証します：
 * 1. プラン選択ページでの宿泊プラン選択
 * 2. 予約情報入力フォームの入力
 * 3. 予約内容確認
 * 4. 予約完了
 */

import { test, expect } from './hooks';
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
    // Allureレポート用メタデータの詳細設定
    allure.epic('予約システム');
    allure.feature('宿泊予約');
    allure.story('標準予約フロー');
    allure.description('プラン選択から予約入力、確認、完了までの一連のE2Eフロー検証');
    allure.severity('critical');
    allure.tag('smoke');
    allure.tag('e2e');
    allure.tag('regression');
    allure.tag('booking');
    allure.owner('ysoma');
    allure.parameter('プラン名', reservationTestData.planName);
    allure.parameter('宿泊日', reservationTestData.checkInDate);
    allure.parameter('宿泊人数', reservationTestData.guests);
    allure.link('予約フロー仕様', 'https://example.com/spec/reservation-flow', 'specification');

    // GIVEN: プラン一覧ページにアクセスする
    const plansPage = new PlansPage(page);
    await allure.step('プラン一覧ページにアクセス', async () => {
        await plansPage.goto();
    });

    // WHEN: 特定のプランを選択する
    // まずステップの外で操作を実行
    const reservationPage = await plansPage.selectPlanByName(reservationTestData.planName);
    // 次にステップとしてログに記録
    await allure.step(`プラン「${reservationTestData.planName}」を選択`, async () => {
        // 操作は既に完了している
    });
    const reserveForm = new ReservePage(reservationPage);

    // AND: 予約情報を入力する
    await allure.step('予約情報を入力', async () => {
        await reserveForm.fillReservationForm(reservationTestData);

        // サブステップとして詳細も記録
        await allure.step(`宿泊日: ${reservationTestData.checkInDate}`, async () => { });
        await allure.step(`宿泊数: ${reservationTestData.stayDays}泊`, async () => { });
        await allure.step(`宿泊人数: ${reservationTestData.guests}人`, async () => { });
        for (const plan of reservationTestData.additionalPlans) {
            await allure.step(`追加プラン: ${plan}`, async () => { });
        }
        await allure.step(`宿泊者名: ${reservationTestData.guestName}`, async () => { });
        await allure.step(`連絡先: ${reservationTestData.email}`, async () => { });
    });

    // AND: 予約確認画面へ進む
    await allure.step('予約内容確認画面へ進む', async () => {
        await reserveForm.proceedToConfirm();
    });

    // THEN: 確認画面に遷移し、入力した予約内容が正しく表示されている
    const confirmPage = new ConfirmPage(reservationPage);
    await allure.step('確認画面への遷移を検証', async () => {
        await confirmPage.assertCurrentUrl(/.*\/confirm\.html/);
    });

    await allure.step('予約内容の正確性を検証', async () => {
        // 新しく追加したアサーションメソッドを使用して予約詳細を検証
        await confirmPage.assertReservationDetails(
            reservationTestData.planName,
            reservationTestData.guestName,
            reservationTestData.email
        );
    });

    // WHEN: 予約を確定する
    await allure.step('予約を確定', async () => {
        await confirmPage.confirm();
    });

    // THEN: 予約完了のモーダルが表示され、適切なメッセージが含まれている
    await allure.step('予約完了の確認', async () => {
        await confirmPage.assertCompletionModal('ご来館、心よりお待ちしております');
    });
});

// 将来的に追加すべきテストケース：
// - 必須項目が未入力の場合のバリデーション確認
// - 異なるプラン選択での予約フロー
// - 連絡方法を電話番号に設定した場合の予約フロー