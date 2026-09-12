/**
 * TapeoutOps Automation Framework — central configuration.
 * Specs never hardcode env/timeouts; import from here.
 */
export const Framework = {
  name: 'TapeoutOps UI Automation Framework',
  version: '1.0.0',
  app: 'TapeoutOps Frontend',
  layer: 'UI',
} as const

export const Env = {
  isCi: !!process.env.CI,
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5177',
  apiBase: process.env.PLAYWRIGHT_API_BASE || 'http://127.0.0.1:8000',
  headed: process.env.HEADED === '1' || process.env.HEADED === 'true',
} as const

export const Timeouts = {
  /** Default Playwright test timeout */
  test: 45_000,
  /** expect() / visibility */
  assert: 15_000,
  /** Navigation / URL settle */
  navigation: 15_000,
  /** WebServer boot */
  webServer: 180_000,
  /** Short poll for optional UI */
  soft: 5_000,
} as const

/** Suite tags — use with --grep or test({ tag }) */
export const Tags = {
  sanity: '@sanity',
  smoke: '@smoke',
  regression: '@regression',
  integration: '@integration',
  critical: '@critical',
  bva: '@bva',
  ecp: '@ecp',
  roles: '@roles',
  network: '@network',
} as const

export const Paths = {
  results: 'test-results',
  allureResults: 'allure-results',
  allureReport: 'allure-report',
  playwrightReport: 'playwright-report',
} as const

export const Users = {
  admin: {
    id: 1,
    email: 'e2e@tapeoutops.com',
    full_name: 'E2E Tester',
    name: 'E2E Tester',
    role: 'admin',
    is_active: true,
    is_admin: true,
    is_superuser: true,
  },
  engineer: {
    id: 2,
    email: 'engineer@tapeoutops.com',
    full_name: 'E2E Engineer',
    name: 'E2E Engineer',
    role: 'engineer',
    is_active: true,
    is_admin: false,
    is_superuser: false,
  },
} as const

export type FrameworkUser = (typeof Users)[keyof typeof Users]
