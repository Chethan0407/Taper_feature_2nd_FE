/** Apply company branding colors to global CSS variables used by Tailwind accents. */

export const DEFAULT_BRAND_PRIMARY = '#0f766e'
export const DEFAULT_BRAND_SECONDARY = '#d97706'

export type BrandColors = {
  primary_color?: string | null
  secondary_color?: string | null
  brand_color?: string | null
}

function normalizeHex(input: string | null | undefined, fallback: string): string {
  if (!input || typeof input !== 'string') return fallback
  let hex = input.trim()
  if (!hex.startsWith('#')) hex = `#${hex}`
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return fallback
  return hex.toLowerCase()
}

/** Tailwind opacity modifiers need space-separated RGB channels. */
export function hexToRgbChannels(hex: string): string {
  const h = normalizeHex(hex, DEFAULT_BRAND_PRIMARY).slice(1)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

function darkenHex(hex: string, amount = 0.18): string {
  const h = normalizeHex(hex, DEFAULT_BRAND_PRIMARY).slice(1)
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16)
    return Math.max(0, Math.min(255, Math.round(c * (1 - amount))))
  })
  return channels.join(' ')
}

/**
 * Sets document CSS vars so neon-blue / neon-purple / primary / btn-primary follow branding.
 */
export function applyBrandTheme(colors: BrandColors = {}) {
  if (typeof document === 'undefined') return

  const primary = normalizeHex(
    colors.primary_color || colors.brand_color,
    DEFAULT_BRAND_PRIMARY,
  )
  const secondary = normalizeHex(colors.secondary_color, DEFAULT_BRAND_SECONDARY)

  const root = document.documentElement
  root.style.setProperty('--brand-primary', primary)
  root.style.setProperty('--brand-secondary', secondary)
  root.style.setProperty('--brand-primary-rgb', hexToRgbChannels(primary))
  root.style.setProperty('--brand-secondary-rgb', hexToRgbChannels(secondary))
  root.style.setProperty('--brand-primary-hover-rgb', darkenHex(primary))
  root.style.setProperty('--primary-color', primary)
  root.style.setProperty('--secondary-color', secondary)
}

export function resetBrandTheme() {
  applyBrandTheme({
    primary_color: DEFAULT_BRAND_PRIMARY,
    secondary_color: DEFAULT_BRAND_SECONDARY,
  })
}
