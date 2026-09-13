import { test, expect } from '../fixtures'
import { Tags } from '../config'
import { seedFeatureData } from '../fixtures/seed'

test.describe('Tapeout Readiness Phase 1 @regression', () => {
  test('project details shows Overview and Tapeout Readiness tabs', {
    tag: [Tags.regression, Tags.critical],
  }, async ({ authenticated, projectDetailsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await projectDetailsPage.gotoId(101)
    await projectDetailsPage.expectLoaded()

    await expect(page.getByTestId('project-detail-tabs')).toBeVisible({ timeout: 15_000 })
    await expect(projectDetailsPage.overviewTab()).toBeVisible()
    await expect(projectDetailsPage.readinessTab()).toBeVisible()

    await projectDetailsPage.openReadinessTab()
    await projectDetailsPage.expectReadinessBoard()
    await expect(page.getByText(/72%|Score/i).first()).toBeVisible()
    await expect(page.getByTestId('signoff-gate-DRC')).toBeVisible()
    await expect(page.getByTestId('signoff-gate-LVS')).toBeVisible()
  })

  test('freeze control is available on readiness board', {
    tag: [Tags.regression],
  }, async ({ authenticated, projectDetailsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await projectDetailsPage.gotoId(101)
    await projectDetailsPage.expectLoaded()
    await projectDetailsPage.openReadinessTab()
    await expect(page.getByTestId('readiness-freeze-btn')).toBeEnabled()
    await page.getByTestId('readiness-freeze-btn').click()
    await expect(page.getByText(/frozen|unfrozen|Design/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
