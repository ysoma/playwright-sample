/**
 * @name ReservePage
 * @description Reserve page object
 */

import { BasePage } from './basePage';

export class ReservePage extends BasePage {
    async selectDate(date: string) {
        const form = this.page.getByRole('textbox', { name: '宿泊日 必須' });
        await form.click();
        await form.fill(date);
        await this.page.getByRole('button', { name: '閉じる' }).click();// 閉じる
    }

    async selectStayDays(days: string) {
        await this.page.getByRole('spinbutton', { name: '宿泊数 必須' }).fill(days);
    }

    async selectGuests(guests: string) {
        await this.page.getByRole('spinbutton', { name: '人数 必須' }).fill(guests);
    }

    async chooseAdditionalPlans(plans: string[]) {
        for (const plan of plans) {
            await this.page.getByRole('checkbox', { name: plan }).check();
        }
    }

    async fillName(name: string) {
        await this.page.getByRole('textbox', { name: '氏名 必須' }).fill(name);
    }

    async selectContactMethod(method: 'no' | 'email' | 'tel') {
        await this.page.selectOption('select[name="contact"]', method);
    }


    async fillEmail(email: string) {
        await this.page.getByRole('textbox', { name: 'メールアドレス 必須' }).fill(email);
    }

    async fillTel(tel: string) {
        await this.page.getByRole('textbox', { name: '電話番号 必須' }).fill(tel);
    }

    async fillRemarks(remarks: string) {
        await this.page.fill('textarea[name="comment"]', remarks);
    }

    async proceedToConfirm() {
        await this.page.locator('[data-test="submit-button"]').click();
    }
}
