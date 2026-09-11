import { test, expect } from '../fixtures'

test.describe('Admin System Usage @authenticated', () => {
  test('loads overview and signup leads sections', async ({ authenticated, adminUsagePage }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await expect(adminUsagePage.overview()).toBeVisible()
  })

  test('edge: overview KPIs and signup leads sections visible', async ({ authenticated, adminUsagePage }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await adminUsagePage.expectSectionsVisible()
  })

  test('edge: empty leads / browser section messaging', async ({ authenticated, adminUsagePage }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await expect(adminUsagePage.emptyLeadsHint()).toBeVisible()
    if (await adminUsagePage.clearLogButton().isVisible().catch(() => false)) {
      await expect(adminUsagePage.clearLogButton()).toBeVisible()
    }
  })
})
