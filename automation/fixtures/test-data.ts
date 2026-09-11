/**
 * Test design data — Equivalence Class Partitioning (ECP) + Boundary Value Analysis (BVA).
 * Used by sanity / regression / integration / bva-ecp automation suites.
 */

/** ECP: email domains */
export const EMAIL_ECP = {
  validCompany: ['user@company.com', 'qa@tapeoutops.com', 'a@b.co'],
  invalidFormat: ['plain', 'a@', '@b.com', 'a@@b.com', 'a b@c.com'],
  freeBlocked: ['a@gmail.com', 'b@yahoo.com', 'c@hotmail.com', 'd@outlook.com'],
  edgeWhitespace: ['  user@company.com  ', '   ', '\t'],
} as const

/**
 * Password BVA (from src/utils/passwordValidation.ts):
 * - min length 8 → boundaries: 7 (invalid), 8 (valid min), 9 (valid just above)
 * - max 72 bytes → 71, 72, 73
 * - must have upper, lower, number, special
 * - not common
 */
export const PASSWORD_BVA = {
  tooShort7: 'Ab1!xxx', // 7 chars — invalid min
  minValid8: 'Ab1!xxxx', // 8 chars — valid boundary
  justAbove9: 'Ab1!xxxxx', // 9
  missingUpper: 'ab1!xxxx',
  missingLower: 'AB1!XXXX',
  missingNumber: 'Ab!xxxxx',
  missingSpecial: 'Ab1xxxxx',
  common: 'Password123',
  /** 72 ASCII chars meeting all class rules */
  maxValid72: `Aa1!${'x'.repeat(68)}`,
  /** 73 ASCII chars — over max bytes */
  overMax73: `Aa1!${'x'.repeat(69)}`,
} as const

/** Company name maxlength=100 → BVA 99 / 100 / 101 */
export const COMPANY_NAME_BVA = {
  empty: '',
  one: 'A',
  mid: 'Acme Semiconductor',
  at99: 'C'.repeat(99),
  at100: 'C'.repeat(100),
  over101: 'C'.repeat(101),
} as const

/** Company description maxlength=500 */
export const COMPANY_DESC_BVA = {
  empty: '',
  at499: 'D'.repeat(499),
  at500: 'D'.repeat(500),
  over501: 'D'.repeat(501),
} as const

/** Project / template / vendor name classes */
export const NAME_ECP = {
  valid: ['Alpha Project', 'Vendor-1', 'Template_A'],
  empty: '',
  whitespace: '   ',
  specialChars: "O'Reilly & Co <script>",
  unicode: '项目测试',
} as const

/** Auth credential ECP for login API mock */
export const LOGIN_ECP = {
  validCompany: { email: 'user@company.com', password: 'ValidPass1!' },
  wrongPassword: { email: 'wrong@company.com', password: 'badpass' },
  unverified: { email: 'unverified@company.com', password: 'ValidPass1!' },
  freeEmail: { email: 'person@gmail.com', password: 'ValidPass1!' },
} as const

/** Protected routes — integration / regression matrix */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/projects',
  '/specs',
  '/checklists',
  '/speclint',
  '/vendors',
  '/companies',
  '/settings',
  '/profile',
  '/settings/branding',
  '/admin/usage',
] as const

/** Public routes — sanity / regression */
export const PUBLIC_ROUTES = [
  { path: '/', title: /tapeout|streamline|welcome/i },
  { path: '/login', title: /sign in|login|tapeout/i },
  { path: '/about', title: /about/i },
  { path: '/privacy', title: /privacy/i },
  { path: '/terms', title: /terms/i },
  { path: '/security', title: /security/i },
  { path: '/documentation', title: /documentation/i },
] as const

/** Sidebar feature matrix for regression */
export const SIDEBAR_FEATURES: Array<{ label: RegExp; url: RegExp }> = [
  { label: /^Dashboard$/i, url: /\/dashboard/ },
  { label: /^Projects$/i, url: /\/projects/ },
  { label: /^Specs$/i, url: /\/specs/ },
  { label: /^Checklists$/i, url: /\/checklists/ },
  { label: /^SpecLint$/i, url: /\/speclint/ },
  { label: /^Vendors$/i, url: /\/vendors/ },
  { label: /^Companies$/i, url: /\/companies/ },
  { label: /^Settings$/i, url: /\/settings(?!\/)/ },
]
