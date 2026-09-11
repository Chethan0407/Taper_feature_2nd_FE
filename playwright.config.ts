import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E for TapeoutOps frontend (same repo).
 * Base URL defaults to the Vite dev server on :5177.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5177',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // CI: preview the production build (workflow runs `npm run build` first).
    // Local: Vite dev server for faster feedback.
    command: process.env.CI
      ? 'npm run preview -- --host 127.0.0.1 --port 5177'
      : 'npx vite --host 127.0.0.1 --port 5177',
    url: 'http://127.0.0.1:5177',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
