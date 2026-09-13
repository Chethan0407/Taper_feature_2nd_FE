import { type Page } from '@playwright/test'
import { Env } from '../config'
import { loginLive, seedAuth } from './index'
import { seedFeatureData } from '../fixtures/seed'

/** Live backend when PLAYWRIGHT_LIVE=1 + email/password; otherwise mocked seed. */
export async function authForModule(page: Page): Promise<boolean> {
  const useLive = Env.live && !!Env.liveEmail && !!Env.livePassword
  if (useLive) {
    await loginLive(page)
    return true
  }
  await seedAuth(page)
  await seedFeatureData(page)
  return false
}
