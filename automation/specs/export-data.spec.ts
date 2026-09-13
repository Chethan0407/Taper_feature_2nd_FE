import { test, expect } from '../fixtures'
import { Tags } from '../config'
import path from 'node:path'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'

test.describe('Admin data transfer on Settings @regression @roles', () => {
  test('admin/superuser sees Data export & import on Settings', {
    tag: [Tags.regression, Tags.roles, Tags.critical],
  }, async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()

    const section = page.getByTestId('settings-export-section')
    await expect(section).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('download-complete-zip')).toBeVisible()
    await expect(page.getByTestId('download-import-template-zip')).toBeVisible()
    await expect(page.getByTestId('import-file-input')).toBeAttached()
    await expect(page.getByTestId('admin-exports-menu')).toBeVisible()
  })

  test('Download all data ZIP works from Settings', {
    tag: [Tags.regression, Tags.critical],
  }, async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    await expect(page.getByTestId('settings-export-section')).toBeVisible({ timeout: 15_000 })

    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 })
    await page.getByTestId('download-complete-zip').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/complete-export\.zip|tapeoutops-complete/i)
  })

  test('Get import template ZIP works from Settings', {
    tag: [Tags.regression],
  }, async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 })
    await page.getByTestId('download-import-template-zip').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/import-template\.zip|tapeoutops-import/i)
  })

  test('per-table Export users CSV from Settings', {
    tag: [Tags.regression],
  }, async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    const exportMenu = page.getByTestId('admin-exports-menu')
    await expect(exportMenu).toBeVisible({ timeout: 15_000 })
    await exportMenu.getByRole('button', { name: /export/i }).click()
    await expect(page.getByTestId('export-resource-users')).toBeVisible()
    await page.getByTestId('export-resource-users').click()
    await expect(page.getByTestId('export-format-csv')).toBeVisible({ timeout: 10_000 })
    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 })
    await page.getByTestId('export-format-csv').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/users-export\.csv/i)
  })

  test('export lists all expected resources', {
    tag: [Tags.regression],
  }, async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    const exportMenu = page.getByTestId('admin-exports-menu')
    await exportMenu.getByRole('button', { name: /export/i }).click()
    for (const id of [
      'users',
      'companies',
      'projects',
      'vendors',
      'specifications',
      'checklist-templates',
      'active-checklists',
    ]) {
      await expect(page.getByTestId(`export-resource-${id}`)).toBeVisible()
    }
  })

  test('upload existing JSON shows import results', {
    tag: [Tags.regression, Tags.critical],
  }, async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    await expect(page.getByTestId('settings-export-section')).toBeVisible()

    const dir = mkdtempSync(path.join(tmpdir(), 'tapeout-import-'))
    const filePath = path.join(dir, 'tapeoutops_complete_export.json')
    writeFileSync(
      filePath,
      JSON.stringify({ schema_version: 1, companies: [{ name: 'Imported Co' }] }),
    )

    await page.getByTestId('import-file-input').setInputFiles(filePath)
    await expect(page.getByTestId('import-results')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('import-results')).toContainText(/companies/i)
    await expect(page.getByTestId('import-results')).toContainText(/projects/i)
  })

  test('engineer does not see Data transfer on Settings', {
    tag: [Tags.regression, Tags.roles],
  }, async ({ authenticatedEngineer, settingsPage, page }) => {
    void authenticatedEngineer
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    await expect(page.getByTestId('settings-export-section')).toHaveCount(0)
    await expect(page.getByTestId('admin-exports-menu')).toHaveCount(0)
    await expect(page.getByTestId('export-data-button')).toHaveCount(0)
  })

  test('System Usage and list pages no longer own Export CTA', {
    tag: [Tags.regression],
  }, async ({ authenticated, adminUsagePage, projectsPage, companiesPage, page }) => {
    void authenticated
    await adminUsagePage.goto()
    await adminUsagePage.expectLoaded()
    await expect(page.getByTestId('admin-exports-menu')).toHaveCount(0)

    await projectsPage.goto()
    await projectsPage.expectLoaded()
    await expect(page.getByTestId('export-data-button')).toHaveCount(0)
    await expect(page.getByTestId('admin-exports-menu')).toHaveCount(0)

    await companiesPage.goto()
    await companiesPage.expectLoaded()
    await expect(page.getByTestId('export-data-button')).toHaveCount(0)
  })
})
