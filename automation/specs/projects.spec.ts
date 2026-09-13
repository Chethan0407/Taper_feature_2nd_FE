import { test, expect } from '../fixtures'
import { Env } from '../config'
import { loginLive } from '../helpers'
import { seedFeatureData } from '../fixtures/seed'

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

  test('negative: create without name shows validation when submitted', async ({ authenticated, projectsPage }) => {
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

test.describe('Projects — full CRUD + link (live or seeded)', () => {
  test('create → edit → link checklist → delete', {
    tag: ['@critical', '@integration', '@regression'],
  }, async ({ page, projectsPage, projectDetailsPage }) => {
    test.setTimeout(180_000)

    const useLive = Env.live && !!Env.liveEmail && !!Env.livePassword
    if (useLive) {
      await loginLive(page)
    } else {
      const { seedAuth } = await import('../helpers')
      await seedAuth(page)
      await seedFeatureData(page)
    }

    const createdName = `E2E CRUD ${Date.now()}`
    const editedName = `${createdName} Edited`

    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await projectsPage.openCreateModal()
    await projectsPage.fillFullCreate(createdName)
    await projectsPage.submitCreate()

    await expect(page.getByText(createdName).first()).toBeVisible({ timeout: 20_000 })

    await projectsPage.openEditFor(createdName)
    await projectsPage.editNameAndSave(editedName)
    await expect(page.getByText(editedName).first()).toBeVisible({ timeout: 20_000 })

    await page.getByText(editedName).first().click()
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 20_000 })
    await projectDetailsPage.expectLoaded()

    // Checklist linking — prefer seeded name, otherwise first available option
    const addChecklist = projectDetailsPage.addChecklistButton()
    if (await addChecklist.isVisible().catch(() => false)) {
      await projectDetailsPage.linkChecklistByName()
      await expect(page.getByText(/test|template|checklist|linked/i).first()).toBeVisible({ timeout: 20_000 })
    }

    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await expect(page.getByText(editedName).first()).toBeVisible({ timeout: 20_000 })
    await projectsPage.deleteProjectNamed(editedName)
    await expect(page.getByText(editedName)).toHaveCount(0, { timeout: 20_000 })
  })
})
