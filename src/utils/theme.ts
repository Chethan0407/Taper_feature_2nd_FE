/**
 * App is dark-only. Legacy light/system prefs in localStorage are cleared on init.
 * Keep sync logic aligned with the inline script in index.html (FOUC prevention).
 */

export type ThemePreference = 'dark'

export function getThemePreference(): ThemePreference {
  return 'dark'
}

/** Always apply dark class on <html>. */
export function syncDarkClass(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.add('dark')
  root.style.backgroundColor = '#0e0e0e'
  root.style.colorScheme = 'dark'
  // Drop any leftover light preference so reloads stay dark
  if (typeof localStorage !== 'undefined') {
    localStorage.theme = 'dark'
  }
}

export function applyThemePreference(_pref?: ThemePreference): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.theme = 'dark'
  }
  syncDarkClass()
}

/**
 * Call once at app bootstrap: forces dark mode.
 */
export function initTheme(): void {
  syncDarkClass()
}
