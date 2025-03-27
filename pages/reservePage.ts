/**
 * @name ReservePage
 * @description 予約ページのページオブジェクト
 * 宿泊予約フォームへの入力と操作を提供します。
 */

import { BasePage } from './basePage';
import { Locator, Page } from '@playwright/test';

export class ReservePage extends BasePage {
    // ページ要素のロケーター
    private readonly dateInput: Locator;
    private readonly stayDaysInput: Locator;
    private readonly guestsInput: Locator;
    private readonly nameInput: Locator;
    private readonly contactSelect: Locator;
    private readonly emailInput: Locator;
    private readonly telInput: Locator;
    private readonly remarksInput: Locator;
    private readonly submitButton: Locator;
    private readonly closeButton: Locator;

    /**
     * ReservePage コンストラクタ
     * @param page Playwrightのページオブジェクト
     */
    constructor(page: Page) {
        super(page);

        // 要素ロケーターの初期化
        this.dateInput = this.page.getByRole('textbox', { name: '宿泊日 必須' });
        this.stayDaysInput = this.page.getByRole('spinbutton', { name: '宿泊数 必須' });
        this.guestsInput = this.page.getByRole('spinbutton', { name: '人数 必須' });
        this.nameInput = this.page.getByRole('textbox', { name: '氏名 必須' });
        this.contactSelect = this.page.locator('select[name="contact"]');
        this.emailInput = this.page.getByRole('textbox', { name: 'メールアドレス 必須' });
        this.telInput = this.page.getByRole('textbox', { name: '電話番号 必須' });
        this.remarksInput = this.page.locator('textarea[name="comment"]');
        this.submitButton = this.page.locator('[data-test="submit-button"]');
        this.closeButton = this.page.getByRole('button', { name: '閉じる' });
    }

    /**
     * 宿泊日を選択
     * @param date 宿泊日（YYYY/MM/DD形式）
     */
    async selectDate(date: string) {
        await this.dateInput.click();
        await this.dateInput.fill(date);
        await this.closeButton.click(); // 日付ピッカーを閉じる
    }

    /**
     * 宿泊数を選択
     * @param days 宿泊数
     */
    async selectStayDays(days: string) {
        await this.stayDaysInput.fill(days);
    }

    /**
     * 宿泊人数を選択
     * @param guests 宿泊人数
     */
    async selectGuests(guests: string) {
        await this.guestsInput.fill(guests);
    }

    /**
     * 追加プランを選択
     * @param plans 選択する追加プランの配列
     */
    async chooseAdditionalPlans(plans: string[]) {
        for (const plan of plans) {
            await this.page.getByRole('checkbox', { name: plan }).check();
        }
    }

    /**
    * 宿泊日フィールドをクリア
    */
    async clearDate() {
        await this.dateInput.click();
        await this.dateInput.fill('');
        await this.page.keyboard.press('Escape'); // 日付ピッカーを閉じる
    }

    /**
     * 宿泊数フィールドをクリア
     */
    async clearStayDays() {
        await this.stayDaysInput.fill('');
    }

    /**
     * 宿泊人数フィールドをクリア
     */
    async clearGuests() {
        await this.guestsInput.fill('');
    }

    /**
     * 宿泊者名を入力
     * @param name 宿泊者名
     */
    async fillName(name: string) {
        await this.nameInput.fill(name);
    }

    /**
     * 連絡方法を選択
     * @param method 連絡方法（'no', 'email', 'tel'）
     */
    async selectContactMethod(method: 'no' | 'email' | 'tel') {
        await this.contactSelect.selectOption(method);
    }

    /**
     * メールアドレスを入力
     * @param email メールアドレス
     */
    async fillEmail(email: string) {
        await this.emailInput.fill(email);
    }

    /**
     * 電話番号を入力
     * @param tel 電話番号
     */
    async fillTel(tel: string) {
        await this.telInput.fill(tel);
    }

    /**
     * 特記事項/備考を入力
     * @param remarks 特記事項/備考
     */
    async fillRemarks(remarks: string) {
        await this.remarksInput.fill(remarks);
    }

    /**
     * 確認画面へ進む
     */
    async proceedToConfirm() {
        await this.submitButton.click();
        await this.waitForPageLoad();
    }

    /**
     * 予約フォームに一括で情報を入力
     * @param data 予約データ
     */
    async fillReservationForm(data: {
        checkInDate: string;
        stayDays: string;
        guests: string;
        additionalPlans: string[];
        guestName: string;
        email: string;
        remarks: string;
    }) {
        try {
            await this.selectDate(data.checkInDate);
            await this.selectStayDays(data.stayDays);
            await this.selectGuests(data.guests);
            await this.chooseAdditionalPlans(data.additionalPlans);
            await this.fillName(data.guestName);
            await this.selectContactMethod(data.email ? 'email' : 'no');
            await this.fillEmail(data.email);
            await this.fillRemarks(data.remarks);
        } catch (error) {
            console.error('予約フォーム入力中にエラーが発生しました:', error instanceof Error ? error.message : '未知のエラー');
            // スクリーンショットを撮影してデバッグ情報として保存
            await this.takeScreenshot('error-reserve-form.png');
            throw error;
        }
    }

    /**
     * フォームの入力値を検証
     * @returns 現在のフォーム入力値のオブジェクト
     */
    async getFormValues() {
        return {
            checkInDate: await this.dateInput.inputValue(),
            stayDays: await this.stayDaysInput.inputValue(),
            guests: await this.guestsInput.inputValue(),
            guestName: await this.nameInput.inputValue(),
            email: await this.emailInput.isVisible() ? await this.emailInput.inputValue() : '',
            remarks: await this.remarksInput.inputValue()
        };
    }
}