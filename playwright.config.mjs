import { defineConfig } from '@playwright/test'

const baseURL = process.env.DSH_E2E_URL || 'http://127.0.0.1:43180'

export default defineConfig({
  testDir: './test/e2e',
  timeout: 60_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]] : 'list',
  outputDir: 'test-results/e2e',
  use: {
    baseURL,
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
})
