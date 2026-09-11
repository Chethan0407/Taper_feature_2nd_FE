import { type Locator, expect } from '@playwright/test'
import { AppShellPage } from './app-shell.page'

export class SpecLintPage extends AppShellPage {
  readonly path = '/speclint'

  title(): Locator {
    return this.heading(/speclint/i)
  }

  ruleBuilder(): Locator {
    return this.page.getByText(/rule builder/i).first()
  }

  addRuleButton(): Locator {
    return this.button(/add rule/i)
  }

  runLinterButton(): Locator {
    return this.button(/run linter/i)
  }

  patternInput(): Locator {
    return this.page.getByPlaceholder('Pattern or keyword').first()
  }

  ruleTypeSelect(): Locator {
    return this.page.locator('select').first()
  }

  filtersToggle(): Locator {
    return this.page.getByText(/^filters/i).first()
  }

  resetFiltersButton(): Locator {
    return this.page.getByRole('button', { name: /reset all/i }).first()
  }

  ruleSearchInput(): Locator {
    return this.page.getByPlaceholder(/search rules/i).first()
  }

  emptyRules(): Locator {
    return this.page.getByText(/no rules found/i).first()
  }

  async expectLoaded() {
    await this.expectVisible(this.title())
    await this.expectVisible(this.ruleBuilder())
    await this.expectVisible(this.addRuleButton())
  }

  async expectRunLinterVisible() {
    await expect(this.runLinterButton()).toBeVisible()
  }

  async clearPattern() {
    await this.patternInput().fill('')
  }

  async expectRunDisabledWithoutSpec() {
    await expect(this.runLinterButton()).toBeDisabled()
  }

  async openFiltersAndReset() {
    const toggle = this.filtersToggle()
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()
    }
    const reset = this.resetFiltersButton()
    if (await reset.isVisible().catch(() => false)) {
      await reset.click()
    }
  }

  async expectEmptyRulesOrBuilder() {
    await expect(this.ruleBuilder()).toBeVisible()
    const empty = await this.emptyRules().isVisible().catch(() => false)
    if (empty) await expect(this.emptyRules()).toBeVisible()
  }
}
