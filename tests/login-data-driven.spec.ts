import { test, expect } from '../src/fixtures/base-test';
import userData from '../src/data/users-data.json';
import { requireEnv } from 'src/utils/env';

test.describe('Kiểm thử Đăng nhập đa tài khoản từ dữ liệu JSON', () => {

    for (const account of userData.accounts) {
        
        test(`TC: Đăng nhập thất bại với vai trò [${account.role}]`, async ({ loginPage, inventoryPage }) => {
            await loginPage.navigateTo();
            
            const username = account.username;
            const password = requireEnv('LOGIN_PASSWORD');
            await loginPage.login(username, password);
            
            await expect(loginPage.errorMessage).toHaveText(account.expectedError, { timeout: 5000 });
        });
        
    }
}); 