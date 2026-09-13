import { type Page, expect } from '@playwright/test'
import { Timeouts } from '../config'

/** Shared wait / poll helpers for the framework. */
export async function waitForTrue(
  fn: () => Promise<boolean>,
  opts: { timeout?: number; interval?: number; message?: string } = {},
) {
  const timeout = opts.timeout ?? Timeouts.assert
  const interval = opts.interval ?? 200
  await expect
    .poll(fn, { timeout, intervals: [interval] })
    .toBeTruthy()
}

export async function markLoggedOut(page: Page) {
  await page.evaluate(() => sessionStorage.setItem('e2e_logged_out', '1'))
}

export async function clearAuthStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('tapeout_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('tapeout_user')
    sessionStorage.setItem('e2e_logged_out', '1')
  })
}
