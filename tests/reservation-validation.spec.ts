/**
 * 宿泊予約フォームの.invalid-feedbackメッセージのテスト
 * 
 * 無効な入力に対する.invalid-feedbackメッセージが表示されることを検証します
 */

import { test, expect } from './hooks';
import { PlansPage } from '../pages/plansPage';
import { ReservePage } from '../pages/reservePage';
import { allure } from 'allure-playwright';

test.describe('宿泊予約フォームの.invalid-feedbackメッセージ', () => {

    test('宿泊数に0を入力するとinvalid-feedbackメッセージが表示される', async ({ page }) => {
        // プラン一覧ページからプラン選択
        const plansPage = new PlansPage(page);
        await plansPage.goto();

        // プランを選択
        const reservationPage = await plansPage.selectPlanByName('お得な特典付きプラン');
        const reservePage = new ReservePage(reservationPage);
        await reservationPage.waitForLoadState('networkidle');

        // 宿泊数に0を入力
        await reservePage.selectStayDays('0');

        // 他の必須項目に有効な値を入力
        await reservePage.fillName('テスト太郎');
        await reservePage.selectContactMethod('email');
        await reservePage.fillEmail('test@example.com');

        // 確認ボタンをクリック
        await reservePage.proceedToConfirm();

        // フォームの送信後に少し待機
        await reservationPage.waitForTimeout(500);

        // スクリーンショットを撮影
        const screenshot = await reservationPage.screenshot();
        allure.attachment('invalid-feedback-screenshot', screenshot, 'image/png');

        // invalida-feedbackメッセージが表示されていることを確認
        const invalidFeedbackCount = await reservationPage.evaluate(() => {
            // 表示されているすべてのinvalid-feedback要素の数を数える
            const visibleInvalidFeedbacks = Array.from(document.querySelectorAll('.invalid-feedback'))
                .filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none';
                });

            return visibleInvalidFeedbacks.length;
        });

        // 少なくとも1つのinvalid-feedbackメッセージが表示されている
        expect(invalidFeedbackCount).toBeGreaterThan(0);

        // 各invalid-feedbackメッセージの内容をコンソールに出力
        const invalidFeedbackMessages = await reservationPage.evaluate(() => {
            return Array.from(document.querySelectorAll('.invalid-feedback'))
                .filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none';
                })
                .map(el => el.textContent);
        });

        console.log('表示されているinvalid-feedbackメッセージ:', invalidFeedbackMessages);

        // ホストコンソールログに表示されているメッセージを含める
        allure.attachment('invalid-feedback-messages', JSON.stringify(invalidFeedbackMessages), 'application/json');
    });

    test('氏名を入力しないとinvalid-feedbackメッセージが表示される', async ({ page }) => {
        // プラン一覧ページからプラン選択
        const plansPage = new PlansPage(page);
        await plansPage.goto();

        // プランを選択
        const reservationPage = await plansPage.selectPlanByName('お得な特典付きプラン');
        const reservePage = new ReservePage(reservationPage);
        await reservationPage.waitForLoadState('networkidle');

        // 氏名は入力しない

        // 他の必須項目に有効な値を入力
        await reservePage.selectContactMethod('email');
        await reservePage.fillEmail('test@example.com');

        // 確認ボタンをクリック
        await reservePage.proceedToConfirm();

        // フォームの送信後に少し待機
        await reservationPage.waitForTimeout(500);

        // スクリーンショットを撮影
        const screenshot = await reservationPage.screenshot();
        allure.attachment('invalid-feedback-screenshot', screenshot, 'image/png');

        // #usernameフィールドの近くにinvalid-feedbackメッセージが表示されていることを確認
        const usernameErrorVisible = await reservationPage.evaluate(() => {
            const usernameField = document.getElementById('username');
            if (!usernameField) return false;

            // usernameフィールドの親要素を取得
            let parent = usernameField.parentElement;
            if (!parent) return false;

            // 親要素内にinvalid-feedback要素があるか確認
            const invalidFeedback = parent.querySelector('.invalid-feedback');
            if (!invalidFeedback) return false;

            // invalid-feedbackが表示されているか確認
            const style = window.getComputedStyle(invalidFeedback);
            return style.display !== 'none' && invalidFeedback.textContent === 'このフィールドを入力してください。';
        });

        expect(usernameErrorVisible).toBeTruthy();
    });

    test('すべての必須項目に有効な値を入力すると.invalid-feedbackは表示されない', async ({ page }) => {
        // プラン一覧ページからプラン選択
        const plansPage = new PlansPage(page);
        await plansPage.goto();

        // プランを選択
        const reservationPage = await plansPage.selectPlanByName('お得な特典付きプラン');
        const reservePage = new ReservePage(reservationPage);
        await reservationPage.waitForLoadState('networkidle');

        // すべての必須項目に有効な値を入力
        await reservePage.fillName('テスト太郎');
        await reservePage.selectContactMethod('email');
        await reservePage.fillEmail('test@example.com');

        // 確認ボタンをクリック
        await reservePage.proceedToConfirm();

        // 確認ページへの遷移を待機
        try {
            await reservationPage.waitForURL(/.*confirm\.html/, { timeout: 10000 });

            // スクリーンショットを撮影
            const screenshot = await reservationPage.screenshot();
            allure.attachment('confirmation-page-screenshot', screenshot, 'image/png');

            // 確認ページに遷移していることを検証
            const currentUrl = reservationPage.url();
            expect(currentUrl).toContain('confirm.html');
        } catch (error) {
            // タイムアウトした場合、現在のページをチェック
            const screenshot = await reservationPage.screenshot();
            allure.attachment('page-after-submit', screenshot, 'image/png');

            // invalid-feedbackメッセージが表示されているか確認
            const invalidFeedbackCount = await reservationPage.evaluate(() => {
                const visibleInvalidFeedbacks = Array.from(document.querySelectorAll('.invalid-feedback'))
                    .filter(el => {
                        const style = window.getComputedStyle(el);
                        return style.display !== 'none';
                    });

                return visibleInvalidFeedbacks.length;
            });

            // エラーメッセージがないこと
            expect(invalidFeedbackCount).toBe(0);

            // エラーを再スロー
            throw error;
        }
    });
});