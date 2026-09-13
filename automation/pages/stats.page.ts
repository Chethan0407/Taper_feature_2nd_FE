import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

export class StatsPage extends AppShellPage {
  readonly path = '/stats'

  title(): Locator {
    return this.heading(/^stats$/i)
  }

  liveBadge(): Locator {
    return this.page.getByText(/^live$/i).first()
  }

  approvedKpi(): Locator {
    return this.page.getByRole('button', { name: /approved/i }).first()
  }

  pendingKpi(): Locator {
    return this.page.getByRole('button', { name: /pending/i }).first()
  }

  rejectedKpi(): Locator {
    return this.page.getByRole('button', { name: /rejected/i }).first()
  }

  vendorsKpi(): Locator {
    return this.page.getByRole('button', { name: /vendors/i }).first()
  }

  qualityKpi(): Locator {
    return this.page.getByText(/^quality$/i).first()
  }

  browseSpecsHeading(): Locator {
    return this.heading(/browse specs/i)
  }

  matchingSpecsHeading(): Locator {
    return this.heading(/matching specifications/i)
  }

  platformFilter(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name }).first()
  }

  statusFilter(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name }).filter({ hasText: name }).first()
  }

  clearFilters(): Locator {
    return this.page.getByRole('button', { name: /clear filters/i })
  }

  openProjects(): Locator {
    return this.button(/open projects/i)
  }

  runSpecLint(): Locator {
    return this.button(/run speclint/i)
  }

  quickLink(label: string | RegExp): Locator {
    return this.page.getByRole('link', { name: label }).first()
  }

  viewAllSpecs(): Locator {
    return this.page.getByRole('link', { name: /view all/i }).first()
  }

  async expectLoaded() {
    await this.waitForUrl(/\/stats/)
    await this.expectVisible(this.title())
  }

  async expectKpis() {
    await expect(this.page.getByText(/^approved$/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(this.page.getByText(/^pending$/i).first()).toBeVisible()
    await expect(this.page.getByText(/^rejected$/i).first()).toBeVisible()
    await expect(this.page.getByText(/^vendors$/i).first()).toBeVisible()
    await expect(this.page.getByText(/^quality$/i).first()).toBeVisible()
  }

  async expectBrowseAndTable() {
    await expect(this.browseSpecsHeading()).toBeVisible({ timeout: 15_000 })
    await expect(this.matchingSpecsHeading()).toBeVisible()
  }
}
