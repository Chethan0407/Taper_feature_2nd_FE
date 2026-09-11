import { test, expect } from '../fixtures'

test.describe('Auth — positive & negative & edge @smoke', () => {
  test('login shell shows all primary controls', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.expectLoaded()
    await expect(loginPage.supportEmail()).toBeVisible()
  })

  test('negative: empty login keeps Sign In disabled or blocked', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.expectSignInDisabled()
  })

  test('negative: free email domains are blocked', async ({ loginPage }) => {
    await loginPage.goto()
    for (const email of ['a@gmail.com', 'b@yahoo.com', 'c@hotmail.com', 'd@outlook.com']) {
      await loginPage.fillLogin(email, 'ValidPass1!')
      await loginPage.expectSignInDisabled()
      await expect(loginPage.freeEmailError()).toBeVisible()
    }
  })

  test('positive: company email enables Sign In', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.fillLogin('user@company.com', 'ValidPass1!')
    await loginPage.expectSignInEnabled()
  })

  test('negative: wrong credentials show error (mocked)', async ({ page, loginPage }) => {
    const { mockApi } = await import('../fixtures/api')
    await mockApi(page)
    await loginPage.goto()
    await loginPage.fillLogin('wrong@company.com', 'badpass')
    await loginPage.submitLogin()
    await expect(page.getByText(/wrong email or password/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('signup modal: mismatch and free-email validation', async ({ loginPage, page }) => {
    await loginPage.goto()
    await loginPage.openSignUp()

    await loginPage.fillSignup({
      name: 'Test User',
      email: 'new@company.com',
      password: 'ValidPass1!',
      confirmPassword: 'Different1!',
    })
    await expect(loginPage.passwordMismatch()).toBeVisible()

    await loginPage.signupEmail().fill('person@gmail.com')
    await expect(page.getByText(/personal email|company email|gmail/i).first()).toBeVisible()

    await loginPage.signupEmail().fill('new@company.com')
    await loginPage.signupConfirmPassword().fill('ValidPass1!')
    await expect(loginPage.createAccountButton()).toBeVisible()
  })

  test('forgot password modal opens and shows Send OTP', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.openForgotPassword()
    await expect(loginPage.sendOtpButton()).toBeVisible()
  })

  test('verify-email page without email still renders or redirects', async ({ page, verifyEmailPage }) => {
    await page.goto('/verify-email')
    await expect(page).toHaveURL(/\/(verify-email|login)/)
    if (page.url().includes('verify-email')) {
      await verifyEmailPage.expectLoaded()
    }
  })

  test('verify-email page with email loads OTP UI', async ({ verifyEmailPage }) => {
    await verifyEmailPage.goto('?email=test@company.com')
    await verifyEmailPage.expectLoaded()
    await expect(verifyEmailPage.verifyButton()).toBeVisible()
  })

  test('reset-password step 1 loads', async ({ resetPasswordPage }) => {
    await resetPasswordPage.goto()
    await resetPasswordPage.expectLoaded()
    await resetPasswordPage.expectStep1()
  })

  test('edge: protected routes redirect when logged out', async ({ page }) => {
    for (const path of ['/dashboard', '/projects', '/specs', '/checklists', '/vendors', '/settings']) {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login/)
    }
  })

  test('negative: invalid email format disables Sign In', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.fillLogin('not-an-email', 'ValidPass1!')
    await expect(loginPage.invalidEmailError()).toBeVisible()
    await loginPage.expectSignInDisabled()
  })

  test('edge: whitespace-only email does not enable Sign In cleanly', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.fillLogin('   ', 'ValidPass1!')
    // Either disabled or still blocked (empty after trim)
    const disabled = await loginPage.signInButton().isDisabled()
    if (!disabled) {
      await loginPage.submitLogin()
      await expect(loginPage.page.getByText(/email|required|valid/i).first()).toBeVisible({ timeout: 10_000 })
    } else {
      await loginPage.expectSignInDisabled()
    }
  })

  test('edge: toggle password visibility on login', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.passwordInput().fill('SecretPass1!')
    await expect(loginPage.passwordInput()).toHaveAttribute('type', 'password')
    const toggle = loginPage.passwordVisibilityToggle()
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()
      await expect(loginPage.passwordInput()).toHaveAttribute('type', 'text')
      await toggle.click()
      await expect(loginPage.passwordInput()).toHaveAttribute('type', 'password')
    }
  })

  test('edge: signup modal cancel/close returns to login', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.openSignUp()
    await loginPage.closeSignUp()
    await loginPage.expectSignupClosed()
    await expect(loginPage.emailInput()).toBeVisible()
  })

  test('negative: OTP empty submit stays blocked', async ({ verifyEmailPage }) => {
    await verifyEmailPage.goto('?email=test@company.com')
    await verifyEmailPage.expectLoaded()
    await verifyEmailPage.trySubmitVerify()
  })

  test('negative: reset password Send OTP disabled without email', async ({ resetPasswordPage }) => {
    await resetPasswordPage.goto()
    await resetPasswordPage.expectStep1()
    await resetPasswordPage.expectSendOtpDisabled()
    await resetPasswordPage.fillEmail('reset@company.com')
    await resetPasswordPage.expectSendOtpEnabled()
  })
})
