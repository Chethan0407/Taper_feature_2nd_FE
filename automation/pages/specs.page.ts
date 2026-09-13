import { type Locator, expect } from '@playwright/test'
import path from 'node:path'
import { AppShellPage } from './app-shell.page'

export class SpecsPage extends AppShellPage {
  readonly path = '/specs'

  title(): Locator {
    return this.heading(/specification/i)
  }

  createButton(): Locator {
    return this.page.getByRole('button', { name: /\+?\s*create spec/i }).first()
  }

  createModalHeading(): Locator {
    return this.heading(/create new spec/i)
  }

  createSubmit(): Locator {
    return this.button(/^create$/i)
  }

  nameInput(): Locator {
    return this.page.getByPlaceholder(/^spec name$/i).first()
  }

  versionInput(): Locator {
    return this.page.getByPlaceholder(/version \(e\.g\. 1\.0\.0\)/i).first()
  }

  descriptionInput(): Locator {
    return this.page.getByPlaceholder(/description \(optional\)/i).first()
  }

  reviewerInput(): Locator {
    return this.page.getByPlaceholder(/enter reviewer name or email/i).first()
  }

  fileInput(): Locator {
    return this.page.locator('.fixed.inset-0 input[type="file"]').first()
  }

  platformSelect(): Locator {
    return this.page.locator('.fixed.inset-0 select').filter({ hasText: /Select Platform|TSMC/i }).first()
  }

  edaSelect(): Locator {
    return this.page.locator('.fixed.inset-0 select').filter({ hasText: /Select EDA Tool|Calibre/i }).first()
  }

  typeSelect(): Locator {
    return this.page.locator('.fixed.inset-0 select').filter({ hasText: /Select Type|DRC|LVS/i }).first()
  }

  closeCreateButton(): Locator {
    return this.page.locator('.fixed.inset-0').getByRole('button', { name: /close/i }).first()
  }

  createError(): Locator {
    return this.page.getByText(/name and version are required|please select a file|assign a reviewer|version must be|invalid file type|failed/i).first()
  }

  toast(): Locator {
    return this.page.locator('.fixed').filter({ hasText: /upload successful|successfully linked|deleted|failed/i }).first()
  }

  emptyState(): Locator {
    return this.page.getByText(/no specifications/i).first()
  }

  filtersHeading(): Locator {
    return this.page.getByRole('heading', { name: /filters/i }).first()
  }

  resetFiltersButton(): Locator {
    return this.page.getByRole('button', { name: /reset all/i }).first()
  }

  uploadHint(): Locator {
    return this.page.getByText(/drag and drop|browse/i).first()
  }

  tableRow(name: string | RegExp): Locator {
    return this.page.locator('tbody tr').filter({ hasText: name }).first()
  }

  linkSelectedButton(): Locator {
    return this.page.getByRole('button', { name: /link \d+ spec/i }).first()
  }

  linkModalHeading(): Locator {
    return this.heading(/link specifications to project|add specifications to/i)
  }

  projectSelectInLinkModal(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: /choose a project|select project/i }) }).first()
      .or(this.page.locator('.fixed.inset-0 select').first())
  }

  confirmLinkButton(): Locator {
    return this.page.getByRole('button', { name: /link to project|add to project/i }).first()
  }

  deleteModalHeading(): Locator {
    return this.heading(/delete specification/i)
  }

  confirmDeleteButton(): Locator {
    return this.page.locator('.fixed.inset-0').getByRole('button', { name: /^delete$/i }).first()
  }

  cancelDeleteButton(): Locator {
    return this.page.locator('.fixed.inset-0').getByRole('button', { name: /^cancel$/i }).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
  }

  async openCreateFlow() {
    await this.createButton().click()
    await this.expectVisible(this.createModalHeading())
  }

  async cancelCreate() {
    await this.closeCreateButton().click({ force: true }).catch(async () => {
      await this.page.evaluate(() => {
        const close = document.querySelector(
          '.fixed.inset-0 button[aria-label="Close"]',
        ) as HTMLButtonElement | null
        close?.click()
      })
    })
  }

  async submitCreate() {
    await this.createSubmit().click()
  }

  async expectEmptyOrList() {
    await expect(this.title()).toBeVisible()
  }

  async expectEmptyListOrFilters() {
    await expect(this.uploadHint()).toBeVisible()
  }

  async expandFilters() {
    await this.filtersHeading().click()
    await expect(this.resetFiltersButton()).toBeVisible({ timeout: 10_000 })
  }

  async selectFirstFilterOptions() {
    await this.expandFilters()
    const selects = this.page.locator('select').filter({ has: this.page.locator('option') })
    const count = await selects.count()
    for (let i = 0; i < Math.min(count, 8); i++) {
      const sel = selects.nth(i)
      const opts = await sel.locator('option').count()
      if (opts > 1) {
        await sel.selectOption({ index: 1 }).catch(() => undefined)
      }
    }
  }

  async resetFilters() {
    if (!(await this.resetFiltersButton().isVisible().catch(() => false))) {
      await this.expandFilters()
    }
    await this.resetFiltersButton().click()
  }

  /**
   * Fill create modal with file + all optional dropdowns.
   * Uses a tiny PDF fixture generated at runtime.
   */
  async fillFullCreate(opts: {
    name: string
    version?: string
    reviewer?: string
    description?: string
    filePath: string
  }) {
    await this.nameInput().fill(opts.name)
    await this.versionInput().fill(opts.version || '1.0.0')
    await this.descriptionInput().fill(opts.description || 'Automation full-field spec')
    await this.fileInput().setInputFiles(opts.filePath)
    await this.reviewerInput().fill(opts.reviewer || 'chethan@shurutech.com')

    if (await this.platformSelect().isVisible().catch(() => false)) {
      await this.platformSelect().selectOption('TSMC').catch(async () => {
        await this.platformSelect().selectOption({ index: 1 })
      })
    }
    if (await this.edaSelect().isVisible().catch(() => false)) {
      await this.edaSelect().selectOption('Calibre').catch(async () => {
        await this.edaSelect().selectOption({ index: 1 })
      })
    }
    if (await this.typeSelect().isVisible().catch(() => false)) {
      await this.typeSelect().selectOption('DRC').catch(async () => {
        await this.typeSelect().selectOption({ index: 1 })
      })
    }
  }

  async selectRowCheckbox(name: string | RegExp) {
    const row = this.tableRow(name)
    await expect(row).toBeVisible({ timeout: 20_000 })
    const checkbox = row.locator('input[type="checkbox"]').first()
    await checkbox.check({ force: true })
  }

  async openLinkSelectedToProject() {
    await expect(this.linkSelectedButton()).toBeVisible({ timeout: 10_000 })
    await this.linkSelectedButton().click()
    await expect(this.linkModalHeading()).toBeVisible({ timeout: 10_000 })
  }

  async linkToFirstProject() {
    await this.openLinkSelectedToProject()
    const select = this.page.locator('.fixed.inset-0 select').first()
    await expect(select).toBeVisible({ timeout: 10_000 })
    await expect.poll(async () => select.locator('option').count(), { timeout: 15_000 }).toBeGreaterThan(1)
    await select.selectOption({ index: 1 })
    await this.confirmLinkButton().click()
    await expect(this.page.getByText(/successfully linked/i).first()).toBeVisible({ timeout: 20_000 })
  }

  async openDeleteFor(name: string | RegExp) {
    const row = this.tableRow(name)
    await expect(row).toBeVisible({ timeout: 15_000 })
    await row.getByTitle(/^delete$/i).click()
    await expect(this.deleteModalHeading()).toBeVisible({ timeout: 10_000 })
  }

  async cancelDelete() {
    await this.cancelDeleteButton().click()
    await expect(this.deleteModalHeading()).toBeHidden({ timeout: 10_000 })
  }

  async confirmDelete() {
    await this.confirmDeleteButton().click()
  }

  /** Absolute path helper for fixtures */
  static tinyPdfPath(): string {
    return path.join(process.cwd(), 'automation', 'fixtures', 'tiny-spec.pdf')
  }
}
