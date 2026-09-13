import { test, expect } from '../fixtures'
import { abortApi, failApi } from '../fixtures/api'
import { seedFeatureData, MOCK } from '../fixtures/seed'

/**
 * API / network failures that must surface correctly in the UI.
 * Tags: @network @regression
 */
test.describe('API & network UI validations @network @regression', () => {
  test('projects list shows Failed to Load when API aborts', { tag: ['@network', '@regression'] }, async ({
    authenticated,
    projectsPage,
    page,
  }) => {
    void authenticated
    await abortApi(page, /\/projects(?!\/)/, 3)
    await projectsPage.goto()
    await expect(page.getByText(/failed to load projects/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: /try again/i }).first()).toBeVisible()
  })

  test('project details shows error state on 500', { tag: ['@network', '@regression'] }, async ({
    authenticated,
    projectDetailsPage,
    page,
  }) => {
    void authenticated
    await failApi(page, /\/projects\/101/, { status: 500, body: { detail: 'boom' }, times: 3 })
    await projectDetailsPage.gotoId(101)
    await projectDetailsPage.expectErrorState()
    await expect(page.getByText(/boom|failed|error/i).first()).toBeVisible()
  })

  test('project details recovers after Retry when API returns data', { tag: ['@network', '@regression'] }, async ({
    authenticated,
    projectDetailsPage,
    page,
  }) => {
    void authenticated
    // First request fails, subsequent fall through to seed
    await failApi(page, /\/projects\/101/, { status: 500, times: 1 })
    await seedFeatureData(page)
    await projectDetailsPage.gotoId(MOCK.project.id)

    if (await projectDetailsPage.errorHeading().isVisible().catch(() => false)) {
      await projectDetailsPage.retryButton().click()
    }
    await expect
      .poll(async () => {
        const ok = await projectDetailsPage.qualityHeading().isVisible().catch(() => false)
        const name = await page.getByText(MOCK.project.name).first().isVisible().catch(() => false)
        return ok || name
      }, { timeout: 20_000 })
      .toBeTruthy()
  })

  test('vendors page still renders shell when vendors API 500', { tag: ['@network', '@regression'] }, async ({
    authenticated,
    vendorsPage,
    page,
  }) => {
    void authenticated
    await failApi(page, /\/vendors/, { status: 500, times: 2 })
    await vendorsPage.goto()
    // Title should still mount even if list fetch fails
    await vendorsPage.expectLoaded()
    await expect(page.locator('body')).toBeVisible()
  })

  test('authenticated request includes Authorization when loading projects', { tag: ['@network', '@regression'] }, async ({
    authenticated,
    projectsPage,
    page,
  }) => {
    void authenticated
    let sawAuth = false
    await page.route('**/api/v1/projects**', async (route) => {
      const headers = route.request().headers()
      if ((headers.authorization || '').toLowerCase().includes('bearer')) {
        sawAuth = true
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })
    await projectsPage.goto()
    await projectsPage.expectLoaded()
    expect(sawAuth).toBeTruthy()
  })

  test('SpecLint Add Rule never shows Response construct error on network abort', {
    tag: ['@network', '@regression', '@speclint'],
  }, async ({ authenticated, specLintPage, page }) => {
    void authenticated
    await abortApi(page, /\/speclint\/rules/, 3)
    await specLintPage.goto()
    await specLintPage.expectLoaded()
    await specLintPage.fillMinimalRule('NETWORK-FIXME')
    await specLintPage.submitAddRule()
    await expect(specLintPage.ruleError()).toBeVisible({ timeout: 15_000 })
    await specLintPage.expectNoResponseConstructError()
    await expect(page.getByText(/cannot reach the server|network error|failed to add rule/i).first()).toBeVisible()
  })
})
