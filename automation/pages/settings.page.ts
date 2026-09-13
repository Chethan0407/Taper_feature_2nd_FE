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
    return this.page.getByRole('heading', { name: /^appearance$/i })
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

  colorSchemeHeading(): Locator {
    return this.page.getByRole('heading', { name: /color scheme/i })
  }

  primaryColorLabel(): Locator {
    return this.page.getByText(/^primary( color)?$/i)
  }

  secondaryColorLabel(): Locator {
    return this.page.getByText(/^secondary( color)?$/i)
  }

  colorPreviewBlock(): Locator {
    return this.page.getByText(/^preview$/i).filter({ has: this.page.getByText(/primary button|gradient element/i) })
  }

  headerAppearanceLink(): Locator {
    return this.page.getByRole('link', { name: /^appearance$/i })
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
    await this.expectVisible(this.profileSection())
  }

  async expectThemeControlsRemoved() {
    await expect(this.appearanceSection()).toHaveCount(0)
    await expect(this.lightButton()).toHaveCount(0)
    await expect(this.darkButton()).toHaveCount(0)
    await expect(this.systemButton()).toHaveCount(0)
    await expect(this.headerAppearanceLink()).toHaveCount(0)
  }

  async expectColorSchemeRemoved() {
    await expect(this.colorSchemeHeading()).toHaveCount(0)
    await expect(this.page.getByText(/main brand color for buttons/i)).toHaveCount(0)
    await expect(this.page.getByText(/gradient element/i)).toHaveCount(0)
    await expect(this.page.getByText(/primary button/i)).toHaveCount(0)
    await expect(this.page.locator('input[type="color"]')).toHaveCount(0)
  }

  async setTheme(_theme: 'light' | 'dark' | 'system') {
    // App is dark-only; no-op for backward-compatible callers
  }

  async expectThemeClass(_theme: 'light' | 'dark' = 'dark') {
    await expect(this.page.locator('html')).toHaveClass(/dark/)
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

  colorSchemeHeading(): Locator {
    return this.page.getByRole('heading', { name: /color scheme/i })
  }

  primaryColorLabel(): Locator {
    return this.page.getByText(/primary color/i)
  }

  secondaryColorLabel(): Locator {
    return this.page.getByText(/secondary color/i)
  }

  async expectColorSchemeRemoved() {
    await expect(this.colorSchemeHeading()).toHaveCount(0)
    await expect(this.primaryColorLabel()).toHaveCount(0)
    await expect(this.secondaryColorLabel()).toHaveCount(0)
    await expect(this.page.getByText(/gradient element/i)).toHaveCount(0)
    await expect(this.page.getByText(/primary button/i)).toHaveCount(0)
    await expect(this.page.locator('input[type="color"]')).toHaveCount(0)
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

  activeUsersKpi(): Locator {
    return this.page.getByText(/active users/i).first()
  }

  signupsKpi(): Locator {
    return this.page.getByText(/signups \(7d\)/i).first()
  }

  companiesKpi(): Locator {
    return this.page.getByText(/^companies$/i).first()
  }

  projectsKpi(): Locator {
    return this.page.getByText(/^projects$/i).first()
  }

  specificationsKpi(): Locator {
    return this.page.getByText(/^specifications$/i).first()
  }

  exportMenu(): Locator {
    return this.page.getByTestId('admin-exports-menu')
  }

  async expectColorfulOverviewKpis() {
    await expect(this.totalUsersKpi()).toBeVisible()
    await expect(this.activeUsersKpi()).toBeVisible()
    await expect(this.signupsKpi()).toBeVisible()
    await expect(this.companiesKpi()).toBeVisible()
    await expect(this.projectsKpi()).toBeVisible()
    await expect(this.specificationsKpi()).toBeVisible()
  }

  usageTrendsHeading(): Locator {
    return this.page.getByRole('heading', { name: /usage trends/i }).first()
  }

  trendsDaysSelect(): Locator {
    return this.page.locator('select').filter({ has: this.page.locator('option', { hasText: '30 days' }) }).first()
  }

  signupsTrendChart(): Locator {
    return this.page.getByTestId('signups-trend-chart')
  }

  signupsTrendStart(): Locator {
    return this.page.getByTestId('signups-trend-start')
  }

  signupsTrendEnd(): Locator {
    return this.page.getByTestId('signups-trend-end')
  }

  usersHeading(): Locator {
    return this.page.getByRole('heading', { name: /^users$/i }).first()
  }

  usersPagination(): Locator {
    return this.page.getByText(/showing\s+\d+/i).first()
  }

  usersNextButton(): Locator {
    return this.page.getByRole('button', { name: /^next$/i }).first()
  }

  usersPrevButton(): Locator {
    return this.page.getByRole('button', { name: /^previous$/i }).first()
  }

  domainsSection(): Locator {
    return this.page.getByTestId('usage-by-domain')
  }

  domainsPagination(): Locator {
    return this.page.getByTestId('domains-pagination')
  }

  domainsNextButton(): Locator {
    return this.page.getByTestId('domains-next')
  }

  domainsPageSize(): Locator {
    return this.page.getByTestId('domains-page-size')
  }

  signupLeadsSection(): Locator {
    return this.page.getByTestId('signup-leads')
  }

  localSignupLeadsTable(): Locator {
    return this.page.getByTestId('local-signup-leads-table')
  }

  localLeadsPagination(): Locator {
    return this.page.getByTestId('local-leads-pagination')
  }

  localLeadsNext(): Locator {
    return this.page.getByTestId('local-leads-next')
  }

  serverSignupLeadsTable(): Locator {
    return this.page.getByTestId('server-signup-leads-table')
  }

  serverLeadsPagination(): Locator {
    return this.page.getByTestId('server-leads-pagination')
  }

  serverLeadsNext(): Locator {
    return this.page.getByTestId('server-leads-next')
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

