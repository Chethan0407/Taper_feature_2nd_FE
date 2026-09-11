import { test, expect } from '../fixtures'
import { seedFeatureData } from '../fixtures/seed'

/**
 * REGRESSION — broad module coverage (happy + negative + UI persistence).
 * Run: npm run test:automation:regression
 */
test.describe('Regression — module smoke matrix @regression', () => {
  test('dashboard page loads', { tag: ['@regression'] }, async ({ authenticated, dashboardPage }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
  })

  test('projects page loads', { tag: ['@regression'] }, async ({ authenticated, projectsPage }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.expectLoaded()
  })

  test('specs page loads', { tag: ['@regression'] }, async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.expectLoaded()
  })

  test('checklists page loads', { tag: ['@regression'] }, async ({ authenticated, checklistsPage }) => {
    void authenticated
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
  })

  test('speclint page loads', { tag: ['@regression'] }, async ({ authenticated, specLintPage }) => {
    void authenticated
    await specLintPage.goto()
    await specLintPage.expectLoaded()
  })

  test('vendors page loads', { tag: ['@regression'] }, async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
  })

  test('companies page loads', { tag: ['@regression'] }, async ({ authenticated, companiesPage }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.expectLoaded()
  })

  test('settings page loads', { tag: ['@regression'] }, async ({ authenticated, settingsPage }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
  })

  test('profile page loads', { tag: ['@regression'] }, async ({ authenticated, profilePage }) => {
    void authenticated
    await profilePage.goto()
    await profilePage.expectLoaded()
  })

  test('branding page loads', { tag: ['@regression'] }, async ({ authenticated, brandingPage }) => {
    void authenticated
    await brandingPage.goto()
    await brandingPage.expectLoaded()
  })

  test('admin-usage page loads', { tag: ['@regression'] }, async ({ authenticated, adminUsagePage }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
  })
})

test.describe('Regression — theme persistence @regression', () => {
  test('dark theme survives navigation', { tag: ['@regression'] }, async ({
    authenticated,
    settingsPage,
    projectsPage,
    page,
  }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    if (await settingsPage.darkButton().isVisible().catch(() => false)) {
      await settingsPage.setTheme('dark')
      await expect(page.locator('html')).toHaveClass(/dark/)
      await projectsPage.goto()
      await projectsPage.expectLoaded()
      await expect(page.locator('html')).toHaveClass(/dark/)
      await settingsPage.goto()
      await settingsPage.setTheme('light')
    }
  })
})

test.describe('Regression — auth session edges @regression', () => {
  test('refresh keeps session on each protected route', { tag: ['@regression'] }, async ({
    authenticated,
    page,
  }) => {
    void authenticated
    test.setTimeout(120_000)
    for (const path of ['/dashboard', '/projects', '/specs', '/vendors', '/settings']) {
      await page.goto(path)
      await page.reload()
      await expect(page).toHaveURL(new RegExp(path.replace('/', '\\/')))
      await expect(page).not.toHaveURL(/\/login/)
    }
  })

  test('logout clears access to protected routes', { tag: ['@regression'] }, async ({
    authenticated,
    dashboardPage,
    page,
  }) => {
    void authenticated
    await dashboardPage.goto()
    const logout = page.getByTitle(/logout/i).or(page.getByRole('button', { name: /logout/i }))
    if (await logout.first().isVisible().catch(() => false)) {
      // Stop seedAuth init-script from re-injecting token on next navigations
      await page.evaluate(() => sessionStorage.setItem('e2e_logged_out', '1'))
      await logout.first().click()
      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
      await page.goto('/projects')
      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
    }
  })
})

test.describe('Regression — modal open/cancel matrix @regression', () => {
  test('projects create cancel', { tag: ['@regression'] }, async ({ authenticated, projectsPage }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.openCreateModal()
    await projectsPage.cancelCreate()
    await projectsPage.expectLoaded()
  })

  test('vendors add cancel', { tag: ['@regression'] }, async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    await vendorsPage.cancelModal()
    await vendorsPage.expectLoaded()
  })

  test('companies create cancel', { tag: ['@regression'] }, async ({ authenticated, companiesPage }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    await companiesPage.cancelCreate()
    await companiesPage.expectLoaded()
  })

  test('checklists create cancel', { tag: ['@regression'] }, async ({ authenticated, checklistsPage }) => {
    void authenticated
    await checklistsPage.goto()
    await checklistsPage.openCreateTemplateModal()
    await checklistsPage.cancelCreate()
    await checklistsPage.expectLoaded()
  })

  test('specs create cancel', { tag: ['@regression'] }, async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.openCreateFlow()
    await specsPage.cancelCreate()
    await expect(specsPage.createButton()).toBeVisible()
  })
})

test.describe('Regression — seeded data UI @regression', () => {
  test('multi-project cards render', { tag: ['@regression'] }, async ({ authenticated, projectsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await projectsPage.goto()
    await expect(page.getByText(/E2E Project Alpha/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/E2E Project Beta/i).first()).toBeVisible()
  })

  test('admin usage KPIs visible', { tag: ['@regression'] }, async ({ authenticated, adminUsagePage }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectSectionsVisible()
  })
})
