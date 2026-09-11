import { test, expect } from '../fixtures'

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
