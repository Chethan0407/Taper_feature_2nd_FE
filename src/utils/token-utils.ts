/**
 * Token validation and management utilities
 */

interface TokenPayload {
  sub?: string // email
  exp?: number // expiration timestamp
  [key: string]: any
}

/**
 * Decode JWT token without verification (client-side only)
 */
function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Check if token is expired or will expire soon
 * @param token JWT token string
 * @param bufferSeconds Buffer time in seconds before expiration (default: 60)
 */
export function isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return true
  }

  try {
    const decoded = decodeToken(token)
    if (!decoded) {
      console.warn('⚠️ Token could not be decoded - may be invalid format')
      return false // Don't consider it expired if we can't decode - let backend decide
    }
    
    if (!decoded.exp) {
      console.warn('⚠️ Token has no expiration claim - assuming valid')
      return false // If no exp claim, assume it's valid (some tokens don't expire)
    }

    const currentTime = Math.floor(Date.now() / 1000)
    const expirationTime = decoded.exp
    const willExpireSoon = expirationTime < (currentTime + bufferSeconds)

    if (willExpireSoon) {
      console.warn('⚠️ Token expires soon or is expired:', {
        currentTime,
        expirationTime,
        expiresIn: expirationTime - currentTime,
        bufferSeconds,
        expired: expirationTime < currentTime
      })
    }

    return willExpireSoon
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return false // If error decoding, don't assume expired - let backend validate
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  if (!token) return null
  
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) return null
    
    return new Date(decoded.exp * 1000)
  } catch (error) {
    console.error('Error getting token expiration:', error)
    return null
  }
}

/**
 * Get time until token expires (in seconds)
 */
export function getTokenTimeUntilExpiry(token: string): number | null {
  if (!token) return null
  
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) return null
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp - currentTime
  } catch (error) {
    console.error('Error calculating token expiry time:', error)
    return null
  }
}

/**
 * Validate token format and expiration
 * Note: This is a client-side check only. The backend is the source of truth.
 */
export function validateToken(token: string | null): { valid: boolean; reason?: string } {
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return { valid: false, reason: 'Token is missing or invalid' }
  }

  // Check token format (should have 3 parts separated by dots for JWT)
  const parts = token.split('.')
  if (parts.length !== 3) {
    // Not a standard JWT format, but might still be valid (e.g., API keys)
    // Don't reject it - let backend validate
    console.warn('⚠️ Token does not have standard JWT format (3 parts), but may still be valid')
    return { valid: true, reason: 'Non-standard format, backend will validate' }
  }

  // Check expiration (but don't fail validation if expired - let backend decide)
  const expired = isTokenExpired(token)
  if (expired) {
    return { valid: true, reason: 'Token may be expired, but sending to backend for validation' }
  }

  return { valid: true }
}

