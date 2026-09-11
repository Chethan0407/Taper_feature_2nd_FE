import { test, expect } from '../fixtures'
import { PUBLIC_ROUTES } from '../fixtures/test-data'

/**
 * SANITY — critical path only. Fast gate before merge / deploy.
 * Run: npm run test:automation:sanity
 */
test.describe('Sanity @sanity', () => {
  test('public landing loads brand CTA', { tag: ['@sanity'] }, async ({ landingPage }) => {
    await landingPage.goto()
    await landingPage.expectLoaded()
    await expect(landingPage.getStartedButton()).toBeVisible()
  })

  test('login page primary controls', { tag: ['@sanity'] }, async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.expectLoaded()
  })

  test('authenticated dashboard loads', { tag: ['@sanity'] }, async ({ authenticated, dashboardPage }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
  })

  test('core feature pages load', { tag: ['@sanity'] }, async ({
    authenticated,
    projectsPage,
    specsPage,
    checklistsPage,
    vendorsPage,
  }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await specsPage.goto()
    await specsPage.expectLoaded()
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
  })

  test('logout path available from dashboard', { tag: ['@sanity'] }, async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    const logout = page.getByTitle(/logout/i).or(page.getByRole('button', { name: /logout/i }))
    await expect(logout.first()).toBeVisible()
  })
})

test.describe('Sanity public routes @sanity', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`GET ${route.path}`, { tag: ['@sanity'] }, async ({ page }) => {
      await page.goto(route.path)
      await expect(page.locator('body')).toBeVisible()
      await expect(page.getByText(/uncaught|application error/i)).toHaveCount(0)
    })
  }
})
