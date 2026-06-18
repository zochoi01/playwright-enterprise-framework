import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class InventoryPage extends BasePage {
    readonly titleHeader: Locator;

    constructor(page: Page) {
        super(page);
        this.titleHeader = page.locator('.title');
    }
}