import 'dotenv/config';
import { test, expect } from '../../src/fixtures/base-test';
import { requireEnv } from '../../src/utils/env';

test.describe('Bộ test kiểm thử tính năng đăng nhập SauceDemo', () => {

    test.beforeEach(async ({ loginPage }) => {
        // Trước mỗi test case thì luôn đi tới trang login
        await loginPage.navigateTo();
    });

    test('TC01: Đăng nhập thành công với tài khoản hợp lệ', async ({ loginPage, inventoryPage }) => {
        console.info('[AUTH TEST] Logging in with standard user');
        await loginPage.login(
            requireEnv('STANDARD_USER_USERNAME'),
            requireEnv('LOGIN_PASSWORD')
        );
        
        // Kiểm tra (Assert) xem tiêu đề trang sản phẩm có hiển thị đúng chữ "Products" không
        await expect(inventoryPage.titleHeader).toBeVisible();
        await expect(inventoryPage.titleHeader).toHaveText('Products');
    });

    test('TC02: Đăng nhập thất bại và hiển thị thông báo lỗi chính xác', async ({ loginPage }) => {
        console.info('[AUTH TEST] Logging in with locked-out user');
        await loginPage.login(
            requireEnv('LOCKED_OUT_USER_USERNAME'),
            requireEnv('LOGIN_PASSWORD')
        );
        
        // Kiểm tra xem câu báo lỗi của hệ thống có hiển thị không
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
    });
});
