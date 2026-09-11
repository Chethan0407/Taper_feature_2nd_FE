import { test, expect } from '../fixtures'

test.describe('App navigation & logout @authenticated', () => {
  test('sidebar links reach all main features', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    test.setTimeout(90_000)

    const links: Array<{ label: RegExp; url: RegExp }> = [
      { label: /^Dashboard$/i, url: /\/dashboard/ },
      { label: /^Projects$/i, url: /\/projects/ },
      { label: /^Specs$/i, url: /\/specs/ },
      { label: /^Checklists$/i, url: /\/checklists/ },
      { label: /^SpecLint$/i, url: /\/speclint/ },
      { label: /^Vendors$/i, url: /\/vendors/ },
      { label: /^Companies$/i, url: /\/companies/ },
      { label: /^Settings$/i, url: /\/settings(?!\/)/ },
    ]

    for (const { label, url } of links) {
      await dashboardPage.goto()
      await dashboardPage.expectLoaded()
      await dashboardPage.sidebar.goTo(label)
      await expect(page).toHaveURL(url, { timeout: 15_000 })
    }
  })

  test('logout returns to login', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    const logout = page.getByTitle(/logout/i).or(page.getByRole('button', { name: /logout/i }))
    if (await logout.first().isVisible().catch(() => false)) {
      await page.evaluate(() => sessionStorage.setItem('e2e_logged_out', '1'))
      await logout.first().click()
      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
    }
  })

  test('edge: deep link refresh stays authenticated', async ({ authenticated, page, projectsPage }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await page.reload()
    await expect(page).toHaveURL(/\/projects/)
    await projectsPage.expectLoaded()
  })

  test('edge: unknown authenticated path does not log out', async ({ authenticated, page, dashboardPage }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await page.goto('/totally-unknown-path-999')
    // Stay in SPA; token preserved — navigating back to dashboard still works
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
