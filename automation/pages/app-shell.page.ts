import { type Locator, type Page } from '@playwright/test'
import { BasePage } from './base.page'

/** Shared left sidebar navigation. */
export class SidebarComponent {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  navLink(name: string | RegExp): Locator {
    return this.page.locator('nav').getByRole('link', { name }).first()
  }

  logoutButton(): Locator {
    return this.page.getByTitle(/logout/i).first()
  }

  async goTo(name: string | RegExp) {
    const link = this.navLink(name)
    await link.scrollIntoViewIfNeeded()
    await link.click()
  }
}

/** Shared top header. */
export class HeaderComponent {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  smartSuggestionsButton(): Locator {
    return this.page.getByTitle(/smart suggestions/i).first()
  }

  searchInput(): Locator {
    return this.page.getByPlaceholder(/search companies/i).first()
  }
}

/** Authenticated shell: sidebar + header helpers. */
export abstract class AppShellPage extends BasePage {
  readonly sidebar: SidebarComponent
  readonly header: HeaderComponent

  constructor(page: Page) {
    super(page)
    this.sidebar = new SidebarComponent(page)
    this.header = new HeaderComponent(page)
  }
}
