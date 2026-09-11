import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
import os from 'node:os'

/**
 * Frontend automation (Playwright) for TapeoutOps — same repo.
 * Specs live under ./automation/specs
 *
 * Suites (grep tags):
 *   @sanity | @regression | @integration | @critical | @bva | @ecp | @roles | @network
 *
 * Reports:
 * - Allure (primary) → npm run test:automation:report
 * - Playwright HTML → playwright-report/
 */
const allureReporter: [string, Record<string, unknown>] = [
  'allure-playwright',
  {
    resultsDir: 'allure-results',
    detail: true,
    suiteTitle: true,
    environmentInfo: {
      os_platform: os.platform(),
      os_release: os.release(),
      node_version: process.version,
      app: 'TapeoutOps Frontend',
      layer: 'UI automation',
    },
  },
]

/** Prefer static preview when dist/ exists — more stable than long vite-dev runs. */
const usePreview = !!process.env.CI || existsSync('dist')

export default defineConfig({
  testDir: './automation/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 45_000,
  reporter: process.env.CI
    ? [
        ['github'],
        ['list'],
        allureReporter,
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'playwright-report/junit.xml' }],
      ]
    : [['list'], allureReporter, ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5177',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: usePreview
      ? 'npm run preview -- --host 127.0.0.1 --port 5177'
      : 'npx vite --host 127.0.0.1 --port 5177 --strictPort',
    url: 'http://127.0.0.1:5177',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
