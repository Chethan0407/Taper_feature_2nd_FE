import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
import { Env, Timeouts, Paths } from './automation/config'
import { allureReporterConfig } from './automation/reporters/allure'

/**
 * TapeoutOps Automation Framework — Playwright runner config.
 *
 * Specs: ./automation/specs
 * Tags:  @sanity | @regression | @integration | @critical | @bva | @ecp | @roles | @network
 * Reports: Allure (primary) — never commit report folders to git
 */
const usePreview = Env.isCi || existsSync('dist')

export default defineConfig({
  testDir: './automation/specs',
  fullyParallel: true,
  forbidOnly: Env.isCi,
  retries: Env.isCi ? 2 : 1,
  workers: 1,
  timeout: Timeouts.test,
  reporter: Env.isCi
    ? [
        ['github'],
        ['list'],
        allureReporterConfig(),
        ['html', { open: 'never', outputFolder: Paths.playwrightReport }],
        ['junit', { outputFile: `${Paths.playwrightReport}/junit.xml` }],
      ]
    : [['list'], allureReporterConfig(), ['html', { open: 'never', outputFolder: Paths.playwrightReport }]],
  use: {
    baseURL: Env.baseURL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: Timeouts.assert,
    navigationTimeout: Timeouts.navigation,
  },
  outputDir: Paths.results,
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
    url: Env.baseURL,
    reuseExistingServer: !Env.isCi,
    timeout: Timeouts.webServer,
  },
})
