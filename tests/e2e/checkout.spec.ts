import { test, expect } from '../../src/fixtures/base-test';
import checkoutData from '../../src/data/checkout-data.json';

test.describe('Bộ test kiểm thử tính năng mua hàng SauceDemo (Áp dụng Storage State)', () => {

    test.beforeEach(async ({ standardUserPage }) => {
        await standardUserPage.page.goto('https://www.saucedemo.com/inventory.html');
    });

    test('TC01: Đăng nhập và mua sản phẩm thành công', async ({ standardUserPage, cartPage, checkoutPage }) => {
        await standardUserPage.addToCart(); 
        await cartPage.viewCart();

        const itemsInCart = await cartPage.getItemsInCart();
        expect(itemsInCart.length).toBeGreaterThan(0);
        
        await cartPage.checkout();
        
        await checkoutPage.fillCheckoutInformation(
            checkoutData.customerInfo.firstName, 
            checkoutData.customerInfo.lastName, 
            checkoutData.customerInfo.postalCode
        );
        
        await checkoutPage.continueCheckout();
        await checkoutPage.finishCheckout();
        
        await expect(checkoutPage.completeHeader).toBeVisible();
        await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });
});