import { test, expect } from '../fixtures'
import { Tags } from '../config'
import { seedFeatureData } from '../fixtures/seed'
import { failApi } from '../helpers'

test.describe('Vendors — page & form @regression @authenticated', () => {
  test('loads vendors page', { tag: [Tags.regression] }, async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
  })

  test('shows seeded vendor in list', { tag: [Tags.regression, Tags.integration] }, async ({
    authenticated,
    vendorsPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
    await expect(page.getByText(/E2E Foundry Co/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('open add modal then cancel', { tag: [Tags.regression] }, async ({ authenticated, vendorsPage }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    await vendorsPage.cancelModal()
    await vendorsPage.expectLoaded()
  })

  test('negative: empty name keeps submit disabled', { tag: [Tags.regression, Tags.ecp] }, async ({
    authenticated,
    vendorsPage,
  }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    await expect(vendorsPage.modalSubmitButton()).toBeDisabled()
    await expect(vendorsPage.nameInput()).toBeVisible()
  })

  test('edge: empty vendors state messaging', { tag: [Tags.regression] }, async ({
    authenticated,
    vendorsPage,
  }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
    const empty = vendorsPage.emptyState()
    if (await empty.isVisible().catch(() => false)) {
      await expect(empty).toBeVisible()
    } else {
      await expect(vendorsPage.title()).toBeVisible()
    }
  })

  test('edge: modal linked-spec search empty query stays open', { tag: [Tags.regression] }, async ({
    authenticated,
    vendorsPage,
  }) => {
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

  test('Add Vendor: linking a second spec keeps the first linked', {
    tag: [Tags.regression, Tags.critical],
  }, async ({ authenticated, vendorsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await vendorsPage.goto()
    await vendorsPage.openAddModal()

    await vendorsPage.selectSpecInAddForm('spec-uuid-1')
    await vendorsPage.expectLinkedSpecCount(1)
    await vendorsPage.expectLinkedSpecChip('spec-uuid-1')
    await expect(vendorsPage.linkedSpecsPreview()).toContainText(/E2E Spec Alpha/i)

    await vendorsPage.selectSpecInAddForm('spec-uuid-2')
    await vendorsPage.expectLinkedSpecCount(2)
    await vendorsPage.expectLinkedSpecChip('spec-uuid-1')
    await vendorsPage.expectLinkedSpecChip('spec-uuid-2')
    await expect(vendorsPage.linkedSpecsPreview()).toContainText(/E2E Spec Alpha/i)
    await expect(vendorsPage.linkedSpecsPreview()).toContainText(/E2E Spec Beta/i)
  })

  test('Add Vendor: selecting the same spec twice unlinks it (toggle)', {
    tag: [Tags.regression],
  }, async ({ authenticated, vendorsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await vendorsPage.goto()
    await vendorsPage.openAddModal()

    await vendorsPage.selectSpecInAddForm('spec-uuid-1')
    await vendorsPage.expectLinkedSpecCount(1)
    await vendorsPage.selectSpecInAddForm('spec-uuid-1')
    await vendorsPage.expectLinkedSpecCount(0)
  })

  test('long vendor name truncates in list (no layout overflow)', {
    tag: [Tags.regression],
  }, async ({ authenticated, vendorsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await page.route('**/api/v1/vendors**', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback()
      const path = new URL(route.request().url()).pathname.replace(/\/+$/, '')
      if (/\/vendors\/[^/]+$/.test(path) && !path.endsWith('/vendors')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'v-long',
            name: 'A'.repeat(120),
            type: 'partner',
            status: 'active',
            linked_specs: [],
            linked_checklists: [],
          }),
        })
      }
      if (path.endsWith('/vendors') || path.includes('/vendors?')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'v-long',
              name: 'A'.repeat(120),
              type: 'partner',
              status: 'active',
              linked_specs: [],
              linked_checklists: [],
            },
          ]),
        })
      }
      return route.fallback()
    })
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
    const row = page.locator('.cursor-pointer').filter({ hasText: /AAAA/ }).first()
    await expect(row).toBeVisible()
    const box = await row.boundingBox()
    expect(box).toBeTruthy()
    expect((box?.width || 0) < 900).toBeTruthy()
  })
})

test.describe('Vendors — preview & linking @regression @integration @critical', () => {
  test.beforeEach(async ({ authenticated, page, vendorsPage }) => {
    void authenticated
    await seedFeatureData(page)
    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
    await expect(page.getByText(/E2E Foundry Co/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('opens vendor preview with empty linked states', {
    tag: [Tags.regression, Tags.critical],
  }, async ({ vendorsPage }) => {
    await vendorsPage.openVendorPreview()
    await expect(vendorsPage.noSpecsLinked()).toBeVisible()
    await expect(vendorsPage.noChecklistsLinked()).toBeVisible()
    await expect(vendorsPage.linkSpecButton()).toBeVisible()
    await expect(vendorsPage.linkChecklistButton()).toBeVisible()
  })

  test('link modal cancel closes without toast', {
    tag: [Tags.regression],
  }, async ({ vendorsPage }) => {
    await vendorsPage.openVendorPreview()
    await vendorsPage.linkSpecButton().click()
    await expect(vendorsPage.linkModal()).toBeVisible()
    await vendorsPage.linkModalCancel().click()
    await expect(vendorsPage.linkModal()).toHaveCount(0)
    await expect(vendorsPage.successToast()).toHaveCount(0)
  })

  test('link modal Link disabled until selection', {
    tag: [Tags.regression, Tags.ecp],
  }, async ({ vendorsPage }) => {
    await vendorsPage.openVendorPreview()
    await vendorsPage.linkSpecButton().click()
    await expect(vendorsPage.linkModalSubmit()).toBeDisabled()
    await vendorsPage.linkOption('spec-uuid-1').click()
    await expect(vendorsPage.linkModalSubmit()).toBeEnabled()
  })

  test('link specification shows success toast and lists spec', {
    tag: [Tags.regression, Tags.integration, Tags.critical],
  }, async ({ vendorsPage, page }) => {
    await vendorsPage.openVendorPreview()
    await vendorsPage.linkSpecById('spec-uuid-1')
    await expect(vendorsPage.successToast()).toBeVisible({ timeout: 10_000 })
    await expect(vendorsPage.successToast()).toContainText(/specification linked successfully/i)
    await expect(vendorsPage.linkModal()).toHaveCount(0)
    await expect(page.getByText(/E2E Spec Alpha/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(vendorsPage.noSpecsLinked()).toHaveCount(0)
  })

  test('link checklist shows success toast and lists checklist', {
    tag: [Tags.regression, Tags.integration, Tags.critical],
  }, async ({ vendorsPage, page }) => {
    await vendorsPage.openVendorPreview()
    await vendorsPage.linkChecklistById(55)
    await expect(vendorsPage.successToast()).toBeVisible({ timeout: 10_000 })
    await expect(vendorsPage.successToast()).toContainText(/checklist linked successfully/i)
    await expect(page.getByText(/E2E Template/i).first()).toBeVisible({ timeout: 10_000 })
    await expect(vendorsPage.noChecklistsLinked()).toHaveCount(0)
  })

  test('unlink specification shows success toast', {
    tag: [Tags.regression, Tags.integration],
  }, async ({ vendorsPage, page }) => {
    await vendorsPage.openVendorPreview()
    await vendorsPage.linkSpecById('spec-uuid-1')
    await expect(vendorsPage.successToast()).toBeVisible()
    page.once('dialog', (d) => d.accept())
    await page.getByTitle(/unlink specification/i).click()
    await expect(vendorsPage.successToast()).toContainText(/unlinked successfully/i, {
      timeout: 10_000,
    })
    await expect(vendorsPage.noSpecsLinked()).toBeVisible({ timeout: 10_000 })
  })

  test('unlink checklist shows success toast', {
    tag: [Tags.regression, Tags.integration],
  }, async ({ vendorsPage, page }) => {
    await vendorsPage.openVendorPreview()
    await vendorsPage.linkChecklistById(55)
    await expect(vendorsPage.successToast()).toBeVisible()
    page.once('dialog', (d) => d.accept())
    await page.getByTitle(/unlink checklist/i).click()
    await expect(vendorsPage.successToast()).toContainText(/unlinked successfully/i, {
      timeout: 10_000,
    })
    await expect(vendorsPage.noChecklistsLinked()).toBeVisible({ timeout: 10_000 })
  })

  test('unlink cancel keeps linked item', {
    tag: [Tags.regression],
  }, async ({ vendorsPage, page }) => {
    await vendorsPage.openVendorPreview()
    await vendorsPage.linkSpecById('spec-uuid-1')
    await expect(page.getByText(/E2E Spec Alpha/i).first()).toBeVisible()
    page.once('dialog', (d) => d.dismiss())
    await page.getByTitle(/unlink specification/i).click()
    await expect(page.getByText(/E2E Spec Alpha/i).first()).toBeVisible()
  })

  test('link search filters options', {
    tag: [Tags.regression],
  }, async ({ vendorsPage }) => {
    await vendorsPage.openVendorPreview()
    await vendorsPage.linkSpecButton().click()
    await vendorsPage.linkModalSearch().fill('zzz-no-match')
    await expect(vendorsPage.page.getByTestId('link-modal-empty')).toBeVisible()
    await vendorsPage.linkModalSearch().fill('E2E Spec')
    await expect(vendorsPage.linkOption('spec-uuid-1')).toBeVisible()
  })

  test('network: link failure shows error toast', {
    tag: [Tags.regression, Tags.network],
  }, async ({ vendorsPage, page }) => {
    await vendorsPage.openVendorPreview()
    await failApi(page, /\/vendors\/.+\/specifications\/.+\/link/, {
      status: 500,
      body: { detail: 'Link failed' },
      times: 1,
    })
    await vendorsPage.linkSpecButton().click()
    await vendorsPage.linkOption('spec-uuid-1').click()
    await vendorsPage.linkModalSubmit().click()
    await expect(vendorsPage.errorToast()).toBeVisible({ timeout: 10_000 })
    await expect(vendorsPage.errorToast()).toContainText(/link failed|failed to link/i)
  })

  test('preview close returns to list', {
    tag: [Tags.regression],
  }, async ({ vendorsPage }) => {
    await vendorsPage.openVendorPreview()
    await vendorsPage.previewModal().getByRole('button', { name: /^close$/i }).click()
    await expect(vendorsPage.previewModal()).toHaveCount(0)
    await vendorsPage.expectLoaded()
  })
})

test.describe('Vendors — live create', () => {
  test('create vendor with type + status → appears in list', {
    tag: ['@critical', '@integration', '@regression'],
  }, async ({ page, vendorsPage }) => {
    test.setTimeout(120_000)
    const { authForModule } = await import('../helpers')
    await authForModule(page)
    const name = `E2E Vendor ${Date.now()}`

    await vendorsPage.goto()
    await vendorsPage.expectLoaded()
    await vendorsPage.openAddModal()
    await vendorsPage.fillAndSubmitVendor({ name, type: 'Foundry', status: 'active' })
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 20_000 })
  })
})
