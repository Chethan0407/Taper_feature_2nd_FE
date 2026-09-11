import { test, expect } from '../fixtures'
import { mockApi } from '../fixtures/api'
import { seedFeatureData, MOCK } from '../fixtures/seed'
import { LOGIN_ECP } from '../fixtures/test-data'

/**
 * Critical end-to-end user journeys across pages.
 * Tags: @critical @integration
 */
test.describe('Critical E2E journeys @critical @integration', () => {
  test('landing → login → dashboard → logout', { tag: ['@critical', '@integration'] }, async ({
    page,
    landingPage,
    loginPage,
    dashboardPage,
  }) => {
    await mockApi(page)
    await landingPage.goto()
    await landingPage.expectLoaded()
    await landingPage.goToLoginViaSignIn()

    await loginPage.expectLoaded()
    await loginPage.fillLogin(LOGIN_ECP.validCompany.email, LOGIN_ECP.validCompany.password)
    await loginPage.submitLogin()
    await expect(page).toHaveURL(/\/(dashboard|projects|verify-email)/, { timeout: 15_000 })

    if (page.url().includes('dashboard') || page.url().includes('projects')) {
      await dashboardPage.goto()
      await dashboardPage.expectLoaded()
      await page.evaluate(() => sessionStorage.setItem('e2e_logged_out', '1'))
      const logout = page.getByTitle(/logout/i).first()
      await logout.click()
      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
    }
  })

  test('projects list → project details → specs → checklists', { tag: ['@critical', '@integration'] }, async ({
    authenticated,
    projectsPage,
    projectDetailsPage,
    specsPage,
    checklistsPage,
    page,
  }) => {
    void authenticated
    test.setTimeout(90_000)
    await seedFeatureData(page)

    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await expect(page.getByText(MOCK.project.name).first()).toBeVisible({ timeout: 15_000 })
    await page.getByText(MOCK.project.name).first().click()
    await expect(page).toHaveURL(new RegExp(`/projects/${MOCK.project.id}`), { timeout: 15_000 })
    await projectDetailsPage.expectLoaded()

    await specsPage.goto()
    await specsPage.expectLoaded()
    await expect(page.getByText(/E2E Spec Alpha/i).first()).toBeVisible({ timeout: 15_000 })

    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await expect(page.getByText(/E2E Template/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('dashboard CTAs → SpecLint and Checklists round-trip', { tag: ['@critical', '@integration'] }, async ({
    authenticated,
    dashboardPage,
    page,
  }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()

    if (await dashboardPage.trySpecLint().isVisible().catch(() => false)) {
      await dashboardPage.trySpecLint().click()
      await expect(page).toHaveURL(/\/speclint/)
    }

    await dashboardPage.goto()
    if (await dashboardPage.createChecklist().isVisible().catch(() => false)) {
      await dashboardPage.createChecklist().click()
      await expect(page).toHaveURL(/\/checklists/)
    }

    await dashboardPage.sidebar.goTo(/^Dashboard$/i)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('settings → branding → profile deep links', { tag: ['@critical', '@integration'] }, async ({
    authenticated,
    settingsPage,
    brandingPage,
    profilePage,
    page,
  }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()

    await brandingPage.goto()
    await brandingPage.expectLoaded()
    await expect(page).toHaveURL(/\/settings\/branding/)

    await profilePage.goto()
    await profilePage.expectLoaded()
    await expect(page).toHaveURL(/\/profile/)
  })
})
