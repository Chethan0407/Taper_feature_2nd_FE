import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

export class VendorsPage extends AppShellPage {
  readonly path = '/vendors'

  title(): Locator {
    return this.heading(/vendor/i)
  }

  addVendorButton(): Locator {
    return this.button(/add vendor/i)
  }

  modalHeading(): Locator {
    return this.heading(/add vendor|edit vendor/i)
  }

  nameInput(): Locator {
    return this.page.getByLabel(/vendor name/i).or(this.page.locator('#name')).first()
  }

  typeSelect(): Locator {
    return this.page.getByLabel(/vendor type/i).or(this.page.locator('#type, select').first())
  }

  statusSelect(): Locator {
    return this.page.getByLabel(/status/i).first()
  }

  submitButton(): Locator {
    return this.button(/add vendor|update vendor/i).last()
  }

  cancelButton(): Locator {
    return this.button(/^cancel$/i)
  }

  nameRequiredError(): Locator {
    return this.page.getByText(/vendor name is required/i).first()
  }

  emptyState(): Locator {
    return this.page.getByText(/no vendors yet/i).first()
  }

  emailInput(): Locator {
    return this.page.getByLabel(/email/i).or(this.page.getByPlaceholder(/email/i)).first()
  }

  typeRequiredError(): Locator {
    return this.page.getByText(/vendor type is required/i).first()
  }

  specSearchInput(): Locator {
    return this.page.getByTestId('vendor-spec-search').or(this.page.getByPlaceholder(/search specifications/i)).first()
  }

  linkedSpecsPreview(): Locator {
    return this.page.getByTestId('vendor-linked-specs-preview')
  }

  linkedSpecChips(): Locator {
    return this.page.getByTestId('vendor-linked-spec-chip')
  }

  specDropdown(): Locator {
    return this.page.getByTestId('vendor-spec-dropdown')
  }

  specOption(idOrName: string | RegExp): Locator {
    if (typeof idOrName === 'string' && !idOrName.includes(' ')) {
      return this.page.getByTestId('vendor-spec-option').filter({ has: this.page.locator(`[data-spec-id="${idOrName}"]`) }).or(
        this.page.locator(`[data-testid="vendor-spec-option"][data-spec-id="${idOrName}"]`),
      ).first()
    }
    return this.page.getByTestId('vendor-spec-option').filter({ hasText: idOrName }).first()
  }

  async selectSpecInAddForm(id: string) {
    await this.specSearchInput().click()
    await expect(this.specDropdown()).toBeVisible({ timeout: 10_000 })
    const option = this.page.locator(`[data-testid="vendor-spec-option"][data-spec-id="${id}"]`)
    await option.dispatchEvent('mousedown')
  }

  async expectLinkedSpecCount(count: number) {
    await expect(this.linkedSpecChips()).toHaveCount(count, { timeout: 10_000 })
  }

  async expectLinkedSpecChip(id: string) {
    await expect(this.page.locator(`[data-testid="vendor-linked-spec-chip"][data-spec-id="${id}"]`)).toBeVisible()
  }

  vendorRow(name: string | RegExp): Locator {
    return this.page.locator('.cursor-pointer').filter({ hasText: name }).first()
  }

  previewModal(): Locator {
    return this.page.getByTestId('vendor-preview-modal')
  }

  previewHeading(): Locator {
    return this.page.getByRole('heading', { name: /vendor preview/i })
  }

  linkSpecButton(): Locator {
    return this.page.getByTestId('link-spec-button')
  }

  linkChecklistButton(): Locator {
    return this.page.getByTestId('link-checklist-button')
  }

  linkModal(): Locator {
    return this.page.getByTestId('link-modal')
  }

  linkModalSearch(): Locator {
    return this.page.getByTestId('link-modal-search')
  }

  linkModalSubmit(): Locator {
    return this.page.getByTestId('link-modal-submit')
  }

  linkModalCancel(): Locator {
    return this.page.getByTestId('link-modal-cancel')
  }

  linkOption(id: string | number): Locator {
    return this.page.getByTestId(`link-option-${id}`)
  }

  successToast(): Locator {
    return this.page.getByTestId('vendor-success-toast')
  }

  errorToast(): Locator {
    return this.page.getByTestId('vendor-error-toast')
  }

  noSpecsLinked(): Locator {
    return this.page.getByText(/no specifications linked/i)
  }

  noChecklistsLinked(): Locator {
    return this.page.getByText(/no checklists linked/i)
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
  }

  async openAddModal() {
    await this.addVendorButton().click()
    await this.expectVisible(this.modalHeading())
  }

  async cancelModal() {
    await this.cancelButton().click()
  }

  async submitAdd() {
    const btn = this.page
      .locator('.fixed.inset-0')
      .getByRole('button', { name: /add vendor|update vendor/i })
      .last()
    await btn.click({ force: true }).catch(async () => {
      await this.submitButton().click({ force: true })
    })
  }

  modalSubmitButton(): Locator {
    return this.page
      .locator('.fixed.inset-0')
      .getByRole('button', { name: /add vendor|update vendor/i })
      .last()
  }

  async expectEmptyState() {
    await expect(this.emptyState()).toBeVisible()
  }

  async openVendorPreview(name: string | RegExp = /E2E Foundry Co/i) {
    await this.vendorRow(name).click()
    await expect(this.previewHeading()).toBeVisible({ timeout: 15_000 })
  }

  async linkSpecById(id: string | number = 'spec-uuid-1') {
    await this.linkSpecButton().click()
    await expect(this.linkModal()).toBeVisible()
    await this.linkOption(id).click()
    await this.linkModalSubmit().click()
  }

  async linkChecklistById(id: string | number = 55) {
    await this.linkChecklistButton().click()
    await expect(this.linkModal()).toBeVisible()
    await this.linkOption(id).click()
    await this.linkModalSubmit().click()
  }

  async fillAndSubmitVendor(opts: { name: string; type?: string; status?: string }) {
    await this.nameInput().fill(opts.name)
    const type = this.page.locator('#type')
    if (await type.isVisible().catch(() => false)) {
      const typeVal = opts.type
      if (typeVal) {
        await type.selectOption(typeVal).catch(async () => {
          await type.selectOption({ index: 1 })
        })
      } else {
        await type.selectOption({ index: 1 })
      }
    }
    const status = this.page.locator('#status')
    if (await status.isVisible().catch(() => false)) {
      await status.selectOption(opts.status || 'active').catch(async () => {
        await status.selectOption({ index: 1 })
      })
    }
    await this.submitAdd()
  }
}
