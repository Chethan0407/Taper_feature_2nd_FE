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
    await this.expectVisible(this.projectNameInput())
    await this.createProjectButton().scrollIntoViewIfNeeded()
    await this.expectVisible(this.createProjectButton())
  }

  async cancelCreate() {
    const cancel = this.cancelButton()
    await cancel.scrollIntoViewIfNeeded()
    await cancel.click({ force: true })
  }

  async submitCreate() {
    const btn = this.createProjectButton()
    await btn.scrollIntoViewIfNeeded()
    await btn.click({ force: true })
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
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /ASIC|TSMC|Select Platform/i }) }).first()
  }

  edaSelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /Synopsys|Calibre|Select EDA/i }) }).first()
  }

  typeSelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /TapeOut|DRC|Select Type/i }) }).first()
  }

  async openFirstProjectIfPresent() {
    const card = this.page.getByText(/E2E Project Alpha|E2E Project/i).first()
    if (await card.isVisible().catch(() => false)) {
      await card.click()
      return true
    }
    return false
  }

  foundrySelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /Select foundry|TSMC|Samsung/i }) }).first()
  }

  processNodeSelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /Select node|N3|N5|N7/i }) }).first()
  }

  tapeoutStatusSelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /Select status|planning|in_progress|frozen/i }) }).first()
  }

  pdkVersionInput(): Locator {
    return this.page.getByPlaceholder(/e\.g\. 1\.2\.3/i).first()
  }

  edaToolVersionInput(): Locator {
    return this.page.getByPlaceholder(/e\.g\. 2024\.1/i).first()
  }

  targetTapeoutDateInput(): Locator {
    return this.page.locator('input[type="date"]').first()
  }

  /** Pick first real option (index 1+) on a select if visible. */
  async selectFirstOption(select: Locator) {
    if (!(await select.isVisible().catch(() => false))) return
    const count = await select.locator('option').count()
    if (count > 1) {
      await select.selectOption({ index: 1 }).catch(() => undefined)
    }
  }

  /** Fill every create-form field / dropdown so the headed run exercises all options. */
  async fillFullCreate(name: string) {
    await this.projectNameInput().fill(name)
    await this.descriptionInput().fill('Automation full-field project').catch(() => undefined)

    await this.selectFirstOption(this.platformSelect())
    await this.selectFirstOption(this.edaSelect())
    await this.selectFirstOption(this.typeSelect())
    await this.selectCompany()

    // Tapeout profile block
    await this.selectFirstOption(this.foundrySelect())
    await this.selectFirstOption(this.processNodeSelect())
    if (await this.pdkVersionInput().isVisible().catch(() => false)) {
      await this.pdkVersionInput().fill('1.2.3')
    }
    if (await this.edaToolVersionInput().isVisible().catch(() => false)) {
      await this.edaToolVersionInput().fill('2024.1')
    }
    if (await this.targetTapeoutDateInput().isVisible().catch(() => false)) {
      await this.targetTapeoutDateInput().fill('2026-12-15')
    }
    await this.selectFirstOption(this.tapeoutStatusSelect())
  }

  async fillMinimalCreate(name: string) {
    await this.fillFullCreate(name)
  }

  companySelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /Select Company|E2E Tapeout|company|UAe/i }) }).first()
  }

  async selectCompany(label?: string | RegExp) {
    const select = this.companySelect()
    await expect(select).toBeVisible({ timeout: 15_000 })
    // Wait until at least one real company option exists
    await expect
      .poll(async () => select.locator('option').count(), { timeout: 15_000 })
      .toBeGreaterThan(1)
    if (label) {
      await select.selectOption({ label }).catch(async () => {
        await select.selectOption({ index: 1 })
      })
    } else {
      await select.selectOption({ index: 1 })
    }
  }

  projectCardByName(name: string | RegExp): Locator {
    return this.page.locator('.group, [class*="rounded-2xl"]').filter({ hasText: name }).first()
  }

  editButtonFor(name: string | RegExp): Locator {
    return this.projectCardByName(name).getByTitle('Edit Project')
  }

  deleteButtonFor(name: string | RegExp): Locator {
    return this.projectCardByName(name).getByTitle('Delete Project')
  }

  editModalHeading(): Locator {
    return this.heading(/edit project/i)
  }

  updateProjectButton(): Locator {
    return this.button(/^update project$/i)
  }

  async openEditFor(name: string | RegExp) {
    const card = this.projectCardByName(name)
    await card.hover()
    await this.editButtonFor(name).click({ force: true })
    await expect(this.editModalHeading()).toBeVisible({ timeout: 10_000 })
  }

  /** Fill every edit-form select + tapeout fields, then rename and save. */
  async editNameAndSave(newName: string) {
    const nameInput = this.page.getByPlaceholder(/project name|enter project name/i).first()
    await nameInput.fill(newName)

    await this.selectFirstOption(this.platformSelect())
    await this.selectFirstOption(this.edaSelect())
    await this.selectFirstOption(this.typeSelect())
    await this.selectFirstOption(this.companySelect())
    await this.selectFirstOption(this.foundrySelect())
    await this.selectFirstOption(this.processNodeSelect())
    if (await this.pdkVersionInput().isVisible().catch(() => false)) {
      await this.pdkVersionInput().fill('1.3.0')
    }
    if (await this.edaToolVersionInput().isVisible().catch(() => false)) {
      await this.edaToolVersionInput().fill('2025.1')
    }
    if (await this.targetTapeoutDateInput().isVisible().catch(() => false)) {
      await this.targetTapeoutDateInput().fill('2027-03-01')
    }
    await this.selectFirstOption(this.tapeoutStatusSelect())

    await this.updateProjectButton().click()
    await expect(this.editModalHeading()).toBeHidden({ timeout: 20_000 })
  }

  async deleteProjectNamed(name: string | RegExp) {
    this.page.once('dialog', (d) => d.accept())
    const card = this.projectCardByName(name)
    await card.hover()
    await this.deleteButtonFor(name).click({ force: true })
  }
}
