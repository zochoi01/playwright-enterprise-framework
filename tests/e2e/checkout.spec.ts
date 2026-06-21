import { test, expect } from '../../src/fixtures/base-test';
import checkoutData from '../../src/data/checkout-data.json';

test.describe('Bộ test kiểm thử tính năng mua hàng SauceDemo', () => {

    test.beforeEach(async ({ loginPage }) => {
        // Trước mỗi test case thì luôn đi tới trang login
        await loginPage.navigateTo();
    });

    test('TC01: Đăng nhập và mua sản phẩm thành công', async ({ loginPage, inventoryPage,cartPage,checkoutPage }) => {
        await loginPage.login(checkoutData.validUser.username, checkoutData.validUser.password);
        await expect(inventoryPage.titleHeader).toBeVisible();
        await expect(inventoryPage.titleHeader).toHaveText('Products');
        await inventoryPage.addToCart();
        await cartPage.viewCart();
        const itemsInCart = await cartPage.getItemsInCart();
        await expect(itemsInCart.length).toBeGreaterThan(0);
        await cartPage.checkout();  
        await checkoutPage.fillCheckoutInformation(checkoutData.customerInfo.firstName, checkoutData.customerInfo.lastName, checkoutData.customerInfo.postalCode);
        await checkoutPage.continueCheckout();
        await checkoutPage.finishCheckout();
        await expect(checkoutPage.completeHeader).toBeVisible();
        await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });

});