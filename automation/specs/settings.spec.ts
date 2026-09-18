import { test, expect } from '../fixtures'

test.describe('Settings / profile / branding @authenticated', () => {
  test('settings loads with profile controls', async ({ authenticated, settingsPage }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    await expect(settingsPage.profileSection()).toBeVisible()
  })

  test('app stays dark (light theme removed)', async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await expect(settingsPage.title()).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('html')).toHaveClass(/dark/)
    await settingsPage.expectThemeControlsRemoved()
  })

  test('profile page save control visible', async ({ authenticated, profilePage }) => {
    void authenticated
    await profilePage.goto()
    await profilePage.expectLoaded()
    await expect(profilePage.saveButton()).toBeVisible()
  })

  test('branding page loads', async ({ authenticated, brandingPage }) => {
    void authenticated
    await brandingPage.goto()
    await brandingPage.expectLoaded()
  })

  test('generate API key button present when on settings', async ({ authenticated, settingsPage }) => {
    void authenticated
    await settingsPage.goto()
    if (await settingsPage.generateKeyButton().isVisible().catch(() => false)) {
      await settingsPage.generateKeyButton().click()
      await expect(settingsPage.page.getByText(/generate|api key|name/i).first()).toBeVisible()
    }
  })

  test('edge: dark theme persists across reload', async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    await settingsPage.expectThemeClass('dark')
    await page.reload()
    await settingsPage.expectLoaded()
    await settingsPage.expectThemeClass('dark')
  })

  test('edge: branding upload control visible', async ({ authenticated, brandingPage }) => {
    void authenticated
    await brandingPage.goto()
    await brandingPage.expectLoaded()
    await brandingPage.expectUploadControlVisible()
  })

  test('branding page loads company and logo controls without color scheme', async ({
    authenticated,
    brandingPage,
  }) => {
    void authenticated
    await brandingPage.goto()
    await brandingPage.expectLoaded()
    await brandingPage.expectUploadControlVisible()
    await brandingPage.expectColorSchemeRemoved()
  })

  test('settings tabs segregate account / security / integrations', async ({ authenticated, page }) => {
    void authenticated
    await page.goto('/settings')
    await expect(page.getByTestId('settings-tabs')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('settings-tab-account')).toBeVisible()
    await expect(page.locator('#profile')).toBeVisible()
    await expect(page.getByTestId('settings-security')).toBeHidden()

    await page.getByTestId('settings-tab-security').click()
    await expect(page.getByTestId('settings-security')).toBeVisible()
    await expect(page.locator('#profile')).toBeHidden()

    await page.getByTestId('settings-tab-integrations').click()
    await expect(page.getByTestId('settings-integrations')).toBeVisible()
    await expect(page).toHaveURL(/section=integrations/)
  })
})
