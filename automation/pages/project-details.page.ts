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

  overviewTab(): Locator {
    return this.page.getByTestId('project-tab-overview')
  }

  readinessTab(): Locator {
    return this.page.getByTestId('project-tab-readiness')
  }

  readinessPanel(): Locator {
    return this.page.getByTestId('tapeout-readiness-tab')
  }

  async openReadinessTab() {
    await this.readinessTab().click()
    await expect(this.readinessPanel()).toBeVisible({ timeout: 15_000 })
  }

  async expectReadinessBoard() {
    await expect(this.readinessPanel()).toBeVisible({ timeout: 15_000 })
    await expect(this.page.getByTestId('readiness-blockers')).toBeVisible()
    await expect(this.page.getByTestId('readiness-gaps')).toBeVisible()
    await expect(this.page.getByTestId('readiness-gates')).toBeVisible()
    await expect(this.page.getByTestId('readiness-freeze-btn')).toBeVisible()
    await expect(this.page.getByTestId('tapeout-ops-extras')).toBeVisible()
  }

  linkModal(): Locator {
    return this.page.getByTestId('link-modal')
  }

  async linkChecklistByName(name?: string | RegExp) {
    await this.addChecklistButton().click()
    await expect(this.linkModal()).toBeVisible({ timeout: 10_000 })

    const options = this.linkModal().locator('[data-testid^="link-option-"]')
    await expect(options.first()).toBeVisible({ timeout: 15_000 })

    if (name) {
      const named = options.filter({ hasText: name }).first()
      if (await named.isVisible().catch(() => false)) {
        await named.click()
      } else {
        await options.first().click()
      }
    } else {
      await options.first().click()
    }

    await expect(this.linkModal().getByText(/^Selected$/i).first()).toBeVisible({ timeout: 5_000 })
    await expect(this.page.getByTestId('link-modal-submit')).toBeEnabled()
    await this.page.getByTestId('link-modal-submit').click()
    await expect(this.linkModal()).toBeHidden({ timeout: 20_000 })
  }

  async linkSpecByName(name: string | RegExp) {
    await this.addSpecButton().click()
    await expect(this.linkModal()).toBeVisible({ timeout: 10_000 })
    const option = this.linkModal().getByText(name).first()
    await option.click()
    await this.page.getByTestId('link-modal-submit').click()
    await expect(this.linkModal()).toBeHidden({ timeout: 15_000 })
  }
}
