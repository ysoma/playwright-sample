/**
 * @name reservationHelpers.ts
 * @description 宿泊予約テスト用のヘルパー関数とデータ
 */

import { Page } from '@playwright/test';
import { PlansPage } from '../pages/plansPage';
import { ReservePage } from '../pages/reservePage';
import { ConfirmPage } from '../pages/confirmPage';
import { reservationData } from './testData';
import { allure } from 'allure-playwright';

/**
 * 予約フローのステップ
 */
export enum ReservationStep {
    SELECT_PLAN = 'プラン選択',
    FILL_FORM = '予約情報入力',
    CONFIRM = '予約内容確認',
    COMPLETE = '予約完了'
}

/**
 * 予約フローの実行結果
 */
export interface ReservationFlowResult {
    success: boolean;
    reservationPage?: Page;
    confirmPage?: ConfirmPage;
    errorMessage?: string;
}

/**
 * 予約フローの実行オプション
 */
export interface ReservationFlowOptions {
    planName?: string;
    checkInDate?: string;
    stayDays?: string;
    guests?: string;
    additionalPlans?: string[];
    guestName?: string;
    email?: string;
    remarks?: string;
    contactMethod?: 'email' | 'tel';
    tel?: string;
    skipSteps?: ReservationStep[];
}

/**
 * 予約フローを実行するヘルパー関数
 * @param page Playwrightのページオブジェクト
 * @param options 予約フローのオプション
 * @returns 予約フローの実行結果
 */
export async function executeReservationFlow(
    page: Page,
    options: ReservationFlowOptions = {}
): Promise<ReservationFlowResult> {
    try {
        // オプションをマージ
        const flowData = {
            planName: options.planName || reservationData.planName,
            checkInDate: options.checkInDate || reservationData.checkInDate,
            stayDays: options.stayDays || reservationData.stayDays,
            guests: options.guests || reservationData.guests,
            additionalPlans: options.additionalPlans || reservationData.additionalPlans,
            guestName: options.guestName || reservationData.guestName,
            email: options.email || reservationData.email,
            remarks: options.remarks || reservationData.remarks,
            contactMethod: options.contactMethod || 'email',
            tel: options.tel || ''
        };

        const skipSteps = options.skipSteps || [];

        // STEP 1: プラン選択
        if (!skipSteps.includes(ReservationStep.SELECT_PLAN)) {
            await allure.step(`${ReservationStep.SELECT_PLAN}: ${flowData.planName}`, async () => {
                const plansPage = new PlansPage(page);
                await plansPage.goto();
                await plansPage.waitForPageLoad();
            });
        }

        // プラン選択
        const plansPage = new PlansPage(page);
        const reservationPage = await plansPage.selectPlanByName(flowData.planName);
        await reservationPage.waitForLoadState('networkidle');

        // STEP 2: 予約情報入力
        const reserveForm = new ReservePage(reservationPage);
        if (!skipSteps.includes(ReservationStep.FILL_FORM)) {
            await allure.step(ReservationStep.FILL_FORM, async () => {
                // 予約フォームに情報を入力
                await reserveForm.fillReservationForm({
                    checkInDate: flowData.checkInDate,
                    stayDays: flowData.stayDays,
                    guests: flowData.guests,
                    additionalPlans: flowData.additionalPlans,
                    guestName: flowData.guestName,
                    email: flowData.email,
                    remarks: flowData.remarks
                });

                // サブステップとして詳細も記録
                await allure.step(`宿泊日: ${flowData.checkInDate}`, async () => {});
                await allure.step(`宿泊数: ${flowData.stayDays}泊`, async () => {});
                await allure.step(`宿泊人数: ${flowData.guests}人`, async () => {});
                for (const plan of flowData.additionalPlans) {
                    await allure.step(`追加プラン: ${plan}`, async () => {});
                }
                await allure.step(`宿泊者名: ${flowData.guestName}`, async () => {});
                await allure.step(`連絡先: ${flowData.contactMethod === 'email' ? flowData.email : flowData.tel}`, async () => {});
            });

            // 確認画面へ進む
            await allure.step('予約内容確認画面へ進む', async () => {
                await reserveForm.proceedToConfirm();
            });
        }

        // STEP 3: 予約内容確認
        const confirmPage = new ConfirmPage(reservationPage);
        if (!skipSteps.includes(ReservationStep.CONFIRM)) {
            await allure.step(ReservationStep.CONFIRM, async () => {
                // 確認画面への遷移を検証
                await confirmPage.assertCurrentUrl(/.*\/confirm\.html/);

                // 予約内容の正確性を検証
                await confirmPage.assertReservationDetails(
                    flowData.planName,
                    flowData.guestName,
                    flowData.contactMethod === 'email' ? flowData.email : flowData.tel
                );
            });
        }

        // STEP 4: 予約完了
        if (!skipSteps.includes(ReservationStep.COMPLETE)) {
            await allure.step(ReservationStep.COMPLETE, async () => {
                // 予約を確定
                await confirmPage.confirm();

                // 予約完了のモーダルが表示されることを検証
                await confirmPage.assertCompletionModal('ご来館、心よりお待ちしております');
            });
        }

        return {
            success: true,
            reservationPage,
            confirmPage
        };
    } catch (error) {
        // エラーが発生した場合はスクリーンショットを撮影
        try {
            const screenshot = await page.screenshot();
            allure.attachment('error-screenshot', screenshot, 'image/png');
        } catch (screenshotError) {
            console.error('スクリーンショットの撮影に失敗しました:', screenshotError);
        }

        return {
            success: false,
            errorMessage: error instanceof Error ? error.message : '未知のエラー'
        };
    }
}

/**
 * 予約フローのテストケース
 */
export interface ReservationTestCase {
    name: string;
    description: string;
    options: ReservationFlowOptions;
    expectedResult: {
        success: boolean;
        errorMessage?: string;
    };
    tags: string[];
    severity: 'critical' | 'high' | 'medium' | 'low' | 'trivial';
}

/**
 * 予約フローのテストケース
 */
export const RESERVATION_TEST_CASES: ReservationTestCase[] = [
    {
        name: '標準的な予約フローが正常に完了すること',
        description: 'プラン選択から予約入力、確認、完了までの一連のE2Eフロー検証',
        options: {}, // デフォルト値を使用
        expectedResult: {
            success: true
        },
        tags: ['smoke', 'e2e', 'regression', 'booking', 'positive'],
        severity: 'critical'
    },
    // 将来的に追加するテストケース例
    /*
    {
        name: '電話番号を連絡先として予約が完了すること',
        description: '連絡方法を電話番号に設定した場合の予約フロー',
        options: {
            contactMethod: 'tel',
            tel: '03-1234-5678',
            email: '' // メールアドレスは空に
        },
        expectedResult: {
            success: true
        },
        tags: ['e2e', 'regression', 'booking', 'positive'],
        severity: 'high'
    },
    {
        name: '異なるプランでも予約が完了すること',
        description: '別のプランを選択した場合の予約フロー',
        options: {
            planName: 'プレミアムプラン'
        },
        expectedResult: {
            success: true
        },
        tags: ['e2e', 'regression', 'booking', 'positive'],
        severity: 'high'
    }
    */
];
