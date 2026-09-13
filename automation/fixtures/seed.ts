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
    foundry: 'TSMC',
    process_node: 'N5',
    pdk_version: '1.2.3',
    eda_tool_version: '2024.1',
    tapeout_status: 'planning',
    target_tapeout_date: '2026-10-01T00:00:00Z',
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
  specB: {
    id: 'spec-uuid-2',
    name: 'E2E Spec Beta',
    version: '1.0',
    status: 'approved',
    project_id: '101',
    created_at: '2026-01-02T00:00:00Z',
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
    is_system: false,
    items: [{ id: 1, title: 'Item 1', order: 1, description: '' }],
  },
  torTemplate: {
    id: 56,
    name: 'Tapeout Readiness TOR',
    description: 'System TOR template',
    is_system: true,
    category: 'tapeout',
    items: [{ id: 1, title: 'Freeze design', order: 1, description: '' }],
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

/** Data created by tapeoutops domain — visible to same-domain peers */
export const DOMAIN_SHARED = {
  project: {
    id: '301',
    name: 'Shared Domain Project',
    description: 'Created by admin for peer visibility',
    status: 'active',
    platform: 'ASIC',
    eda_tool: 'Synopsys',
    edaTool: 'Synopsys',
    type: 'TapeOut',
    company_id: 1,
    created_by: 'e2e@tapeoutops.com',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  spec: {
    id: 'spec-shared-1',
    // Keep ≤15 chars — SpecsPage formatSpecName truncates longer labels in the cell text
    name: 'Shared Spec',
    file_name: 'Shared Spec.pdf',
    version: '2.0',
    status: 'draft',
    project_id: '301',
    company_id: 1,
    created_by: 'e2e@tapeoutops.com',
    uploaded_by: 'e2e@tapeoutops.com',
    created_at: '2026-03-01T00:00:00Z',
    uploaded_on: '2026-03-01T00:00:00Z',
  },
  vendor: {
    id: 'v-shared',
    name: 'Shared Domain Vendor',
    type: 'Foundry',
    status: 'active',
    company_id: 1,
    created_by: 'e2e@tapeoutops.com',
    linked_specs: [],
    linked_checklists: [],
  },
  company: {
    id: 1,
    name: 'E2E Tapeout Corp',
    description: 'Shared company for same-domain users',
    status: 'active',
    created_by: 'e2e@tapeoutops.com',
    created_at: '2026-01-01T00:00:00Z',
  },
  template: {
    id: 88,
    name: 'Shared Domain Template',
    description: 'Visible to same domain',
    created_by: 'e2e@tapeoutops.com',
    items: [{ id: 1, title: 'Shared item', order: 1, description: '' }],
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
  const vendorState = {
    ...MOCK.vendor,
    linked_specs: [] as Array<string | number>,
    linked_checklists: [] as Array<string | number>,
  }

  /** Mutable checklists for Use / Approve E2E */
  const templatesState: Array<Record<string, unknown>> = [
    { ...MOCK.template },
    { ...MOCK.torTemplate },
  ]
  const activeChecklistsState: Array<Record<string, unknown>> = [{ ...MOCK.activeChecklist }]
  let nextActiveId = 1000

  /** Mutable project list for create / update / delete E2E */
  const projectsState: Array<Record<string, unknown>> = [
    { ...MOCK.project },
    { ...MOCK.projectB },
  ]
  let nextProjectId = 201
  const linkedByProject: Record<string, Array<Record<string, unknown>>> = {
    '101': [],
    '102': [],
  }

  const findProject = (id: string) =>
    projectsState.find((p) => String(p.id) === String(id))

  await page.route('**/api/v1/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const path = url.pathname.replace(/\/+$/, '')
    const method = req.method()

    // Vendor link / unlink (must run before generic vendor POST)
    const vendorSpecLink = path.match(/\/vendors\/([^/]+)\/specifications\/([^/]+)\/link$/)
    const vendorSpecUnlink = path.match(/\/vendors\/([^/]+)\/specifications\/([^/]+)\/unlink$/)
    const vendorChecklistLink = path.match(/\/vendors\/([^/]+)\/checklists\/([^/]+)\/link$/)
    const vendorChecklistUnlink = path.match(/\/vendors\/([^/]+)\/checklists\/([^/]+)\/unlink$/)

    if (method === 'POST' && vendorSpecLink) {
      const specId = vendorSpecLink[2]
      if (!vendorState.linked_specs.some((id) => String(id) === String(specId))) {
        vendorState.linked_specs.push(specId === 'spec-uuid-1' ? MOCK.spec.id : specId)
      }
      return fulfillJson(route, { ...vendorState, message: 'linked' })
    }
    if (method === 'DELETE' && vendorSpecUnlink) {
      const specId = vendorSpecUnlink[2]
      vendorState.linked_specs = vendorState.linked_specs.filter((id) => String(id) !== String(specId))
      return fulfillJson(route, { ...vendorState, message: 'unlinked' })
    }
    if (method === 'POST' && vendorChecklistLink) {
      const checklistId = vendorChecklistLink[2]
      const id = checklistId === '55' ? MOCK.template.id : checklistId
      if (!vendorState.linked_checklists.some((x) => String(x) === String(id))) {
        vendorState.linked_checklists.push(id)
      }
      return fulfillJson(route, { ...vendorState, message: 'linked' })
    }
    if (method === 'DELETE' && vendorChecklistUnlink) {
      const checklistId = vendorChecklistUnlink[2]
      vendorState.linked_checklists = vendorState.linked_checklists.filter(
        (id) => String(id) !== String(checklistId),
      )
      return fulfillJson(route, { ...vendorState, message: 'unlinked' })
    }

    // Project link / unlink
    const projectSpecLink = path.match(/\/projects\/([^/]+)\/specifications\/([^/]+)\/link$/)
    const projectChecklistLink = path.match(/\/projects\/([^/]+)\/checklists\/([^/]+)\/link$/)
    if (method === 'POST' && projectSpecLink) {
      const [, projectId, specId] = projectSpecLink
      const spec = [MOCK.spec, MOCK.specB].find((s) => String(s.id) === String(specId)) || {
        id: specId,
        name: `Spec ${specId}`,
      }
      linkedByProject[projectId] = linkedByProject[projectId] || []
      if (!linkedByProject[projectId].some((x) => x.type === 'specification' && String(x.id) === String(specId))) {
        linkedByProject[projectId].push({ ...spec, type: 'specification' })
      }
      return fulfillJson(route, { message: 'linked', project_id: projectId, specification_id: specId })
    }
    if (method === 'POST' && projectChecklistLink) {
      const [, projectId, checklistId] = projectChecklistLink
      const tpl =
        [MOCK.template, MOCK.torTemplate].find((t) => String(t.id) === String(checklistId)) || {
          id: checklistId,
          name: `Checklist ${checklistId}`,
        }
      linkedByProject[projectId] = linkedByProject[projectId] || []
      if (!linkedByProject[projectId].some((x) => x.type === 'checklist' && String(x.id) === String(checklistId))) {
        linkedByProject[projectId].push({ ...tpl, type: 'checklist', status: 'pending' })
      }
      return fulfillJson(route, { message: 'linked', project_id: projectId, checklist_id: checklistId })
    }
    if (method === 'DELETE' && projectSpecLink) {
      const [, projectId, specId] = projectSpecLink
      linkedByProject[projectId] = (linkedByProject[projectId] || []).filter(
        (x) => !(x.type === 'specification' && String(x.id) === String(specId)),
      )
      return fulfillJson(route, { message: 'unlinked' })
    }
    if (method === 'DELETE' && projectChecklistLink) {
      const [, projectId, checklistId] = projectChecklistLink
      linkedByProject[projectId] = (linkedByProject[projectId] || []).filter(
        (x) => !(x.type === 'checklist' && String(x.id) === String(checklistId)),
      )
      return fulfillJson(route, { message: 'unlinked' })
    }

    if (method === 'GET') {
      const projectDetail = path.match(/\/projects\/([^/]+)$/)
      if (projectDetail && !path.includes('/projects?')) {
        const found = findProject(projectDetail[1])
        if (found) return fulfillJson(route, found)
      }
      if (path.includes('/linked-content')) {
        const m = path.match(/\/projects\/([^/]+)\/linked-content/)
        const pid = m?.[1] || '101'
        return fulfillJson(route, linkedByProject[pid] || [])
      }
      if (path.includes('/readiness')) {
        return fulfillJson(route, {
          readiness_score: 72,
          blockers: [{ id: 1, title: 'Missing DRC report', severity: 'high', message: 'Upload a DRC report.' }],
          is_design_frozen: false,
          tapeout_status: 'planning',
          foundry: 'TSMC',
          process_node: 'N5',
          pdk_version: '1.2.3',
        })
      }
      if (path.includes('/gaps')) {
        return fulfillJson(route, { gaps: [{ id: 1, title: 'PDK incomplete', message: 'Confirm PDK version.' }] })
      }
      if (path.includes('/signoff-gates')) {
        return fulfillJson(route, [
          { id: 'g-drc', gate_type: 'DRC', status: 'pending' },
          { id: 'g-lvs', gate_type: 'LVS', status: 'pass', tool_name: 'Calibre' },
        ])
      }
      if (path.includes('/waivers')) {
        return fulfillJson(route, [{ id: 'w1', title: 'Density waiver', severity: 'medium', status: 'pending' }])
      }
      if (path.includes('/packages')) {
        return fulfillJson(route, [{ id: 'pkg1', version_label: 'TO-1.0', is_frozen: false, artifacts: [] }])
      }
      if (path.includes('/submissions')) {
        return fulfillJson(route, [{ id: 'sub1', package_id: 'pkg1', status: 'draft' }])
      }
      if (path.includes('/fab-lots')) {
        return fulfillJson(route, [{ id: 'lot1', lot_id: 'LOT-A', wafer_count: 25, status: 'wafer_start' }])
      }
      if (path.includes('/nda') && !path.includes('/download')) {
        return fulfillJson(route, [{ id: 'nda1', file_name: 'nda.pdf' }])
      }
      if (path.includes('/timeline')) {
        return fulfillJson(route, [{ id: 1, message: 'Vendor onboarded', time: '2026-01-01T00:00:00Z' }])
      }
      if (path.endsWith('/projects') || path.includes('/projects?')) {
        return fulfillJson(route, projectsState)
      }
      if (path.includes('/specifications/statuses')) {
        return fulfillJson(route, ['draft', 'in_review', 'approved'])
      }
      if (/\/specifications\/spec-uuid-1/.test(path)) {
        return fulfillJson(route, MOCK.spec)
      }
      if (path.includes('/specifications')) {
        return fulfillJson(route, [MOCK.spec, MOCK.specB])
      }
      // Single vendor detail (preview) before list
      if (/\/vendors\/[^/]+$/.test(path) && !path.endsWith('/vendors')) {
        return fulfillJson(route, { ...vendorState })
      }
      if (path.endsWith('/vendors') || path.includes('/vendors?')) {
        return fulfillJson(route, [{ ...vendorState }])
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
        const approved = activeChecklistsState.filter((c) => String(c.status).toLowerCase() === 'approved').length
        return fulfillJson(route, {
          total_templates: templatesState.length,
          active_checklists: activeChecklistsState.length,
          approved_checklists: approved,
          avg_completion_rate: 40,
        })
      }
      if (path.includes('/checklists/active') && path.includes('/completion')) {
        return fulfillJson(route, { progress: 2, total: 5, completion_percent: 40 })
      }
      if (/\/checklists\/active\/[^/]+$/.test(path) && !path.endsWith('/active')) {
        const id = path.split('/').pop()
        const found = activeChecklistsState.find((c) => String(c.id) === String(id))
        if (!found) return fulfillJson(route, { detail: 'Not found' }, 404)
        return fulfillJson(route, found)
      }
      if (path.includes('/checklists/templates/') && /\/templates\/[^/]+$/.test(path)) {
        const id = path.split('/').pop()
        const found = templatesState.find((t) => String(t.id) === String(id))
        if (!found) return fulfillJson(route, { detail: 'Not found' }, 404)
        return fulfillJson(route, found)
      }
      if (path.includes('/checklists/templates')) {
        return fulfillJson(route, templatesState)
      }
      if (path.includes('/checklists/active')) {
        return fulfillJson(route, activeChecklistsState)
      }
      // Linkable checklists for project details modal
      if (path.includes('/checklists')) {
        return fulfillJson(route, [MOCK.template, MOCK.torTemplate])
      }
      if (path.includes('/lint-results/speclint/rules') || path.includes('/speclint/rules')) {
        return fulfillJson(route, [MOCK.lintRule])
      }
      if (path.includes('/metadata/platforms')) {
        return fulfillJson(route, ['ASIC', 'FPGA', 'SoC', 'TSMC'])
      }
      if (path.includes('/metadata/eda-tools')) {
        return fulfillJson(route, ['Synopsys', 'Cadence', 'Calibre'])
      }
      if (path.includes('/metadata/types')) {
        return fulfillJson(route, ['TapeOut', 'LintOnly', 'DRC'])
      }
      if (path.includes('/metadata/')) {
        return fulfillJson(route, ['ASIC', 'FPGA', 'SoC', 'Synopsys', 'Cadence', 'TapeOut', 'active', 'planning', 'N5'])
      }
      if (path.includes('/activity')) {
        return fulfillJson(route, [])
      }
    }

    if (method === 'POST') {
      if (path.includes('/freeze') || path.includes('/unfreeze')) {
        return fulfillJson(route, { is_design_frozen: path.includes('/freeze') && !path.includes('/unfreeze') })
      }
      if (path.endsWith('/projects') || /\/projects$/.test(path)) {
        let body: Record<string, unknown> = {}
        try {
          body = req.postDataJSON() as Record<string, unknown>
        } catch {
          /* ignore */
        }
        const created = {
          ...MOCK.project,
          id: String(nextProjectId++),
          name: String(body.name || 'Created Project'),
          description: String(body.description || ''),
          platform: String(body.platform || MOCK.project.platform),
          eda_tool: String(body.eda_tool || body.edaTool || MOCK.project.eda_tool),
          edaTool: String(body.eda_tool || body.edaTool || MOCK.project.edaTool),
          type: String(body.type || MOCK.project.type),
          company_id: Number(body.company_id || 1),
          foundry: body.foundry || MOCK.project.foundry,
          process_node: body.process_node || MOCK.project.process_node,
          pdk_version: body.pdk_version || MOCK.project.pdk_version,
          eda_tool_version: body.eda_tool_version || MOCK.project.eda_tool_version,
          tapeout_status: body.tapeout_status || MOCK.project.tapeout_status,
          target_tapeout_date: body.target_tapeout_date || MOCK.project.target_tapeout_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        projectsState.push(created)
        linkedByProject[String(created.id)] = []
        return fulfillJson(route, created)
      }
      if (path.endsWith('/vendors') || /\/vendors$/.test(path)) {
        return fulfillJson(route, { ...MOCK.vendor, id: 'v-new', name: 'Created Vendor' })
      }
      if (path.includes('/companies')) {
        return fulfillJson(route, { ...MOCK.company, id: 99, name: 'Created Company' })
      }
      if (path.includes('/checklists/templates')) {
        let body: Record<string, unknown> = {}
        try {
          body = req.postDataJSON() as Record<string, unknown>
        } catch {
          /* ignore */
        }
        const created = {
          ...MOCK.template,
          id: 900 + templatesState.length,
          name: String(body.name || 'Created Template'),
          description: String(body.description || ''),
          items: Array.isArray(body.items) ? body.items : MOCK.template.items,
        }
        templatesState.push(created)
        return fulfillJson(route, created)
      }
      if (path.includes('/checklists/active') && path.includes('/approve')) {
        const parts = path.split('/')
        const id = parts[parts.indexOf('active') + 1]
        const idx = activeChecklistsState.findIndex((c) => String(c.id) === String(id))
        if (idx === -1) return fulfillJson(route, { detail: 'Not found' }, 404)
        activeChecklistsState[idx] = {
          ...activeChecklistsState[idx],
          status: 'approved',
          is_approved: true,
          approved_by: 'E2E Tester',
          approved_by_email: 'e2e@tapeoutops.com',
        }
        return fulfillJson(route, activeChecklistsState[idx])
      }
      if (path.endsWith('/checklists/active') || /\/checklists\/active$/.test(path)) {
        let body: Record<string, unknown> = {}
        try {
          body = req.postDataJSON() as Record<string, unknown>
        } catch {
          /* ignore */
        }
        const templateId = body.template_id
        const tpl =
          templatesState.find((t) => String(t.id) === String(templateId)) || MOCK.template
        const created = {
          id: nextActiveId++,
          template_id: tpl.id,
          template_name: tpl.name,
          name: String(tpl.name || 'Active Checklist'),
          status: 'pending',
          completion_percent: 0,
          items: tpl.items || [],
        }
        activeChecklistsState.push(created)
        return fulfillJson(route, created)
      }
      if (path.includes('/lint-results/speclint/rules') || path.includes('/speclint/rules')) {
        return fulfillJson(route, { id: 2, pattern: 'TODO', type: 'warning' })
      }
    }

    if (method === 'PUT' || method === 'PATCH') {
      const projectUpdate = path.match(/\/projects\/([^/]+)$/)
      if (projectUpdate) {
        const idx = projectsState.findIndex((p) => String(p.id) === String(projectUpdate[1]))
        if (idx === -1) return fulfillJson(route, { detail: 'Not found' }, 404)
        let body: Record<string, unknown> = {}
        try {
          body = req.postDataJSON() as Record<string, unknown>
        } catch {
          /* ignore */
        }
        const prev = projectsState[idx]
        const updated = {
          ...prev,
          ...body,
          id: prev.id,
          name: body.name != null ? String(body.name) : prev.name,
          eda_tool: body.eda_tool || body.edaTool || prev.eda_tool,
          edaTool: body.eda_tool || body.edaTool || prev.edaTool,
          updated_at: new Date().toISOString(),
        }
        projectsState[idx] = updated
        return fulfillJson(route, updated)
      }
    }

    if (method === 'DELETE') {
      const projectDelete = path.match(/\/projects\/([^/]+)$/)
      if (projectDelete) {
        const id = projectDelete[1]
        const idx = projectsState.findIndex((p) => String(p.id) === String(id))
        if (idx !== -1) projectsState.splice(idx, 1)
        delete linkedByProject[id]
        await route.fulfill({ status: 204, body: '' })
        return
      }
    }

    return route.fallback()
  })
}

/**
 * Seed company-scoped data for data-driven domain visibility tests.
 * @param opts.companyId viewer company — if not 1, return empty lists (cross-domain isolation)
 */
export async function seedDomainSharedData(page: Page, opts: { companyId: number } = { companyId: 1 }) {
  const shared = opts.companyId === 1
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const path = url.pathname.replace(/\/+$/, '')
    const method = req.method()

    if (method !== 'GET') return route.fallback()

    if (path.endsWith('/projects') || path.includes('/projects?')) {
      return fulfillJson(route, shared ? [DOMAIN_SHARED.project] : [])
    }
    if (path.includes('/specifications/statuses')) {
      return fulfillJson(route, ['draft', 'in_review', 'approved'])
    }
    if (path.includes('/specifications')) {
      return fulfillJson(route, shared ? [DOMAIN_SHARED.spec] : [])
    }
    if (path.includes('/vendors')) {
      return fulfillJson(route, shared ? [DOMAIN_SHARED.vendor] : [])
    }
    if (path.includes('/companies/') && /\/companies\/\d+$/.test(path)) {
      return fulfillJson(route, shared ? DOMAIN_SHARED.company : { detail: 'Not found' }, shared ? 200 : 404)
    }
    if (path.includes('/companies')) {
      return fulfillJson(route, shared ? [DOMAIN_SHARED.company] : [])
    }
    if (path.includes('/checklists/stats')) {
      return fulfillJson(route, {
        total_templates: shared ? 1 : 0,
        active_checklists: 0,
        approved_checklists: 0,
        avg_completion_rate: 0,
      })
    }
    if (path.includes('/checklists/templates')) {
      return fulfillJson(route, shared ? [DOMAIN_SHARED.template] : [])
    }
    if (path.includes('/checklists/active')) {
      return fulfillJson(route, [])
    }
    if (path.includes('/metadata/')) {
      return fulfillJson(route, ['ASIC', 'FPGA', 'SoC', 'Synopsys', 'Cadence', 'TapeOut', 'active'])
    }

    return route.fallback()
  })
}
