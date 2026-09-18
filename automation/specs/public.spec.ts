import { test, expect } from '../fixtures'
import { PublicStaticPage } from '../pages'

test.describe('Public / marketing — buttons & links @smoke', () => {
  test('landing: brand + auth CTAs', async ({ landingPage }) => {
    await landingPage.goto()
    await landingPage.expectLoaded()
    await expect(landingPage.getStartedButton()).toBeVisible()
  })

  test('landing: Sign In navigates to login', async ({ landingPage }) => {
    await landingPage.goto()
    await landingPage.goToLoginViaSignIn()
  })

  test('landing: Request a Demo scrolls to demo form', async ({ landingPage, page }) => {
    await landingPage.goto()
    await landingPage.getStartedButton().click()
    await expect(page.locator('#demo')).toBeVisible()
  })

  test('landing: footer legal links exist', async ({ landingPage }) => {
    await landingPage.goto()
    await expect(landingPage.footerPrivacy()).toBeVisible()
    await expect(landingPage.footerTerms()).toBeVisible()
    await expect(landingPage.footerSecurity()).toBeVisible()
  })

  for (const { path, heading } of [
    { path: '/about', heading: /about/i },
    { path: '/privacy', heading: /privacy/i },
    { path: '/terms', heading: /terms/i },
    { path: '/security', heading: /security/i },
    { path: '/documentation', heading: /documentation/i },
  ]) {
    test(`${path} loads heading`, async ({ page }) => {
      const publicPage = new PublicStaticPage(page, path, heading)
      await publicPage.goto()
      await publicPage.expectLoaded()
    })
  }

  test('legal page CTAs navigate to login when present', async ({ page }) => {
    const privacy = new PublicStaticPage(page, '/privacy', /privacy/i)
    await privacy.goto()
    await privacy.expectLoaded()
    await privacy.expectAuthCtas()
    const signIn = privacy.signInButton()
    if (await signIn.isVisible().catch(() => false)) {
      await signIn.click()
      await expect(page).toHaveURL(/\/login/)
    }
  })

  test('edge: unknown public route does not crash the app', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz')
    // No catch-all 404 — app should still render shell without uncaught error overlay
    await expect(page.locator('body')).toBeVisible()
    await expect(page.getByText(/uncaught|application error/i)).toHaveCount(0)
  })
})
