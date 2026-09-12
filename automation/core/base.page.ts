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

  /** Navigate to this page path (+ optional query). */
  async goto(query = '') {
    await this.page.goto(`${this.path}${query}`)
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
