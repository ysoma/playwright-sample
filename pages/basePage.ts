/**
 * BasePage class
 */
import { Page } from '@playwright/test';

export class BasePage {
    protected nav: Map<string, any>;

    constructor(protected page: Page) {
        this.nav = new Map();
        this.nav.set('home', page.getByRole('link', { name: 'ホーム' }));
        this.nav.set('plans', page.getByRole('link', { name: '宿泊予約' }));
        this.nav.set('signup', page.getByRole('link', { name: '会員登録' }));
        this.nav.set('login', page.getByRole('button', { name: 'ログイン' }));
        this.nav.set('logout', page.getByRole('button', { name: 'ログアウト' }));
    }
    async navigateToHome() {
        await this.clickNav('home');
    }
    async navigateToPlans() {
        await this.clickNav('plans');
    }
    async navigateToSignup() {
        await this.clickNav('signup');
    }
    async navigateToLogin() {
        await this.clickNav('login');
    }
    async navigateToLogout() {
        await this.clickNav('logout');
    }
    async pageTitle() {
        return this.page.title();
    }
    async clickNav(nav: string) {
        const element = this.nav.get(nav);
        if (element) {
            await element.click();
        } else {
            throw new Error(`Navigation element ${nav} not found`);
        }
    }
    async logout() {
        await this.navigateToLogout();
    }

}