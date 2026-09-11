import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

export class ProjectsPage extends AppShellPage {
  readonly path = '/projects'

  title(): Locator {
    return this.heading(/projects/i)
  }

  newProjectButton(): Locator {
    return this.button(/new project|\+ new project/i)
  }

  createProjectButton(): Locator {
    return this.button(/^create project$/i)
  }

  cancelButton(): Locator {
    return this.button(/^cancel$/i)
  }

  projectNameInput(): Locator {
    return this.page.getByPlaceholder(/project name|enter project name/i).first()
  }

  emptyState(): Locator {
    return this.page.getByText(/no projects yet/i).first()
  }

  emptyStateHint(): Locator {
    return this.page.getByText(/create your first project/i).first()
  }

  nameRequiredError(): Locator {
    return this.page.getByText(/project name is required/i).first()
  }

  projectCard(name?: string | RegExp): Locator {
    if (name) return this.page.getByText(name).first()
    return this.page.locator('[class*="rounded-2xl"]').filter({ hasText: /.+/ }).first()
  }

  searchInput(): Locator {
    return this.page.getByPlaceholder(/search project/i).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
  }

  async openCreateModal() {
    await this.newProjectButton().click()
    await this.expectVisible(this.createProjectButton())
  }

  async cancelCreate() {
    await this.cancelButton().click()
  }

  async expectEmptyOrList() {
    const empty = this.emptyState()
    const hasEmpty = await empty.isVisible().catch(() => false)
    if (!hasEmpty) {
      await expect(this.title()).toBeVisible()
    }
  }

  async expectEmptyMessaging() {
    await expect(this.emptyState()).toBeVisible()
    await expect(this.emptyStateHint()).toBeVisible()
  }

  descriptionInput(): Locator {
    return this.page.getByPlaceholder(/project description/i).first()
  }

  platformSelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /ASIC|Select Platform/i }) }).first()
  }

  edaSelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /Synopsys|Select EDA/i }) }).first()
  }

  typeSelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /TapeOut|Select Type/i }) }).first()
  }

  async openFirstProjectIfPresent() {
    const card = this.page.getByText(/E2E Project Alpha|E2E Project/i).first()
    if (await card.isVisible().catch(() => false)) {
      await card.click()
      return true
    }
    return false
  }

  async fillMinimalCreate(name: string) {
    await this.projectNameInput().fill(name)
    await this.descriptionInput().fill('Automation description').catch(() => undefined)
    const platform = this.platformSelect()
    if (await platform.isVisible().catch(() => false)) {
      await platform.selectOption({ index: 1 }).catch(async () => {
        await platform.selectOption('ASIC').catch(() => undefined)
      })
    }
    const eda = this.edaSelect()
    if (await eda.isVisible().catch(() => false)) {
      await eda.selectOption({ index: 1 }).catch(async () => {
        await eda.selectOption('Synopsys').catch(() => undefined)
      })
    }
    const type = this.typeSelect()
    if (await type.isVisible().catch(() => false)) {
      await type.selectOption({ index: 1 }).catch(async () => {
        await type.selectOption('TapeOut').catch(() => undefined)
      })
    }
  }

  async submitCreate() {
    await this.createProjectButton().click()
  }
}
