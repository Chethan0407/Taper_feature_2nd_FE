import { type Locator, expect } from '@playwright/test'
import { BasePage } from './base.page'

export class VerifyEmailPage extends BasePage {
  readonly path = '/verify-email'

  headingEl(): Locator {
    return this.heading(/verify/i)
  }

  otpInputs(): Locator {
    return this.page.locator('input[type="text"], input[inputmode="numeric"]').filter({ hasNot: this.page.locator('[type="email"]') })
  }

  verifyButton(): Locator {
    return this.button(/verify email/i)
  }

  resendButton(): Locator {
    return this.button(/resend otp/i)
  }

  backToLogin(): Locator {
    return this.page.getByText(/go back to login|back to login/i).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.headingEl())
  }

  async fillOtp(code: string) {
    const digits = code.split('')
    const inputs = this.page.locator('input').filter({ has: this.page.locator(':visible') })
    // Prefer dedicated OTP boxes
    const otpBoxes = this.page.locator('input[maxlength="1"]')
    const count = await otpBoxes.count()
    if (count >= 6) {
      for (let i = 0; i < 6; i++) {
        await otpBoxes.nth(i).fill(digits[i] ?? '')
      }
      return
    }
    // Fallback single field
    await this.page.getByPlaceholder(/otp|code/i).first().fill(code).catch(async () => {
      await inputs.first().fill(code)
    })
  }

  async expectIncompleteOtpError() {
    await expect(this.page.getByText(/complete 6-digit|enter.*otp/i).first()).toBeVisible({ timeout: 10_000 })
  }

  async expectVerifyDisabled() {
    await expect(this.verifyButton()).toBeDisabled()
  }

  async trySubmitVerify() {
    const btn = this.verifyButton()
    if (await btn.isEnabled().catch(() => false)) {
      await btn.click()
      await this.expectIncompleteOtpError()
    } else {
      await this.expectVerifyDisabled()
    }
  }
}

export class ResetPasswordPage extends BasePage {
  readonly path = '/reset-password'

  emailInput(): Locator {
    return this.page.getByLabel(/email/i).or(this.page.getByPlaceholder(/email/i)).first()
  }

  sendOtpButton(): Locator {
    return this.button(/send otp/i)
  }

  verifyOtpButton(): Locator {
    return this.button(/verify otp/i)
  }

  resetPasswordButton(): Locator {
    return this.button(/^reset password$/i)
  }

  newPasswordInput(): Locator {
    return this.page.getByLabel(/new password/i).first()
  }

  confirmPasswordInput(): Locator {
    return this.page.getByLabel(/confirm/i).first()
  }

  backToLogin(): Locator {
    return this.page.getByText(/back to login/i).first()
  }

  content(): Locator {
    return this.page.getByText(/reset|password|otp|email/i).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.content())
  }

  async expectStep1() {
    await this.expectVisible(this.sendOtpButton())
  }

  async fillEmail(email: string) {
    await this.emailInput().fill(email)
  }

  async expectSendOtpDisabled() {
    await expect(this.sendOtpButton()).toBeDisabled()
  }

  async expectSendOtpEnabled() {
    await expect(this.sendOtpButton()).toBeEnabled()
  }
}

/** Generic public marketing/legal pages. */
export class PublicStaticPage extends BasePage {
  readonly path: string
  private readonly headingPattern: RegExp

  constructor(page: import('@playwright/test').Page, path: string, headingPattern: RegExp) {
    super(page)
    this.path = path
    this.headingPattern = headingPattern
  }

  signInButton(): Locator {
    return this.page.getByRole('button', { name: /^sign in$/i }).first()
  }

  getStartedButton(): Locator {
    return this.page.getByRole('button', { name: /request an enterprise pilot|request enterprise pilot|request a demo|get started/i }).first()
  }

  brandHome(): Locator {
    return this.page.getByText(/TapeOutOps/i).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.heading(this.headingPattern))
  }

  async expectAuthCtas() {
    await expect(this.signInButton().or(this.getStartedButton())).toBeVisible()
  }
}
