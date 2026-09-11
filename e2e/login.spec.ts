import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('loads login form and shows Sign In', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByLabel(/email/i).first()).toBeVisible()
    await expect(page.getByLabel(/password/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('blocks free email providers on login', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/email/i).first().fill('user@gmail.com')
    await page.getByLabel(/password/i).first().fill('SomePass123!')

    const signIn = page.getByRole('button', { name: /sign in/i })
    await expect(signIn).toBeDisabled()
    await expect(page.getByText(/company email|gmail|personal/i).first()).toBeVisible()
  })
})
