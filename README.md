# 🎭 Playwright Enterprise Framework

Framework kiểm thử tự động bằng **Playwright + TypeScript**, thực hành trên [SauceDemo](https://www.saucedemo.com).

Áp dụng Page Object Model, custom fixtures, storage-state authentication và báo cáo Allure.

> **Trạng thái hiện tại:** 7 test UI, tất cả đang pass. Dự án **chưa có API test** — lý do và cách bổ sung xem [phần 7](#7-thêm-api-testing-chưa-có-trong-repo).

---

## 📑 Mục lục

| Phần | Nội dung |
|---|---|
| [1](#1-yêu-cầu--cài-đặt) | Yêu cầu & Cài đặt |
| [2](#2-chạy-test) | Chạy test |
| [3](#3-cấu-trúc-dự-án) | Cấu trúc dự án |
| [4](#4-kiến-trúc-dành-cho-người-mới) | Kiến trúc — dành cho người mới |
| [5](#5-các-test-hiện-có) | Các test hiện có |
| [6](#6-hướng-dẫn-viết-test-ui-mới) | **Hướng dẫn viết test UI mới** |
| [7](#7-thêm-api-testing-chưa-có-trong-repo) | **Hướng dẫn thêm API testing** |
| [8](#8-hướng-dẫn-test-hybrid-api--ui) | **Hướng dẫn test Hybrid (API + UI)** |
| [9](#9-báo-cáo-allure) | Báo cáo Allure |
| [10](#10-troubleshooting) | Troubleshooting |

---

## 1. Yêu cầu & Cài đặt

**Yêu cầu:** Node.js ≥ 18, npm, Git.

```bash
git clone <repository-url>
cd playwright-enterprise-framework

npm install
npx playwright install chromium
```

### Tạo file `.env`

Repo có sẵn `.env.example` làm khuôn. `.env` bị `.gitignore` chặn nên **không bao giờ lên git** — mỗi máy tự tạo.

```bash
cp .env.example .env
```

Điền 4 biến (đây là tài khoản demo công khai của SauceDemo):

```env
STANDARD_USER_USERNAME=standard_user
PROBLEM_USER_USERNAME=problem_user
LOCKED_OUT_USER_USERNAME=locked_out_user
LOGIN_PASSWORD=secret_sauce
```

> ⚠️ Thiếu bất kỳ biến nào, `requireEnv()` sẽ throw ngay với thông báo `[ENV GUARD] Missing required environment variable: X`. Đây là chủ ý — fail sớm và rõ ràng, thay vì để test fail mơ hồ ở giữa chừng.
>
> ⚠️ File `.env` cần có **dòng trống ở cuối**. Nếu không, việc append bằng script sẽ nối chuỗi vào dòng cuối và làm hỏng giá trị.

---

## 2. Chạy test

```bash
npm test                 # toàn bộ 7 test, chromium, headless (~4 giây)
npm run test:headed      # mở browser để xem chạy
npm run test:debug       # Playwright Inspector, chạy từng bước
npm run test:ui-mode     # UI mode — trực quan nhất cho người mới
npm run report:serve     # mở báo cáo Allure
```

### Chạy có chọn lọc

```bash
npx playwright test tests/auth/login.spec.ts     # theo file
npx playwright test --grep "Đăng nhập"           # theo tên test
npx playwright test --list                       # chỉ liệt kê, không chạy
```

> 💡 Người mới nên bắt đầu bằng `npm run test:ui-mode`. Nó cho xem lại từng bước, DOM snapshot tại mỗi thời điểm, và chạy lại một test riêng lẻ mà không cần gõ lệnh.

---

## 3. Cấu trúc dự án

```
playwright-enterprise-framework/
├── playwright.config.ts      # cấu hình Playwright
├── tsconfig.json             # alias @pages/* và @fixtures/*
├── CLAUDE.md                 # quy ước code (AI đọc file này)
├── .env.example              # khuôn cho .env
│
├── src/
│   ├── pages/                # Page Object Model
│   │   ├── base-page.ts      # lớp cha — clickOn(), typeInto()
│   │   ├── login-page.ts
│   │   ├── inventory-page.ts
│   │   ├── cart-page.ts
│   │   └── checkout-page.ts
│   │
│   ├── fixtures/
│   │   └── base-test.ts      # ⭐ nơi khai báo mọi fixture
│   │
│   ├── data/
│   │   ├── auth.constants.ts # đường dẫn file storage state
│   │   ├── users-data.json   # data cho DDT login
│   │   └── checkout-data.json
│   │
│   └── utils/
│       └── env.ts            # requireEnv()
│
├── tests/
│   ├── auth.setup.ts         # chạy TRƯỚC — tạo phiên đăng nhập
│   ├── auth/login.spec.ts
│   ├── e2e/checkout.spec.ts
│   └── login-data-driven.spec.ts
│
└── playwright/.auth/         # storage state (gitignored, tự sinh)
    ├── standard_user.json
    └── problem_user.json
```

---

## 4. Kiến trúc — dành cho người mới

### 4.1. Page Object Model (POM)

Thay vì rải selector khắp file test, mỗi trang web được gói thành **một class**. Khi giao diện đổi, bạn sửa **một chỗ** thay vì sửa 20 file test.

```typescript
// src/pages/login-page.ts
export class LoginPage extends BasePage {
    private readonly usernameInput: Locator;   // private: chỉ dùng trong class
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    readonly errorMessage: Locator;            // public: test cần assert lên nó

    constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('[data-test="username"]');
        // ...
    }

    async login(user: string, pass: string) {
        await this.typeInto(this.usernameInput, user, 'Trường Username');
        await this.typeInto(this.passwordInput, pass, 'Trường Password');
        await this.clickOn(this.loginButton, 'Nút Login');
    }
}
```

**Ba quy tắc quan trọng:**

| Quy tắc | Lý do |
|---|---|
| Locator để `private readonly` | Test không nên biết selector. Test chỉ gọi hành vi (`login()`), không thao tác DOM. |
| Trừ khi test cần assert → để `readonly` (public) | Ví dụ `errorMessage`, `titleHeader`, `completeHeader`. Test viết `expect(loginPage.errorMessage).toBeVisible()`. |
| Ưu tiên selector `[data-test="..."]` | Bền hơn CSS class hay xpath — không vỡ khi designer đổi style. |

### 4.2. BasePage — tại sao không gọi `locator.click()` trực tiếp?

```typescript
// src/pages/base-page.ts
async clickOn(locator: Locator, elementName: string) {
    await test.step(`Click vào: ${elementName}`, async () => {
        await locator.waitFor({ state: 'visible' });
        await locator.click();
    });
}
```

Hàm này bọc 2 lớp giá trị:

1. **`test.step()`** → báo cáo Allure hiện từng bước có tên tiếng Việt, thay vì một khối đen. Khi test fail, bạn thấy ngay nó chết ở bước nào.
2. **`waitFor({ state: 'visible' })`** → chờ element hiện ra, giảm flaky test.

➡️ **Luôn dùng `this.clickOn()` / `this.typeInto()`. Không gọi `locator.click()` hay `.fill()` trực tiếp trong page object.**

### 4.3. Fixtures — `src/fixtures/base-test.ts`

Fixture là "đồ nghề" được Playwright bơm tự động vào mỗi test. Thay vì mỗi test tự `new LoginPage(page)`, bạn khai báo một lần:

```typescript
export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    // ...
});
```

Rồi test chỉ việc "gọi tên món đồ cần":

```typescript
test('...', async ({ loginPage, inventoryPage }) => { ... });
```

**Fixtures hiện có:**

| Fixture | Kiểu | Công dụng |
|---|---|---|
| `loginPage` | `LoginPage` | Trang đăng nhập |
| `inventoryPage` | `InventoryPage` | Trang sản phẩm |
| `cartPage` | `CartPage` | Giỏ hàng |
| `checkoutPage` | `CheckoutPage` | Thanh toán |
| `standardUserPage` | `InventoryPage` | ⭐ Đã nạp sẵn cookie `standard_user` — **bỏ qua bước login** |
| `problemUserPage` | `InventoryPage` | ⭐ Đã nạp sẵn cookie `problem_user` |

### 4.4. Storage State — vì sao test chạy nhanh

Nếu mỗi test đều phải đăng nhập qua UI, 20 test = 20 lần gõ username/password. Rất chậm.

Giải pháp trong repo này:

```
┌─────────────────────────────────────┐
│  Project "setup"                    │
│  tests/auth.setup.ts                │
│                                     │
│  1. Đăng nhập thật qua UI (1 lần)   │
│  2. Lưu cookie ra file JSON         │
│     playwright/.auth/*.json         │
└─────────────────────────────────────┘
                 ↓  dependencies: ['setup']
┌─────────────────────────────────────┐
│  Project "chromium"                 │
│  Mọi test còn lại                   │
│                                     │
│  Fixture standardUserPage nạp cookie│
│  → vào thẳng trang inventory        │
└─────────────────────────────────────┘
```

Khai báo trong [playwright.config.ts](playwright.config.ts):

```typescript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] }
]
```

### 4.5. Cấu hình chính

| Tuỳ chọn | Giá trị | Ý nghĩa |
|---|---|---|
| `baseURL` | `https://www.saucedemo.com` | `page.goto('/')` tự nối vào đây |
| `fullyParallel` | `true` | Chạy song song, nhanh hơn nhiều |
| `headless` | `true` | Không mở cửa sổ browser |
| `retries` | `2` trên CI, `0` ở local | Giảm nhiễu từ lỗi mạng trên CI |
| `trace` | `retain-on-failure` | Chỉ lưu trace khi fail — tiết kiệm dung lượng |
| `screenshot` / `video` | `only-on-failure` / `retain-on-failure` | Bằng chứng khi fail |

---

## 5. Các test hiện có

```
[setup]     auth.setup.ts        Setup Session cho Standard User
[setup]     auth.setup.ts        Setup Session cho Problem User
[chromium]  auth/login.spec.ts   TC01: Đăng nhập thành công với tài khoản hợp lệ
[chromium]  auth/login.spec.ts   TC02: Đăng nhập thất bại và hiển thị thông báo lỗi
[chromium]  e2e/checkout.spec.ts TC01: Đăng nhập và mua sản phẩm thành công
[chromium]  login-data-driven    TC: Đăng nhập thất bại với vai trò [Standard User]
[chromium]  login-data-driven    TC: Đăng nhập thất bại với vai trò [Locked Out User]

Total: 7 tests in 4 files — all passing
```

### Pattern Data-Driven Testing (DDT) đã có sẵn

Repo dùng **file JSON + vòng `for`** bọc `test()`:

```json
// src/data/users-data.json
{
  "accounts": [
    { "role": "Standard User",  "username": "standard_userr", "expectedError": "Epic sadface: Username and password do not match any user in this service" },
    { "role": "Locked Out User", "username": "locked_out_user", "expectedError": "Epic sadface: Sorry, this user has been locked out." }
  ]
}
```

```typescript
// tests/login-data-driven.spec.ts
for (const account of userData.accounts) {
    test(`TC: Đăng nhập thất bại với vai trò [${account.role}]`, async ({ loginPage }) => {
        await loginPage.navigateTo();
        await loginPage.login(account.username, requireEnv('LOGIN_PASSWORD'));
        await expect(loginPage.errorMessage).toHaveText(account.expectedError, { timeout: 5000 });
    });
}
```

Thêm một test case mới = thêm **một object vào JSON**, không đụng vào code.

> 📌 Giữ data ở **JSON**, không tạo file `.ts` chứa mảng. Đó là quy ước của repo này.

---

## 6. Hướng dẫn viết test UI mới

### Bước 1 — Đọc page object trước khi viết

Đây là bước hay bị bỏ qua nhất, và là nguyên nhân số 1 gây lỗi. Tên method trong repo này **không đoán được**:

| Bạn có thể đoán | Thực tế trong repo |
|---|---|
| `cartPage.navigateTo()` | `cartPage.viewCart()` |
| `cartPage.getCartItemCount()` | `cartPage.getItemsInCart()` → trả về `Locator[]` |
| `checkoutPage.fillForm({...})` | `checkoutPage.fillCheckoutInformation(first, last, postal)` — **3 tham số vị trí** |
| `checkoutPage.clickContinue()` | `checkoutPage.continueCheckout()` |
| `checkoutPage.clickFinish()` | `checkoutPage.finishCheckout()` |
| `inventoryPage.addToCart('tên sản phẩm')` | `inventoryPage.addToCart()` — **không tham số**, hardcode backpack |

➡️ Mở file trong [src/pages/](src/pages/) và đọc, đừng đoán.

### Bước 2 — Nếu cần trang mới, tạo Page Object

```typescript
// src/pages/product-detail-page.ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ProductDetailPage extends BasePage {
    private readonly backButton: Locator;
    readonly productName: Locator;      // public vì test sẽ assert

    constructor(page: Page) {
        super(page);
        this.backButton  = page.locator('[data-test="back-to-products"]');
        this.productName = page.locator('.inventory_details_name');
    }

    async goBack() {
        await this.clickOn(this.backButton, 'Nút Back to Products');
    }
}
```

### Bước 3 — Đăng ký fixture

Sửa [src/fixtures/base-test.ts](src/fixtures/base-test.ts) ở **cả hai chỗ**:

```typescript
import { ProductDetailPage } from '../pages/product-detail-page';   // 1. import

type MyFixtures = {
    // ...
    productDetailPage: ProductDetailPage;                            // 2. thêm vào type
};

export const test = base.extend<MyFixtures>({
    // ...
    productDetailPage: async ({ page }, use) => {                    // 3. thêm vào extend
        await use(new ProductDetailPage(page));
    },
});
```

> Quên bước 2 hoặc 3 → TypeScript báo lỗi hoặc fixture `undefined` lúc chạy.

### Bước 4 — Viết file test

```typescript
// tests/e2e/product-detail.spec.ts
import { test, expect } from '../../src/fixtures/base-test';

test.describe('Bộ test kiểm thử trang chi tiết sản phẩm', () => {

    test.beforeEach(async ({ standardUserPage }) => {
        await standardUserPage.page.goto('https://www.saucedemo.com/inventory.html');
    });

    test('TC01: Xem chi tiết sản phẩm và quay lại', async ({ standardUserPage, productDetailPage }) => {
        await standardUserPage.page.locator('[data-test="item-4-title-link"]').click();

        await expect(productDetailPage.productName).toBeVisible();
        await expect(productDetailPage.productName).toHaveText('Sauce Labs Backpack');

        await productDetailPage.goBack();
        await expect(standardUserPage.titleHeader).toHaveText('Products');
    });
});
```

**Checklist khi viết test:**

- [ ] Import fixture bằng **đường dẫn tương đối** (`'../../src/fixtures/base-test'`), không dùng alias `@fixtures` — alias đó chỉ dùng bên trong `src/`
- [ ] Tiêu đề test và comment viết **tiếng Việt**, đặt mã `TC01:`, `TC02:`...
- [ ] Assert lên **locator được expose**, không viết helper trả `boolean`
- [ ] Credential lấy qua `requireEnv()`, **không hardcode**
- [ ] Dùng `standardUserPage` nếu test không cần kiểm tra luồng login → nhanh hơn nhiều

### Bước 5 — Chạy và verify

```bash
npx playwright test tests/e2e/product-detail.spec.ts --headed
```

> ⚠️ **Test chưa chạy pass thì chưa xong.** Code trông đúng không phải bằng chứng. Luôn chạy trước khi coi là hoàn thành.

---

## 7. Thêm API testing (chưa có trong repo)

### 7.1. Vì sao repo chưa có — và đừng thêm cho SauceDemo

**SauceDemo không có REST API.** Đã kiểm chứng:

```bash
$ curl -o /dev/null -w "%{http_code}" https://www.saucedemo.com/api/products
404
$ curl -o /dev/null -w "%{http_code}" https://www.saucedemo.com/api/cart
404
```

Nó là site demo tĩnh, mọi state nằm trong `localStorage` của trình duyệt. Viết `APIService` gọi `/api/products` cho site này sẽ tạo ra code **trông rất chuyên nghiệp nhưng không chạy được** — cái bẫy nguy hiểm nhất khi học automation.

➡️ **Muốn học API testing thì trỏ vào một API có thật.** Phần dưới dùng [JSONPlaceholder](https://jsonplaceholder.typicode.com) — API công khai, miễn phí, không cần key. Các response dưới đây đã được verify thật.

### 7.2. Cách Playwright test API

Playwright có sẵn `APIRequestContext` — một HTTP client, **không cần mở browser**, nên nhanh hơn UI test cả chục lần.

Cách đơn giản nhất, dùng fixture `request` có sẵn:

```typescript
// tests/api/users.spec.ts
import { test, expect } from '@playwright/test';

test.describe('JSONPlaceholder — Users API', () => {

    test('TC01: GET /users/1 trả về đúng user', async ({ request }) => {
        const response = await request.get('https://jsonplaceholder.typicode.com/users/1');

        expect(response.status()).toBe(200);

        const user = await response.json();
        expect(user.id).toBe(1);
        expect(user.name).toBe('Leanne Graham');
        expect(user.email).toContain('@');
    });

    test('TC02: POST /posts tạo mới thành công', async ({ request }) => {
        const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
            data: { title: 'Bài viết test', body: 'Nội dung', userId: 1 }
        });

        expect(response.status()).toBe(201);

        const created = await response.json();
        expect(created.id).toBeTruthy();
        expect(created.title).toBe('Bài viết test');
    });
});
```

Chạy:

```bash
npx playwright test tests/api/users.spec.ts --project=chromium
```

### 7.3. Đóng gói thành Service Layer

Khi số lượng API call tăng, gói lại thành class — đúng tinh thần POM nhưng cho API. Đặt ở `src/services/`:

```typescript
// src/services/user.service.ts
import { APIRequestContext } from '@playwright/test';

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
}

export class UserService {
    constructor(
        private readonly request: APIRequestContext,
        private readonly baseURL = 'https://jsonplaceholder.typicode.com'
    ) {}

    async getUser(id: number): Promise<User> {
        const response = await this.request.get(`${this.baseURL}/users/${id}`);

        if (!response.ok()) {
            throw new Error(`[API] GET /users/${id} thất bại: ${response.status()}`);
        }
        return response.json();
    }

    async createPost(title: string, body: string, userId: number) {
        const response = await this.request.post(`${this.baseURL}/posts`, {
            data: { title, body, userId }
        });

        if (response.status() !== 201) {
            throw new Error(`[API] POST /posts thất bại: ${response.status()}`);
        }
        return response.json();
    }
}
```

Đăng ký fixture, y hệt cách làm với page object:

```typescript
// src/fixtures/base-test.ts
import { UserService } from '../services/user.service';

type MyFixtures = {
    // ...
    userService: UserService;
};

export const test = base.extend<MyFixtures>({
    // ...
    userService: async ({ request }, use) => {
        await use(new UserService(request));
    },
});
```

Dùng trong test:

```typescript
test('TC01: Lấy thông tin user', async ({ userService }) => {
    const user = await userService.getUser(1);
    expect(user.name).toBe('Leanne Graham');
});
```

### 7.4. DDT cho API

Cùng pattern JSON + `for` như phần UI:

```json
// src/data/api-users-data.json
{
  "users": [
    { "id": 1, "expectedName": "Leanne Graham", "expectedUsername": "Bret" },
    { "id": 2, "expectedName": "Ervin Howell",  "expectedUsername": "Antonette" }
  ]
}
```

```typescript
for (const u of apiUsersData.users) {
    test(`TC: GET /users/${u.id} trả về ${u.expectedName}`, async ({ userService }) => {
        const user = await userService.getUser(u.id);
        expect(user.name).toBe(u.expectedName);
        expect(user.username).toBe(u.expectedUsername);
    });
}
```

### 7.5. Nếu bạn có API riêng (cần token)

JSONPlaceholder không cần xác thực. API thật thường cần token. Dưới đây là service hoàn chỉnh cho trường hợp đó — **cùng cấu trúc với `UserService` ở 7.3**, chỉ thêm `baseURL` lấy từ `.env` và header `Authorization`.

**Bước 1 — Khai báo biến môi trường**

Thêm vào `.env.example` (để đồng đội biết cần biến gì) **và** `.env` của bạn (điền giá trị thật):

```env
API_BASE_URL=https://api.duan-cua-ban.com
API_TOKEN=
```

**Bước 2 — Tạo file service**

```typescript
// src/services/product.service.ts
import { APIRequestContext } from '@playwright/test';
import { requireEnv } from '../utils/env';

export interface Product {
    id: number;
    name: string;
    price: number;
}

export class ProductService {
    constructor(
        private readonly request: APIRequestContext,
        private readonly baseURL = requireEnv('API_BASE_URL')
    ) {}

    // Gom logic xác thực vào một chỗ, mọi request tái sử dụng
    private authHeaders() {
        return { Authorization: `Bearer ${requireEnv('API_TOKEN')}` };
    }

    async getProducts(): Promise<Product[]> {
        const response = await this.request.get(`${this.baseURL}/products`, {
            headers: this.authHeaders(),
        });

        if (!response.ok()) {
            throw new Error(`[API] GET /products thất bại: ${response.status()}`);
        }
        return response.json();
    }

    async addToCart(productId: number, quantity: number) {
        const response = await this.request.post(`${this.baseURL}/cart/items`, {
            headers: this.authHeaders(),
            data: { productId, quantity },
        });

        if (response.status() !== 201) {
            throw new Error(`[API] POST /cart/items thất bại: ${response.status()}`);
        }
        return response.json();
    }
}
```

**Bước 3 — Đăng ký fixture** trong [src/fixtures/base-test.ts](src/fixtures/base-test.ts), đủ cả 3 chỗ:

```typescript
import { ProductService } from '../services/product.service';   // 1

type MyFixtures = {
    // ...
    productService: ProductService;                              // 2
};

export const test = base.extend<MyFixtures>({
    // ...
    productService: async ({ request }, use) => {                // 3
        await use(new ProductService(request));
    },
});
```

**Bước 4 — Dùng trong test**

```typescript
test('TC01: Lấy danh sách sản phẩm', async ({ productService }) => {
    const products = await productService.getProducts();
    expect(products.length).toBeGreaterThan(0);
});
```

> 💡 **Vì sao `baseURL` là default parameter?** `requireEnv('API_BASE_URL')` chỉ chạy khi service được khởi tạo, tức khi có test thực sự dùng đến nó. Thiếu biến môi trường → fail ngay lúc đó với thông báo rõ ràng, thay vì gửi request đến `undefined/products`. Đồng thời bạn vẫn ghi đè được khi cần: `new ProductService(request, 'http://localhost:3000')`.

> ⚠️ **Verify endpoint trước khi viết code.** Một lệnh `curl` mất 2 giây và cứu bạn khỏi hàng trăm dòng code vô dụng:
> ```bash
> curl -i -H "Authorization: Bearer <token>" https://api.duan-cua-ban.com/products
> ```

---

## 8. Hướng dẫn test Hybrid (API + UI)

### 8.1. Điều kiện tiên quyết

Hybrid chỉ có ý nghĩa khi **API và UI dùng chung một backend**. Lúc đó dữ liệu tạo qua API sẽ hiện lên trên UI.

```
✅ Áp dụng được          ❌ Không áp dụng được
┌──────────────┐         ┌──────────────┐  ┌──────────────┐
│   UI  ←→ API │         │  SauceDemo   │  │JSONPlaceholder│
│      ↓       │         │  (localStorage)│ │  (API riêng) │
│  1 backend   │         └──────────────┘  └──────────────┘
└──────────────┘            hai hệ thống không liên quan
```

➡️ **Không thể làm hybrid giữa SauceDemo và JSONPlaceholder.** Chúng là hai hệ thống rời rạc. Phần dưới là pattern để áp dụng khi bạn có ứng dụng thật.

### 8.2. Vì sao dùng Hybrid

| Việc | Qua UI | Qua API | Nên dùng |
|---|---|---|---|
| Tạo 50 sản phẩm để test phân trang | ~3 phút click | ~2 giây | **API** |
| Kiểm tra nút bị lệch trên mobile | Thấy được | Không thấy | **UI** |
| Xác nhận đơn hàng lưu đúng vào DB | Chỉ thấy chữ "Thành công" | Đọc được data thật | **API** |

**Nguyên tắc:** *Setup bằng API (nhanh) → Thao tác qua UI (kiểm tra trải nghiệm) → Verify bằng cả hai (UI đúng mắt, API đúng dữ liệu).*

### 8.3. Pattern chuẩn

```typescript
// tests/hybrid/checkout.spec.ts   — mẫu, cần backend chung
import { test, expect } from '../../src/fixtures/base-test';

test('TC01: Đặt hàng — setup bằng API, thao tác bằng UI, verify cả hai', async ({
    productService,     // service API của bạn
    orderService,
    standardUserPage,
    cartPage,
    checkoutPage
}) => {

    // 1️⃣ SETUP qua API — nhanh, bỏ qua hàng chục cú click
    await test.step('Chuẩn bị giỏ hàng qua API', async () => {
        const products = await productService.getProducts();
        await productService.addToCart(products[0].id, 2);
    });

    // 2️⃣ THAO TÁC qua UI — đây mới là thứ cần kiểm tra
    await test.step('Hoàn tất thanh toán trên giao diện', async () => {
        await cartPage.viewCart();
        await cartPage.checkout();
        await checkoutPage.fillCheckoutInformation('Nguyen', 'Van A', '70000');
        await checkoutPage.continueCheckout();
        await checkoutPage.finishCheckout();
    });

    // 3️⃣ VERIFY qua UI — người dùng có thấy đúng không?
    await test.step('Kiểm tra giao diện xác nhận', async () => {
        await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });

    // 4️⃣ VERIFY qua API — dữ liệu có lưu đúng không?
    await test.step('Kiểm tra đơn hàng trong hệ thống', async () => {
        const orders = await orderService.getOrders();
        const latest = orders[orders.length - 1];

        expect(latest.status).toBe('completed');
        expect(latest.items[0].quantity).toBe(2);   // ⭐ UI không kiểm được điều này
    });
});
```

Bước 4 là giá trị cốt lõi của hybrid: UI chỉ hiện *"Thank you for your order!"*, nó **không chứng minh** đơn hàng đã lưu đúng số lượng vào database. Chỉ API mới trả lời được.

### 8.4. Vì sao nên bọc `test.step()`

Báo cáo Allure sẽ hiện cây rõ ràng thay vì một khối liền:

```
TC01: Đặt hàng
├── Chuẩn bị giỏ hàng qua API           ✅ 0.4s
├── Hoàn tất thanh toán trên giao diện  ✅ 2.1s
├── Kiểm tra giao diện xác nhận         ✅ 0.2s
└── Kiểm tra đơn hàng trong hệ thống    ❌ 0.3s   ← fail chính xác ở đây
```

### 8.5. So sánh 4 kiểu test

| Kiểu | Tốc độ | Bắt được lỗi gì | Khi nào dùng |
|---|---|---|---|
| **UI thuần** | Chậm | Layout, luồng người dùng, JS lỗi | Kiểm luồng nghiệp vụ chính |
| **API thuần** | Rất nhanh | Logic backend, status code, schema | Kiểm business logic, chạy nhiều case |
| **Hybrid** | Trung bình | Sai lệch giữa hiển thị và dữ liệu | Luồng quan trọng: thanh toán, đăng ký |
| **DDT** | Tuỳ loại | Lỗi ở input biên, nhiều vai trò | Khi cùng luồng nhưng khác dữ liệu |

**Chiến lược đề xuất (kim tự tháp test):**

```
        ▲  Ít  — UI E2E: 3-5 luồng quan trọng nhất
       ███
      █████ — Hybrid: các luồng có tiền/dữ liệu quan trọng
     ███████
    █████████ Nhiều — API: phủ rộng mọi business rule
```

---

## 9. Báo cáo Allure

### Cài Allure CLI

```bash
scoop install allure          # Windows
brew install allure           # macOS
```

### Xem báo cáo

```bash
npm test                  # chạy test → sinh allure-results/
npm run report:serve      # mở báo cáo trên browser
npm run report:generate   # xuất HTML tĩnh ra allure-report/
```

Báo cáo chứa: kết quả pass/fail, **từng bước** từ `test.step()` (nhờ `clickOn`/`typeInto`), screenshot + video khi fail, và trace file.

### Xem trace khi test fail

Trace là công cụ debug mạnh nhất của Playwright — tua lại từng bước kèm DOM snapshot:

```bash
npx playwright show-trace test-results/<tên-thư-mục>/trace.zip
```

---

## 10. Troubleshooting

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `[ENV GUARD] Missing required environment variable: X` | Thiếu biến trong `.env` | Đối chiếu `.env` với `.env.example`, bổ sung biến còn thiếu |
| Giá trị `.env` bị dính liền nhau | File không có newline cuối, bị append vào dòng cuối | Mở `.env` sửa tay, thêm dòng trống cuối file |
| `ENOENT: playwright/.auth/standard_user.json` | Project `setup` chưa chạy | Chạy `npx playwright test --project=setup`, hoặc `npm test` (tự chạy setup trước) |
| `TimeoutError: locator.waitFor` | Selector sai hoặc element chưa hiện | Dùng `npm run test:ui-mode` xem DOM tại thời điểm fail |
| `Property 'xxx' does not exist` | Fixture chưa đăng ký đủ 2 chỗ | Kiểm tra cả `MyFixtures` type lẫn `base.extend()` |
| API trả `404` | Endpoint không tồn tại | `curl -i <url>` verify trước khi viết code |
| `moduleResolution=node10 is deprecated` | Cảnh báo của TypeScript 6 | Không ảnh hưởng Playwright. Sửa bằng `"ignoreDeprecations": "6.0"` trong `tsconfig.json` |

---

## 📐 Quy ước code

Toàn bộ quy ước bắt buộc nằm trong [CLAUDE.md](CLAUDE.md) — file này được Claude Code tự động nạp mỗi phiên làm việc.

**Ba điều quan trọng nhất:**

1. **Đọc page object trước khi viết test** — tên method không đoán được.
2. **Không gọi `locator.click()` trực tiếp** — dùng `clickOn()` / `typeInto()` để có `test.step()`.
3. **Verify endpoint bằng `curl` trước khi viết API code** — đừng giả định API tồn tại.

---

## 📚 Tài liệu tham khảo

- [Playwright Docs](https://playwright.dev/) · [API Testing](https://playwright.dev/docs/api-testing) · [Fixtures](https://playwright.dev/docs/test-fixtures) · [Best Practices](https://playwright.dev/docs/best-practices)
- [SauceDemo](https://www.saucedemo.com) — ứng dụng đang test
- [JSONPlaceholder](https://jsonplaceholder.typicode.com) — API công khai để thực hành

---

**License:** ISC · **Tác giả:** Swagger
