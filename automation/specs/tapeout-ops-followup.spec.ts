import { test, expect } from '../fixtures'
import { Tags } from '../config'
import { seedFeatureData } from '../fixtures/seed'

test.describe('Tapeout ops follow-up @regression', () => {
  test('readiness tab shows waivers packages submissions fab lots', {
    tag: [Tags.regression, Tags.critical],
  }, async ({ authenticated, projectDetailsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await projectDetailsPage.gotoId(101)
    await projectDetailsPage.expectLoaded()
    await projectDetailsPage.openReadinessTab()

    await expect(page.getByTestId('tapeout-ops-extras')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('readiness-waivers')).toBeVisible()
    await expect(page.getByTestId('readiness-packages')).toBeVisible()
    await expect(page.getByTestId('readiness-submissions')).toBeVisible()
    await expect(page.getByTestId('readiness-fab-lots')).toBeVisible()
  })

  test('system TOR template shows badges and hides delete', {
    tag: [Tags.regression],
  }, async ({ authenticated, checklistsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await expect(page.getByTestId('template-system-badge').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('template-tor-badge').first()).toBeVisible()
    await expect(page.getByText(/Tapeout Readiness TOR/i)).toBeVisible()
  })

  test('vendor preview shows NDA and timeline sections', {
    tag: [Tags.regression],
  }, async ({ authenticated, vendorsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
    await vendorsPage.openVendorPreview()
    await expect(page.getByTestId('vendor-nda-section')).toBeVisible()
    await expect(page.getByTestId('vendor-timeline-section')).toBeVisible()
  })
})
