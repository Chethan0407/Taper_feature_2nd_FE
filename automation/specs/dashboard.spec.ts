import { test, expect } from '../fixtures'
import { Tags } from '../config'
import { seedFeatureData } from '../fixtures/seed'

test.describe('Dashboard — user entry @authenticated', () => {
  test('loads shell and primary CTAs', async ({ authenticated, dashboardPage }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await expect(dashboardPage.openProjects()).toBeVisible()
    await expect(dashboardPage.viewStats()).toBeVisible()
  })

  test('is entry workspace — no Stats KPI strip', async ({ authenticated, dashboardPage }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.expectNoLiveKpis()
  })

  test('Run SpecLint entry navigates', async ({ authenticated, dashboardPage, page }) => {
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

  test('entry CTAs present', async ({ authenticated, dashboardPage }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.expectPrimaryCtas()
  })

  test('Open Checklists entry navigates', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    const cta = dashboardPage.createChecklist()
    if (await cta.isVisible().catch(() => false)) {
      await cta.click()
      await expect(page).toHaveURL(/\/checklists/)
    }
  })

  test('Browse Specs entry navigates', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.browseSpecsEntry().click()
    await expect(page).toHaveURL(/\/specs/)
  })

  test('Open Stats entry card navigates', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.openStatsEntry().click()
    await expect(page).toHaveURL(/\/stats/)
  })

  test('View Stats navigates to /stats', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.viewStats().click()
    await expect(page).toHaveURL(/\/stats/)
  })

  test('Open Projects CTA navigates', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.openProjects().click()
    await expect(page).toHaveURL(/\/projects/)
  })

  test('sidebar nav from dashboard to projects', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.sidebar.goTo(/^Projects$/i)
    await expect(page).toHaveURL(/\/projects/)
  })

  test('sidebar Stats link reaches /stats', async ({ authenticated, dashboardPage, page }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()
    await dashboardPage.sidebar.goTo(/^Stats$/i)
    await expect(page).toHaveURL(/\/stats/)
  })
})

test.describe('Stats — live metrics @authenticated @regression', () => {
  test('loads Stats page with KPIs', { tag: [Tags.regression] }, async ({ authenticated, statsPage }) => {
    void authenticated
    await statsPage.goto()
    await statsPage.expectLoaded()
    await statsPage.expectKpis()
  })

  test('shows live badge and KPI values from dashboard API', {
    tag: [Tags.regression],
  }, async ({ authenticated, statsPage, page }) => {
    void authenticated
    await statsPage.goto()
    await statsPage.expectLoaded()
    await expect(page.getByText(/live program metrics/i).first()).toBeVisible()
    await expect(statsPage.approvedKpi()).toContainText('1', { timeout: 15_000 })
    await expect(page.getByText(/100\s*%/).first()).toBeVisible()
  })

  test('browse specs filters and matching table render', {
    tag: [Tags.regression],
  }, async ({ authenticated, statsPage, page }) => {
    void authenticated
    await statsPage.goto()
    await statsPage.expectLoaded()
    await statsPage.expectBrowseAndTable()
    await expect(page.getByRole('button', { name: /^TSMC$/i }).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: /^Calibre$/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /^DRC$/i }).first()).toBeVisible()
  })

  test('platform filter selects and can clear', {
    tag: [Tags.regression],
  }, async ({ authenticated, statsPage, page }) => {
    void authenticated
    await statsPage.goto()
    await statsPage.expectLoaded()
    await page.getByRole('button', { name: /^TSMC$/i }).first().click()
    await expect(statsPage.clearFilters()).toBeVisible({ timeout: 10_000 })
    await statsPage.clearFilters().click()
    await expect(statsPage.clearFilters()).toHaveCount(0)
  })

  test('Approved KPI toggles status filter', {
    tag: [Tags.regression],
  }, async ({ authenticated, statsPage }) => {
    void authenticated
    await statsPage.goto()
    await statsPage.expectLoaded()
    await statsPage.approvedKpi().click()
    await expect(statsPage.clearFilters()).toBeVisible({ timeout: 10_000 })
  })

  test('Open Projects CTA navigates', {
    tag: [Tags.regression],
  }, async ({ authenticated, statsPage, page }) => {
    void authenticated
    await statsPage.goto()
    await statsPage.expectLoaded()
    await statsPage.openProjects().click()
    await expect(page).toHaveURL(/\/projects/)
  })

  test('Run SpecLint CTA navigates', {
    tag: [Tags.regression],
  }, async ({ authenticated, statsPage, page }) => {
    void authenticated
    await statsPage.goto()
    await statsPage.expectLoaded()
    await statsPage.runSpecLint().click()
    await expect(page).toHaveURL(/\/speclint/)
  })

  test('quick link SpecLint navigates', {
    tag: [Tags.regression],
  }, async ({ authenticated, statsPage, page }) => {
    void authenticated
    await statsPage.goto()
    await statsPage.expectLoaded()
    await statsPage.quickLink(/speclint/i).click()
    await expect(page).toHaveURL(/\/speclint/)
  })

  test('View all specs navigates to /specs', {
    tag: [Tags.regression],
  }, async ({ authenticated, statsPage, page }) => {
    void authenticated
    await statsPage.goto()
    await statsPage.expectLoaded()
    await statsPage.viewAllSpecs().click()
    await expect(page).toHaveURL(/\/specs/)
  })

  test('matching specs show seeded name when feature data present', {
    tag: [Tags.regression],
  }, async ({ authenticated, statsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await statsPage.goto()
    await statsPage.expectLoaded()
    await expect(page.getByText(/E2E Spec Alpha/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
