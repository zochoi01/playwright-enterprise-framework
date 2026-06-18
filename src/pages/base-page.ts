import { Locator, Page, test } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Viết đè (wrap) lại hàm click để tự động in ra log báo cáo đẹp mắt
    async clickOn(locator: Locator, elementName: string) {
        await test.step(`Click vào: ${elementName}`, async () => {
            await locator.waitFor({ state: 'visible' });
            await locator.click();
        });
    }

    // Viết đè hàm điền text
    async typeInto(locator: Locator, text: string, elementName: string) {
        await test.step(`Nhập văn bản vào: ${elementName}`, async () => {
            await locator.waitFor({ state: 'visible' });
            await locator.fill(text);
        });
    }
}