/**
 * @name loginPage.ts
 * @description Login page object   
 */

import { BasePage } from './basePage';

export class LoginPage extends BasePage {
    async goto() {
        await this.page.goto('/ja/login');
    }

    async fillEmail(email: string) {
        const mail = this.page.getByRole('textbox', { name: 'メールアドレス' });
        await mail.fill(email);
    }

    async fillPassword(password: string) {
        const pass = this.page.getByRole('textbox', { name: 'パスワード' });
        await pass.fill(password);
    }

    async submit() {
        const submit = this.page.locator('#login-button')
        await submit.click();
    }

    async loginAs(email: string, password: string) {
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.submit();
    }
}
