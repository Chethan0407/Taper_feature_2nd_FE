<template>
  <div class="min-h-screen bg-gradient-to-br from-light-50 to-light-100 dark:from-dark-950 dark:to-dark-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Reset Password Card -->
      <div class="glass-effect rounded-2xl p-8 shadow-2xl">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gradient">Reset Password</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Enter your new password</p>
        </div>

        <!-- Loading State -->
        <div v-if="isVerifying" class="text-center py-8">
          <svg class="animate-spin h-8 w-8 text-neon-blue mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600 dark:text-gray-400">Verifying reset token...</p>
        </div>

        <!-- Error State (Invalid Token) -->
        <div v-else-if="tokenError" class="text-center py-8">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Invalid or Expired Link</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ tokenError }}</p>
          <div class="space-y-3">
            <button
              @click="requestNewReset"
              class="btn-primary w-full py-3 font-semibold"
            >
              Request New Reset Link
            </button>
            <router-link
              to="/login"
              class="block text-center text-neon-blue hover:text-neon-purple font-medium transition-colors"
            >
              Back to Login
            </router-link>
          </div>
        </div>

        <!-- Password Reset Form -->
        <form v-else-if="isTokenValid" @submit.prevent="handleResetPassword" class="space-y-6">
          <!-- Email Display (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              :value="userEmail"
              type="email"
              readonly
              class="input-field w-full bg-gray-50 dark:bg-dark-800 cursor-not-allowed"
            />
          </div>

          <!-- New Password -->
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div class="relative">
              <input
                id="new-password"
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                :class="[
                  'input-field w-full pr-12',
                  passwordValidation && !passwordValidation.isValid && newPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : passwordValidation && passwordValidation.isValid
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                    : ''
                ]"
                placeholder="Enter your new password"
                autocomplete="new-password"
                @focus="showPasswordRequirements = true"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Toggle password visibility"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>

            <!-- Password Requirements List - Only show if password is invalid -->
            <Transition name="fade">
              <div v-if="showPasswordRequirements && newPassword && !passwordValidation?.isValid" class="mt-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600">
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
                <ul class="space-y-1.5">
                  <li
                    v-for="req in passwordRequirements"
                    :key="req.key"
                    class="flex items-start gap-2 text-xs"
                  >
                    <svg
                      v-if="passwordValidation?.checks[req.key]"
                      class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <svg
                      v-else
                      class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <span :class="[
                      passwordValidation?.checks[req.key]
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    ]">{{ req.text }}</span>
                  </li>
                </ul>
              </div>
            </Transition>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div class="relative">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                :class="[
                  'input-field w-full pr-12',
                  confirmPassword && newPassword && confirmPassword !== newPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : confirmPassword && newPassword && confirmPassword === newPassword
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                    : ''
                ]"
                placeholder="Confirm your new password"
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Toggle password visibility"
              >
                <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>

            <!-- Password Mismatch Error -->
            <Transition name="fade">
              <div v-if="confirmPassword && newPassword && confirmPassword !== newPassword" class="mt-2 flex items-center gap-2 text-red-500 text-sm">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Passwords do not match</span>
              </div>
            </Transition>

            <!-- Password Match Success -->
            <Transition name="fade">
              <div v-if="confirmPassword && newPassword && confirmPassword === newPassword && confirmPassword.length > 0" class="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>Passwords match</span>
              </div>
            </Transition>
          </div>

          <!-- Error Message -->
          <Transition name="fade">
            <div v-if="error" class="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ error }}</span>
            </div>
          </Transition>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting || !newPassword || !confirmPassword || (passwordValidation && !passwordValidation.isValid) || confirmPassword !== newPassword"
            class="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting password...
            </span>
            <span v-else>Reset Password</span>
          </button>

          <!-- Back to Login -->
          <div class="text-center">
            <router-link
              to="/login"
              class="text-sm text-neon-blue hover:text-neon-purple font-medium transition-colors"
            >
              Back to Login
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { validatePassword, getPasswordRequirements, type PasswordValidationResult } from '@/utils/passwordValidation'

const router = useRouter()
const route = useRoute()

const token = ref<string | null>(null)
const userEmail = ref('')
const isVerifying = ref(true)
const isTokenValid = ref(false)
const tokenError = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const passwordValidation = ref<PasswordValidationResult | null>(null)
const passwordRequirements = getPasswordRequirements()
const showPasswordRequirements = ref(false)

// Watch password changes for validation
watch(newPassword, (newPwd) => {
  if (newPwd) {
    passwordValidation.value = validatePassword(newPwd)
    showPasswordRequirements.value = true
  } else {
    passwordValidation.value = null
    showPasswordRequirements.value = false
  }
})

// Verify token on mount
onMounted(async () => {
  // Extract token from URL
  const tokenParam = route.query.token as string
  if (!tokenParam) {
    tokenError.value = 'Reset token is missing. Please use the link from your email.'
    isVerifying.value = false
    return
  }

  token.value = tokenParam

  // Verify token
  try {
    const response = await fetch(`/api/v1/auth/verify-reset-token?token=${encodeURIComponent(tokenParam)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (response.ok && data.valid && data.email) {
      // Token is valid, get email from backend response
      userEmail.value = data.email
      isTokenValid.value = true
    } else {
      // Token is invalid/expired - handle different error cases
      if (response.status === 404) {
        tokenError.value = data.detail || 'User not found. Please request a new reset link.'
      } else if (response.status === 400) {
        tokenError.value = data.detail || 'Invalid or expired reset token. Please request a new reset link.'
      } else {
        tokenError.value = data.detail || 'Invalid or expired reset link. Please request a new reset link.'
      }
    }
  } catch (err: any) {
    tokenError.value = 'Failed to verify reset token. Please try again or request a new reset link.'
    console.error('Error verifying token:', err)
  } finally {
    isVerifying.value = false
  }
})

const handleResetPassword = async () => {
  if (!token.value) {
    error.value = 'Reset token is missing.'
    return
  }

  // Validate password match
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  // Validate password requirements
  const validation = validatePassword(newPassword.value)
  if (!validation.isValid) {
    error.value = validation.errors.join('. ')
    return
  }

  // Double-check byte length
  const passwordByteLength = new TextEncoder().encode(newPassword.value).length
  if (passwordByteLength > 72) {
    error.value = `Password cannot exceed 72 bytes. Current: ${passwordByteLength} bytes. Please use a shorter password.`
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    const response = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token.value,
        new_password: newPassword.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Success - redirect to login
      router.push('/login?message=Password reset successful. Please log in with your new password.')
    } else {
      // Handle different error cases
      if (response.status === 404) {
        throw new Error(data.detail || 'User not found.')
      } else if (response.status === 400) {
        // Password validation error or invalid token
        throw new Error(data.detail || 'Failed to reset password. Please check your password requirements.')
      } else {
        throw new Error(data.detail || data.message || 'Failed to reset password. Please try again.')
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to reset password. Please try again.'
    console.error('Error resetting password:', err)
  } finally {
    isSubmitting.value = false
  }
}

const requestNewReset = () => {
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

