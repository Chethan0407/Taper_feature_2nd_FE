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
          <p class="text-gray-600 dark:text-gray-400 mt-2">{{ currentStepText }}</p>
        </div>

        <!-- Step 1: Request OTP (if email not provided) -->
        <div v-if="step === 1" class="space-y-6">
          <form @submit.prevent="handleRequestOTP" class="space-y-6">
            <div>
              <label for="reset-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="reset-email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                class="input-field w-full"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              :disabled="isRequestingOTP || !email"
              class="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isRequestingOTP" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
                Sending OTP...
              </span>
              <span v-else>Send OTP</span>
            </button>

            <Transition name="fade">
              <div v-if="error" class="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ error }}</span>
              </div>
            </Transition>

            <Transition name="fade">
              <div v-if="successMessage" class="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ successMessage }}</span>
              </div>
            </Transition>
          </form>
        </div>

        <!-- Step 2: Verify OTP -->
        <div v-else-if="step === 2" class="space-y-6">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              Enter the 6-digit OTP sent to <strong>{{ email }}</strong>
            </p>
            
            <!-- OTP Timer -->
            <div class="text-center mb-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                OTP expires in: <span class="font-semibold text-neon-blue">{{ formatTime(otpExpiryCountdown) }}</span>
              </p>
            </div>

            <!-- OTP Input Boxes -->
            <div class="flex justify-center gap-2 mb-6">
              <input
                v-for="(digit, index) in otpDigits"
                :key="index"
                :ref="el => { if (el) otpInputs[index] = el as HTMLInputElement }"
                v-model="otpDigits[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg input-field focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20"
                :class="[
                  otpDigits[index] ? 'border-neon-blue' : 'border-gray-300 dark:border-dark-600',
                  error && !otpDigits[index] ? 'border-red-500' : ''
                ]"
                @input="handleOtpInput(index, $event)"
                @keydown="handleOtpKeydown(index, $event)"
                @paste="handleOtpPaste"
              />
          </div>

            <button
              @click="handleVerifyOTP"
              :disabled="isVerifyingOTP || !isOtpComplete || otpExpiryCountdown <= 0 || otpAttempts >= maxAttempts"
              class="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isVerifyingOTP" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
              <span v-else>Verify OTP</span>
            </button>

            <!-- Resend OTP -->
            <div class="text-center">
              <button
                @click="handleResendOTP"
                :disabled="isResendingOTP || resendCountdown > 0"
                class="text-sm text-neon-blue hover:text-neon-purple font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isResendingOTP">Resending...</span>
                <span v-else-if="resendCountdown > 0">Resend OTP in {{ formatTime(resendCountdown) }}</span>
                <span v-else>Resend OTP</span>
              </button>
            </div>

            <Transition name="fade">
              <div v-if="error" class="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ error }}</span>
              </div>
            </Transition>

            <Transition name="fade">
              <div v-if="successMessage" class="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ successMessage }}</span>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Step 3: Reset Password -->
        <div v-else-if="step === 3" class="space-y-6">
          <form @submit.prevent="handleResetPassword" class="space-y-6">
          <!-- Email Display (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
                :value="email"
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

              <!-- Password Requirements List -->
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
          </form>
        </div>

          <!-- Back to Login -->
        <div class="text-center mt-6">
            <router-link
              to="/login"
              class="text-sm text-neon-blue hover:text-neon-purple font-medium transition-colors"
            >
              Back to Login
            </router-link>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { validatePassword, getPasswordRequirements, type PasswordValidationResult } from '@/utils/passwordValidation'

const router = useRouter()
const route = useRoute()

const step = ref(1) // 1: Request OTP, 2: Verify OTP, 3: Reset Password
const email = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref<(HTMLInputElement | null)[]>([])
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isRequestingOTP = ref(false)
const isVerifyingOTP = ref(false)
const isResendingOTP = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const successMessage = ref('')
const passwordValidation = ref<PasswordValidationResult | null>(null)
const passwordRequirements = getPasswordRequirements()
const showPasswordRequirements = ref(false)
const otpExpiryCountdown = ref(600) // 10 minutes - OTP expiry time
const resendCountdown = ref(600) // 10 minutes - Resend OTP timer (matches backend OTP expiry)
const otpAttempts = ref(0)
const maxAttempts = 5
let otpExpiryInterval: number | null = null
let resendInterval: number | null = null

const currentStepText = computed(() => {
  if (step.value === 1) return 'Enter your email to receive an OTP code'
  if (step.value === 2) return 'Enter the 6-digit OTP code from your email'
  return 'Enter your new password'
})

const isOtpComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '')
})

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

// Watch step changes to clear errors from previous step
watch(step, (newStep) => {
  if (newStep === 3) {
    // Clear any errors from OTP verification step when moving to password reset
    error.value = ''
  }
})

// Get email from query parameter on mount
onMounted(() => {
  const emailParam = route.query.email as string
  if (emailParam) {
    email.value = emailParam
    // If email is provided, go directly to step 2 (OTP verification)
    step.value = 2
    startCountdown()
    // Focus first OTP input
    setTimeout(() => {
      otpInputs.value[0]?.focus()
    }, 100)
  }
})

onUnmounted(() => {
  if (otpExpiryInterval) {
    clearInterval(otpExpiryInterval)
  }
  if (resendInterval) {
    clearInterval(resendInterval)
  }
})

const startCountdown = () => {
  // OTP expiry timer (10 minutes)
  otpExpiryCountdown.value = 600
  if (otpExpiryInterval) {
    clearInterval(otpExpiryInterval)
  }
  otpExpiryInterval = window.setInterval(() => {
    if (otpExpiryCountdown.value > 0) {
      otpExpiryCountdown.value--
    } else {
      if (otpExpiryInterval) {
        clearInterval(otpExpiryInterval)
      }
    }
  }, 1000)

  // Resend timer (10 minutes - matches backend OTP expiry)
  resendCountdown.value = 600
  if (resendInterval) {
    clearInterval(resendInterval)
  }
  resendInterval = window.setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value--
    } else {
      if (resendInterval) {
        clearInterval(resendInterval)
      }
    }
  }, 1000)
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Step 1: Request OTP
const handleRequestOTP = async () => {
  if (!email.value || !email.value.trim()) {
    error.value = 'Please enter your email address'
    return
  }

  isRequestingOTP.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value.trim().toLowerCase()
      })
    })

    const data = await response.json()

    if (response.ok) {
      successMessage.value = 'If the email exists, an OTP will be sent to your email.'
      // Move to step 2 after 1 second
      setTimeout(() => {
        step.value = 2
        startCountdown()
        successMessage.value = ''
        // Focus first OTP input
        setTimeout(() => {
          otpInputs.value[0]?.focus()
        }, 100)
      }, 1000)
    } else {
      error.value = data.detail || data.message || 'Failed to send OTP. Please try again.'
    }
  } catch (err: any) {
    error.value = 'Failed to send OTP. Please try again.'
    console.error('Error requesting OTP:', err)
  } finally {
    isRequestingOTP.value = false
  }
}

// OTP Input Handlers
const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  
  if (value) {
    otpDigits.value[index] = value
    // Move to next input
    if (index < 5 && otpInputs.value[index + 1]) {
      otpInputs.value[index + 1]?.focus()
    }
  } else {
    otpDigits.value[index] = ''
  }

  // Auto-verify when complete
  if (isOtpComplete.value) {
    handleVerifyOTP()
  }
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
}

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6).split('')
  
  digits.forEach((digit, i) => {
    if (i < 6) {
      otpDigits.value[i] = digit
    }
  })
  
  // Focus last filled input or first empty
  const lastFilledIndex = digits.length - 1
  if (lastFilledIndex < 5) {
    otpInputs.value[lastFilledIndex + 1]?.focus()
  } else {
    otpInputs.value[5]?.focus()
  }
}

// Step 2: Verify OTP
const handleVerifyOTP = async () => {
  if (!isOtpComplete.value) {
    error.value = 'Please enter the complete 6-digit OTP code'
    return
  }

  if (otpExpiryCountdown.value <= 0) {
    error.value = 'OTP has expired. Please request a new one.'
    return
  }

  if (otpAttempts.value >= maxAttempts) {
    error.value = 'Maximum verification attempts reached. Please request a new OTP code.'
    return
  }

  isVerifyingOTP.value = true
  error.value = ''
  successMessage.value = ''

  const otpValue = otpDigits.value.join('')
  otp.value = otpValue

  try {
    const response = await fetch('/api/v1/auth/verify-reset-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value.trim().toLowerCase(),
        otp: otpValue
      })
    })

    const data = await response.json()

    // If backend returns 200 OK, OTP is verified successfully
    if (response.ok && response.status === 200) {
      successMessage.value = data.message || 'OTP verified successfully. You can now reset your password.'
      // Clear any previous errors
      error.value = ''
      // Move to step 3 after 1 second
      setTimeout(() => {
        step.value = 3
        successMessage.value = ''
        error.value = '' // Ensure error is cleared when moving to step 3
        if (otpExpiryInterval) {
          clearInterval(otpExpiryInterval)
        }
        if (resendInterval) {
          clearInterval(resendInterval)
        }
      }, 1000)
    } else {
      // Response is not OK (4xx, 5xx)
      otpAttempts.value++
      // Clear OTP input on error
      otpDigits.value = ['', '', '', '', '', '']
      setTimeout(() => {
        otpInputs.value[0]?.focus()
      }, 100)

      if (response.status === 429) {
        error.value = 'Too many failed attempts. Please request a new OTP.'
      } else {
        error.value = data.detail || data.message || 'Invalid or expired OTP. Please check and try again.'
      }
    }
  } catch (err: any) {
    otpAttempts.value++
    error.value = 'Failed to verify OTP. Please try again.'
    // Clear OTP input on error
    otpDigits.value = ['', '', '', '', '', '']
    setTimeout(() => {
      otpInputs.value[0]?.focus()
    }, 100)
    console.error('Error verifying OTP:', err)
  } finally {
    isVerifyingOTP.value = false
  }
}

// Resend OTP
const handleResendOTP = async () => {
  if (resendCountdown.value > 0) {
    error.value = `Please wait ${formatTime(resendCountdown.value)} before requesting a new OTP.`
    return
  }

  isResendingOTP.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value.trim().toLowerCase()
      })
    })

    const data = await response.json()

    if (response.ok) {
      successMessage.value = 'New OTP sent to your email!'
      // Reset OTP inputs and attempts
      otpDigits.value = ['', '', '', '', '', '']
      otpAttempts.value = 0
      // Restart countdown
      startCountdown()
      // Focus first input
      setTimeout(() => {
        otpInputs.value[0]?.focus()
      }, 100)
    } else {
      error.value = data.detail || data.message || 'Failed to resend OTP. Please try again.'
    }
  } catch (err: any) {
    error.value = 'Failed to resend OTP. Please try again.'
    console.error('Error resending OTP:', err)
  } finally {
    isResendingOTP.value = false
  }
}

// Step 3: Reset Password
const handleResetPassword = async () => {
  // Clear any previous errors
  error.value = ''
  
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

  // Validate that OTP was verified (we should have otp value from step 2)
  if (!otp.value) {
    error.value = 'OTP verification is required. Please verify your OTP first.'
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    const response = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value.trim().toLowerCase(),
        otp: otp.value,
        new_password: newPassword.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Success - redirect to login
      error.value = '' // Clear any errors
      router.push('/login?message=Password reset successful. Please log in with your new password.')
    } else {
      // Handle different error cases
      if (response.status === 404) {
        throw new Error(data.detail || 'User not found.')
      } else if (response.status === 400) {
        // Check if it's an OTP error or password error
        const errorMsg = data.detail || data.message || 'Failed to reset password.'
        if (errorMsg.toLowerCase().includes('otp') || errorMsg.toLowerCase().includes('verify')) {
          throw new Error('OTP verification failed. Please go back and verify your OTP again.')
        } else {
          throw new Error(errorMsg)
        }
      } else if (response.status === 422) {
        throw new Error(data.detail || 'Password validation failed. Please check password requirements.')
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
