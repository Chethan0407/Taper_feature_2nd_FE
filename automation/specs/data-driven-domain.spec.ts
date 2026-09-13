import { test, expect } from '../fixtures'
import { Tags, Users } from '../config'
import { SAME_DOMAIN_SHARED, CROSS_DOMAIN_HIDDEN, seedDomainSharedData } from '../data'

/**
 * Data-driven domain visibility.
 * Same domain / company users see each other's created records.
 * Cross-domain users do not.
 *
 * Run: npm run test:automation:ddt
 */
test.describe('DDT — same domain sees shared created data @ddt @datadriven @regression', () => {
  for (const row of SAME_DOMAIN_SHARED) {
    test(`${row.id} peer sees ${row.module}: ${row.createdBy}`, {
      tag: [Tags.ddt, Tags.datadriven, Tags.regression],
    }, async ({ authenticatedPeer, page }) => {
      void authenticatedPeer
      await seedDomainSharedData(page, { companyId: Users.peer.company_id })
      await page.goto(row.path)
      // Specs table truncates cell text; title attribute keeps the full name when present
      const label = page
        .getByTitle(row.createdLabel)
        .or(page.getByText(row.createdLabel))
        .first()
      await label.scrollIntoViewIfNeeded().catch(() => undefined)
      await expect(label).toBeVisible({ timeout: 15_000 })
    })
  }
})

test.describe('DDT — cross domain cannot see shared data @ddt @datadriven @regression', () => {
  for (const row of CROSS_DOMAIN_HIDDEN) {
    test(`${row.id} outsider hidden ${row.module}`, {
      tag: [Tags.ddt, Tags.datadriven, Tags.regression],
    }, async ({ authenticatedOutsider, page }) => {
      void authenticatedOutsider
      await seedDomainSharedData(page, { companyId: Users.outsider.company_id })
      await page.goto(row.path)
      await expect(page.getByText(row.createdLabel)).toHaveCount(0)
    })
  }
})

test.describe('DDT — creator and peer see the same shared set @ddt @datadriven @integration', () => {
  test('admin creator sees Shared Domain Project', {
    tag: [Tags.ddt, Tags.datadriven, Tags.integration],
  }, async ({ authenticated, page }) => {
    void authenticated
    await seedDomainSharedData(page, { companyId: Users.admin.company_id })
    await page.goto('/projects')
    await expect(page.getByText(/Shared Domain Project/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('same-domain peer sees the same Shared Domain Project', {
    tag: [Tags.ddt, Tags.datadriven, Tags.integration],
  }, async ({ authenticatedPeer, page }) => {
    void authenticatedPeer
    await seedDomainSharedData(page, { companyId: Users.peer.company_id })
    await page.goto('/projects')
    await expect(page.getByText(/Shared Domain Project/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
