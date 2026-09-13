import { test, expect } from '../fixtures'
import { seedFeatureData } from '../fixtures/seed'
import { COMPANY_NAME_BVA, COMPANY_DESC_BVA, NAME_ECP } from '../fixtures/test-data'

/**
 * BVA + ECP — form fields across Companies / Projects / Vendors / Specs / Checklists.
 * Run: npm run test:automation:bva
 */
test.describe('BVA — company name maxlength 100 @bva @regression', () => {
  test('empty name stays on create modal', { tag: ['@bva', '@ecp', '@regression'] }, async ({
    authenticated,
    companiesPage,
  }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    await companiesPage.nameInput().fill(COMPANY_NAME_BVA.empty)
    await companiesPage.submitCreate()
    await expect(companiesPage.modalHeading()).toBeVisible()
  })

  test('BVA 1-char name accepted by input', { tag: ['@bva', '@regression'] }, async ({
    authenticated,
    companiesPage,
  }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    await companiesPage.nameInput().fill(COMPANY_NAME_BVA.one)
    await expect(companiesPage.nameInput()).toHaveValue('A')
  })

  test('BVA 100-char name fills (max boundary)', { tag: ['@bva', '@regression'] }, async ({
    authenticated,
    companiesPage,
    page,
  }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    await companiesPage.nameInput().fill(COMPANY_NAME_BVA.at100)
    await expect(companiesPage.nameInput()).toHaveValue(COMPANY_NAME_BVA.at100)
    await expect(page.getByText(/100\/100/i).first()).toBeVisible()
  })

  test('BVA 101 truncated by maxlength attribute', { tag: ['@bva', '@regression'] }, async ({
    authenticated,
    companiesPage,
  }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    await companiesPage.nameInput().fill(COMPANY_NAME_BVA.over101)
    const value = await companiesPage.nameInput().inputValue()
    expect(value.length).toBeLessThanOrEqual(100)
  })

  test('BVA description 500 boundary', { tag: ['@bva', '@regression'] }, async ({
    authenticated,
    companiesPage,
    page,
  }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    const desc = page.getByPlaceholder(/company description/i).first()
    await desc.fill(COMPANY_DESC_BVA.at500)
    await expect(desc).toHaveValue(COMPANY_DESC_BVA.at500)
    await expect(page.getByText(/500\/500/i).first()).toBeVisible()
  })

  test('BVA description 501 truncated', { tag: ['@bva', '@regression'] }, async ({
    authenticated,
    companiesPage,
    page,
  }) => {
    void authenticated
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    const desc = page.getByPlaceholder(/company description/i).first()
    await desc.fill(COMPANY_DESC_BVA.over501)
    const value = await desc.inputValue()
    expect(value.length).toBeLessThanOrEqual(500)
  })
})

test.describe('ECP — project create field classes @ecp @bva @regression', () => {
  test('empty name class blocks create', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    projectsPage,
  }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.openCreateModal()
    await projectsPage.createProjectButton().click()
    await expect(projectsPage.createProjectButton()).toBeVisible()
  })

  test('valid name class fills form', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    projectsPage,
  }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.openCreateModal()
    await projectsPage.projectNameInput().fill(NAME_ECP.valid[0])
    await expect(projectsPage.projectNameInput()).toHaveValue(NAME_ECP.valid[0])
  })

  test('whitespace-only name class', { tag: ['@ecp', '@bva', '@regression'] }, async ({
    authenticated,
    projectsPage,
  }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.openCreateModal()
    await projectsPage.projectNameInput().fill(NAME_ECP.whitespace)
    await projectsPage.createProjectButton().click()
    // Still on form (HTML5 required / app validation)
    await expect(projectsPage.createProjectButton()).toBeVisible()
  })

  test('required selects present (platform/eda/type)', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    projectsPage,
    page,
  }) => {
    void authenticated
    await projectsPage.goto()
    await projectsPage.openCreateModal()
    await expect(page.getByText(/platform/i).first()).toBeVisible()
    await expect(page.getByText(/eda tool/i).first()).toBeVisible()
    await expect(page.locator('select').first()).toBeVisible()
  })
})

test.describe('ECP — vendor form classes @ecp @regression', () => {
  test('empty required fields stay on modal', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    vendorsPage,
  }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    await vendorsPage.submitAdd()
    await expect(vendorsPage.modalHeading()).toBeVisible()
  })

  test('name-only without type/status stays invalid', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    vendorsPage,
    page,
  }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    await vendorsPage.nameInput().fill('Partial Vendor')
    // Type/status still empty → submit stays disabled
    await expect(vendorsPage.modalSubmitButton()).toBeDisabled()
    await expect(vendorsPage.modalHeading()).toBeVisible()
  })

  test('valid type options exist (equivalence set)', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    vendorsPage,
    page,
  }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    const type = page.locator('#type')
    await expect(type).toBeVisible()
    for (const label of ['EDA Tool', 'Foundry', 'Other']) {
      await expect(type.locator(`option`, { hasText: label })).toHaveCount(1)
    }
  })

  test('status equivalence set active/pending/inactive', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    vendorsPage,
    page,
  }) => {
    void authenticated
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    const status = page.locator('#status')
    await expect(status.locator('option[value="active"]')).toHaveCount(1)
    await expect(status.locator('option[value="pending"]')).toHaveCount(1)
    await expect(status.locator('option[value="inactive"]')).toHaveCount(1)
  })
})

test.describe('ECP — specs / checklists / search @ecp @regression', () => {
  test('specs create empty name/version class', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    specsPage,
  }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.openCreateFlow()
    await specsPage.submitCreate()
    // Modal remains open (HTML5 required / app validation)
    await expect(specsPage.createSubmit()).toBeVisible()
    await expect(specsPage.nameInput()).toBeVisible()
  })

  test('checklist empty template name class', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    checklistsPage,
  }) => {
    void authenticated
    await checklistsPage.goto()
    await checklistsPage.openCreateTemplateModal()
    await checklistsPage.submitEmptyTemplate()
    await expect(checklistsPage.templateNameInput()).toBeVisible()
    await expect(checklistsPage.submitCreate()).toBeVisible()
  })

  test('checklist add-item then remove equivalence', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    checklistsPage,
    page,
  }) => {
    void authenticated
    await checklistsPage.goto()
    await checklistsPage.openCreateTemplateModal()
    await checklistsPage.templateNameInput().fill('ECP Template')
    // Modal seeds one blank item by design — add a second, then remove one
    const itemTitles = page.getByPlaceholder(/item title/i)
    await expect(itemTitles.first()).toBeVisible()
    const before = await itemTitles.count()
    await checklistsPage.addItemButton().click()
    await expect(itemTitles).toHaveCount(before + 1)
    await page.getByTitle(/remove item/i).last().click()
    await expect(itemTitles).toHaveCount(before)
  })

  test('companies search no-match class', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    companiesPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await companiesPage.goto()
    if (await companiesPage.searchInput().isVisible().catch(() => false)) {
      await companiesPage.search('zzz-no-match-ecp-999')
      await expect(page.getByText(/Searching for:\s*"zzz-no-match-ecp-999"/i)).toBeVisible()
      await expect
        .poll(async () => {
          const noMatch = await companiesPage.noSearchResults().isVisible().catch(() => false)
          const stillSeeded = await page.getByText(/E2E Tapeout Corp/i).first().isVisible().catch(() => false)
          return noMatch || !stillSeeded
        }, { timeout: 15_000 })
        .toBeTruthy()
    }
  })

  test('companies search match class', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    companiesPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await companiesPage.goto()
    if (await companiesPage.searchInput().isVisible().catch(() => false)) {
      await companiesPage.search('Tapeout')
      await expect(page.getByText(/E2E Tapeout Corp/i).first()).toBeVisible({ timeout: 15_000 })
    }
  })
})

test.describe('BVA — SpecLint pattern field @bva @ecp @regression', () => {
  test('empty pattern class — add rule no-op', { tag: ['@ecp', '@regression'] }, async ({
    authenticated,
    specLintPage,
  }) => {
    void authenticated
    await specLintPage.goto()
    await specLintPage.clearPattern()
    await specLintPage.addRuleButton().click()
    await expect(specLintPage.ruleBuilder()).toBeVisible()
  })

  test('single-char pattern boundary', { tag: ['@bva', '@regression'] }, async ({
    authenticated,
    specLintPage,
  }) => {
    void authenticated
    await specLintPage.goto()
    await specLintPage.patternInput().fill('x')
    await expect(specLintPage.patternInput()).toHaveValue('x')
  })

  test('long pattern boundary (~200 chars)', { tag: ['@bva', '@regression'] }, async ({
    authenticated,
    specLintPage,
  }) => {
    void authenticated
    await specLintPage.goto()
    const long = 'P'.repeat(200)
    await specLintPage.patternInput().fill(long)
    await expect(specLintPage.patternInput()).toHaveValue(long)
  })
})
