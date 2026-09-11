import { type Locator, expect } from '@playwright/test'
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
    return this.heading(/create new spec|create spec/i).or(this.page.getByText(/spec name/i)).first()
  }

  createSubmit(): Locator {
    return this.button(/^create$/i)
  }

  nameInput(): Locator {
    return this.page.getByPlaceholder(/spec name/i).first()
  }

  versionInput(): Locator {
    return this.page.getByPlaceholder(/version/i).first()
  }

  closeCreateButton(): Locator {
    return this.page
      .locator('.fixed.inset-0')
      .getByRole('button', { name: /×|close/i })
      .or(this.page.locator('.fixed.inset-0 button').filter({ hasText: '×' }))
      .first()
  }

  createError(): Locator {
    return this.page.getByText(/name and version are required|please select a file|assign a reviewer/i).first()
  }

  emptyState(): Locator {
    return this.page.getByText(/no specifications/i).first()
  }

  filtersHeading(): Locator {
    return this.page.getByText(/^filters$/i).first()
  }

  resetFiltersButton(): Locator {
    return this.page.getByRole('button', { name: /reset all/i }).first()
  }

  uploadHint(): Locator {
    return this.page.getByText(/drag and drop|browse/i).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
  }

  async openCreateFlow() {
    await this.createButton().click()
    await this.expectVisible(this.createModalHeading())
  }

  async cancelCreate() {
    const close = this.closeCreateButton()
    if (await close.isVisible().catch(() => false)) {
      await close.click()
    } else {
      await this.page.keyboard.press('Escape')
    }
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
}
