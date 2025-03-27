/**
 * @name ConfirmPage
 * @description 予約確認ページのページオブジェクト
 * 予約内容確認と予約確定に関連する操作を提供します。
 */

import { BasePage } from './basePage';
import { Locator, Page, expect } from '@playwright/test';

export class ConfirmPage extends BasePage {
    // ページ要素のロケーター
    private readonly confirmButton: Locator;
    private readonly modal: Locator;
    private readonly modalCloseButton: Locator;
    private readonly planNameElement: Locator;
    private readonly usernameElement: Locator;
    private readonly contactElement: Locator;
    private readonly modalBodyElement: Locator;

    /**
     * ConfirmPage コンストラクタ
     * @param page Playwrightのページオブジェクト
     */
    constructor(page: Page) {
        super(page);

        // 要素ロケーターの初期化
        this.confirmButton = this.page.locator('text=この内容で予約する');
        this.modal = this.page.locator('.modal');
        this.modalCloseButton = this.page.locator('.modal button:has-text("閉じる")');
        this.planNameElement = this.page.locator('[id="plan-name"]');
        this.usernameElement = this.page.locator('[id="username"]');
        this.contactElement = this.page.locator('[id="contact"]');
        this.modalBodyElement = this.page.locator('.modal-body');
    }

    /**
     * 予約を確定する（確認ボタンをクリック）
     */
    async confirm() {
        await this.confirmButton.click();
        await this.waitForPageLoad();
    }

    /**
     * 確認モーダルが表示されていることを確認
     */
    async expectModalVisible() {
        await expect(this.modal).toBeVisible();
    }

    /**
     * モーダルを閉じる
     */
    async closeModal() {
        await this.modalCloseButton.click();
    }

    /**
     * プラン名を取得
     * @returns プラン名のテキスト
     */
    async getPlanNameText() {
        return await this.getLocatorTextWithRetry(this.planNameElement);
    }

    /**
     * 宿泊者名を取得
     * @returns 宿泊者名のテキスト
     */
    async getGuestNameText() {
        return await this.getLocatorTextWithRetry(this.usernameElement);
    }

    /**
     * 連絡先情報を取得
     * @returns 連絡先のテキスト
     */
    async getContactText() {
        return await this.getLocatorTextWithRetry(this.contactElement);
    }

    /**
     * モーダル本文を取得
     * @returns モーダル本文のテキスト
     */
    async getModalText() {
        await expect(this.modalBodyElement).toBeVisible();
        return await this.getLocatorTextWithRetry(this.modalBodyElement);
    }

    /**
     * 予約内容が期待通りであることを確認
     * @param expectedPlan 期待されるプラン名
     * @param expectedGuest 期待される宿泊者名
     * @param expectedContact 期待される連絡先
     */
    async assertReservationDetails(expectedPlan: string, expectedGuest: string, expectedContact: string) {
        const planName = await this.getPlanNameText();
        const guestName = await this.getGuestNameText();
        const contact = await this.getContactText();

        expect(planName).toContain(expectedPlan);
        expect(guestName).toContain(expectedGuest);
        expect(contact).toContain(expectedContact);
    }

    /**
     * 予約完了モーダルの内容を確認
     * @param expectedText 期待されるモーダルメッセージ
     */
    async assertCompletionModal(expectedText: string) {
        await this.expectModalVisible();
        const modalText = await this.getModalText();
        expect(modalText).toContain(expectedText);
    }
}