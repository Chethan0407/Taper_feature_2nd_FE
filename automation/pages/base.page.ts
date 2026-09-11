import { type Locator, type Page, expect } from '@playwright/test'

/**
 * Base Page Object — all pages extend this.
 */
export abstract class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  abstract readonly path: string

  async goto(query = '') {
    await this.page.goto(`${this.path}${query}`)
  }

  async waitForUrl(pattern?: RegExp | string) {
    await this.page.waitForURL(pattern ?? new RegExp(this.path.replace(/\//g, '\\/')))
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

  async expectVisible(locator: Locator, timeout = 15_000) {
    await expect(locator).toBeVisible({ timeout })
  }
}
