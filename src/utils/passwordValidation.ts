/**
 * Password Validation Utility
 * 
 * Validates passwords according to backend requirements:
 * - Minimum length: 8 characters
 * - Maximum length: 72 bytes (bcrypt limit - approximately 72 characters for ASCII)
 * - Must contain at least one uppercase letter (A-Z)
 * - Must contain at least one lowercase letter (a-z)
 * - Must contain at least one number (0-9)
 * - Must contain at least one special character from: !@#$%^&*(),.?":{}|<>
 * - Cannot be common passwords
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
  checks: {
    minLength: boolean
    maxLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
    notCommon: boolean
  }
}

const COMMON_PASSWORDS = [
  'password',
  '12345678',
  'qwerty',
  'abc123',
  'password123',
  'password1',
  'Password',
  'Password1',
  'Password123'
]

const SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>]/

/**
 * Validates a password against all requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  const checks = {
    minLength: password.length >= 8,
    maxLength: password.length <= 72, // bcrypt limit is 72 bytes
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: SPECIAL_CHARS.test(password),
    notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase())
  }

  if (!checks.minLength) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!checks.maxLength) {
    errors.push('Password must be no more than 72 bytes long (approximately 72 characters for ASCII)')
  }
  if (!checks.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter (A-Z)')
  }
  if (!checks.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter (a-z)')
  }
  if (!checks.hasNumber) {
    errors.push('Password must contain at least one number (0-9)')
  }
  if (!checks.hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)')
  }
  if (!checks.notCommon) {
    errors.push('Password is too common. Please choose a more unique password')
  }

  // Calculate strength based on how many requirements are met
  const metRequirements = Object.values(checks).filter(Boolean).length
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  
  if (metRequirements >= 7) {
    strength = 'strong'
  } else if (metRequirements >= 5) {
    strength = 'good'
  } else if (metRequirements >= 3) {
    strength = 'fair'
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    checks
  }
}

/**
 * Get password requirement descriptions for display
 */
export function getPasswordRequirements(): Array<{ text: string; key: keyof PasswordValidationResult['checks'] }> {
  return [
    { text: 'At least 8 characters', key: 'minLength' },
    { text: 'No more than 72 bytes (approx. 72 characters)', key: 'maxLength' },
    { text: 'At least one uppercase letter (A-Z)', key: 'hasUppercase' },
    { text: 'At least one lowercase letter (a-z)', key: 'hasLowercase' },
    { text: 'At least one number (0-9)', key: 'hasNumber' },
    { text: 'At least one special character (!@#$%^&*(),.?":{}|<>)', key: 'hasSpecialChar' },
    { text: 'Not a common password', key: 'notCommon' }
  ]
}

