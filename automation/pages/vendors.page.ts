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
    return this.page.getByPlaceholder(/search specifications/i).first()
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
}
