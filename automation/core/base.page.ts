import { type Locator, type Page, expect } from '@playwright/test'
import { Timeouts } from '../config'

/**
 * Framework core — Base Page Object.
 * All feature pages extend this (or AppShellPage).
 */
export abstract class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  abstract readonly path: string

  /** Navigate to this page path (+ optional query). Retries once on transient webServer drops. */
  async goto(query = '') {
    const url = `${this.path}${query}`
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.page.goto(url)
        return
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const transient = /ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|NS_ERROR_CONNECTION_REFUSED/i.test(msg)
        if (!transient || attempt === 2) throw err
        await this.page.waitForTimeout(750 * (attempt + 1))
      }
    }
  }

  async waitForUrl(pattern?: RegExp | string) {
    await this.page.waitForURL(pattern ?? new RegExp(this.path.replace(/\//g, '\\/')), {
      timeout: Timeouts.navigation,
    })
  }

  heading(name: string | RegExp): Locator {
    return this.page.getByRole('heading', { name }).first()
  }

  button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name }).first()
  }

  link(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name }).first()
  }

  text(pattern: string | RegExp): Locator {
    return this.page.getByText(pattern).first()
  }

  async expectVisible(locator: Locator, timeout = Timeouts.assert) {
    await expect(locator).toBeVisible({ timeout })
  }

  async expectHidden(locator: Locator, timeout = Timeouts.assert) {
    await expect(locator).toBeHidden({ timeout })
  }

  async expectUrl(pattern: RegExp, timeout = Timeouts.navigation) {
    await expect(this.page).toHaveURL(pattern, { timeout })
  }

  /** Soft visibility — returns boolean, does not fail the test. */
  async isVisible(locator: Locator, timeout = Timeouts.soft): Promise<boolean> {
    return locator.isVisible({ timeout }).catch(() => false)
  }

  async clickIfVisible(locator: Locator, timeout = Timeouts.soft): Promise<boolean> {
    if (await this.isVisible(locator, timeout)) {
      await locator.click()
      return true
    }
    return false
  }
}

/**
 * Reusable UI fragment (sidebar, header, modal shell).
 * Prefer composition over giant page classes.
 */
export abstract class BaseComponent {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name }).first()
  }

  link(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name }).first()
  }
}
