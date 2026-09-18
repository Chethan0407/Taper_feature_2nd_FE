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

  test('landing: Request Enterprise Pilot scrolls to demo form', async ({ landingPage, page }) => {
    await landingPage.goto()
    await landingPage.getStartedButton().click()
    await expect(page.locator('#demo')).toBeVisible()
  })

  test('landing: product previews have no developer file-path leaks @smoke', async ({ landingPage, page }) => {
    await landingPage.goto()
    await expect(page.locator('#product')).toBeVisible()
    await expect(page.getByRole('heading', { name: /see the workflow/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /speclint on upload/i })).toBeVisible()
    // Intentional SpecLint demo copy (not a real runtime error)
    await expect(page.getByText(/\[ERROR\] Block B_CLK/i)).toBeVisible()
    // Must never show internal asset paths to visitors / VCs
    await expect(page.locator('#product')).not.toContainText('public/product/')
    await expect(page.getByRole('button', { name: /get started free/i })).toHaveCount(0)
  })

  test('landing: enterprise CTAs + security pillars + metadata copy @smoke', async ({ landingPage, page }) => {
    const { mockApi } = await import('../fixtures/api')
    await mockApi(page)
    await landingPage.goto()
    await expect(page.getByRole('button', { name: /request an enterprise pilot/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /join the private beta/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /get started free/i })).toHaveCount(0)
    await expect(page.getByTestId('security-pillars')).toBeVisible()
    await expect(page.getByTestId('landing-security')).toBeVisible()
    await expect(page.getByText(/TLS 1\.3/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/AES-256/i).first()).toBeVisible()
    await expect(page.getByText(/SOC 2 Type II/i).first()).toBeVisible()
    await expect(page.getByText(/Not SOC 2 certified/i).first()).toBeVisible()
    await expect(page.getByTestId('landing-signoff-preview').getByText(/Marketing preview/i)).toBeVisible()
    await expect(page.getByText(/LIVE PREVIEW/i)).toHaveCount(0)
    await expect(page.getByText(/completely isolated from your raw physical layout files/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /Sign-Off Matrices & DRC\/LVS Tracking Gates/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Secure Foundry & OSAT Handovers/i })).toBeVisible()
  })

  test('landing: footer legal links navigate', async ({ landingPage, page }) => {
    await landingPage.goto()
    await expect(landingPage.footerPrivacy()).toBeVisible()
    await landingPage.footerPrivacy().click()
    await expect(page).toHaveURL(/\/privacy/)
    await expect(page.getByRole('heading', { name: /privacy/i })).toBeVisible()
    await page.goto('/')
    await landingPage.footerTerms().click()
    await expect(page).toHaveURL(/\/terms/)
    await page.goto('/')
    await landingPage.footerSecurity().click()
    await expect(page).toHaveURL(/\/security/)
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
