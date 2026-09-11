import { type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class LoginPage extends BasePage {
  readonly path = '/login'

  // --- Login form ---
  emailInput(): Locator {
    return this.page.locator('#email')
  }

  passwordInput(): Locator {
    return this.page.locator('#password')
  }

  rememberMe(): Locator {
    return this.page.getByLabel(/remember me/i)
  }

  signInButton(): Locator {
    return this.button(/^sign in$/i)
  }

  forgotPasswordLink(): Locator {
    return this.page.getByText(/forgot password\?/i).first()
  }

  signUpLink(): Locator {
    return this.page.getByRole('link', { name: /sign up/i }).first()
  }

  supportEmail(): Locator {
    return this.page.getByText(/support@tapeoutops\.com/i).first()
  }

  freeEmailError(): Locator {
    return this.page.getByText(/Personal email addresses \(Gmail, Yahoo, etc\.\) are not allowed/i)
  }

  invalidEmailError(): Locator {
    return this.page.getByText(/please enter a valid email address/i).first()
  }

  loginError(): Locator {
    return this.page.locator('.text-red-500, .text-red-400').filter({ hasText: /.+/ }).first()
  }

  /** Login form eye icon (no aria-label on the login field). */
  passwordVisibilityToggle(): Locator {
    return this.passwordInput().locator('xpath=..').getByRole('button').first()
  }

  // --- Signup modal ---
  signupHeading(): Locator {
    return this.heading(/create account/i)
  }

  signupName(): Locator {
    return this.page.locator('#signup-name')
  }

  signupEmail(): Locator {
    return this.page.locator('#signup-email')
  }

  signupRole(): Locator {
    return this.page.locator('#signup-role')
  }

  signupPassword(): Locator {
    return this.page.locator('#signup-password')
  }

  signupConfirmPassword(): Locator {
    return this.page.locator('#signup-confirm-password')
  }

  createAccountButton(): Locator {
    return this.button(/^create account$/i)
  }

  passwordMismatch(): Locator {
    return this.page.getByText(/passwords do not match/i).first()
  }

  passwordMatch(): Locator {
    return this.page.getByText(/passwords match/i).first()
  }

  passwordRequirement(text: string | RegExp): Locator {
    return this.page.getByText(text).first()
  }

  closeSignupButton(): Locator {
    return this.page
      .getByLabel(/close sign up/i)
      .or(this.page.getByRole('button', { name: /close sign up/i }))
      .or(this.page.locator('[aria-label*="Close"]').first())
  }

  signupPasswordVisibilityToggle(): Locator {
    return this.page.getByLabel(/toggle password visibility/i).first()
  }

  // --- Forgot password modal ---
  forgotHeading(): Locator {
    return this.heading(/forgot password/i)
  }

  forgotEmail(): Locator {
    return this.page.getByPlaceholder(/enter your email/i).first()
  }

  sendOtpButton(): Locator {
    return this.button(/send otp/i)
  }

  async expectLoaded() {
    await this.expectVisible(this.emailInput())
    await this.expectVisible(this.passwordInput())
    await this.expectVisible(this.signInButton())
    await this.expectVisible(this.forgotPasswordLink())
    await this.expectVisible(this.signUpLink())
  }

  async fillLogin(email: string, password: string) {
    await this.emailInput().fill(email)
    await this.passwordInput().fill(password)
  }

  async submitLogin() {
    await this.signInButton().click()
  }

  async openSignUp() {
    await this.signUpLink().click()
    await this.expectVisible(this.signupHeading())
  }

  async openForgotPassword() {
    await this.forgotPasswordLink().click()
    await this.expectVisible(this.forgotHeading())
  }

  async fillSignup(opts: {
    name: string
    email: string
    password: string
    confirmPassword?: string
    role?: string
  }) {
    await this.signupName().fill(opts.name)
    await this.signupEmail().fill(opts.email)
    if (opts.role) await this.signupRole().selectOption(opts.role)
    await this.signupPassword().fill(opts.password)
    await this.signupConfirmPassword().fill(opts.confirmPassword ?? opts.password)
  }

  async expectSignInDisabled() {
    await expect(this.signInButton()).toBeDisabled()
  }

  async expectSignInEnabled() {
    await expect(this.signInButton()).toBeEnabled()
  }

  async togglePasswordVisibility() {
    await this.passwordVisibilityToggle().click()
  }

  async closeSignUp() {
    await this.closeSignupButton().click()
  }

  async expectSignupClosed() {
    await expect(this.signupHeading()).toBeHidden({ timeout: 10_000 })
  }
}
