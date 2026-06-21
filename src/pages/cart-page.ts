import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";


export class CartPage extends BasePage {
    readonly page: Page;
    private readonly cartIcon: Locator;
    private readonly checkoutButton: Locator;
    private readonly listOfItemsInCart: Locator;
    

    constructor(page: Page) {
        super(page);
        this.page = page;   
        this.cartIcon = page.locator('[data-test="shopping-cart-link"]');
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.listOfItemsInCart = page.locator('.cart_item');
    }

    async viewCart() {
        await this.clickOn(this.cartIcon, 'Biểu tượng giỏ hàng');
    }

    async checkout() {
        await this.clickOn(this.checkoutButton, 'Nút Checkout');
    }

    async getItemsInCart() {
        return await this.listOfItemsInCart.all();
    }
}