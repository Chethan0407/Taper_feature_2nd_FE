import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

export class DashboardPage extends AppShellPage {
  readonly path = '/dashboard'

  title(): Locator {
    return this.heading(/streamline|dashboard|tapeout/i)
  }

  getStarted(): Locator {
    return this.page.getByText(/get started/i).first()
  }

  trySpecLint(): Locator {
    return this.page.getByText(/try speclint/i).first()
  }

  createChecklist(): Locator {
    return this.page.getByText(/create checklist/i).first()
  }

  emptyOrZeroHint(): Locator {
    return this.page
      .getByText(/no |0 |get started|create your first|nothing yet/i)
      .first()
  }

  adminNotice(): Locator {
    return this.page.getByText(/system usage is admin-only/i).first()
  }

  dismissNotice(): Locator {
    return this.button(/dismiss/i)
  }

  async expectLoaded() {
    await this.waitForUrl(/\/dashboard/)
    await this.expectVisible(this.title())
  }

  async expectPrimaryCtas() {
    await this.expectVisible(this.getStarted())
    const speclint = await this.trySpecLint().isVisible().catch(() => false)
    const checklist = await this.createChecklist().isVisible().catch(() => false)
    expect(speclint || checklist).toBeTruthy()
  }

  async goToChecklistsViaCta() {
    await this.createChecklist().click()
    await this.page.waitForURL(/\/checklists/)
  }
}
