import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://hotel.testplanisphere.dev',
    headless: true,
    screenshot: 'only-on-failure'
  },
  reporter: [
    ['list'],
    ['allure-playwright']
  ],
  testDir: './tests',
  timeout: 30000
});