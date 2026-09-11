import { test, expect } from '../fixtures'

test.describe('SpecLint — builder & run @authenticated', () => {
  test('loads engine UI', async ({ authenticated, specLintPage }) => {
    void authenticated
    await specLintPage.goto()
    await specLintPage.expectLoaded()
  })

  test('rule builder controls visible', async ({ authenticated, specLintPage }) => {
    void authenticated
    await specLintPage.goto()
    await specLintPage.expectLoaded()
    await expect(specLintPage.patternInput()).toBeVisible({ timeout: 15_000 })
    await specLintPage.expectRunLinterVisible()
  })

  test('negative: add rule without pattern stays on form', async ({ authenticated, specLintPage }) => {
    void authenticated
    await specLintPage.goto()
    await specLintPage.addRuleButton().click()
    await expect(specLintPage.ruleBuilder()).toBeVisible()
  })

  test('edge: clear empty pattern and stay on builder', async ({ authenticated, specLintPage }) => {
    void authenticated
    await specLintPage.goto()
    await specLintPage.expectLoaded()
    await specLintPage.patternInput().fill('temp-pattern')
    await specLintPage.clearPattern()
    await expect(specLintPage.patternInput()).toHaveValue('')
    await expect(specLintPage.ruleBuilder()).toBeVisible()
  })

  test('edge: reset filters / empty rules messaging', async ({ authenticated, specLintPage }) => {
    void authenticated
    await specLintPage.goto()
    await specLintPage.expectLoaded()
    await specLintPage.openFiltersAndReset()
    await specLintPage.expectEmptyRulesOrBuilder()
  })

  test('negative: run linter without selected spec stays disabled', async ({ authenticated, specLintPage }) => {
    void authenticated
    await specLintPage.goto()
    await specLintPage.expectLoaded()
    await specLintPage.expectRunDisabledWithoutSpec()
  })
})
