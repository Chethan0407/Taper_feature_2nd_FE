/**
 * Theme: localStorage.theme is 'light' | 'dark' when set; omitted = follow system (prefers-color-scheme).
 * Keep sync logic in sync with the inline script in index.html (FOUC prevention).
 */

export type ThemePreference = 'light' | 'dark' | 'system'

export function getThemePreference(): ThemePreference {
  if (!('theme' in localStorage)) return 'system'
  const t = localStorage.getItem('theme')
  if (t === 'dark' || t === 'light') return t
  return 'system'
}

/** Apply localStorage + system preference to <html class="dark"> */
export function syncDarkClass(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  let dark = false
  if (localStorage.theme === 'dark') dark = true
  else if (localStorage.theme === 'light') dark = false
  else dark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (dark) root.classList.add('dark')
  else root.classList.remove('dark')
}

export function applyThemePreference(pref: ThemePreference): void {
  if (pref === 'system') {
    localStorage.removeItem('theme')
  } else {
    localStorage.theme = pref
  }
  syncDarkClass()
}

/**
 * Call once at app bootstrap: applies theme and listens for OS changes when in "system" mode.
 */
export function initTheme(): void {
  syncDarkClass()
  if (typeof window === 'undefined') return

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onSchemeChange = () => {
    if (!('theme' in localStorage)) syncDarkClass()
  }
  mq.addEventListener('change', onSchemeChange)
}
