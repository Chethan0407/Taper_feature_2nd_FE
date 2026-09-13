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
  /** When true, project live E2E uses real API + PLAYWRIGHT_EMAIL / PLAYWRIGHT_PASSWORD */
  live: process.env.PLAYWRIGHT_LIVE === '1' || process.env.PLAYWRIGHT_LIVE === 'true',
  liveEmail: process.env.PLAYWRIGHT_EMAIL || '',
  livePassword: process.env.PLAYWRIGHT_PASSWORD || '',
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
  /** Data-driven tables (same-domain visibility, etc.) */
  ddt: '@ddt',
  datadriven: '@datadriven',
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
    company_id: 1,
    domain: 'tapeoutops.com',
  },
  /** Same domain as admin — should see company-shared data */
  peer: {
    id: 3,
    email: 'peer@tapeoutops.com',
    full_name: 'Domain Peer',
    name: 'Domain Peer',
    role: 'engineer',
    is_active: true,
    is_admin: false,
    is_superuser: false,
    company_id: 1,
    domain: 'tapeoutops.com',
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
    company_id: 1,
    domain: 'tapeoutops.com',
  },
  /** Different domain — must NOT see tapeoutops company data */
  outsider: {
    id: 9,
    email: 'outsider@othercorp.com',
    full_name: 'Other Corp User',
    name: 'Other Corp User',
    role: 'engineer',
    is_active: true,
    is_admin: false,
    is_superuser: false,
    company_id: 99,
    domain: 'othercorp.com',
  },
} as const

export type FrameworkUser = (typeof Users)[keyof typeof Users]
