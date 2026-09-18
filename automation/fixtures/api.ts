import { type Page, type Route } from '@playwright/test'
import { Users, type FrameworkUser } from '../config'

export type MockUser = FrameworkUser

/** Admin — default authenticated fixture user */
export const TEST_USER: MockUser = Users.admin

/** Non-admin engineer — roles / permissions tests */
export const ENGINEER_USER: MockUser = Users.engineer

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

/** In-memory branding for E2E — drives CSS var accents after save */
let mockBranding = {
  company_name: 'E2E Tapeout Corp',
  logo_url: '',
  primary_color: '#0f766e',
  secondary_color: '#d97706',
  brand_color: '#0f766e',
}

/** Stub /api/v1 so authenticated pages load without a live backend. */
export async function mockApi(page: Page, user: MockUser = TEST_USER) {
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const path = url.pathname.replace(/\/+$/, '')
    const method = req.method()

    if (path.endsWith('/api/v1/me') || path.endsWith('/me')) {
      return json(route, user)
    }

    if (path.includes('/auth/login') && method === 'POST') {
      let body: { email?: string; password?: string; mfa_code?: string } = {}
      try {
        body = req.postDataJSON() as { email?: string; password?: string; mfa_code?: string }
      } catch {
        /* ignore */
      }
      if (body?.email?.includes('wrong@')) {
        return json(route, { detail: 'Wrong email or password.' }, 401)
      }
      if (body?.email?.includes('unverified@')) {
        return json(route, { detail: 'Email not verified. Please verify your email address first.' }, 403)
      }
      if (body?.email?.includes('mfa@') && !body?.mfa_code) {
        return json(route, {
          access_token: null,
          token_type: 'mfa_pending',
          requires_mfa: true,
          mfa_token: 'e2e-mfa-pending-token',
          expires_in_minutes: 5,
        })
      }
      if (body?.email?.includes('engineer@')) {
        return json(route, {
          access_token: 'e2e-engineer-token',
          token_type: 'bearer',
          requires_mfa: false,
          user: ENGINEER_USER,
        })
      }
      return json(route, {
        access_token: 'e2e-login-token',
        token_type: 'bearer',
        requires_mfa: false,
        user: TEST_USER,
      })
    }

    if (path.includes('/auth/mfa/verify') && method === 'POST') {
      let body: { mfa_token?: string; mfa_code?: string } = {}
      try {
        body = req.postDataJSON() as { mfa_token?: string; mfa_code?: string }
      } catch {
        /* ignore */
      }
      if (body?.mfa_code === '000000' || (body?.mfa_code && body.mfa_code.length >= 6)) {
        return json(route, {
          access_token: 'e2e-login-token-after-mfa',
          token_type: 'bearer',
          requires_mfa: false,
        })
      }
      return json(route, { detail: 'Invalid MFA code' }, 401)
    }

    if (path.includes('/auth/password-policy') && method === 'GET') {
      return json(route, {
        min_length: 8,
        max_length: 128,
        max_bytes: 72,
        require_uppercase: true,
        require_lowercase: true,
        require_number: true,
        require_special: true,
        special_chars: '!@#$%^&*(),.?":{}|<>',
        block_common_passwords: true,
        notes: 'Enforced on signup and password reset.',
      })
    }

    if (path.includes('/auth/session') && method === 'GET') {
      return json(route, {
        user_id: user.id,
        email: user.email,
        mfa_enabled: false,
        absolute_timeout_minutes: 60,
        expires_at: new Date(Date.now() + 3600_000).toISOString(),
        rbac_role: user.role || 'engineer',
      })
    }

    if (path.includes('/public/security-report') && method === 'POST') {
      return json(route, { ok: true, id: 1 }, 201)
    }

    if (path.includes('/public/demo-request') && method === 'POST') {
      return json(route, { ok: true, id: 1 }, 201)
    }

    if (path.includes('/public/capabilities') && method === 'GET') {
      return json(route, {
        product: 'TapeOutOps',
        updated_at: '2026-09-18T20:00:00Z',
        capabilities: [
          { claim: 'Inbound Jira / GitLab / GitHub / Jenkins webhooks', status: 'live' },
          { claim: 'Bidirectional issue sync', status: 'roadmap' },
          { claim: 'Calibre / GDSII layout mutation', status: 'out_of_scope' },
          { claim: 'TLS 1.3 + AES-256', status: 'ops' },
        ],
      })
    }

    if (path.includes('/public/integrations') && method === 'GET') {
      return json(route, {
        live: [
          { name: 'Jira', kind: 'inbound', notes: 'Inbound webhook only' },
          { name: 'GitLab', kind: 'inbound', notes: 'Inbound webhook only' },
          { name: 'GitHub', kind: 'inbound', notes: 'Inbound webhook only' },
          { name: 'Jenkins', kind: 'inbound', notes: 'CI hook + X-TapeOutOps-Secret' },
        ],
        roadmap: [
          { name: 'Bidirectional Jira sync', kind: 'sync', notes: 'Not live' },
        ],
        out_of_scope: [
          { name: 'Calibre / GDSII layout mutation', kind: 'eda', notes: 'TapeOutOps does not mutate layout databases' },
        ],
        note: 'Inbound connectors are live. Bidirectional sync is roadmap. Layout EDA stays out of scope.',
      })
    }

    if (path.includes('/public/security') && method === 'GET') {
      return json(route, {
        product: 'TapeOutOps',
        updated_at: '2026-09-18T20:00:00Z',
        contact: { security_email: 'security@tapeoutops.com' },
        encryption: {
          in_transit: { control: 'TLS 1.3', status: 'ops', notes: 'TLS at edge' },
          at_rest: { control: 'AES-256', status: 'ops', notes: 'At rest' },
        },
        authentication_access: {
          mfa: { control: 'TOTP MFA', status: 'live' },
        },
        infrastructure: {
          network_security: { status: 'ops', notes: 'Firewalls / VPC' },
        },
        data_protection: {
          backups: { status: 'ops', notes: 'Automated backups' },
        },
        monitoring: {
          alerting: { status: 'ops', notes: 'Datadog monitoring' },
          penetration_testing: { status: 'roadmap', notes: 'Not continuous public claim' },
        },
        deployment: {
          private_vpc: { status: 'ops', notes: 'Isolated cloud VPC' },
          on_prem_dedicated_vpc: { status: 'roadmap' },
          aws_govcloud: { status: 'roadmap' },
        },
        compliance: {
          encryption_summary: 'TLS 1.3 in transit; AES-256 at rest.',
          access_summary: 'JWT auth, RBAC, MFA.',
          soc2: {
            control: 'SOC 2 Type II',
            status: 'roadmap',
            notes: 'Controls aligned; not certified.',
          },
        },
        reporting: { security_email: 'security@tapeoutops.com', api: 'POST /api/v1/public/security-report' },
        data_boundary: 'TapeOutOps does not ingest GDSII/OASIS layout databases.',
        user_best_practices: ['Enable multi-factor authentication'],
      })
    }

    if (path.includes('/settings/security/mfa/status') && method === 'GET') {
      return json(route, { mfa_enabled: false, method: 'totp' })
    }
    if (path.includes('/settings/security/mfa/setup') && method === 'POST') {
      return json(route, {
        secret: 'JBSWY3DPEHPK3PXP',
        otpauth_url: 'otpauth://totp/TapeOutOps:e2e@tapeoutops.com?secret=JBSWY3DPEHPK3PXP&issuer=TapeOutOps',
        issuer: 'TapeOutOps',
      })
    }
    if (path.includes('/settings/security/mfa/enable') && method === 'POST') {
      return json(route, { ok: true, mfa_enabled: true })
    }
    if (path.includes('/settings/security/mfa/disable') && method === 'POST') {
      return json(route, { ok: true, mfa_enabled: false })
    }
    if (path.includes('/settings/security/access-review') && method === 'GET') {
      return json(route, {
        company_id: 1,
        company_name: 'E2E Tapeout Corp',
        users: [
          {
            user_id: 1,
            email: user.email,
            full_name: user.name || 'E2E',
            role: user.role || 'admin',
            is_active: true,
            mfa_enabled: false,
            last_login_at: null,
          },
        ],
        reviewed_at: '2026-09-18T20:00:00Z',
      })
    }
    if (path.includes('/settings/security/retention') && method === 'GET') {
      return json(route, {
        company_id: 1,
        data_retention_days: 365,
        deletion_policy: 'soft_delete',
        notes: 'Soft-deleted accounts remain until retention window elapses.',
      })
    }
    if (path.includes('/settings/security/retention') && method === 'PATCH') {
      let body: { data_retention_days?: number; deletion_policy?: string; company_id?: number } = {}
      try {
        body = req.postDataJSON() as typeof body
      } catch {
        /* ignore */
      }
      return json(route, {
        ok: true,
        company_id: body.company_id || 1,
        data_retention_days: body.data_retention_days || 365,
        deletion_policy: body.deletion_policy || 'soft_delete',
      })
    }
    if (path.includes('/settings/security/deletion-request') && method === 'POST') {
      return json(route, {
        ok: true,
        status: 'soft_deleted',
        message: 'Account deactivated.',
        deleted_at: '2026-09-18T20:00:00Z',
      }, 202)
    }

    if (path.includes('/vendors/performance') && method === 'GET') {
      return json(route, {
        count: 2,
        note: 'SLA hours are advisory from recent acknowledgements.',
        vendors: [
          {
            vendor_id: 1,
            name: 'E2E Foundry Co',
            type: 'foundry',
            status: 'active',
            linked_specifications: 3,
            acknowledgements: 2,
            last_activity_at: '2026-09-18T12:00:00Z',
            response_sla_hours: 48,
            sla_breached: false,
            staging: 'secure_upload',
          },
          {
            vendor_id: 2,
            name: 'IP Partner LLC',
            type: 'ip',
            status: 'active',
            linked_specifications: 1,
            acknowledgements: 0,
            last_activity_at: null,
            response_sla_hours: 24,
            sla_breached: true,
            staging: 'pending',
          },
        ],
      })
    }

    if (path.includes('/integrations/connectors') && method === 'GET') {
      return json(route, [
        {
          id: 10,
          company_id: 1,
          provider: 'jira',
          name: 'Prod Jira inbound',
          is_active: true,
          created_by: user.email,
          created_at: '2026-09-18T10:00:00Z',
          inbound_path: '/api/v1/integrations/webhooks/jira/inbound',
          secret_hint: '••••ab12',
        },
      ])
    }

    if (path.includes('/integrations/connectors') && method === 'POST') {
      let body: { provider?: string; company_id?: number; name?: string; secret?: string } = {}
      try {
        body = req.postDataJSON() as typeof body
      } catch {
        /* ignore */
      }
      return json(route, {
        id: 99,
        company_id: body.company_id || 1,
        provider: body.provider || 'jira',
        name: body.name || null,
        is_active: true,
        created_by: user.email,
        created_at: '2026-09-18T20:00:00Z',
        inbound_path: `/api/v1/integrations/webhooks/${body.provider || 'jira'}/inbound`,
        secret_hint: '••••e2e1',
        secret: body.secret || 'e2e-generated-secret',
      }, 201)
    }

    if (path.includes('/integrations/events') && method === 'GET') {
      return json(route, [
        {
          id: 1,
          connector_id: 10,
          company_id: 1,
          provider: 'jira',
          event_type: 'issue_updated',
          external_id: 'PROJ-1',
          status: 'accepted',
          created_at: '2026-09-18T11:00:00Z',
        },
      ])
    }

    if (path.includes('/auth/signup') && method === 'POST') {
      let body: { email?: string } = {}
      try {
        body = req.postDataJSON() as { email?: string }
      } catch {
        /* ignore */
      }
      if (body?.email?.includes('exists@')) {
        return json(route, { detail: 'Email already registered. Please log in instead.' }, 400)
      }
      return json(route, {
        message: 'Account created successfully. Please check your email for OTP verification code.',
        email: body?.email,
        requires_verification: true,
      })
    }

    if (path.includes('/auth/verify-email') && method === 'POST') {
      let body: { otp?: string } = {}
      try {
        body = req.postDataJSON() as { otp?: string }
      } catch {
        /* ignore */
      }
      if (body?.otp === '000000') {
        return json(route, { detail: 'Invalid or expired OTP. Please check and try again.' }, 400)
      }
      return json(route, {
        message: 'Email verified successfully!',
        access_token: 'e2e-verified-token',
        user: TEST_USER,
      })
    }

    if (path.includes('/auth/resend-otp') || path.includes('/auth/forgot-password') || path.includes('/auth/reset-password') || path.includes('/auth/logout')) {
      return json(route, { message: 'If the email exists, an OTP will be sent to your email.', msg: 'ok' })
    }

    if (path.includes('/auth/verify-reset-token')) {
      return json(route, { valid: true, email: 'e2e@tapeoutops.com' })
    }

    if (method === 'GET') {
      if (path.includes('/settings/branding')) {
        return json(route, { ...mockBranding })
      }
      if (path.includes('/exports/types')) {
        return json(route, {
          resources: [
            'users',
            'companies',
            'projects',
            'vendors',
            'specifications',
            'checklist-templates',
            'active-checklists',
          ].map((id) => ({ id, name: id })),
          formats: ['csv', 'json', 'xlsx'],
        })
      }
      if (path.includes('/imports/types')) {
        return json(route, {
          resources: [
            'users',
            'companies',
            'projects',
            'vendors',
            'specifications',
            'checklist-templates',
            'active-checklists',
          ].map((id) => ({ id, name: id })),
          formats: ['json', 'zip', 'csv'],
          max_bytes: 25 * 1024 * 1024,
        })
      }
      if (path.includes('/imports/template')) {
        const format = (url.searchParams.get('format') || 'zip').toLowerCase()
        if (format === 'json') {
          return json(route, {
            schema_version: 1,
            companies: [],
            projects: [],
            vendors: [],
          })
        }
        await route.fulfill({
          status: 200,
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="tapeoutops-import-template.zip"',
          },
          body: 'PK\u0003\u0004fake-template-zip',
        })
        return
      }
      if (path.includes('/exports/complete')) {
        const format = (url.searchParams.get('format') || 'zip').toLowerCase()
        if (format === 'json') {
          return json(route, {
            schema_version: 1,
            exported_at: '2026-09-13T00:00:00Z',
            companies: [{ id: 1, name: 'Sample Co' }],
            projects: [{ id: 1, name: 'Sample Project' }],
          })
        }
        await route.fulfill({
          status: 200,
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="tapeoutops-complete-export.zip"',
          },
          body: 'PK\u0003\u0004fake-complete-zip',
        })
        return
      }
      if (/\/exports\/[^/]+$/.test(path) || path.includes('/exports/')) {
        const resource = path.split('/exports/')[1]?.split('?')[0] || 'export'
        const format = (url.searchParams.get('format') || 'csv').toLowerCase()
        if (format === 'json') {
          return json(route, {
            resource,
            count: 2,
            data: [
              { id: 1, name: `Sample ${resource} A` },
              { id: 2, name: `Sample ${resource} B` },
            ],
          })
        }
        const body =
          format === 'xlsx'
            ? 'PK\u0003\u0004fake-xlsx'
            : `id,name\n1,Sample ${resource} A\n2,Sample ${resource} B\n`
        const contentType =
          format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv'
        await route.fulfill({
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${resource}-export.${format === 'xlsx' ? 'xlsx' : 'csv'}"`,
          },
          body,
        })
        return
      }
      if (path.includes('/checklists/stats')) {
        return json(route, {
          total_templates: 0,
          active_checklists: 0,
          approved_checklists: 0,
          avg_completion_rate: 0,
        })
      }
      // System usage trends — sparse signups (UI must pad the window)
      if (path.includes('/usage/trends')) {
        const days = Number(url.searchParams.get('days') || 30)
        const end = new Date()
        const y = end.getFullYear()
        const m = String(end.getMonth() + 1).padStart(2, '0')
        const d = String(end.getDate()).padStart(2, '0')
        const today = `${y}-${m}-${d}`
        const mid = new Date(end)
        mid.setDate(end.getDate() - Math.min(14, Math.max(1, days - 1)))
        const midKey = `${mid.getFullYear()}-${String(mid.getMonth() + 1).padStart(2, '0')}-${String(mid.getDate()).padStart(2, '0')}`
        return json(route, {
          signups: [
            { date: midKey, count: 2 },
            { date: today, count: 5 },
          ],
          projects: [],
          period_days: days,
          timestamp: new Date().toISOString(),
        })
      }
      if (path.includes('/usage/users')) {
        const skip = Number(url.searchParams.get('skip') || 0)
        const limit = Number(url.searchParams.get('limit') || 10)
        const all = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          email: `user${i + 1}@tapeoutops.com`,
          full_name: `User ${i + 1}`,
          role: 'engineer',
          email_domain: 'tapeoutops.com',
          is_active: true,
          activity_count: i,
          created_at: '2026-09-01T00:00:00Z',
        }))
        return json(route, {
          users: all.slice(skip, skip + limit),
          total: all.length,
          skip,
          limit,
        })
      }
      if (path.includes('/usage/domains') || path.endsWith('/domains')) {
        const domains = Array.from({ length: 14 }, (_, i) => ({
          domain: i === 0 ? 'gmail.com' : i === 1 ? 'tapeoutops.com' : `domain${i}.com`,
          users: Math.max(1, 14 - i),
          companies: i % 3,
          projects: i % 4,
        }))
        return json(route, { domains, total_domains: domains.length })
      }
      if (path.includes('/signup-leads')) {
        const leads = Array.from({ length: 12 }, (_, i) => ({
          email: `lead${i + 1}@example.com`,
          last_source: i % 2 === 0 ? 'blur' : 'idle',
          last_seen: '2026-09-13T10:00:00Z',
          converted: i % 5 === 0,
          user_id: i % 5 === 0 ? i + 1 : null,
        }))
        return json(route, { items: leads, total: leads.length })
      }
      if (path.includes('/readiness')) {
        return json(route, {
          readiness_score: 72,
          blockers: [{ id: 1, title: 'Missing DRC report', severity: 'high', message: 'Upload a DRC report to clear this blocker.' }],
          gates: [
            { id: 'g-drc', gate_type: 'DRC', status: 'pending' },
            { id: 'g-lvs', gate_type: 'LVS', status: 'pass', tool_name: 'Calibre' },
          ],
          is_design_frozen: false,
          tapeout_status: 'planning',
          foundry: 'TSMC',
          process_node: 'N5',
          pdk_version: '1.2.3',
        })
      }
      if (path.includes('/gaps')) {
        return json(route, {
          gaps: [
            { id: 1, title: 'Foundry profile incomplete', message: 'Set PDK version on the project.', severity: 'medium' },
          ],
        })
      }
      if (path.includes('/signoff-matrix')) {
        return json(route, {
          project_id: 101,
          count: 2,
          gates: [
            {
              gate_id: 'g-drc',
              gate: 'DRC',
              owner: 'PD owner',
              status: 'Pending',
              status_raw: 'pending',
              approved_by: null,
              when: null,
            },
            {
              gate_id: 'g-lvs',
              gate: 'LVS',
              owner: 'PD owner',
              status: 'Pass',
              status_raw: 'pass',
              approved_by: 'e2e@tapeoutops.com',
              when: '2026-09-17T10:00:00Z',
            },
          ],
          default_gate_types: ['DRC', 'LVS', 'STA', 'IR_EM', 'DFT'],
        })
      }
      if (path.includes('/signoff-gates')) {
        return json(route, [
          { id: 'g-drc', gate_type: 'DRC', status: 'pending' },
          { id: 'g-lvs', gate_type: 'LVS', status: 'pass', tool_name: 'Calibre', tool_version: '2024.1' },
          { id: 'g-sta', gate_type: 'STA', status: 'pending' },
          { id: 'g-irem', gate_type: 'IR_EM', status: 'pending' },
          { id: 'g-dft', gate_type: 'DFT', status: 'pending' },
        ])
      }
      if (path.includes('/activity')) {
        return json(route, [
          {
            id: 1,
            timestamp: '2026-09-18T12:00:00Z',
            user: user.email,
            action: 'vendor.acknowledged',
            entity: 'vendor',
            entity_id: 1,
            details: { note: 'E2E ack' },
          },
          {
            id: 2,
            timestamp: '2026-09-18T11:00:00Z',
            user: user.email,
            action: 'signoff.approved',
            entity: 'project',
            entity_id: 101,
            details: { gate: 'LVS' },
          },
        ])
      }
      if (path.includes('/waivers')) {
        return json(route, [
          { id: 'w1', title: 'Metal density waiver', severity: 'medium', status: 'pending', rule_id: 'DRC.12' },
        ])
      }
      if (path.includes('/packages')) {
        return json(route, [
          {
            id: 'pkg1',
            version_label: 'TO-1.0',
            notes: 'Initial package',
            is_frozen: false,
            artifacts: [{ id: 'a1', file_name: 'top.gds', checksum_sha256: 'abc123def4567890' }],
          },
        ])
      }
      if (path.includes('/submissions')) {
        return json(route, [
          { id: 'sub1', package_id: 'pkg1', status: 'draft', foundry_ticket_id: 'TSMC-100' },
        ])
      }
      if (path.includes('/fab-lots')) {
        return json(route, [{ id: 'lot1', lot_id: 'LOT-A', wafer_count: 25, status: 'wafer_start' }])
      }
      if (path.includes('/vendors/') && path.endsWith('/nda')) {
        return json(route, [{ id: 'nda1', file_name: 'nda.pdf' }])
      }
      if (path.includes('/vendors/') && path.includes('/timeline')) {
        return json(route, [{ id: 1, message: 'Vendor created', time: '2026-01-01T00:00:00Z' }])
      }
      if (path.endsWith('/dashboard') || path.includes('/dashboard?')) {
        return json(route, {
          approved_specs: 1,
          pending_specs: 0,
          rejected_specs: 0,
          vendor_partners: 3,
          quality_score: 100,
        })
      }
      if (path.includes('/metadata/platforms')) {
        return json(route, ['TSMC', 'Intel', 'Samsung'])
      }
      if (path.includes('/metadata/eda-tools')) {
        return json(route, ['Calibre', 'Innovus', 'ICC2'])
      }
      if (path.includes('/metadata/types')) {
        return json(route, ['DRC', 'LVS', 'STA', 'Layout'])
      }
      if (path.includes('/metadata/statuses')) {
        return json(route, ['Approved', 'Pending', 'Rejected'])
      }
      if (path.includes('/metadata/process-nodes')) {
        return json(route, ['N3', 'N5', 'N7', 'N16'])
      }
      if (path.includes('/metadata/tapeout-statuses')) {
        return json(route, ['planning', 'in_progress', 'frozen', 'submitted', 'fab'])
      }
      if (path.includes('/metadata/signoff-gate')) {
        return json(route, ['pass', 'fail', 'pending', 'DRC', 'LVS', 'STA', 'IR_EM', 'DFT'])
      }
      if (path.includes('/specifications') && !path.includes('/statuses')) {
        return json(route, [
          {
            id: 'spec-1',
            name: 'E2E Spec Alpha',
            status: 'Approved',
            platform: 'TSMC',
            uploaded_on: '2026-01-24T00:00:00Z',
            updated_at: '2026-01-24T00:00:00Z',
          },
          {
            id: 'spec-2',
            name: 'E2E Spec Beta',
            status: 'Pending',
            platform: 'Intel',
            uploaded_on: '2026-02-01T00:00:00Z',
            updated_at: '2026-02-01T00:00:00Z',
          },
        ])
      }
      if (path.includes('/admin') || path.includes('/usage') || path.includes('/signup')) {
        return json(route, {
          users: { total: 12, active: 10, signups_7d: 3 },
          resources: { companies: 2, projects: 4, specifications: 1 },
          total_users: 12,
          active_users: 10,
          total_projects: 4,
          total_specs: 1,
          signup_leads: [],
          items: [],
          activities: [],
          domains: [],
          active_users_list: [],
        })
      }
      return json(route, [])
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (path.includes('/imports/complete') && method === 'POST') {
        return json(route, {
          schema_version: 1,
          imported_by: user.email,
          results: {
            companies: { created: 1, updated: 0, skipped: 0, errors: [] },
            projects: { created: 2, updated: 1, skipped: 0, errors: [] },
            vendors: { created: 0, updated: 0, skipped: 1, errors: [] },
          },
        })
      }
      if (path.includes('/freeze') || path.includes('/unfreeze')) {
        return json(route, {
          readiness_score: 72,
          is_design_frozen: path.includes('/freeze') && !path.includes('/unfreeze'),
          tapeout_status: 'planning',
        })
      }
      if (path.includes('/waivers') || path.includes('/packages') || path.includes('/submissions') || path.includes('/fab-lots') || path.includes('/artifacts') || path.includes('/acknowledge') || path.includes('/nda')) {
        return json(route, { message: 'ok', id: 'new-1', status: 'pending' })
      }
      if (path.includes('/signoff-gates') && (method === 'PATCH' || method === 'POST')) {
        if (path.includes('/approve')) {
          return json(route, { ok: true, status: 'pass', approved_by: user.email })
        }
        return json(route, { id: 'g-drc', gate_type: 'DRC', status: 'pass', tool_name: 'Calibre' })
      }
      if (path.includes('/settings/branding') && method === 'PUT') {
        let body: Record<string, unknown> = {}
        try {
          body = (route.request().postDataJSON() as Record<string, unknown>) || {}
        } catch {
          /* ignore */
        }
        mockBranding = {
          ...mockBranding,
          ...(typeof body.company_name === 'string' ? { company_name: body.company_name } : {}),
          ...(typeof body.logo_url === 'string' ? { logo_url: body.logo_url } : {}),
          ...(typeof body.primary_color === 'string'
            ? { primary_color: body.primary_color, brand_color: body.primary_color }
            : {}),
          ...(typeof body.secondary_color === 'string' ? { secondary_color: body.secondary_color } : {}),
          ...(typeof body.brand_color === 'string' ? { brand_color: body.brand_color } : {}),
        }
        return json(route, { ...mockBranding })
      }
      if (method === 'DELETE') {
        await route.fulfill({ status: 204, body: '' })
        return
      }
      return json(route, { message: 'ok', id: 1 })
    }

    return json(route, { detail: 'mocked' }, 404)
  })
}

export async function seedAuth(page: Page, user: MockUser = TEST_USER) {
  await mockApi(page, user)
  await page.addInitScript((u) => {
    if (sessionStorage.getItem('e2e_logged_out') === '1') return
    localStorage.setItem('tapeout_token', 'e2e-test-token')
    localStorage.setItem('access_token', 'e2e-test-token')
    localStorage.setItem('tapeout_user', JSON.stringify(u))
  }, user)
}

/**
 * Force the next matching API call(s) to fail — for UI error-state coverage.
 * Register AFTER seedAuth so this handler wins.
 */
export async function failApi(
  page: Page,
  match: string | RegExp,
  opts: { status?: number; body?: unknown; times?: number } = {},
) {
  const status = opts.status ?? 500
  const body = opts.body ?? { detail: 'Internal Server Error' }
  let remaining = opts.times ?? 1

  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url()
    const hit = typeof match === 'string' ? url.includes(match) : match.test(url)
    if (hit && remaining > 0) {
      remaining -= 1
      return json(route, body, status)
    }
    return route.fallback()
  })
}

/** Abort matching requests (network offline style). */
export async function abortApi(page: Page, match: string | RegExp, times = 1) {
  let remaining = times
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url()
    const hit = typeof match === 'string' ? url.includes(match) : match.test(url)
    if (hit && remaining > 0) {
      remaining -= 1
      return route.abort('failed')
    }
    return route.fallback()
  })
}
