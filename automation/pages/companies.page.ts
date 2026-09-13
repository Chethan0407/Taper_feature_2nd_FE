import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

export class CompaniesPage extends AppShellPage {
  readonly path = '/companies'

  title(): Locator {
    return this.heading(/compan/i)
  }

  newCompanyButton(): Locator {
    return this.button(/new company/i)
  }

  modalHeading(): Locator {
    return this.heading(/create new company|edit company/i)
  }

  nameInput(): Locator {
    return this.page.getByPlaceholder(/enter company name/i).or(this.page.getByLabel(/company name/i)).first()
  }

  createButton(): Locator {
    return this.button(/^create company$/i)
  }

  cancelButton(): Locator {
    return this.button(/^cancel$/i)
  }

  searchInput(): Locator {
    return this.page.getByPlaceholder(/search companies by name, description, or creator/i).first()
  }

  emptyState(): Locator {
    return this.page.getByText(/no companies yet|no companies found/i).first()
  }

  noSearchResults(): Locator {
    return this.page.getByText(/no companies match your search/i).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
  }

  async openCreateModal() {
    await this.newCompanyButton().click()
    await this.expectVisible(this.modalHeading())
  }

  async cancelCreate() {
    await this.cancelButton().click()
  }

  async submitCreate() {
    await this.createButton().click()
  }

  async search(query: string) {
    await this.searchInput().fill(query)
  }

  async expectNoSearchResults() {
    const noMatch = await this.noSearchResults().isVisible({ timeout: 15_000 }).catch(() => false)
    const empty = await this.emptyState().isVisible().catch(() => false)
    expect(noMatch || empty).toBeTruthy()
  }

  descriptionInput(): Locator {
    return this.page.getByPlaceholder(/company description/i).first()
  }

  companyCard(name: string | RegExp): Locator {
    return this.page.getByText(name).first()
  }

  deleteButtonFor(name: string | RegExp): Locator {
    return this.page.locator('.group, tr, [class*="rounded"]').filter({ hasText: name }).getByTitle(/delete/i).first()
      .or(this.page.locator('button').filter({ has: this.page.locator('svg') }).filter({ hasText: '' }).first())
  }

  async fillCreate(name: string, description = 'Automation company') {
    await this.nameInput().fill(name)
    if (await this.descriptionInput().isVisible().catch(() => false)) {
      await this.descriptionInput().fill(description)
    }
  }

  async createCompany(name: string, description?: string) {
    await this.openCreateModal()
    await this.fillCreate(name, description)
    await this.submitCreate()
  }

  async openDeleteConfirm(name: string | RegExp) {
    const card = this.page.locator('div, tr').filter({ hasText: name }).first()
    await card.hover().catch(() => undefined)
    const del = card.getByTitle(/delete/i).or(card.getByRole('button', { name: /delete/i })).first()
    await del.click({ force: true })
  }
}
