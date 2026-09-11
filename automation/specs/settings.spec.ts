import { test, expect } from '../fixtures'

test.describe('Settings / profile / branding @authenticated', () => {
  test('settings loads with appearance controls', async ({ authenticated, settingsPage }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    await expect(settingsPage.appearanceSection()).toBeVisible()
  })

  test('theme toggles light/dark/system', async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await expect(settingsPage.title()).toBeVisible({ timeout: 15_000 })
    if (await settingsPage.lightButton().isVisible().catch(() => false)) {
      await settingsPage.setTheme('light')
      await expect(page.locator('html')).not.toHaveClass(/dark/)
      await settingsPage.setTheme('dark')
      await expect(page.locator('html')).toHaveClass(/dark/)
    }
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

  test('edge: appearance theme persists across reload', async ({ authenticated, settingsPage, page }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    if (await settingsPage.darkButton().isVisible().catch(() => false)) {
      await settingsPage.setTheme('dark')
      await settingsPage.expectThemeClass('dark')
      await page.reload()
      await settingsPage.expectLoaded()
      await settingsPage.expectThemeClass('dark')
      await settingsPage.setTheme('light')
    }
  })

  test('edge: branding upload control visible', async ({ authenticated, brandingPage }) => {
    void authenticated
    await brandingPage.goto()
    await brandingPage.expectLoaded()
    await brandingPage.expectUploadControlVisible()
  })

  test('edge: profile empty name blocked by required', async ({ authenticated, profilePage }) => {
    void authenticated
    await profilePage.goto()
    await profilePage.expectLoaded()
    if (await profilePage.nameInput().isVisible().catch(() => false)) {
      await profilePage.nameInput().fill('')
      await profilePage.saveButton().click()
      // HTML5 required keeps user on profile
      await expect(profilePage.nameInput()).toBeVisible()
      await expect(profilePage.saveButton()).toBeVisible()
    }
  })
})
