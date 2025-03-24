/**
 * 宿泊予約の一連フローが完了するテスト
 * 1. プラン選択
 * 2. 予約フォーム入力
 * 3. 確認
 */

import { test, expect, Page } from '@playwright/test';
import { PlansPage } from '../pages/plansPage';
import { ReservePage } from '../pages/reservePage';
import { ConfirmPage } from '../pages/confirmPage';
import { allure } from 'allure-playwright';

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

test('宿泊予約の一連フローが完了する', async ({ page }) => {
    allure.label('feature', '宿泊予約');
    allure.description('プラン選択から予約フォーム入力、確認、モーダル完了までのE2Eテスト');

    const plansPage = new PlansPage(page);
    await plansPage.goto();

    const popup: Page = await plansPage.selectPlanByName(testData.planName); // プラン選択

    const reservePage = new ReservePage(popup);
    const confirmPage = new ConfirmPage(popup);

    // testDataの入力
    await reservePage.selectDate(testData.checkInDate);
    await reservePage.selectStayDays(testData.stayDays);
    await reservePage.selectGuests(testData.guests);
    await reservePage.chooseAdditionalPlans(testData.additionalPlans);
    await reservePage.fillName(testData.guestName);
    await reservePage.selectContactMethod(testData.email ? 'email' : 'no');
    await reservePage.fillEmail(testData.email);
    await reservePage.fillRemarks(testData.remarks);
    await reservePage.proceedToConfirm();

    // 確認画面に遷移したことを検証
    await expect(popup).toHaveURL(/.*\/confirm\.html/);

    // 確認画面の内容を検証
    const planNameText = await confirmPage.getPlanNameText();
    expect(planNameText).toContain(testData.planName);
    const guestNameText = await confirmPage.getGuestNameText();
    expect(guestNameText).toContain(testData.guestName);
    const emailText = await confirmPage.getContactText();
    expect(emailText).toContain(testData.email);

    // 予約を確定
    await confirmPage.confirm();

    // モーダルを検証
    await confirmPage.expectModalVisible();
    const modalText = await confirmPage.getModalText();
    expect(modalText).toContain('ご来館、心よりお待ちしております');
});

