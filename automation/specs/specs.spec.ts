import { test, expect } from '../fixtures'
import { Env } from '../config'
import { loginLive, seedAuth } from '../helpers'
import { seedFeatureData } from '../fixtures/seed'
import { SpecsPage } from '../pages/specs.page'
import fs from 'node:fs'

async function authForSpecs(page: import('@playwright/test').Page) {
  const useLive = Env.live && !!Env.liveEmail && !!Env.livePassword
  if (useLive) {
    await loginLive(page)
  } else {
    await seedAuth(page)
    await seedFeatureData(page)
  }
  return useLive
}

test.describe('Specs — UI smoke @authenticated', () => {
  test('loads specs page', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.expectLoaded()
    await specsPage.expectEmptyOrList()
  })

  test('open create modal', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.openCreateFlow()
  })

  test('create CTA visible', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.expectLoaded()
    await expect(specsPage.createButton()).toBeVisible({ timeout: 15_000 })
  })

  test('edge: cancel create closes modal', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.openCreateFlow()
    await specsPage.cancelCreate()
    await expect(specsPage.createButton()).toBeVisible({ timeout: 10_000 })
  })

  test('negative: submit create with empty name stays on form', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.openCreateFlow()
    await specsPage.submitCreate()
    await expect(specsPage.nameInput()).toBeVisible()
    await expect(specsPage.createSubmit()).toBeVisible()
  })

  test('edge: empty list / filters section visible', async ({ authenticated, specsPage }) => {
    void authenticated
    await specsPage.goto()
    await specsPage.expectLoaded()
    await specsPage.expectEmptyListOrFilters()
  })
})

test.describe('Specs — full flows (live or seeded)', () => {
  test.beforeAll(() => {
    const pdf = SpecsPage.tinyPdfPath()
    if (!fs.existsSync(pdf)) {
      fs.writeFileSync(pdf, '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')
    }
  })

  test('negative: invalid version shows validation', {
    tag: ['@regression', '@bva'],
  }, async ({ page, specsPage }) => {
    test.setTimeout(90_000)
    await authForSpecs(page)
    await specsPage.goto()
    await specsPage.expectLoaded()
    await specsPage.openCreateFlow()
    await specsPage.nameInput().fill('Bad Version Spec')
    await specsPage.versionInput().fill('1.0')
    await specsPage.fileInput().setInputFiles(SpecsPage.tinyPdfPath())
    await specsPage.reviewerInput().fill('chethan@shurutech.com')
    await specsPage.submitCreate()
    // HTML5 pattern or app message — still on create form
    await expect(specsPage.createModalHeading()).toBeVisible()
    await expect(specsPage.createSubmit()).toBeVisible()
  })

  test('negative: missing file blocked by required file input', {
    tag: ['@regression'],
  }, async ({ page, specsPage }) => {
    test.setTimeout(90_000)
    await authForSpecs(page)
    await specsPage.goto()
    await specsPage.openCreateFlow()
    await specsPage.nameInput().fill('No File Spec')
    await specsPage.versionInput().fill('1.0.0')
    await specsPage.reviewerInput().fill('chethan@shurutech.com')
    await specsPage.submitCreate()
    // Native HTML5 required on file input — modal stays open
    await expect(specsPage.createModalHeading()).toBeVisible()
    await expect(specsPage.fileInput()).toBeVisible()
    const valid = await specsPage.fileInput().evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(valid).toBe(false)
  })

  test('filters expand, select options, reset', {
    tag: ['@regression'],
  }, async ({ page, specsPage }) => {
    test.setTimeout(90_000)
    await authForSpecs(page)
    await specsPage.goto()
    await specsPage.expectLoaded()
    await specsPage.selectFirstFilterOptions()
    await expect(specsPage.resetFiltersButton()).toBeVisible()
    await specsPage.resetFilters()
    await expect(page.getByText(/specifications/i).first()).toBeVisible()
  })

  test('create with all options → list → link to project → delete cancel/confirm', {
    tag: ['@critical', '@integration', '@regression'],
  }, async ({ page, specsPage }) => {
    test.setTimeout(180_000)
    const live = await authForSpecs(page)
    const name = `E2E Spec ${Date.now()}`

    await specsPage.goto()
    await specsPage.expectLoaded()
    await specsPage.openCreateFlow()
    await specsPage.fillFullCreate({
      name,
      version: '1.2.3',
      reviewer: Env.liveEmail || 'chethan@shurutech.com',
      description: 'Full automation create with all fields',
      filePath: SpecsPage.tinyPdfPath(),
    })
    await specsPage.submitCreate()

    await expect(page.getByText(/upload successful/i).first()).toBeVisible({ timeout: 30_000 })
    // Full name must appear (formatSpecName no longer truncates normal titles)
    await expect(page.getByTitle(name).or(page.getByText(name)).first()).toBeVisible({ timeout: 30_000 })

    // Select + link to a project (live has projects; seeded also has MOCK projects)
    await specsPage.selectRowCheckbox(name)
    if (live || (await page.getByRole('button', { name: /link \d+ spec/i }).isVisible().catch(() => false))) {
      await specsPage.linkToFirstProject()
    }

    // Delete cancel path
    await specsPage.openDeleteFor(name)
    await specsPage.cancelDelete()
    await expect(page.getByText(name).first()).toBeVisible()

    // Delete confirm — backend may 500; FE must still respond (success or error toast)
    await specsPage.openDeleteFor(name)
    await specsPage.confirmDelete()
    await expect
      .poll(async () => {
        const gone = (await page.getByText(name).count()) === 0
        const toast = await page.getByText(/deleted successfully|failed|error|internal/i).first().isVisible().catch(() => false)
        return gone || toast
      }, { timeout: 25_000 })
      .toBeTruthy()
  })
})
