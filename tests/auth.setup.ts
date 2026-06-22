import { test as base } from '@playwright/test';
import { LoginPage } from '../src/pages/login-page';
import 'dotenv/config';
import { STANDARD_USER_STATE, PROBLEM_USER_STATE } from 'src/data/auth.constants';
import { requireEnv } from '../src/utils/env';

const setup = base.extend<{ loginPage: LoginPage }>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
});

setup('Setup Session cho Standard User', async ({ page, loginPage }) => {
    console.info('[AUTH SETUP] Preparing session for standard user');
    const username = requireEnv('STANDARD_USER_USERNAME');
    const password = requireEnv('LOGIN_PASSWORD');

    await loginPage.navigateTo();
    await loginPage.login(username, password);
    await page.waitForURL('**/inventory.html');
    await page.context().storageState({ path: STANDARD_USER_STATE });
    console.info(`[AUTH SETUP] Standard user session saved to ${STANDARD_USER_STATE}`);
});

setup('Setup Session cho Problem User', async ({ page, loginPage }) => {
    console.info('[AUTH SETUP] Preparing session for problem user');
    const username = requireEnv('PROBLEM_USER_USERNAME');
    const password = requireEnv('LOGIN_PASSWORD');

    await loginPage.navigateTo();
    await loginPage.login(username, password);
    await page.waitForURL('**/inventory.html');
    await page.context().storageState({ path: PROBLEM_USER_STATE });
    console.info(`[AUTH SETUP] Problem user session saved to ${PROBLEM_USER_STATE}`);
});
