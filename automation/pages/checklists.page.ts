import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

export class ChecklistsPage extends AppShellPage {
  readonly path = '/checklists'

  title(): Locator {
    return this.heading(/checklist/i)
  }

  templatesSection(): Locator {
    return this.page.getByText(/checklist templates|templates/i).first()
  }

  activeSection(): Locator {
    return this.page.getByText(/active checklists/i).first()
  }

  createTemplateButton(): Locator {
    return this.button(/create template/i)
  }

  createModalHeading(): Locator {
    return this.heading(/create.*template/i).or(this.page.getByText(/template name/i)).first()
  }

  templateNameInput(): Locator {
    return this.page.getByPlaceholder(/^Template Name$/i).first()
  }

  addItemButton(): Locator {
    return this.button(/add item/i)
  }

  cancelButton(): Locator {
    return this.page.locator('.fixed.inset-0').getByRole('button', { name: /^cancel$/i }).first()
  }

  submitCreate(): Locator {
    // Scope to modal — page header also has "Create Template"
    return this.page.locator('.fixed.inset-0').getByRole('button', { name: /^create template$/i })
  }

  emptyTemplates(): Locator {
    return this.page.getByText(/no templates yet|no templates found/i).first()
  }

  emptyActive(): Locator {
    return this.page.getByText(/no active checklists/i).first()
  }

  useTemplateButton(): Locator {
    return this.page.getByTestId('use-template-btn').first()
  }

  useButtons(): Locator {
    return this.page.getByTestId('use-template-btn')
  }

  templatesList(): Locator {
    return this.page.locator('text=Checklist Templates').locator('xpath=ancestor::div[contains(@class,"module-panel")]').first()
  }

  activeListPanel(): Locator {
    return this.page.locator('text=Active Checklists').locator('xpath=ancestor::div[contains(@class,"module-panel")]').first()
  }

  approveButton(): Locator {
    return this.page.getByRole('button', { name: /^approve$/i }).first()
  }

  approvedBadge(): Locator {
    return this.page.getByText(/^Approved$/i).first()
  }

  loadingTemplates(): Locator {
    return this.page.getByText(/loading templates/i)
  }

  loadingActive(): Locator {
    return this.page.getByText(/loading active checklists/i)
  }

  toastSuccess(): Locator {
    return this.page.locator('.fixed.top-6').filter({ hasText: /instantiated|approved|created/i }).first()
  }

  deleteTemplateButton(): Locator {
    return this.page.getByTitle(/delete template/i).first()
  }

  deleteConfirmHeading(): Locator {
    return this.heading(/delete template/i)
  }

  deleteConfirmCancel(): Locator {
    return this.page
      .locator('.fixed.inset-0')
      .getByRole('button', { name: /^cancel$/i })
      .first()
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
    await this.expectVisible(this.templatesSection())
  }

  async openCreateTemplateModal() {
    await this.createTemplateButton().click()
    await this.expectVisible(this.createModalHeading())
  }

  async cancelCreate() {
    await this.cancelButton().click()
  }

  async submitEmptyTemplate() {
    await this.submitCreate().click()
  }

  async expectEmptyStates() {
    await expect(this.templatesSection()).toBeVisible()
    await expect(this.activeSection()).toBeVisible()
    const empty = await this.emptyTemplates().isVisible().catch(() => false)
    if (empty) await expect(this.emptyTemplates()).toBeVisible()
  }

  itemTitleInput(): Locator {
    return this.page.getByPlaceholder(/item title/i).first()
  }

  descriptionInput(): Locator {
    return this.page.getByPlaceholder(/^Description$/i).first()
  }

  templateCard(name: string | RegExp): Locator {
    return this.page.getByText(name).first()
  }

  activeCard(name: string | RegExp): Locator {
    return this.page.getByText(name).first()
  }

  deleteConfirmButton(): Locator {
    return this.page
      .locator('.fixed.inset-0')
      .getByRole('button', { name: /^delete$/i })
      .first()
  }

  async openDeleteThenCancel() {
    const del = this.deleteTemplateButton()
    if (!(await del.isVisible().catch(() => false))) return false
    await del.click()
    await this.expectVisible(this.deleteConfirmHeading())
    await this.deleteConfirmCancel().click()
    await expect(this.deleteConfirmHeading()).toBeHidden({ timeout: 10_000 })
    return true
  }

  async fillTemplateAndAddItem(name: string, itemTitle: string) {
    await this.templateNameInput().fill(name)
    await this.descriptionInput().fill('Automation template').catch(() => undefined)
    await this.addItemButton().click()
    await this.itemTitleInput().fill(itemTitle)
  }

  async submitTemplate() {
    await this.submitCreate().click()
  }

  async useFirstTemplate() {
    const btn = this.useTemplateButton()
    await expect(btn).toBeVisible({ timeout: 15_000 })
    await btn.click()
  }

  async approveFirstPending() {
    const btn = this.approveButton()
    await expect(btn).toBeVisible({ timeout: 15_000 })
    await btn.click()
  }

  async expectNoFullListLoadingFlash(ms = 800) {
    // After an action, full-panel loaders should not appear while list content exists
    await this.page.waitForTimeout(ms)
    const templatesLoading = await this.loadingTemplates().isVisible().catch(() => false)
    const activeLoading = await this.loadingActive().isVisible().catch(() => false)
    expect(templatesLoading).toBeFalsy()
    expect(activeLoading).toBeFalsy()
  }
}
