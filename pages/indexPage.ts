/**
 * @name indexPage.ts
 * @description Index page object
 */
import { BasePage } from './basePage';

export class IndexPage extends BasePage {
    async goto() {
        await this.page.goto('/ja/index');
    }
}
