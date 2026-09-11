import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

/** Project details — /projects/:id */
export class ProjectDetailsPage extends AppShellPage {
  readonly path = '/projects'

  async gotoId(id: string | number) {
    await this.page.goto(`${this.path}/${id}`)
  }

  qualityHeading(): Locator {
    return this.heading(/quality score breakdown/i)
  }

  errorHeading(): Locator {
    return this.heading(/error loading project/i)
  }

  retryButton(): Locator {
    return this.button(/^retry$/i)
  }

  refreshPageButton(): Locator {
    return this.button(/refresh page/i)
  }

  goToLoginButton(): Locator {
    return this.button(/go to login/i)
  }

  addSpecButton(): Locator {
    return this.button(/add spec|add first spec/i)
  }

  addChecklistButton(): Locator {
    return this.button(/add checklist|add first checklist/i)
  }

  projectName(name: string | RegExp): Locator {
    return this.page.getByText(name).first()
  }

  async expectLoaded() {
    await this.page.waitForURL(/\/projects\/.+/, { timeout: 15_000 })
    // Quality section OR error OR still loading — any means the page mounted
    const quality = this.qualityHeading()
    const err = this.errorHeading()
    const loading = this.page.getByText(/loading project/i)
    await expect
      .poll(async () => {
        return (
          (await quality.isVisible().catch(() => false)) ||
          (await err.isVisible().catch(() => false)) ||
          (await loading.isVisible().catch(() => false))
        )
      }, { timeout: 15_000 })
      .toBeTruthy()
  }

  async expectErrorState() {
    await expect(this.errorHeading()).toBeVisible({ timeout: 15_000 })
    await expect(this.retryButton()).toBeVisible()
    await expect(this.refreshPageButton()).toBeVisible()
  }

  async expectQualitySection() {
    await expect(this.qualityHeading()).toBeVisible({ timeout: 15_000 })
  }
}
