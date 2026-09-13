import { test, expect } from '../fixtures'

/**
 * Roles / permissions — superuser vs engineer.
 * System Usage nav + route require profile.is_superuser === true (no DEV bypass).
 */
test.describe('Roles & permissions @roles @regression', () => {
  test('superuser can open System Usage', { tag: ['@roles', '@regression'] }, async ({
    authenticated,
    adminUsagePage,
    dashboardPage,
    page,
  }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    const usage = page.locator('nav').getByRole('link', { name: /system usage/i, includeHidden: true })
    await usage.scrollIntoViewIfNeeded()
    await expect(usage).toBeVisible({ timeout: 15_000 })
    await usage.click()
    await expect(page).toHaveURL(/\/admin\/usage/)
    await adminUsagePage.expectLoaded()
    await expect(page.getByText(/development mode/i)).toHaveCount(0)
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
    await expect(
      page.getByText(/E2E Engineer|engineer@tapeoutops\.com/i).first(),
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      page.locator('nav').getByRole('link', { name: /system usage/i, includeHidden: true }),
    ).toHaveCount(0)

    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await specsPage.goto()
    await specsPage.expectLoaded()
  })

  test('engineer is redirected away from /admin/usage', { tag: ['@roles', '@regression'] }, async ({
    authenticatedEngineer,
    page,
    dashboardPage,
  }) => {
    void authenticatedEngineer
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()

    await page.goto('/admin/usage')
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 })
    await expect(page).toHaveURL(/\/dashboard/)
    const notice = page.getByText(/system usage is superuser-only|system usage is admin-only/i)
    await expect(notice).toBeVisible({ timeout: 10_000 })
  })
})
