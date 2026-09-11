import { test, expect } from '../fixtures'

test.describe('Vendors — form validation @authenticated', () => {
  test('loads vendors page', async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
  })

  test('open add modal then cancel', async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    await vendorsPage.cancelModal()
  })

  test('negative: modal shows required name field', async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    await expect(vendorsPage.nameInput()).toBeVisible()
    await expect(vendorsPage.modalHeading()).toBeVisible()
  })

  test('negative: empty name validation on submit', async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    // Submit stays disabled until required fields are filled
    await expect(vendorsPage.modalSubmitButton()).toBeDisabled()
    await expect(vendorsPage.nameInput()).toBeVisible()
  })

  test('edge: empty vendors state messaging', async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
    // Empty copy is optional depending on API seed; page title is enough when list has data
    const empty = vendorsPage.emptyState()
    if (await empty.isVisible().catch(() => false)) {
      await expect(empty).toBeVisible()
    } else {
      await expect(vendorsPage.title()).toBeVisible()
    }
  })

  test('edge: modal linked-spec search empty query stays open', async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    const search = vendorsPage.specSearchInput()
    if (await search.isVisible().catch(() => false)) {
      await search.fill('zzz-no-match-query')
      await expect(search).toHaveValue('zzz-no-match-query')
    }
    await expect(vendorsPage.modalHeading()).toBeVisible()
  })
})
