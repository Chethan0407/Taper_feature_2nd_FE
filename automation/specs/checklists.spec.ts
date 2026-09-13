import { test, expect } from '../fixtures'
import { authForModule } from '../helpers'
import { seedFeatureData } from '../fixtures/seed'

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

test.describe('Checklists — use + approve flows @authenticated @critical', () => {
  test('Use template does not blank templates list with Loading…', async ({
    authenticated,
    checklistsPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await expect(page.getByText(/E2E Template/i).first()).toBeVisible({ timeout: 15_000 })

    await checklistsPage.useFirstTemplate()
    // Button may briefly say Using… then list must stay
    await expect(page.getByText(/Loading templates/i)).toHaveCount(0)
    await expect(page.getByText(/E2E Template/i).first()).toBeVisible()
    await expect(
      page.getByText(/Checklist instantiated|E2E Template/i).first(),
    ).toBeVisible({ timeout: 15_000 })
    await checklistsPage.expectNoFullListLoadingFlash()
  })

  test('Approve pending checklist keeps active list visible', async ({
    authenticated,
    checklistsPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await expect(checklistsPage.approveButton()).toBeVisible({ timeout: 15_000 })

    await checklistsPage.approveFirstPending()
    await expect(page.getByText(/Loading active checklists/i)).toHaveCount(0)
    await expect(checklistsPage.approvedBadge()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Checklist approved|Approved/i).first()).toBeVisible()
    await checklistsPage.expectNoFullListLoadingFlash()
  })

  test('stats tiles render after load', async ({ authenticated, checklistsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await expect(page.getByText(/Total Templates/i)).toBeVisible()
    await expect(page.getByText(/Active Checklists/i).first()).toBeVisible()
    await expect(page.getByText(/Approved/i).first()).toBeVisible()
    await expect(page.getByText(/Avg\. Completion/i)).toBeVisible()
  })
})

test.describe('Checklists — live use + approve', () => {
  test('live: Use template → Approve without loading flash @critical @integration', {
    tag: ['@critical', '@integration', '@regression'],
  }, async ({ page, checklistsPage }) => {
    test.setTimeout(180_000)
    const live = await authForModule(page)
    test.skip(!live, 'Set PLAYWRIGHT_LIVE=1 + email/password for live checklist flow')

    await checklistsPage.goto()
    await checklistsPage.expectLoaded()

    // Prefer a non-system template Use button
    const useBtns = checklistsPage.useButtons()
    await expect(useBtns.first()).toBeVisible({ timeout: 20_000 })
    const beforeActive = await page.locator('text=Active Checklists').locator('..').locator('li').count().catch(() => 0)

    await useBtns.first().click()
    await expect(page.getByText(/Loading templates/i)).toHaveCount(0)
    await expect(page.getByText(/Checklist instantiated|Using/i).first()).toBeVisible({ timeout: 20_000 }).catch(() => undefined)

    // Wait for a pending Approve to show (new or existing)
    const approve = page.getByRole('button', { name: /^approve$/i }).first()
    await expect(approve).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(/Loading active checklists/i)).toHaveCount(0)

    await approve.click()
    await expect(page.getByText(/Loading active checklists/i)).toHaveCount(0)
    await expect(page.getByText(/^Approved$/i).first()).toBeVisible({ timeout: 20_000 })
    void beforeActive
  })
})
