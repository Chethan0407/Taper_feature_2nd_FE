import { test, expect } from '../fixtures'
import { authForModule } from '../helpers'

test.describe('Checklists — templates & active @authenticated', () => {
  test('loads templates and active sections', async ({ authenticated, checklistsPage }) => {
    void authenticated
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await expect(checklistsPage.activeSection()).toBeVisible()
  })

  test('open create template then cancel', async ({ authenticated, checklistsPage }) => {
    void authenticated
    await checklistsPage.goto()
    await checklistsPage.openCreateTemplateModal()
    await checklistsPage.cancelCreate()
  })

  test('create template modal has add item', async ({ authenticated, checklistsPage }) => {
    void authenticated
    await checklistsPage.goto()
    await checklistsPage.openCreateTemplateModal()
    await expect(checklistsPage.addItemButton()).toBeVisible()
  })

  test('negative: empty template name blocked on submit', async ({ authenticated, checklistsPage }) => {
    void authenticated
    await checklistsPage.goto()
    await checklistsPage.openCreateTemplateModal()
    await checklistsPage.submitEmptyTemplate()
    await expect(checklistsPage.templateNameInput()).toBeVisible()
    await expect(checklistsPage.createModalHeading()).toBeVisible()
  })

  test('edge: empty templates and active sections visible', async ({ authenticated, checklistsPage }) => {
    void authenticated
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await checklistsPage.expectEmptyStates()
  })

  test('edge: delete template confirm can be cancelled', async ({ authenticated, checklistsPage, page }) => {
    void authenticated
    await page.route('**/api/v1/checklists/templates**', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const url = route.request().url()
      if (url.includes('/stats')) return route.fallback()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 55, name: 'E2E Template', description: 'mock', items: [{ title: 'Item 1', order: 1 }] },
        ]),
      })
    })
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    const cancelled = await checklistsPage.openDeleteThenCancel()
    if (cancelled) {
      await expect(checklistsPage.page.getByText(/E2E Template/i).first()).toBeVisible()
    }
  })
})

test.describe('Checklists — live create template', () => {
  test('create template with item → appears in list', {
    tag: ['@critical', '@integration', '@regression'],
  }, async ({ page, checklistsPage }) => {
    test.setTimeout(120_000)
    await authForModule(page)
    const name = `E2E Tpl ${Date.now()}`

    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await checklistsPage.openCreateTemplateModal()
    await checklistsPage.fillTemplateAndAddItem(name, 'Gate check item')
    await checklistsPage.submitTemplate()

    await expect(page.getByText(name).first()).toBeVisible({ timeout: 20_000 })
  })
})
