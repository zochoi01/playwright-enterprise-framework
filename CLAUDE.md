# CLAUDE.md

Framework test tự động bằng Playwright + TypeScript cho [SauceDemo](https://www.saucedemo.com).

**Chỉ test UI.** SauceDemo không có REST API (`/api/*` trả 404) — đừng viết API test cho site này.

## Chạy test

```bash
npm test                  # toàn bộ suite (7 test, chromium, headless)
npm run test:headed       # xem browser chạy
npm run test:debug        # Playwright Inspector
npm run report:serve      # Allure report
```

`auth.setup.ts` chạy trước qua project `setup` (dependency của project `chromium`), lưu storage state vào `playwright/.auth/*.json`.

## Cấu trúc

```
src/pages/       Page Object, kế thừa BasePage
src/fixtures/    base-test.ts — nơi khai báo mọi fixture
src/data/        *.json (test data) + auth.constants.ts (đường dẫn storage state)
src/utils/env.ts requireEnv() — đọc biến môi trường, throw nếu thiếu
tests/           *.spec.ts + auth.setup.ts
```

## Quy ước bắt buộc

**Trước khi viết test mới, ĐỌC page object liên quan.** Đừng suy đoán tên method — repo này dùng tên tiếng Việt hoá không đoán được (`viewCart`, `fillCheckoutInformation`, `continueCheckout`, `finishCheckout`).

**Page Object**
- Kế thừa `BasePage`, khởi tạo locator trong constructor.
- Selector ưu tiên `[data-test="..."]`.
- Locator để `private readonly`. Chỉ để `readonly` (public) khi test cần assert trực tiếp lên nó — ví dụ `titleHeader`, `errorMessage`, `completeHeader`.
- **Không gọi `locator.click()` / `.fill()` trực tiếp.** Dùng `this.clickOn(locator, 'Tên tiếng Việt')` và `this.typeInto(locator, text, 'Tên tiếng Việt')` từ `BasePage` — hai hàm này bọc `test.step()` để Allure có báo cáo từng bước.

**Fixture**
- Page object mới phải thêm vào cả type `MyFixtures` lẫn `base.extend()` trong [src/fixtures/base-test.ts](src/fixtures/base-test.ts).
- `standardUserPage` / `problemUserPage` trả về `InventoryPage` đã nạp sẵn cookie, dùng khi muốn bỏ qua bước login.

**Test**
- Import fixture bằng đường dẫn tương đối: `from '../../src/fixtures/base-test'`. Alias `@pages`/`@fixtures` chỉ dùng bên trong `src/`.
- Assert trên locator được expose: `await expect(page.titleHeader).toHaveText('Products')`. Không viết helper trả boolean kiểu `isOrderSuccess()`.
- Tiêu đề test, comment, log message viết tiếng Việt. Log có prefix: `[AUTH SETUP]`, `[AUTH TEST]`, `[ENV GUARD]`.

**Credentials**
- Không hardcode. Dùng `requireEnv('TÊN_BIẾN')` và `import 'dotenv/config'` ở đầu file.
- Key hiện có trong `.env`: `STANDARD_USER_USERNAME`, `PROBLEM_USER_USERNAME`, `LOCKED_OUT_USER_USERNAME`, `LOGIN_PASSWORD`.
- Thêm user mới → thêm key vào `.env` **và** báo cho người dùng biết, vì `.env` không nằm trong git.

**Data-Driven Test**
Pattern đã có sẵn: file JSON trong `src/data/` + vòng `for` bọc `test()`. Xem [tests/login-data-driven.spec.ts](tests/login-data-driven.spec.ts) và [src/data/users-data.json](src/data/users-data.json). Đừng tạo file `.ts` chứa mảng data — repo dùng JSON.

## Lưu ý

- `.env` không có newline ở cuối file → dùng Write/Edit tool, đừng `Add-Content`.
- `playwright.config.ts` chỉ bật project `chromium`. Muốn thêm browser thì thêm project và nhớ khai `dependencies: ['setup']`.
