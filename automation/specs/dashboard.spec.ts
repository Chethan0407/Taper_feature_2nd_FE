import { test, expect } from '../fixtures'

test.describe('Dashboard — CTAs & edges @authenticated', () => {
  test('loads shell and primary CTAs', async ({ authenticated, dashboardPage }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await expect(dashboardPage.getStarted()).toBeVisible()
  })

  test('Try SpecLint CTA navigates', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    const cta = dashboardPage.trySpecLint()
    if (await cta.isVisible().catch(() => false)) {
      await cta.click()
      await expect(page).toHaveURL(/\/speclint/)
    }
  })

  test('admin_required notice can appear and dismiss', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await page.goto('/dashboard?notice=admin_required')
    const notice = dashboardPage.adminNotice()
    if (await notice.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await dashboardPage.dismissNotice().click()
    }
  })

  test('empty/zero messaging or Get Started present', async ({ authenticated, dashboardPage }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.expectPrimaryCtas()
  })

  test('Create Checklist CTA navigates from dashboard', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    const cta = dashboardPage.createChecklist()
    if (await cta.isVisible().catch(() => false)) {
      await cta.click()
      await expect(page).toHaveURL(/\/checklists/)
    }
  })

  test('sidebar nav from dashboard to projects', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.sidebar.goTo(/^Projects$/i)
    await expect(page).toHaveURL(/\/projects/)
  })
})
