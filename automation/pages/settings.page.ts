import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

export class SettingsPage extends AppShellPage {
  readonly path = '/settings'

  title(): Locator {
    return this.heading(/settings/i)
  }

  profileSection(): Locator {
    return this.page.getByText(/user profile|profile/i).first()
  }

  appearanceSection(): Locator {
    return this.page.getByText(/appearance/i).first()
  }

  lightButton(): Locator {
    return this.button(/^light$/i)
  }

  darkButton(): Locator {
    return this.button(/^dark$/i)
  }

  systemButton(): Locator {
    return this.button(/^system$/i)
  }

  updateProfileButton(): Locator {
    return this.button(/update profile/i)
  }

  generateKeyButton(): Locator {
    return this.button(/generate new key/i)
  }

  brandingSection(): Locator {
    return this.page.getByText(/branding|organization/i).first()
  }

  logoControl(): Locator {
    return this.page.getByText(/logo|upload|click or drag/i).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
    await this.expectVisible(this.appearanceSection())
  }

  async setTheme(theme: 'light' | 'dark' | 'system') {
    if (theme === 'light') await this.lightButton().click()
    else if (theme === 'dark') await this.darkButton().click()
    else await this.systemButton().click()
  }

  async expectThemeClass(theme: 'light' | 'dark') {
    if (theme === 'dark') await expect(this.page.locator('html')).toHaveClass(/dark/)
    else await expect(this.page.locator('html')).not.toHaveClass(/dark/)
  }
}

export class ProfilePage extends AppShellPage {
  readonly path = '/profile'

  title(): Locator {
    return this.heading(/profile/i)
  }

  saveButton(): Locator {
    return this.button(/save changes/i)
  }

  nameInput(): Locator {
    return this.page.getByLabel(/name/i).or(this.page.getByPlaceholder(/your name|name/i)).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
  }

  async clearNameAndSave() {
    await this.nameInput().fill('')
    await this.saveButton().click()
  }
}

export class BrandingPage extends AppShellPage {
  readonly path = '/settings/branding'

  title(): Locator {
    return this.heading(/branding/i)
  }

  saveButton(): Locator {
    return this.button(/save changes/i)
  }

  logoUploadHint(): Locator {
    return this.page.getByText(/click or drag to (upload|replace) logo/i).first()
  }

  fileInput(): Locator {
    return this.page.locator('input[type="file"]').first()
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
  }

  async expectUploadControlVisible() {
    const hint = await this.logoUploadHint().isVisible().catch(() => false)
    const file = await this.fileInput().count()
    expect(hint || file > 0).toBeTruthy()
  }
}

export class AdminUsagePage extends AppShellPage {
  readonly path = '/admin/usage'

  title(): Locator {
    return this.page.getByText('System Usage').first()
  }

  overview(): Locator {
    return this.page.getByRole('heading', { name: /overview/i }).first()
  }

  signupLeads(): Locator {
    return this.page.getByRole('heading', { name: /signup leads/i }).first()
  }

  totalUsersKpi(): Locator {
    return this.page.getByText(/total users/i).first()
  }

  emptyLeadsHint(): Locator {
    return this.page
      .getByText(/no signup leads|no signup data|this browser/i)
      .first()
  }

  clearLogButton(): Locator {
    return this.button(/clear log/i)
  }

  async expectLoaded() {
    await this.page.waitForURL(/\/admin\/usage/, { timeout: 15_000 })
    await this.expectVisible(this.title())
    await this.expectVisible(this.overview())
  }

  async expectSectionsVisible() {
    await expect(this.overview()).toBeVisible()
    await expect(this.signupLeads()).toBeVisible()
    await expect(this.totalUsersKpi()).toBeVisible()
  }
}

