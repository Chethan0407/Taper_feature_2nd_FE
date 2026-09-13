import { test, expect } from '../fixtures'

/**
 * Guards for UI we intentionally removed:
 * - Light / Appearance theme controls (app is dark-only)
 * - Color Scheme pickers + preview on Settings + Branding
 */
test.describe('Removed settings surfaces @regression @critical', () => {
  test('settings has no Appearance / Light / Dark / System controls', async ({
    authenticated,
    settingsPage,
    page,
  }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    await settingsPage.expectThemeControlsRemoved()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByText(/light, dark, or match your device/i)).toHaveCount(0)
  })

  test('header profile menu has no Appearance link', async ({
    authenticated,
    settingsPage,
    page,
  }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()

    const profileTrigger = page.getByText(/chethan|profile|gopal/i).last()
    if (await profileTrigger.isVisible().catch(() => false)) {
      await profileTrigger.click()
    }
    await expect(page.getByRole('link', { name: /^appearance$/i })).toHaveCount(0)
  })

  test('legacy light localStorage is forced to dark', async ({
    authenticated,
    settingsPage,
    page,
  }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()

    await page.evaluate(() => {
      localStorage.setItem('theme', 'light')
    })
    await page.reload()
    await settingsPage.expectLoaded()

    await expect(page.locator('html')).toHaveClass(/dark/)
    const stored = await page.evaluate(() => localStorage.getItem('theme'))
    expect(stored).toBe('dark')
  })

  test('settings branding card has no color scheme UI', async ({
    authenticated,
    settingsPage,
  }) => {
    void authenticated
    await settingsPage.goto()
    await settingsPage.expectLoaded()
    await expect(settingsPage.brandingSection()).toBeVisible()
    await settingsPage.expectColorSchemeRemoved()
  })

  test('branding page has no Color Scheme / preview / color inputs', async ({
    authenticated,
    brandingPage,
  }) => {
    void authenticated
    await brandingPage.goto()
    await brandingPage.expectLoaded()
    await brandingPage.expectUploadControlVisible()
    await brandingPage.expectColorSchemeRemoved()
    await expect(brandingPage.page.getByText(/company logo|upload logo|company information/i).first()).toBeVisible()
  })

  test('deep-link ?section=appearance still loads settings without theme UI', async ({
    authenticated,
    settingsPage,
    page,
  }) => {
    void authenticated
    await page.goto('/settings?section=appearance')
    await settingsPage.expectLoaded()
    await settingsPage.expectThemeControlsRemoved()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
