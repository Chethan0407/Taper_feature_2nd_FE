/**
 * TapeoutOps Automation Framework — public entry.
 *
 * Layers:
 *   config  → env, timeouts, tags, users
 *   core    → BasePage, waits
 *   data    → BVA/ECP, seeds, route matrices
 *   helpers → API mock / auth / network faults
 *   pages   → Page Object Model
 *   fixtures→ Playwright test + page fixtures
 *   specs   → test cases
 *   reporters → Allure metadata
 */
export * from './config'
export * from './core'
export * from './data'
export * from './helpers'
export { allureReporterConfig, allureEnvironmentInfo } from './reporters/allure'
