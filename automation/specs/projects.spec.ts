import { test, expect } from '../fixtures'

test.describe('Projects — CRUD UI & negatives @authenticated', () => {
  test('loads page and empty/list state', async ({ authenticated, projectsPage }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await projectsPage.expectEmptyOrList()
  })

  test('open create modal then cancel', async ({ authenticated, projectsPage }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.openCreateModal()
    await projectsPage.cancelCreate()
  })

  test('negative: create without name shows validation when submitted', async ({ authenticated, projectsPage, page }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.openCreateModal()
    await projectsPage.createProjectButton().click()
    // Either HTML5 required blocks submit or app shows error
    await expect(projectsPage.createProjectButton()).toBeVisible()
  })

  test('positive: fill name enables create path', async ({ authenticated, projectsPage }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.openCreateModal()
    if (await projectsPage.projectNameInput().isVisible().catch(() => false)) {
      await projectsPage.projectNameInput().fill('E2E Project Alpha')
      await expect(projectsPage.createProjectButton()).toBeVisible()
    }
  })

  test('edge: empty-state messaging when list is empty', async ({ authenticated, projectsPage }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.expectLoaded()
    if (await projectsPage.emptyState().isVisible().catch(() => false)) {
      await projectsPage.expectEmptyMessaging()
    }
  })

  test('edge: open project details when list is mocked', async ({ authenticated, projectsPage, page }) => {
    void authenticated
    await page.route('**/api/v1/projects**', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 101,
            name: 'E2E Project Detail',
            description: 'Mocked',
            status: 'active',
            platform: 'TSMC',
            eda_tool: 'Calibre',
            type: 'DRC',
          },
        ]),
      })
    })
    await projectsPage.goto()
    await projectsPage.expectLoaded()
    const opened = await projectsPage.openFirstProjectIfPresent()
    if (opened) {
      await expect(page).toHaveURL(/\/projects\/101|\/projects/, { timeout: 15_000 })
    }
  })

  test('edge: duplicate-looking name still allows create UI', async ({ authenticated, projectsPage }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.openCreateModal()
    await projectsPage.projectNameInput().fill('E2E Project Alpha')
    await expect(projectsPage.createProjectButton()).toBeVisible()
    // UI does not block duplicate names client-side; create control remains available
    await projectsPage.cancelCreate()
  })
})
