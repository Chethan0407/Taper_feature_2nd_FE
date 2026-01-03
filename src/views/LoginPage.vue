<template>
  <div class="min-h-screen bg-gradient-to-br from-light-50 to-light-100 dark:from-dark-950 dark:to-dark-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Login Card -->
      <div class="glass-effect rounded-2xl p-8 shadow-2xl">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="6" height="6" rx="1"/>
              <rect x="15" y="3" width="6" height="6" rx="1"/>
              <rect x="3" y="15" width="6" height="6" rx="1"/>
              <rect x="15" y="15" width="6" height="6" rx="1"/>
              <line x1="9" y1="6" x2="9" y2="18"/>
              <line x1="15" y1="6" x2="15" y2="18"/>
              <line x1="6" y1="9" x2="18" y2="9"/>
              <line x1="6" y1="15" x2="18" y2="15"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gradient">TapeOutOps</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Semiconductor Tapeout Workflow Management</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input-field w-full"
              placeholder="Enter your email"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-field w-full pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input type="checkbox" v-model="rememberMe" class="rounded border-light-300 dark:border-dark-600 text-neon-blue focus:ring-neon-blue/20">
              <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
            </label>
            <a href="#" @click.prevent="showForgotPassword = true" class="text-sm text-neon-blue hover:text-neon-blue/80 transition-colors">
              Forgot password?
            </a>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading || !email || !password"
            class="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-light-300 dark:border-dark-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-dark-950 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <!-- Google SSO -->
          <button
            type="button"
            @click="handleGoogleLogin"
            class="w-full flex items-center justify-center px-4 py-3 border border-light-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-light-50 dark:hover:bg-dark-800 transition-colors"
          >
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <!-- Sign Up Link -->
        <div class="mt-8 text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Don't have an account?
            <a href="#" @click.prevent="showSignUp = true" class="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">
              Sign up
            </a>
          </p>
        </div>

        <!-- Login Error -->
        <div v-if="loginError" class="text-red-500 text-center mt-2">{{ loginError }}</div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          © 2024 TapeOutOps. All rights reserved.
        </p>
      </div>
    </div>

    <!-- Sign Up Modal -->
    <Transition name="modal">
      <div v-if="showSignUp" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" @click.self="showSignUp = false">
        <div class="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
          <!-- Close Button -->
          <button 
            type="button"
            @click="showSignUp = false" 
            class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-light-100 dark:hover:bg-dark-800 rounded-lg transition-all duration-200"
            aria-label="Close sign up modal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Header -->
          <div class="mb-6">
            <h2 class="text-3xl font-bold mb-2 text-center text-gradient">Create Account</h2>
            <p class="text-sm text-center text-gray-600 dark:text-gray-400">Join TapeOutOps to get started</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSignUp" class="space-y-5">
            <!-- Name Field -->
            <div>
              <label for="signup-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input 
                id="signup-name"
                v-model="signupName" 
                type="text" 
                required 
                class="input-field w-full" 
                placeholder="Enter your full name"
                autocomplete="name"
              />
            </div>

            <!-- Email Field -->
          <div>
              <label for="signup-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input 
                id="signup-email"
                v-model="signupEmail" 
                type="email" 
                required 
                class="input-field w-full" 
                placeholder="Enter your email"
                autocomplete="email"
              />
          </div>

            <!-- Password Field -->
          <div>
              <label for="signup-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
            <div class="relative">
                <input 
                  id="signup-password"
                  :type="signupShowPassword ? 'text' : 'password'" 
                  v-model="signupPassword" 
                  required 
                  class="input-field w-full pr-12" 
                  placeholder="Create a password"
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  @click="signupShowPassword = !signupShowPassword" 
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                <svg v-if="signupShowPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
          </div>

            <!-- Confirm Password Field -->
          <div>
              <label for="signup-confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div class="relative">
                <input 
                  id="signup-confirm-password"
                  :type="signupShowConfirmPassword ? 'text' : 'password'" 
                  v-model="signupConfirmPassword" 
                  required 
                  class="input-field w-full pr-12" 
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  @click="signupShowConfirmPassword = !signupShowConfirmPassword" 
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <svg v-if="signupShowConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Password Mismatch Error -->
            <Transition name="fade">
              <div v-if="signupPasswordMismatch" class="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Passwords do not match</span>
          </div>
            </Transition>

            <!-- Sign Up Button -->
            <button 
              type="submit" 
              class="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" 
              :disabled="signupLoading || !signupName || !signupEmail || !signupPassword || !signupConfirmPassword"
            >
              <span v-if="signupLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
              <span v-else>Create Account</span>
          </button>

            <!-- Error Message -->
            <Transition name="fade">
              <div v-if="signupError" class="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ signupError }}</span>
              </div>
            </Transition>

            <!-- Success Message -->
            <Transition name="fade">
              <div v-if="signupSuccess" class="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Account created successfully! You can now log in.</span>
              </div>
            </Transition>

            <!-- Back to Login Link -->
            <div class="pt-2 text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?
                <a 
                  href="#" 
                  @click.prevent="showSignUp = false" 
                  class="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
        </form>
      </div>
    </div>
    </Transition>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPassword" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click="showForgotPassword = false">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Forgot Password</h2>
        <form @submit.prevent="handleForgotPassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input v-model="forgotEmail" type="email" required class="input-field w-full" placeholder="Enter your email" />
          </div>
          <button type="submit" class="btn-primary w-full py-3 text-lg font-semibold" :disabled="forgotLoading">
            <span v-if="forgotLoading">Sending...</span>
            <span v-else>Send Reset Link</span>
          </button>
          <div v-if="forgotError" class="text-red-500 text-center mt-2">{{ forgotError }}</div>
          <div v-if="forgotSuccess" class="text-green-500 text-center mt-2">Reset link sent! Check your email.</div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const isLoading = ref(false)

// Sign up state
const showSignUp = ref(false)
const signupEmail = ref('')
const signupPassword = ref('')
const signupName = ref('')
const signupLoading = ref(false)
const signupSuccess = ref(false)
const signupError = ref('')
const signupConfirmPassword = ref('')
const signupShowPassword = ref(false)
const signupShowConfirmPassword = ref(false)
const signupPasswordMismatch = ref(false)

// Add forgot password state
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotSuccess = ref(false)
const forgotError = ref('')

const loginError = ref('')

const handleLogin = async () => {
  // Prevent multiple simultaneous login attempts
  if (isLoading.value) {
    console.log('⏸️ Login already in progress, skipping duplicate call')
    return
  }

  // Validate inputs before attempting login
  if (!email.value || !email.value.trim()) {
    loginError.value = 'Please enter your email address.'
    return
  }

  if (!password.value || !password.value.trim()) {
    loginError.value = 'Please enter your password.'
    return
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    loginError.value = 'Please enter a valid email address.'
    return
  }

  isLoading.value = true
  loginError.value = ''
  try {
    const result = await authStore.login(email.value.trim(), password.value)
    if (result.success) {
      router.push('/dashboard')
    } else {
      loginError.value = result.error || 'Wrong email or password.'
    }
  } catch (error) {
    loginError.value = 'Wrong email or password.'
    console.error('Login failed:', error)
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  isLoading.value = true
  try {
    const result = await authStore.loginWithGoogle()
    if (result.success) {
      router.push('/dashboard')
    } else {
      console.error('Google login failed:', result.error)
    }
  } catch (error) {
    console.error('Google login failed:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSignUp = async () => {
  signupLoading.value = true
  signupError.value = ''
  signupSuccess.value = false
  signupPasswordMismatch.value = false
  if (signupPassword.value !== signupConfirmPassword.value) {
    signupPasswordMismatch.value = true
    signupLoading.value = false
    return
  }
  try {
    const res = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupEmail.value, password: signupPassword.value, name: signupName.value })
    })
    if (!res.ok) throw new Error('Sign up failed')
    signupSuccess.value = true
    setTimeout(() => { showSignUp.value = false }, 1500)
  } catch (e: any) {
    signupError.value = e.message || 'Sign up failed'
  } finally {
    signupLoading.value = false
  }
}

const handleForgotPassword = async () => {
  forgotLoading.value = true
  forgotError.value = ''
  forgotSuccess.value = false
  try {
    const res = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail.value })
    })
    if (!res.ok) throw new Error('Failed to send reset email')
    forgotSuccess.value = true
    setTimeout(() => { showForgotPassword.value = false }, 2000)
  } catch (e: any) {
    forgotError.value = e.message || 'Failed to send reset email'
  } finally {
    forgotLoading.value = false
  }
}
</script> 