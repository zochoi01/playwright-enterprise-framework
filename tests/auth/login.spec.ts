import { test, expect } from '../../src/fixtures/base-test';

test.describe('Bộ test kiểm thử tính năng đăng nhập SauceDemo', () => {

    test.beforeEach(async ({ loginPage }) => {
        // Trước mỗi test case thì luôn đi tới trang login
        await loginPage.navigateTo();
    });

    test('TC01: Đăng nhập thành công với tài khoản hợp lệ', async ({ loginPage, inventoryPage }) => {
        // Thực hiện hành động login thông qua hàm đã wrap sẵn
        await loginPage.login('standard_user', 'secret_sauce');
        
        // Kiểm tra (Assert) xem tiêu đề trang sản phẩm có hiển thị đúng chữ "Products" không
        await expect(inventoryPage.titleHeader).toBeVisible();
        await expect(inventoryPage.titleHeader).toHaveText('Products');
    });

    test('TC02: Đăng nhập thất bại và hiển thị thông báo lỗi chính xác', async ({ loginPage }) => {
        await loginPage.login('locked_out_user', 'secret_sauce');
        
        // Kiểm tra xem câu báo lỗi của hệ thống có hiển thị không
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
    });
});