import { test, expect } from '../fixtures'
import { Tags } from '../config'
import { mockApi } from '../fixtures/api'
import { seedFeatureData } from '../fixtures/seed'

test.describe('Landing honesty from public APIs @smoke', () => {
  test('capabilities + integrations matrix from live claim endpoints', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await expect(page.getByTestId('landing-capabilities')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Inbound Jira/i).first()).toBeVisible()
    await expect(page.locator('#integrations')).toBeVisible()
    await expect(page.getByText(/Inbound connectors are live/i).first()).toBeVisible()
    await expect(page.getByText(/^Jira$/i).first()).toBeVisible()
    await expect(page.getByText(/Bidirectional Jira sync/i).first()).toBeVisible()
    await expect(page.getByText(/Calibre \/ GDSII layout mutation/i).first()).toBeVisible()
    await expect(page.getByText(/SOC 2 certified/i)).toHaveCount(0)
  })

  test('demo form accepts investor_data_room interest', async ({ page }) => {
    await mockApi(page)
    await page.goto('/#demo')
    await page.locator('#demo select').selectOption('investor_data_room')
    await page.locator('#demo input[placeholder="Your name"]').fill('Investor')
    await page.locator('#demo input[type="email"]').fill('ir@fund.com')
    await page.locator('#demo input[placeholder="Company / design house"]').fill('Fund LP')
    await page.locator('#demo button[type="submit"]').click()
    await expect(page.locator('#demo').getByText(/Thanks.*Data Room|follow up shortly/i)).toBeVisible({
      timeout: 10_000,
    })
  })
})

test.describe('Product surfaces from live APIs @authenticated @smoke', () => {
  test('sign-off matrix on readiness tab', {
    tag: [Tags.smoke, Tags.critical],
  }, async ({ authenticated, projectDetailsPage, page }) => {
    void authenticated
    await seedFeatureData(page)
    await projectDetailsPage.gotoId(101)
    await projectDetailsPage.expectLoaded()
    await projectDetailsPage.openReadinessTab()
    await expect(page.getByTestId('signoff-matrix')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('signoff-matrix').getByText(/^DRC$/i)).toBeVisible()
    await expect(page.getByTestId('signoff-matrix').getByRole('button', { name: /^Approve$/i }).first()).toBeVisible()
  })

  test('vendor performance panel', { tag: [Tags.smoke] }, async ({ authenticated, page }) => {
    void authenticated
    await page.goto('/vendors')
    await expect(page.getByTestId('vendor-performance')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/E2E Foundry Co/i).first()).toBeVisible()
    await expect(page.getByText(/Breached/i).first()).toBeVisible()
  })

  test('activity audit filters', { tag: [Tags.smoke] }, async ({ authenticated, page }) => {
    void authenticated
    await page.goto('/activity')
    await expect(page.getByTestId('activity-audit')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/vendor\.acknowledged|signoff\.approved/i).first()).toBeVisible()
    await page.getByPlaceholder(/project, vendor/i).fill('vendor')
    await page.getByRole('button', { name: /apply filters/i }).click()
    await expect(page.getByTestId('activity-audit')).toBeVisible()
  })

  test('settings integrations connectors', { tag: [Tags.smoke] }, async ({ authenticated, page }) => {
    void authenticated
    await page.goto('/settings')
    await expect(page.getByTestId('settings-integrations')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Prod Jira inbound/i)).toBeVisible()
    await expect(page.getByText(/issue_updated/i)).toBeVisible()
    await page.getByRole('button', { name: /create connector/i }).click()
    await expect(page.getByText(/Connector #99 created/i)).toBeVisible({ timeout: 10_000 })
  })
})
