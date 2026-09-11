import { test, expect } from '../fixtures'

test.describe('Specs — create UI & empty @authenticated', () => {
  test('loads specs page', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.expectLoaded()
    await specsPage.expectEmptyOrList()
  })

  test('open create modal', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.openCreateFlow()
  })

  test('create CTA visible', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.expectLoaded()
    await expect(specsPage.createButton()).toBeVisible({ timeout: 15_000 })
  })

  test('edge: cancel create closes modal', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.openCreateFlow()
    await specsPage.cancelCreate()
    await expect(specsPage.createButton()).toBeVisible({ timeout: 10_000 })
  })

  test('negative: submit create with empty name stays on form', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.openCreateFlow()
    await specsPage.submitCreate()
    // HTML5 required or app error — modal still open
    await expect(specsPage.nameInput()).toBeVisible()
    await expect(specsPage.createSubmit()).toBeVisible()
  })

  test('edge: empty list / filters section visible', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.expectLoaded()
    await specsPage.expectEmptyListOrFilters()
  })
})
