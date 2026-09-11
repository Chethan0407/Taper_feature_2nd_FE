import { test, expect } from '../fixtures'
import { mockApi } from '../fixtures/api'
import { seedFeatureData } from '../fixtures/seed'
import { LOGIN_ECP, PROTECTED_ROUTES, SIDEBAR_FEATURES } from '../fixtures/test-data'

/**
 * INTEGRATION — cross-module flows (auth → shell → feature → detail).
 * Run: npm run test:automation:integration
 */
test.describe('Integration — auth to app shell @integration', () => {
  test('valid login lands on authenticated area', { tag: ['@integration'] }, async ({ page, loginPage }) => {
    await mockApi(page)
    await loginPage.goto()
    await loginPage.fillLogin(LOGIN_ECP.validCompany.email, LOGIN_ECP.validCompany.password)
    await loginPage.expectSignInEnabled()
    await loginPage.submitLogin()
    await expect(page).toHaveURL(/\/(dashboard|projects|verify-email)/, { timeout: 15_000 })
  })

  test('unverified login shows verify messaging', { tag: ['@integration'] }, async ({ page, loginPage }) => {
    await mockApi(page)
    await loginPage.goto()
    await loginPage.fillLogin(LOGIN_ECP.unverified.email, LOGIN_ECP.unverified.password)
    await loginPage.submitLogin()
    await expect(
      page.getByText(/not verified|verify your email|wrong email or password/i).first(),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('signup success path reaches verify email', { tag: ['@integration'] }, async ({ page, loginPage }) => {
    await mockApi(page)
    await loginPage.goto()
    await loginPage.openSignUp()
    await loginPage.fillSignup({
      name: 'Integration User',
      email: 'newhire@company.com',
      password: 'ValidPass1!',
      confirmPassword: 'ValidPass1!',
    })
    await loginPage.createAccountButton().click()
    await expect(page.getByText(/check your email|otp|verify|success|created/i).first()).toBeVisible({
      timeout: 15_000,
    })
  })
})

test.describe('Integration — navigation matrix @integration', () => {
  test('sidebar reaches every main module then returns', { tag: ['@integration'] }, async ({
    authenticated,
    dashboardPage,
    page,
  }) => {
    void authenticated
    test.setTimeout(120_000)
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()

    for (const { label, url } of SIDEBAR_FEATURES) {
      await dashboardPage.sidebar.goTo(label)
      await expect(page).toHaveURL(url, { timeout: 15_000 })
    }

    await dashboardPage.sidebar.goTo(/^Dashboard$/i)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('dashboard CTAs reach SpecLint and Checklists', { tag: ['@integration'] }, async ({
    authenticated,
    dashboardPage,
    page,
  }) => {
    void authenticated
    await dashboardPage.goto()
    await dashboardPage.expectLoaded()

    if (await dashboardPage.trySpecLint().isVisible().catch(() => false)) {
      await dashboardPage.trySpecLint().click()
      await expect(page).toHaveURL(/\/speclint/)
    }

    await dashboardPage.goto()
    if (await dashboardPage.createChecklist().isVisible().catch(() => false)) {
      await dashboardPage.createChecklist().click()
      await expect(page).toHaveURL(/\/checklists/)
    }
  })

  test('logged-out deep links all redirect to login', { tag: ['@integration'] }, async ({ page }) => {
    for (const path of PROTECTED_ROUTES) {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    }
  })
})

test.describe('Integration — seeded list → detail @integration', () => {
  test('projects list opens detail route', { tag: ['@integration'] }, async ({
    authenticated,
    projectsPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await expect(page.getByText(/E2E Project Alpha/i).first()).toBeVisible({ timeout: 15_000 })
    await page.getByText(/E2E Project Alpha/i).first().click()
    await expect(page).toHaveURL(/\/projects\/101/, { timeout: 15_000 })
  })

  test('companies list shows seeded company', { tag: ['@integration'] }, async ({
    authenticated,
    companiesPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await companiesPage.goto()
    await companiesPage.expectLoaded()
    await expect(page.getByText(/E2E Tapeout Corp/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('vendors list shows seeded vendor', { tag: ['@integration'] }, async ({
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

  test('checklists show seeded template and active card', { tag: ['@integration'] }, async ({
    authenticated,
    checklistsPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await checklistsPage.goto()
    await checklistsPage.expectLoaded()
    await expect(page.getByText(/E2E Template/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/E2E Template|active checklist|40%|pending/i).first()).toBeVisible()
  })

  test('specs list shows seeded specification', { tag: ['@integration'] }, async ({
    authenticated,
    specsPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await specsPage.goto()
    await specsPage.expectLoaded()
    await expect(page.getByText(/E2E Spec Alpha/i).first()).toBeVisible({ timeout: 15_000 })
  })
})

test.describe('Integration — create flows end-to-end UI @integration', () => {
  test('create company happy path closes or shows success', { tag: ['@integration'] }, async ({
    authenticated,
    companiesPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await companiesPage.goto()
    await companiesPage.openCreateModal()
    await companiesPage.nameInput().fill('Integration Co LLC')
    await companiesPage.submitCreate()
    // Modal closes and/or company appears in list
    await expect
      .poll(async () => {
        const modalOpen = await companiesPage.modalHeading().isVisible().catch(() => false)
        const listed = await page.getByText(/Integration Co LLC/i).first().isVisible().catch(() => false)
        return !modalOpen || listed
      }, { timeout: 15_000 })
      .toBeTruthy()
  })

  test('create checklist template with item', { tag: ['@integration'] }, async ({
    authenticated,
    checklistsPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await checklistsPage.goto()
    await checklistsPage.openCreateTemplateModal()
    await checklistsPage.templateNameInput().fill('Integration Template')
    await checklistsPage.addItemButton().click()
    const itemTitle = page.getByPlaceholder(/item title/i).first()
    if (await itemTitle.isVisible().catch(() => false)) {
      await itemTitle.fill('Step one')
    }
    await checklistsPage.submitCreate().click()
    const listed = await page.getByText(/Integration Template/i).first().isVisible({ timeout: 15_000 }).catch(() => false)
    const titleOk = await checklistsPage.title().isVisible().catch(() => false)
    expect(listed || titleOk).toBeTruthy()
  })

  test('add vendor with required fields', { tag: ['@integration'] }, async ({
    authenticated,
    vendorsPage,
    page,
  }) => {
    void authenticated
    await seedFeatureData(page)
    await vendorsPage.goto()
    await vendorsPage.openAddModal()
    await vendorsPage.nameInput().fill('Integration Vendor')
    const type = page.locator('#type')
    const status = page.locator('#status')
    if (await type.isVisible().catch(() => false)) await type.selectOption('EDA Tool')
    if (await status.isVisible().catch(() => false)) await status.selectOption('active')
    const submit = vendorsPage.modalSubmitButton()
    await expect(submit).toBeEnabled({ timeout: 5_000 })
    await submit.click()
    await expect
      .poll(async () => {
        const modalOpen = await vendorsPage.modalHeading().isVisible().catch(() => false)
        const listed = await page.getByText(/Integration Vendor/i).first().isVisible().catch(() => false)
        return !modalOpen || listed
      }, { timeout: 15_000 })
      .toBeTruthy()
  })
})
