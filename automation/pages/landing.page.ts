import { type Locator } from '@playwright/test'
import { BasePage } from './base.page'

export class LandingPage extends BasePage {
  readonly path = '/'

  brandText(): Locator {
    return this.page.getByText(/TapeOutOps/i).first()
  }

  signInButton(): Locator {
    return this.page.getByRole('button', { name: /^sign in$/i }).first()
  }

  getStartedButton(): Locator {
    return this.page.getByRole('button', { name: /request an enterprise pilot|request enterprise pilot/i }).first()
  }

  getStartedFree(): Locator {
    return this.page.getByRole('button', { name: /join the private beta|enterprise pilot/i }).first()
  }

  navFeatures(): Locator {
    return this.page.getByRole('link', { name: /^features$/i }).first()
  }

  navHowItWorks(): Locator {
    return this.page.getByRole('link', { name: /how it works/i }).first()
  }

  footerPrivacy(): Locator {
    return this.page.getByRole('link', { name: /privacy/i }).first()
  }

  footerTerms(): Locator {
    return this.page.getByRole('link', { name: /terms/i }).first()
  }

  footerSecurity(): Locator {
    return this.page.getByRole('link', { name: /security/i }).first()
  }

  footerDocs(): Locator {
    return this.page.getByRole('link', { name: /documentation/i }).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.brandText())
    await this.expectVisible(this.signInButton())
  }

  productSection(): Locator {
    return this.page.locator('#product')
  }

  async goToLoginViaSignIn() {
    await this.signInButton().click()
    await this.page.waitForURL(/\/login/)
  }
}
