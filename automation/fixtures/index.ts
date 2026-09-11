import { test as base, expect } from '@playwright/test'
import { seedAuth, ENGINEER_USER, TEST_USER } from './api'
import {
  LandingPage,
  LoginPage,
  VerifyEmailPage,
  ResetPasswordPage,
  DashboardPage,
  ProjectsPage,
  ProjectDetailsPage,
  SpecsPage,
  ChecklistsPage,
  SpecLintPage,
  VendorsPage,
  CompaniesPage,
  SettingsPage,
  ProfilePage,
  BrandingPage,
  AdminUsagePage,
} from '../pages'

type Pages = {
  landingPage: LandingPage
  loginPage: LoginPage
  verifyEmailPage: VerifyEmailPage
  resetPasswordPage: ResetPasswordPage
  dashboardPage: DashboardPage
  projectsPage: ProjectsPage
  projectDetailsPage: ProjectDetailsPage
  specsPage: SpecsPage
  checklistsPage: ChecklistsPage
  specLintPage: SpecLintPage
  vendorsPage: VendorsPage
  companiesPage: CompaniesPage
  settingsPage: SettingsPage
  profilePage: ProfilePage
  brandingPage: BrandingPage
  adminUsagePage: AdminUsagePage
}

type AuthPages = Pages & {
  /** Seeds admin token + API mocks. */
  authenticated: void
  /** Seeds engineer (non-admin) token + API mocks. */
  authenticatedEngineer: void
}

/**
 * Playwright fixtures with Page Object Model.
 * Public: landingPage / loginPage / …
 * Auth admin: authenticated
 * Auth engineer: authenticatedEngineer
 */
export const test = base.extend<AuthPages>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page))
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  verifyEmailPage: async ({ page }, use) => {
    await use(new VerifyEmailPage(page))
  },
  resetPasswordPage: async ({ page }, use) => {
    await use(new ResetPasswordPage(page))
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page))
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page))
  },
  projectDetailsPage: async ({ page }, use) => {
    await use(new ProjectDetailsPage(page))
  },
  specsPage: async ({ page }, use) => {
    await use(new SpecsPage(page))
  },
  checklistsPage: async ({ page }, use) => {
    await use(new ChecklistsPage(page))
  },
  specLintPage: async ({ page }, use) => {
    await use(new SpecLintPage(page))
  },
  vendorsPage: async ({ page }, use) => {
    await use(new VendorsPage(page))
  },
  companiesPage: async ({ page }, use) => {
    await use(new CompaniesPage(page))
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page))
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page))
  },
  brandingPage: async ({ page }, use) => {
    await use(new BrandingPage(page))
  },
  adminUsagePage: async ({ page }, use) => {
    await use(new AdminUsagePage(page))
  },
  authenticated: [
    async ({ page }, use) => {
      await seedAuth(page, TEST_USER)
      await use()
    },
    { auto: false },
  ],
  authenticatedEngineer: [
    async ({ page }, use) => {
      await seedAuth(page, ENGINEER_USER)
      await use()
    },
    { auto: false },
  ],
})

export { expect }
