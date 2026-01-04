<template>
  <div class="min-h-screen bg-gradient-to-br from-light-50 to-light-100 dark:from-dark-950 dark:to-dark-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Verification Card -->
      <div class="glass-effect rounded-2xl p-8 shadow-2xl">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gradient">Verify Your Email</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Enter the OTP code sent to your email</p>
        </div>

        <!-- Email Display -->
        <div class="mb-6 p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Verification code sent to:</p>
          <p class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ email }}</p>
        </div>

        <!-- OTP Input -->
        <form @submit.prevent="handleVerify" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
              Enter 6-digit OTP code
            </label>
            <div class="flex justify-center gap-2 mb-4">
              <input
                v-for="(_, index) in otpDigits"
                :key="index"
                :ref="el => otpInputs[index] = el as HTMLInputElement"
                v-model="otpDigits[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="w-12 h-14 text-center text-2xl font-bold input-field focus:ring-2 focus:ring-neon-blue"
                :class="{
                  'border-red-500': error && otpDigits[index],
                  'border-green-500': success && otpDigits[index]
                }"
                @input="handleOtpInput(index, $event)"
                @keydown="handleOtpKeydown(index, $event)"
                @paste="handleOtpPaste"
              />
            </div>
          </div>

          <!-- Error Message -->
          <Transition name="fade">
            <div v-if="error" class="flex items-start gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="flex-1">
                <p>{{ error }}</p>
                <p v-if="otpAttempts > 0 && otpAttempts < maxAttempts" class="mt-1 text-xs">
                  Attempts remaining: {{ maxAttempts - otpAttempts }} of {{ maxAttempts }}
                </p>
                <p v-if="otpAttempts >= maxAttempts" class="mt-1 text-xs font-semibold">
                  Maximum attempts reached. Please request a new OTP code.
                </p>
              </div>
            </div>
          </Transition>

          <!-- Success Message -->
          <Transition name="fade">
            <div v-if="success" class="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ success }}</span>
            </div>
          </Transition>

          <!-- Timer and Resend -->
          <div class="text-center space-y-3">
            <div v-if="countdown > 0" class="text-sm text-gray-600 dark:text-gray-400">
              OTP expires in: <span class="font-semibold text-neon-blue">{{ formatTime(countdown) }}</span>
            </div>
            <div v-else class="text-sm text-gray-600 dark:text-gray-400">
              OTP has expired. Please request a new one.
            </div>
            
            <button
              type="button"
              @click="handleResend"
              :disabled="isResending || countdown > 0"
              class="text-sm text-neon-blue hover:text-neon-blue/80 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isResending">Sending...</span>
              <span v-else-if="countdown > 0">Resend OTP (available in {{ formatTime(countdown) }})</span>
              <span v-else>Resend OTP</span>
            </button>
          </div>

          <!-- Verify Button -->
          <button
            type="submit"
            :disabled="isLoading || !isOtpComplete || otpAttempts >= maxAttempts"
            class="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
            <span v-else>Verify Email</span>
          </button>
        </form>

        <!-- Back to Login -->
        <div class="mt-6 text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Wrong email?
            <a href="#" @click.prevent="goToLogin" class="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">
              Go back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref<(HTMLInputElement | null)[]>([])
const isLoading = ref(false)
const isResending = ref(false)
const error = ref('')
const success = ref('')
const countdown = ref(600) // 10 minutes in seconds
const otpAttempts = ref(0)
const maxAttempts = 5
let countdownInterval: number | null = null

const isOtpComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '')
})

// Get email from query parameter
onMounted(() => {
  const emailParam = route.query.email as string
  if (emailParam) {
    email.value = emailParam
  } else {
    // If no email in query, redirect to login
    router.push('/login')
    return
  }

  // Start countdown timer
  startCountdown()
  
  // Focus first input
  setTimeout(() => {
    otpInputs.value[0]?.focus()
  }, 100)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

const startCountdown = () => {
  countdown.value = 600 // Reset to 10 minutes
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  countdownInterval = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, 1000)
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  
  if (value) {
    otpDigits.value[index] = value
    error.value = ''
    
    // Auto-focus next input
    if (index < 5 && otpInputs.value[index + 1]) {
      otpInputs.value[index + 1]?.focus()
    } else if (index === 5) {
      // Last digit entered, auto-submit
      target.blur()
      if (isOtpComplete.value) {
        handleVerify()
      }
    }
  } else {
    otpDigits.value[index] = ''
  }
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  // Handle backspace
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
  
  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }
}

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6).split('')
  
  digits.forEach((digit, index) => {
    if (index < 6) {
      otpDigits.value[index] = digit
    }
  })
  
  // Focus the next empty input or the last one
  const nextEmptyIndex = otpDigits.value.findIndex(d => !d)
  if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
    otpInputs.value[nextEmptyIndex]?.focus()
  } else {
    otpInputs.value[5]?.focus()
    if (isOtpComplete.value) {
      handleVerify()
    }
  }
}

const handleVerify = async () => {
  if (!isOtpComplete.value) {
    error.value = 'Please enter the complete 6-digit OTP code'
    return
  }

  if (countdown.value <= 0) {
    error.value = 'OTP has expired. Please request a new one.'
    return
  }

  if (otpAttempts.value >= maxAttempts) {
    error.value = 'Maximum verification attempts reached. Please request a new OTP code.'
    return
  }

  isLoading.value = true
  error.value = ''
  success.value = ''

  const otp = otpDigits.value.join('')

  try {
    const result = await authStore.verifyEmail(email.value, otp)
    
    if (result.success) {
      success.value = 'Email verified successfully! Redirecting...'
      
      // Clear countdown and attempts
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
      otpAttempts.value = 0
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      // Increment attempt counter
      otpAttempts.value++
      
      // Clear OTP input on error
      otpDigits.value = ['', '', '', '', '', '']
      setTimeout(() => {
        otpInputs.value[0]?.focus()
      }, 100)
      
      // Handle specific error messages
      if (result.error) {
        if (result.error.toLowerCase().includes('expired')) {
          error.value = 'Invalid or expired OTP. Please check your email and try again, or request a new OTP.'
        } else if (result.error.toLowerCase().includes('not found')) {
          error.value = 'User not found'
        } else {
          error.value = result.error
        }
      } else {
        error.value = 'Invalid or expired OTP. Please check your email and try again, or request a new OTP.'
      }
    }
  } catch (err: any) {
    otpAttempts.value++
    error.value = err.message || 'Verification failed. Please try again.'
    // Clear OTP input on error
    otpDigits.value = ['', '', '', '', '', '']
    setTimeout(() => {
      otpInputs.value[0]?.focus()
    }, 100)
  } finally {
    isLoading.value = false
  }
}

const handleResend = async () => {
  if (countdown.value > 0) {
    error.value = `Please wait ${formatTime(countdown.value)} before requesting a new OTP.`
    return
  }

  isResending.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await authStore.resendOTP(email.value)
    
    if (result.success) {
      success.value = 'New OTP sent to your email!'
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
      // Handle specific error: email already verified
      if (result.error && result.error.toLowerCase().includes('already verified')) {
        error.value = 'Email already verified. Please log in.'
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        error.value = result.error || 'Failed to resend OTP. Please try again.'
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to resend OTP. Please try again.'
  } finally {
    isResending.value = false
  }
}

const goToLogin = () => {
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

