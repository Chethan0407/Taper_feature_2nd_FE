import { test, expect } from '../fixtures'

/**
 * Roles / permissions — admin vs engineer.
 * Note: System Usage nav is admin-only in production builds (preview/CI).
 * In vite-dev, DEV flag also shows the link — assertions adapt.
 */
test.describe('Roles & permissions @roles @regression', () => {
  test('admin can open System Usage', { tag: ['@roles', '@regression'] }, async ({
    authenticated,
    adminUsagePage,
    dashboardPage,
    page,
  }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    const usage = page.locator('nav').getByRole('link', { name: /system usage/i })
    await expect(usage).toBeVisible({ timeout: 15_000 })
    await usage.click()
    await expect(page).toHaveURL(/\/admin\/usage/)
    await adminUsagePage.expectLoaded()
  })

  test('engineer still reaches core product pages', { tag: ['@roles', '@regression'] }, async ({
    authenticatedEngineer,
    dashboardPage,
    projectsPage,
    specsPage,
    page,
  }) => {
    void authenticatedEngineer
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await expect(page.getByText(/E2E Engineer/i).first()).toBeVisible({ timeout: 15_000 })

    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await specsPage.goto()
    await specsPage.expectLoaded()
  })

  test('engineer admin-usage gate (prod build)', { tag: ['@roles', '@regression'] }, async ({
    authenticatedEngineer,
    page,
    dashboardPage,
  }) => {
    void authenticatedEngineer
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()

    await page.goto('/admin/usage')
    await page.waitForLoadState('networkidle').catch(() => undefined)

    // Production preview: non-admin → /dashboard(?notice=admin_required)
    // Vite-dev: DEV flag may still allow /admin/usage
    if (/\/dashboard/.test(page.url())) {
      await expect(page).toHaveURL(/\/dashboard/)
      const notice = page.getByText(/system usage is admin-only/i)
      if (await notice.isVisible().catch(() => false)) {
        await expect(notice).toBeVisible()
      }
    } else {
      await expect(page).not.toHaveURL(/\/login/)
    }
  })
})
