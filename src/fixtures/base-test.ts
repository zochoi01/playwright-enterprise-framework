import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { InventoryPage } from '../pages/inventory-page';

// Gom tất cả các Page Object vào một kiểu dữ liệu chung
type MyFixtures = {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
};

// Mở rộng từ khóa 'test' gốc của Playwright thành 'test' thông minh của riêng bạn
export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
});

export { expect } from '@playwright/test';