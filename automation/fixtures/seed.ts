import { type Page, type Route } from '@playwright/test'

/** Shared seed entities for complex list/detail automation. */
export const MOCK = {
  project: {
    id: '101',
    name: 'E2E Project Alpha',
    description: 'Automation seeded project',
    status: 'active',
    platform: 'ASIC',
    eda_tool: 'Synopsys',
    edaTool: 'Synopsys',
    type: 'TapeOut',
    company_id: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  projectB: {
    id: '102',
    name: 'E2E Project Beta',
    description: 'Second project',
    status: 'planning',
    platform: 'FPGA',
    eda_tool: 'Cadence',
    edaTool: 'Cadence',
    type: 'LintOnly',
    company_id: 1,
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
  spec: {
    id: 'spec-uuid-1',
    name: 'E2E Spec Alpha',
    version: '1.0',
    status: 'draft',
    project_id: '101',
    created_at: '2026-01-01T00:00:00Z',
  },
  vendor: {
    id: 'v-1',
    name: 'E2E Foundry Co',
    type: 'Foundry',
    status: 'active',
    linked_specs: [],
    linked_checklists: [],
  },
  company: {
    id: 1,
    name: 'E2E Tapeout Corp',
    description: 'Seed company',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
  },
  template: {
    id: 55,
    name: 'E2E Template',
    description: 'mock template',
    items: [{ id: 1, title: 'Item 1', order: 1, description: '' }],
  },
  activeChecklist: {
    id: 77,
    template_id: 55,
    template_name: 'E2E Template',
    name: 'E2E Active Checklist',
    status: 'pending',
    completion_percent: 40,
    project_id: '101',
  },
  lintRule: {
    id: 1,
    pattern: 'FIXME',
    type: 'error',
    description: 'Ban FIXME',
  },
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

/** Override list endpoints with seeded entities (register AFTER seedAuth/mockApi). */
export async function seedFeatureData(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const path = url.pathname.replace(/\/+$/, '')
    const method = req.method()

    if (method === 'GET') {
      if (/\/projects\/101$/.test(path) || path.endsWith('/projects/101')) {
        return fulfillJson(route, MOCK.project)
      }
      if (/\/projects\/102$/.test(path)) {
        return fulfillJson(route, MOCK.projectB)
      }
      if (path.endsWith('/projects') || path.includes('/projects?')) {
        return fulfillJson(route, [MOCK.project, MOCK.projectB])
      }
      if (path.includes('/specifications/statuses')) {
        return fulfillJson(route, ['draft', 'in_review', 'approved'])
      }
      if (/\/specifications\/spec-uuid-1/.test(path)) {
        return fulfillJson(route, MOCK.spec)
      }
      if (path.includes('/specifications')) {
        return fulfillJson(route, [MOCK.spec])
      }
      if (path.includes('/vendors')) {
        return fulfillJson(route, [MOCK.vendor])
      }
      if (path.includes('/companies/') && /\/companies\/\d+$/.test(path)) {
        return fulfillJson(route, MOCK.company)
      }
      if (path.includes('/companies')) {
        const q = (url.searchParams.get('search') || '').trim().toLowerCase()
        if (q && !String(MOCK.company.name).toLowerCase().includes(q) && !String(MOCK.company.description || '').toLowerCase().includes(q)) {
          return fulfillJson(route, [])
        }
        return fulfillJson(route, [MOCK.company])
      }
      if (path.includes('/checklists/stats')) {
        return fulfillJson(route, {
          total_templates: 1,
          active_checklists: 1,
          approved_checklists: 0,
          avg_completion_rate: 40,
        })
      }
      if (path.includes('/checklists/templates')) {
        return fulfillJson(route, [MOCK.template])
      }
      if (path.includes('/checklists/active')) {
        return fulfillJson(route, [MOCK.activeChecklist])
      }
      if (path.includes('/lint-results/speclint/rules') || path.includes('/speclint/rules')) {
        return fulfillJson(route, [MOCK.lintRule])
      }
      if (path.includes('/metadata/')) {
        return fulfillJson(route, ['ASIC', 'FPGA', 'SoC', 'Synopsys', 'Cadence', 'TapeOut', 'active'])
      }
      if (path.includes('/activity')) {
        return fulfillJson(route, [])
      }
    }

    if (method === 'POST') {
      if (path.includes('/projects')) {
        return fulfillJson(route, { ...MOCK.project, id: '201', name: 'Created Project' })
      }
      if (path.includes('/vendors')) {
        return fulfillJson(route, { ...MOCK.vendor, id: 'v-new', name: 'Created Vendor' })
      }
      if (path.includes('/companies')) {
        return fulfillJson(route, { ...MOCK.company, id: 99, name: 'Created Company' })
      }
      if (path.includes('/checklists/templates')) {
        return fulfillJson(route, { ...MOCK.template, id: 99, name: 'Created Template' })
      }
      if (path.includes('/lint-results/speclint/rules') || path.includes('/speclint/rules')) {
        return fulfillJson(route, { id: 2, pattern: 'TODO', type: 'warning' })
      }
    }

    return route.fallback()
  })
}
