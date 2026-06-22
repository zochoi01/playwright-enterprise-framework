# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> Setup Session cho Standard User
- Location: tests/auth.setup.ts:13:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/inventory.html" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Swag Labs
  - generic [ref=e5]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - textbox "Username" [ref=e11]: standard_user
        - img [ref=e12]
      - generic [ref=e14]:
        - textbox "Password" [ref=e15]
        - img [ref=e16]
      - 'heading "Epic sadface: Password is required" [level=3] [ref=e19]':
        - button [ref=e20] [cursor=pointer]:
          - img [ref=e21]
        - text: "Epic sadface: Password is required"
      - button "Login" [active] [ref=e23] [cursor=pointer]
    - generic [ref=e25]:
      - generic [ref=e26]:
        - heading "Accepted usernames are:" [level=4] [ref=e27]
        - text: standard_user
        - text: locked_out_user
        - text: problem_user
        - text: performance_glitch_user
        - text: error_user
        - text: visual_user
      - generic [ref=e28]:
        - heading "Password for all users:" [level=4] [ref=e29]
        - text: secret_sauce
```

# Test source

```ts
  1  | import { test as base } from '@playwright/test';
  2  | import { LoginPage } from '../src/pages/login-page';
  3  | import checkoutData from '../src/data/checkout-data.json';
  4  | import 'dotenv/config';
  5  | import { STANDARD_USER_STATE, PROBLEM_USER_STATE } from 'src/data/auth.constants';
  6  | 
  7  | const setup = base.extend<{ loginPage: LoginPage }>({
  8  |     loginPage: async ({ page }, use) => {
  9  |         await use(new LoginPage(page));
  10 |     },
  11 | });
  12 | 
  13 | setup('Setup Session cho Standard User', async ({ page, loginPage }) => {
  14 |     await loginPage.navigateTo();
  15 |     await loginPage.login(checkoutData.validUser.username, process.env.LOGIN_PASSWORD || '');
> 16 |     await page.waitForURL('**/inventory.html');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  17 |     await page.context().storageState({ path: STANDARD_USER_STATE });
  18 | });
  19 | 
  20 | setup('Setup Session cho Problem User', async ({ page, loginPage }) => {
  21 |     await loginPage.navigateTo();
  22 |     await loginPage.login('problem_user', process.env.LOGIN_PASSWORD || '');
  23 |     await page.waitForURL('**/inventory.html');
  24 |     await page.context().storageState({ path: PROBLEM_USER_STATE });
  25 | });
```