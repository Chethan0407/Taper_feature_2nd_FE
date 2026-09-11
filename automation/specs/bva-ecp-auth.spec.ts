import { test, expect } from '../fixtures'
import { mockApi } from '../fixtures/api'
import {
  EMAIL_ECP,
  PASSWORD_BVA,
  LOGIN_ECP,
} from '../fixtures/test-data'

/**
 * BVA + Equivalence Class Partitioning — Auth module.
 * Run: npm run test:automation:bva
 */
test.describe('ECP — email domains @ecp @bva @regression', () => {
  for (const email of EMAIL_ECP.validCompany) {
    test(`valid company email enables Sign In: ${email}`, { tag: ['@ecp', '@bva', '@regression'] }, async ({
      loginPage,
    }) => {
      await loginPage.goto()
      await loginPage.fillLogin(email, 'ValidPass1!')
      await loginPage.expectSignInEnabled()
    })
  }

  for (const email of EMAIL_ECP.freeBlocked) {
    test(`free email blocked: ${email}`, { tag: ['@ecp', '@regression'] }, async ({ loginPage }) => {
      await loginPage.goto()
      await loginPage.fillLogin(email, 'ValidPass1!')
      await loginPage.expectSignInDisabled()
      await expect(loginPage.freeEmailError()).toBeVisible()
    })
  }

  for (const email of EMAIL_ECP.invalidFormat) {
    test(`invalid email format: ${email}`, { tag: ['@ecp', '@bva', '@regression'] }, async ({ loginPage }) => {
      await loginPage.goto()
      await loginPage.fillLogin(email, 'ValidPass1!')
      // Invalid → disabled and/or validation message
      const disabled = await loginPage.signInButton().isDisabled()
      if (!disabled) {
        const invalid = await loginPage.invalidEmailError().isVisible().catch(() => false)
        const free = await loginPage.freeEmailError().isVisible().catch(() => false)
        expect(invalid || free).toBeTruthy()
      } else {
        await loginPage.expectSignInDisabled()
      }
    })
  }
})

test.describe('BVA — password length & classes (signup) @bva @ecp @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.openSignUp()
    await loginPage.signupName().fill('BVA User')
    await loginPage.signupEmail().fill('bva@company.com')
  })

  test('BVA min-1: 7-char password fails requirements', { tag: ['@bva', '@regression'] }, async ({
    loginPage,
    page,
  }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.tooShort7)
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.tooShort7)
    await expect(page.getByText(/at least 8 characters/i).first()).toBeVisible()
  })

  test('BVA min: 8-char valid password meets length', { tag: ['@bva', '@regression'] }, async ({
    loginPage,
    page,
  }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.minValid8)
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.minValid8)
    // Requirements checklist hides when all rules pass — assert no min-length error
    await expect(page.getByText(/password must be at least 8 characters/i)).toHaveCount(0)
    await expect(loginPage.createAccountButton()).toBeVisible()
  })

  test('ECP missing uppercase', { tag: ['@ecp', '@regression'] }, async ({ loginPage, page }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.missingUpper)
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.missingUpper)
    await expect(page.getByText(/uppercase/i).first()).toBeVisible()
  })

  test('ECP missing lowercase', { tag: ['@ecp', '@regression'] }, async ({ loginPage, page }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.missingLower)
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.missingLower)
    await expect(page.getByText(/lowercase/i).first()).toBeVisible()
  })

  test('ECP missing number', { tag: ['@ecp', '@regression'] }, async ({ loginPage, page }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.missingNumber)
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.missingNumber)
    await expect(page.getByText(/number/i).first()).toBeVisible()
  })

  test('ECP missing special char', { tag: ['@ecp', '@regression'] }, async ({ loginPage, page }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.missingSpecial)
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.missingSpecial)
    await expect(page.getByText(/special character/i).first()).toBeVisible()
  })

  test('ECP common password rejected', { tag: ['@ecp', '@regression'] }, async ({ loginPage, page }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.common)
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.common)
    await expect(page.getByText(/common password/i).first()).toBeVisible()
  })

  test('BVA max: 72-char password accepted length-wise', { tag: ['@bva', '@regression'] }, async ({
    loginPage,
  }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.maxValid72)
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.maxValid72)
    await expect(loginPage.createAccountButton()).toBeVisible()
  })

  test('BVA max+1: 73-char password fails max bytes', { tag: ['@bva', '@regression'] }, async ({
    loginPage,
    page,
  }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.overMax73)
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.overMax73)
    await expect(page.getByText(/72 bytes|72 characters|cannot exceed/i).first()).toBeVisible()
  })

  test('ECP password mismatch vs match', { tag: ['@ecp', '@regression'] }, async ({ loginPage }) => {
    await loginPage.signupPassword().fill(PASSWORD_BVA.minValid8)
    await loginPage.signupConfirmPassword().fill('Different1!')
    await expect(loginPage.passwordMismatch()).toBeVisible()
    await loginPage.signupConfirmPassword().fill(PASSWORD_BVA.minValid8)
    await expect(loginPage.passwordMismatch()).toBeHidden()
    await expect(loginPage.createAccountButton()).toBeVisible()
  })
})

test.describe('ECP — login API outcomes @ecp @regression', () => {
  test('wrong credentials class → error', { tag: ['@ecp', '@regression'] }, async ({ page, loginPage }) => {
    await mockApi(page)
    await loginPage.goto()
    await loginPage.fillLogin(LOGIN_ECP.wrongPassword.email, LOGIN_ECP.wrongPassword.password)
    await loginPage.submitLogin()
    await expect(page.getByText(/wrong email or password/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('remember-me toggle is interactive', { tag: ['@ecp', '@regression'] }, async ({ loginPage }) => {
    await loginPage.goto()
    const remember = loginPage.rememberMe()
    if (await remember.isVisible().catch(() => false)) {
      await remember.check()
      await expect(remember).toBeChecked()
      await remember.uncheck()
      await expect(remember).not.toBeChecked()
    }
  })
})
