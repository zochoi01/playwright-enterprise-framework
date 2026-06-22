import { readFileSync } from 'node:fs';
import { test as base, type BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { InventoryPage } from '../pages/inventory-page';
import { CartPage } from '@pages/cart-page';
import { CheckoutPage } from '@pages/checkout-page';
import { PROBLEM_USER_STATE, STANDARD_USER_STATE } from '../data/auth.constants';

type Cookies = Parameters<BrowserContext['addCookies']>[0];

function loadCookies(storageStatePath: string): Cookies {
    const storageState = JSON.parse(
        readFileSync(storageStatePath, 'utf-8')
    ) as { cookies: Cookies };

    return storageState.cookies;
}

type MyFixtures = {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
    standardUserPage: InventoryPage; 
    problemUserPage: InventoryPage;
};

export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },
    standardUserPage: async ({ page, context }, use) => {
        await context.addCookies(loadCookies(STANDARD_USER_STATE));
        await use(new InventoryPage(page));
    },
    problemUserPage: async ({ page, context }, use) => {
        await context.addCookies(loadCookies(PROBLEM_USER_STATE));
        await use(new InventoryPage(page));
    },
});

export { expect } from '@playwright/test';
