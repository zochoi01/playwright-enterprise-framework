import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class InventoryPage extends BasePage {
    readonly titleHeader: Locator;
    private readonly addToCartButton: Locator;


    constructor(page: Page) {
        super(page);
        this.titleHeader = page.locator('.title');
        this.addToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    }

    async addToCart() {
        await this.clickOn(this.addToCartButton, 'Nút Add to Cart');
    }
}