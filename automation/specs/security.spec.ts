import { test, expect } from '../fixtures'
import { mockApi } from '../fixtures/api'

test.describe('Public security page @smoke', () => {
  test('renders API statuses and never claims SOC 2 certified', async ({ page }) => {
    await mockApi(page)
    await page.goto('/security')
    await expect(page.getByRole('heading', { name: /^security$/i })).toBeVisible()
    await expect(page.getByText(/TLS 1\.3/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/AES-256/i).first()).toBeVisible()
    await expect(page.getByTestId('security-status-badge').first()).toBeVisible()
    await expect(page.getByText(/TapeOutOps is not SOC 2 certified/i)).toBeVisible()
    await expect(page.getByText(/security@tapeoutops\.com/i).first()).toBeVisible()
    await expect(page.getByText(/SOC 2 Type II/i).first()).toBeVisible()
    await expect(page.getByTestId('security-status-badge').filter({ hasText: /^Roadmap$/i }).first()).toBeVisible()
  })

  test('security report form posts to public API', async ({ page }) => {
    await mockApi(page)
    await page.goto('/security')
    await expect(page.getByText(/TLS 1\.3/i).first()).toBeVisible({ timeout: 15_000 })
    await page.locator('input[type="email"]').fill('reporter@company.com')
    await page.locator('textarea').fill('Possible XSS on login page for review.')
    await page.getByRole('button', { name: /submit report/i }).click()
    await expect(page.getByText(/report submitted/i)).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Login MFA @smoke', () => {
  test('requires_mfa prompts TOTP then verifies', async ({ page }) => {
    await mockApi(page)
    await page.goto('/login')
    await page.fill('#email', 'mfa@company.com')
    await page.fill('#password', 'ValidPass1!')
    await page.getByRole('button', { name: /^sign in$/i }).click()
    await expect(page.getByTestId('login-mfa-form')).toBeVisible({ timeout: 10_000 })
    await page.fill('#mfa-code', '123456')
    await page.getByRole('button', { name: /verify/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
  })
})

test.describe('Settings security @authenticated @smoke', () => {
  test('loads MFA, access review, retention, session', async ({ authenticated, page }) => {
    void authenticated
    await page.goto('/settings?section=security')
    await expect(page.getByTestId('settings-security')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Multi-factor authentication/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /^Access review$/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /^Data retention$/i })).toBeVisible()
    await expect(page.getByText(/Absolute timeout/i)).toBeVisible()
    await page.getByRole('button', { name: /set up mfa/i }).click()
    await expect(page.getByText(/JBSWY3DPEHPK3PXP/i)).toBeVisible({ timeout: 10_000 })
  })
})
