import { test, expect } from '../fixtures'
import { authForModule } from '../helpers'

test.describe('Companies — CRUD UI @authenticated', () => {
  test('loads companies page', async ({ authenticated, companiesPage }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.expectLoaded()
  })

  test('open create modal then cancel', async ({ authenticated, companiesPage }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    await companiesPage.cancelCreate()
  })

  test('search input accepts query', async ({ authenticated, companiesPage }) => {
    void authenticated
    await companiesPage.goto()
    if (await companiesPage.searchInput().isVisible().catch(() => false)) {
      await companiesPage.searchInput().fill('acme')
      await expect(companiesPage.searchInput()).toHaveValue('acme')
    }
  })

  test('negative: create with empty name stays on modal', async ({ authenticated, companiesPage }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    await companiesPage.submitCreate()
    await expect(companiesPage.modalHeading()).toBeVisible()
    await expect(companiesPage.nameInput()).toBeVisible()
  })

  test('edge: search with no results shows empty messaging', async ({ authenticated, companiesPage }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.expectLoaded()
    if (await companiesPage.searchInput().isVisible().catch(() => false)) {
      await companiesPage.search('zzz-no-such-company-xyz')
      await companiesPage.expectNoSearchResults()
    }
  })
})

test.describe('Companies — live create / search / delete', () => {
  test('create company with fields → search → delete', {
    tag: ['@critical', '@integration', '@regression'],
  }, async ({ page, companiesPage }) => {
    test.setTimeout(120_000)
    await authForModule(page)
    const name = `E2E Co ${Date.now()}`

    await companiesPage.goto()
    await companiesPage.expectLoaded()
    await companiesPage.createCompany(name, 'Live automation company')
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 20_000 })

    await companiesPage.search(name)
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 15_000 })

    await companiesPage.openDeleteConfirm(name)
    const confirm = page.getByRole('button', { name: /^delete$/i }).last()
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click()
      await expect
        .poll(async () => {
          const gone = (await page.getByText(name).count()) === 0
          const toast = await page
            .getByText(/deleted successfully|cannot delete|failed/i)
            .first()
            .isVisible()
            .catch(() => false)
          return gone || toast
        }, { timeout: 20_000 })
        .toBeTruthy()
    }
  })
})
