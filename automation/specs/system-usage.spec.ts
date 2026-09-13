import { test, expect } from '../fixtures'
import { Tags } from '../config'

/**
 * System Usage (/admin/usage) — trends chart + users pagination.
 */
test.describe('System Usage — trends & users @regression @critical', () => {
  test('overview KPIs render for superuser', {
    tag: [Tags.regression, Tags.critical],
  }, async ({ authenticated, adminUsagePage }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await adminUsagePage.expectColorfulOverviewKpis()
  })

  test('loads usage trends and pads signup chart across window', {
    tag: [Tags.regression, Tags.critical],
  }, async ({ authenticated, adminUsagePage, page }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await expect(adminUsagePage.usageTrendsHeading()).toBeVisible({ timeout: 15_000 })
    await expect(adminUsagePage.signupsTrendChart()).toBeVisible()

    const days = adminUsagePage.trendsDaysSelect()
    await expect(days).toBeVisible()
    await days.selectOption({ label: '30 days' })

    await expect(adminUsagePage.signupsTrendStart()).toBeVisible({ timeout: 15_000 })
    await expect(adminUsagePage.signupsTrendEnd()).toBeVisible()

    const start = (await adminUsagePage.signupsTrendStart().textContent())?.trim() || ''
    const end = (await adminUsagePage.signupsTrendEnd().textContent())?.trim() || ''
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // Filled 30-day window must not collapse to a single date (solid-block bug)
    expect(start).not.toEqual(end)

    const bars = adminUsagePage.signupsTrendChart().locator('[data-date]')
    await expect(bars).toHaveCount(30)
  })

  test('users table shows pagination controls', {
    tag: [Tags.regression],
  }, async ({ authenticated, adminUsagePage, page }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await expect(adminUsagePage.usersHeading()).toBeVisible({ timeout: 15_000 })
    await expect(adminUsagePage.usersPagination()).toBeVisible({ timeout: 15_000 })
    await expect(adminUsagePage.usersNextButton()).toBeVisible()
    await expect(adminUsagePage.usersPrevButton()).toBeVisible()

    // Mock has 12 users @ 10/page → Next enabled on page 1
    await expect(adminUsagePage.usersNextButton()).toBeEnabled()
    await adminUsagePage.usersNextButton().click()
    await expect(page.getByText(/page 2 of/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(adminUsagePage.usersPrevButton()).toBeEnabled()
  })

  test('changing trends window keeps distinct axis dates', {
    tag: [Tags.regression],
  }, async ({ authenticated, adminUsagePage }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    const days = adminUsagePage.trendsDaysSelect()
    await days.selectOption({ label: '7 days' })
    await expect(adminUsagePage.signupsTrendChart().locator('[data-date]')).toHaveCount(7)
    const start = (await adminUsagePage.signupsTrendStart().textContent())?.trim()
    const end = (await adminUsagePage.signupsTrendEnd().textContent())?.trim()
    expect(start).not.toEqual(end)
  })

  test('usage by domain table paginates', {
    tag: [Tags.regression],
  }, async ({ authenticated, adminUsagePage, page }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await expect(adminUsagePage.domainsSection()).toBeVisible({ timeout: 15_000 })
    await expect(adminUsagePage.domainsPagination()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/showing 1–10 of 14 domains/i).first()).toBeVisible()
    await expect(adminUsagePage.domainsNextButton()).toBeEnabled()
    await adminUsagePage.domainsNextButton().click()
    await expect(page.getByText(/page 2 of/i).first()).toBeVisible()
    await expect(page.getByText(/showing 11–14 of 14 domains/i).first()).toBeVisible()
  })

  test('signup leads — server table + pagination', {
    tag: [Tags.regression],
  }, async ({ authenticated, adminUsagePage, page }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await expect(adminUsagePage.signupLeadsSection()).toBeVisible({ timeout: 15_000 })
    await expect(adminUsagePage.serverSignupLeadsTable()).toBeVisible()
    await expect(adminUsagePage.serverLeadsPagination()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/showing 1–10 of 12 leads/i).first()).toBeVisible()
    await adminUsagePage.serverLeadsNext().click()
    await expect(page.getByText(/showing 11–12 of 12 leads/i).first()).toBeVisible()
  })

  test('signup leads — local browser table paginates', {
    tag: [Tags.regression],
  }, async ({ authenticated, adminUsagePage, page }) => {
    void authenticated
    const leads = Array.from({ length: 12 }, (_, i) => ({
      email: `local${i + 1}@curefit.com`,
      source: i % 2 === 0 ? 'blur' : 'name_idle',
      partial: false,
      path: '/login',
      ts: Date.now() - i * 1000,
    }))

    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await page.evaluate((rows) => {
      localStorage.setItem('tapeout_signup_leads_log', JSON.stringify(rows))
    }, leads)
    await page.getByRole('button', { name: /^apply$/i }).first().click()
    await expect(adminUsagePage.localSignupLeadsTable()).toBeVisible()
    await expect(adminUsagePage.localLeadsPagination()).toBeVisible({ timeout: 15_000 })
    await expect(adminUsagePage.localLeadsPagination()).toContainText(/of 12 leads/i)
    await adminUsagePage.localLeadsNext().click()
    await expect(adminUsagePage.localLeadsPagination()).toContainText(/page 2 of/i)
  })
})
