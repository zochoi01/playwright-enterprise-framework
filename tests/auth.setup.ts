import { test as base } from '@playwright/test';
import { LoginPage } from '../src/pages/login-page';
import checkoutData from '../src/data/checkout-data.json';
import 'dotenv/config';
import { STANDARD_USER_STATE, PROBLEM_USER_STATE } from 'src/data/auth.constants';

const setup = base.extend<{ loginPage: LoginPage }>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
});

setup('Setup Session cho Standard User', async ({ page, loginPage }) => {
    await loginPage.navigateTo();
    await loginPage.login(checkoutData.validUser.username, process.env.LOGIN_PASSWORD || '');
    await page.waitForURL('**/inventory.html');
    await page.context().storageState({ path: STANDARD_USER_STATE });
});

setup('Setup Session cho Problem User', async ({ page, loginPage }) => {
    await loginPage.navigateTo();
    await loginPage.login('problem_user', process.env.LOGIN_PASSWORD || '');
    await page.waitForURL('**/inventory.html');
    await page.context().storageState({ path: PROBLEM_USER_STATE });
});