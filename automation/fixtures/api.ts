import { type Page, type Route } from '@playwright/test'

export type MockUser = {
  id: number
  email: string
  full_name: string
  name: string
  role: string
  is_active: boolean
  is_admin: boolean
  is_superuser?: boolean
}

/** Admin — default authenticated fixture user */
export const TEST_USER: MockUser = {
  id: 1,
  email: 'e2e@tapeoutops.com',
  full_name: 'E2E Tester',
  name: 'E2E Tester',
  role: 'admin',
  is_active: true,
  is_admin: true,
  is_superuser: true,
}

/** Non-admin engineer — roles / permissions tests */
export const ENGINEER_USER: MockUser = {
  id: 2,
  email: 'engineer@tapeoutops.com',
  full_name: 'E2E Engineer',
  name: 'E2E Engineer',
  role: 'engineer',
  is_active: true,
  is_admin: false,
  is_superuser: false,
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
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
      let body: { email?: string; password?: string } = {}
      try {
        body = req.postDataJSON() as { email?: string; password?: string }
      } catch {
        /* ignore */
      }
      if (body?.email?.includes('wrong@')) {
        return json(route, { detail: 'Wrong email or password.' }, 401)
      }
      if (body?.email?.includes('unverified@')) {
        return json(route, { detail: 'Email not verified. Please verify your email address first.' }, 403)
      }
      if (body?.email?.includes('engineer@')) {
        return json(route, {
          access_token: 'e2e-engineer-token',
          token_type: 'bearer',
          user: ENGINEER_USER,
        })
      }
      return json(route, {
        access_token: 'e2e-login-token',
        token_type: 'bearer',
        user: TEST_USER,
      })
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
      if (path.includes('/checklists/stats')) {
        return json(route, {
          total_templates: 0,
          active_checklists: 0,
          approved_checklists: 0,
          avg_completion_rate: 0,
        })
      }
      if (path.includes('/admin') || path.includes('/usage') || path.includes('/signup')) {
        return json(route, {
          users: { total: 0, active: 0, signups_7d: 0 },
          resources: { companies: 0, projects: 0, specifications: 0 },
          total_users: 0,
          active_users: 0,
          total_projects: 0,
          total_specs: 0,
          signup_leads: [],
          items: [],
        })
      }
      return json(route, [])
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
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
