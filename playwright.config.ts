import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // Chạy song song tất cả các test để tối ưu thời gian
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // Chạy lại 2 lần nếu fail trên CI
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['line'],
    ['allure-playwright', { outputFolder: 'allure-results' }] // Cấu hình Allure
  ],
  use: {
    baseURL: 'https://www.saucedemo.com', // Base URL cho dự án thực hành SauceDemo
    trace: 'retain-on-failure',           // Giữ lại trace log khi test fail
    screenshot: 'only-on-failure',           // Chụp ảnh khi lỗi
    video: 'retain-on-failure',           // Quay video khi lỗi
    headless: true,                      // Chạy trình duyệt ở chế độ headless để tăng tốc độ
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/, // Chỉ chạy các file có đuôi .setup.ts
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    }
  ],
});