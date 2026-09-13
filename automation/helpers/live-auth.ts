import { type Page, request } from '@playwright/test'
import { Env } from '../config'

export type LiveSession = {
  token: string
  user: Record<string, unknown>
}

/**
 * Authenticate against the real backend (no API mocks).
 * Requires PLAYWRIGHT_EMAIL + PLAYWRIGHT_PASSWORD (+ optional PLAYWRIGHT_API_BASE).
 */
export async function loginLive(page: Page): Promise<LiveSession> {
  const email = Env.liveEmail
  const password = Env.livePassword
  if (!email || !password) {
    throw new Error('Set PLAYWRIGHT_EMAIL and PLAYWRIGHT_PASSWORD for live automation')
  }

  const api = await request.newContext({ baseURL: Env.apiBase })
  const loginRes = await api.post('/api/v1/auth/login', {
    data: { email, password },
  })
  if (!loginRes.ok()) {
    const detail = await loginRes.text()
    throw new Error(`Live login failed (${loginRes.status()}): ${detail}`)
  }
  const loginBody = (await loginRes.json()) as {
    access_token?: string
    token?: string
    user?: Record<string, unknown>
  }
  const token = loginBody.access_token || loginBody.token
  if (!token) throw new Error('Live login response missing access_token')

  let user = loginBody.user
  if (!user) {
    const meRes = await api.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (meRes.ok()) {
      user = (await meRes.json()) as Record<string, unknown>
    } else {
      const alt = await api.get('/api/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (alt.ok()) user = (await alt.json()) as Record<string, unknown>
    }
  }

  const sessionUser = {
    ...(user || {
      email,
      full_name: email,
      name: email,
      role: 'engineer',
      is_active: true,
    }),
    // App shells expect these shapes
    name: (user as { full_name?: string; name?: string } | undefined)?.full_name
      || (user as { name?: string } | undefined)?.name
      || email,
    is_admin: Boolean((user as { is_superuser?: boolean; role?: string } | undefined)?.is_superuser)
      || (user as { role?: string } | undefined)?.role === 'admin',
  }

  // FE still calls GET /api/v1/me; BE exposes /api/v1/auth/me — bridge only that path.
  await page.route('**/api/v1/me', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionUser),
    })
  })
  await page.route('**/api/v1/auth/me', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionUser),
    })
  })

  await page.addInitScript(
    ({ token: t, user: u }) => {
      sessionStorage.removeItem('e2e_logged_out')
      localStorage.setItem('tapeout_token', t)
      localStorage.setItem('access_token', t)
      localStorage.setItem('tapeout_user', JSON.stringify(u))
    },
    { token, user: sessionUser },
  )

  await api.dispose()
  return { token, user: sessionUser }
}
