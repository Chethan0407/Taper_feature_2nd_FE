import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

export class DashboardPage extends AppShellPage {
  readonly path = '/dashboard'

  title(): Locator {
    return this.heading(/workspace|dashboard|tapeout program/i)
  }

  openProjects(): Locator {
    return this.button(/open projects/i)
  }

  viewStats(): Locator {
    return this.button(/view stats/i)
  }

  /** @deprecated use openProjects */
  getStarted(): Locator {
    return this.openProjects()
  }

  entryCard(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name }).first()
  }

  trySpecLint(): Locator {
    return this.page.getByRole('button', { name: /run speclint/i }).first()
  }

  createChecklist(): Locator {
    return this.page.getByRole('button', { name: /open checklists/i }).first()
  }

  browseSpecsEntry(): Locator {
    return this.page.getByRole('button', { name: /browse specs/i }).first()
  }

  openStatsEntry(): Locator {
    return this.page.getByRole('button', { name: /open stats/i }).first()
  }

  /** Stats KPIs must not appear on the entry Dashboard. */
  async expectNoLiveKpis() {
    await expect(this.page.getByRole('heading', { name: /^stats$/i, level: 1 })).toHaveCount(0)
    await expect(this.page.getByText(/^approved$/i)).toHaveCount(0)
    await expect(this.page.getByText(/^live$/i)).toHaveCount(0)
  }

  emptyOrZeroHint(): Locator {
    return this.page
      .getByText(/no |0 |get started|create your first|nothing yet|start from here/i)
      .first()
  }

  adminNotice(): Locator {
    return this.page.getByText(/system usage is (admin|superuser)-only/i).first()
  }

  dismissNotice(): Locator {
    return this.button(/dismiss/i)
  }

  async expectLoaded() {
    await this.waitForUrl(/\/dashboard/)
    await this.expectVisible(this.title())
  }

  async expectPrimaryCtas() {
    await this.expectVisible(this.openProjects())
    const stats = await this.viewStats().isVisible().catch(() => false)
    const speclint = await this.trySpecLint().isVisible().catch(() => false)
    const checklist = await this.createChecklist().isVisible().catch(() => false)
    expect(stats || speclint || checklist).toBeTruthy()
  }

  async goToChecklistsViaCta() {
    await this.createChecklist().click()
    await this.page.waitForURL(/\/checklists/)
  }
}
