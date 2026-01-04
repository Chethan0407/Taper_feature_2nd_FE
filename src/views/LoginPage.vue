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
              :class="[
                'input-field w-full',
                loginEmailError && email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : ''
              ]"
              placeholder="Enter your company email"
              @input="loginEmailError = ''"
            />
            <!-- Email Error Message -->
            <Transition name="fade">
              <div v-if="loginEmailError && email" class="mt-2 flex items-center gap-2 text-red-500 text-sm">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ loginEmailError }}</span>
              </div>
            </Transition>
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
        </form>

        <!-- Sign Up Link -->
        <div class="mt-8 text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Don't have an account?
            <a href="#" @click.prevent="openSignUpModal" class="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors">
              Sign up
            </a>
          </p>
        </div>

          <!-- Login Error -->
          <Transition name="fade">
            <div v-if="loginError" class="mt-4">
              <div class="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ loginError }}</span>
              </div>
              <!-- Resend OTP option if email not verified -->
              <div v-if="loginRequiresVerification" class="mt-3 text-center">
                <button
                  @click="handleResendOTPFromLogin"
                  class="text-sm text-neon-blue hover:text-neon-blue/80 font-medium transition-colors"
                >
                  Resend OTP and verify email
                </button>
              </div>
            </div>
          </Transition>
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
      <div v-if="showSignUp" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
        <div class="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md relative my-8 max-h-[90vh] flex flex-col">
          <!-- Close Button -->
          <button 
            type="button"
            @click="closeSignUpModal" 
            class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-light-100 dark:hover:bg-dark-800 rounded-lg transition-all duration-200"
            aria-label="Close sign up modal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Header -->
          <div class="mb-6 flex-shrink-0">
            <h2 class="text-3xl font-bold mb-2 text-center text-gradient">Create Account</h2>
            <p class="text-sm text-center text-gray-600 dark:text-gray-400">Join TapeOutOps to get started</p>
          </div>

          <!-- Form - Scrollable Area -->
          <div class="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
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
                :class="[
                  'input-field w-full',
                  signupEmailError && signupEmail 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : ''
                ]"
                placeholder="Enter your company email"
                autocomplete="email"
              />
              <!-- Email Error Message -->
              <Transition name="fade">
                <div v-if="signupEmailError && signupEmail" class="mt-2 flex items-center gap-2 text-red-500 text-sm">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ signupEmailError }}</span>
                </div>
              </Transition>
          </div>

            <!-- Role Field (Optional) -->
            <div>
              <label for="signup-role" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role <span class="text-gray-500 text-xs">(optional)</span>
              </label>
              <select 
                id="signup-role"
                v-model="signupRole" 
                class="input-field w-full"
              >
                <option value="engineer">Engineer</option>
                <option value="lead">Lead</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
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
                  :class="[
                    'input-field w-full pr-12',
                    passwordValidation && !passwordValidation.isValid && signupPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : passwordValidation && passwordValidation.isValid 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                      : ''
                  ]"
                  placeholder="Create a password"
                  autocomplete="new-password"
                  @focus="showPasswordRequirements = true"
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

            <!-- Password Strength Indicator -->
            <Transition name="fade">
              <div v-if="showPasswordRequirements && signupPassword" class="mt-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Password Strength:</span>
                  <span :class="[
                    'text-xs font-semibold',
                    passwordValidation?.strength === 'weak' ? 'text-red-500' :
                    passwordValidation?.strength === 'fair' ? 'text-yellow-500' :
                    passwordValidation?.strength === 'good' ? 'text-blue-500' :
                    passwordValidation?.strength === 'strong' ? 'text-green-500' :
                    'text-gray-500'
                  ]">{{ passwordStrengthText }}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    :class="['h-2 rounded-full transition-all duration-300', passwordStrengthColor]"
                    :style="{ width: passwordStrengthWidth }"
                  ></div>
                </div>
              </div>
            </Transition>

            <!-- Password Requirements List - Only show if password is invalid (not all requirements met) -->
            <Transition name="fade">
              <div v-if="showPasswordRequirements && signupPassword && !passwordValidation?.isValid" class="mt-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600">
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
                  :class="[
                    'input-field w-full pr-12',
                    signupConfirmPassword && signupPassword && signupConfirmPassword !== signupPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : signupConfirmPassword && signupPassword && signupConfirmPassword === signupPassword
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                      : ''
                  ]"
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

            <!-- Password Mismatch Error - Show in real-time -->
            <Transition name="fade">
              <div v-if="signupConfirmPassword && signupPassword && signupConfirmPassword !== signupPassword" class="mt-2 flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Passwords do not match</span>
              </div>
            </Transition>
            
            <!-- Password Match Success - Show when they match -->
            <Transition name="fade">
              <div v-if="signupConfirmPassword && signupPassword && signupConfirmPassword === signupPassword && signupConfirmPassword.length > 0" class="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>Passwords match</span>
              </div>
            </Transition>

            <!-- Sign Up Button -->
            <button 
              type="submit" 
              class="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" 
              :disabled="signupLoading || !signupName || !signupEmail || !signupPassword || !signupConfirmPassword || (passwordValidation && !passwordValidation.isValid) || !!signupEmailError"
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
                  @click.prevent="closeSignUpModal" 
                  class="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
            </form>
          </div>
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validatePassword, getPasswordRequirements, type PasswordValidationResult } from '@/utils/passwordValidation'

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
const signupRole = ref('engineer') // Default role
const signupLoading = ref(false)
const signupSuccess = ref(false)
const signupError = ref('')
const signupConfirmPassword = ref('')
const signupShowPassword = ref(false)
const signupShowConfirmPassword = ref(false)
const signupPasswordMismatch = ref(false)
const signupEmailError = ref('')

// List of blocked free email providers
const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'yandex.com',
  'zoho.com',
  'gmx.com',
  'live.com',
  'msn.com',
  'rediffmail.com',
  'inbox.com',
  'mail.ru',
  'qq.com'
]

// Function to validate email domain
const validateEmailDomain = (email: string): { isValid: boolean; error: string } => {
  if (!email || !email.trim()) {
    return { isValid: false, error: '' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  const domain = email.trim().split('@')[1]?.toLowerCase()
  if (!domain) {
    return { isValid: false, error: 'Invalid email format' }
  }
  
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return { 
      isValid: false, 
      error: 'Personal email addresses (Gmail, Yahoo, etc.) are not allowed. Please use your company email address.' 
    }
  }
  
  return { isValid: true, error: '' }
}

// Watch email changes for real-time validation
watch(signupEmail, (newEmail) => {
  if (newEmail && newEmail.trim()) {
    const validation = validateEmailDomain(newEmail)
    signupEmailError.value = validation.error
  } else {
    signupEmailError.value = ''
  }
})

// Password validation state
const passwordValidation = ref<PasswordValidationResult | null>(null)
const passwordRequirements = getPasswordRequirements()
const showPasswordRequirements = ref(false)

// Watch password changes for real-time validation
watch(signupPassword, (newPassword) => {
  if (newPassword) {
    passwordValidation.value = validatePassword(newPassword)
    showPasswordRequirements.value = true
  } else {
    passwordValidation.value = null
    showPasswordRequirements.value = false
  }
  // Clear password mismatch error when password changes
  if (signupPasswordMismatch.value) {
    signupPasswordMismatch.value = false
  }
})

// Watch confirm password changes
watch(signupConfirmPassword, () => {
  if (signupPasswordMismatch.value) {
    signupPasswordMismatch.value = false
  }
})

// Computed properties for password strength
const passwordStrengthColor = computed(() => {
  if (!passwordValidation.value) return 'bg-gray-300 dark:bg-gray-600'
  switch (passwordValidation.value.strength) {
    case 'weak':
      return 'bg-red-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'good':
      return 'bg-blue-500'
    case 'strong':
      return 'bg-green-500'
    default:
      return 'bg-gray-300 dark:bg-gray-600'
  }
})

const passwordStrengthText = computed(() => {
  if (!passwordValidation.value) return ''
  return passwordValidation.value.strength.charAt(0).toUpperCase() + passwordValidation.value.strength.slice(1)
})

const passwordStrengthWidth = computed(() => {
  if (!passwordValidation.value) return '0%'
  switch (passwordValidation.value.strength) {
    case 'weak':
      return '25%'
    case 'fair':
      return '50%'
    case 'good':
      return '75%'
    case 'strong':
      return '100%'
    default:
      return '0%'
  }
})

// Add forgot password state
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const forgotLoading = ref(false)
const forgotSuccess = ref(false)
const forgotError = ref('')

const loginError = ref('')
const loginRequiresVerification = ref(false)
const loginEmailForVerification = ref('')
const loginEmailError = ref('')

// Function to open signup modal
const openSignUpModal = () => {
  showSignUp.value = true
  // Reset any previous errors/states when opening
  signupError.value = ''
  signupEmailError.value = ''
  signupSuccess.value = false
  signupPasswordMismatch.value = false
}

// Function to close signup modal and reset form
const closeSignUpModal = () => {
  // Only reset if not loading and not successful (preserve success state)
  if (!signupLoading.value && !signupSuccess.value) {
    // Reset form fields
    signupName.value = ''
    signupEmail.value = ''
    signupPassword.value = ''
    signupConfirmPassword.value = ''
    signupRole.value = 'engineer'
    signupPasswordMismatch.value = false
    signupError.value = ''
    signupEmailError.value = ''
    passwordValidation.value = null
    showPasswordRequirements.value = false
  }
  showSignUp.value = false
}

const handleLogin = async () => {
  // Prevent multiple simultaneous login attempts
  if (isLoading.value) {
    console.log('⏸️ Login already in progress, skipping duplicate call')
    return
  }

  // Validate inputs before attempting login
  if (!email.value || !email.value.trim()) {
    loginError.value = 'Please enter your email address.'
    loginRequiresVerification.value = false
    return
  }

  if (!password.value || !password.value.trim()) {
    loginError.value = 'Please enter your password.'
    loginRequiresVerification.value = false
    return
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    loginError.value = 'Please enter a valid email address.'
    loginEmailError.value = 'Please enter a valid email address.'
    loginRequiresVerification.value = false
    return
  }

  // Validate email domain (block free email providers)
  const emailValidation = validateEmailDomain(email.value.trim())
  if (!emailValidation.isValid) {
    loginError.value = emailValidation.error
    loginEmailError.value = emailValidation.error
    loginRequiresVerification.value = false
    return
  }
  
  // Clear email error if validation passes
  loginEmailError.value = ''

  isLoading.value = true
  loginError.value = ''
  loginRequiresVerification.value = false
  loginEmailForVerification.value = ''
  
  try {
    const result = await authStore.login(email.value.trim(), password.value)
    if (result.success) {
      router.push('/dashboard')
    } else {
      // Check if email verification is required
      if (result.requiresVerification) {
        loginRequiresVerification.value = true
        loginEmailForVerification.value = result.email || email.value.trim()
        loginError.value = result.error || 'Email not verified. Please verify your email address first.'
      } else {
        loginError.value = result.error || 'Wrong email or password.'
      }
    }
  } catch (error) {
    loginError.value = 'Wrong email or password.'
    loginRequiresVerification.value = false
    console.error('Login failed:', error)
  } finally {
    isLoading.value = false
  }
}

const handleResendOTPFromLogin = async () => {
  if (!loginEmailForVerification.value) return
  
  try {
    const result = await authStore.resendOTP(loginEmailForVerification.value)
    if (result.success) {
      // Redirect to verification page
      router.push(`/verify-email?email=${encodeURIComponent(loginEmailForVerification.value)}`)
    } else {
      loginError.value = result.error || 'Failed to resend OTP. Please try again.'
    }
  } catch (error: any) {
    loginError.value = error.message || 'Failed to resend OTP. Please try again.'
  }
}

const handleSignUp = async () => {
  signupLoading.value = true
  signupError.value = ''
  signupSuccess.value = false
  signupPasswordMismatch.value = false

  // Validate email domain (block free email providers)
  const emailValidation = validateEmailDomain(signupEmail.value)
  if (!emailValidation.isValid) {
    signupEmailError.value = emailValidation.error
    signupError.value = emailValidation.error
    signupLoading.value = false
    return
  }

  // Validate password match
  if (signupPassword.value !== signupConfirmPassword.value) {
    signupPasswordMismatch.value = true
    signupLoading.value = false
    return
  }

  // Validate password requirements
  const validation = validatePassword(signupPassword.value)
  if (!validation.isValid) {
    signupError.value = validation.errors.join('. ')
    signupLoading.value = false
    return
  }

  try {
    const res = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: signupEmail.value.trim(), 
        password: signupPassword.value, 
        full_name: signupName.value.trim(),
        role: signupRole.value || 'engineer'
      })
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorDetail = errorData.detail || errorData.message || errorData.error || ''
      
      // Handle specific error cases according to the guide
      if (res.status === 400) {
        // Email already registered
        if (errorDetail.toLowerCase().includes('already registered') || 
            errorDetail.toLowerCase().includes('already exists') ||
            errorDetail.toLowerCase().includes('email already')) {
          signupError.value = 'Email already registered. Please log in instead.'
        }
        // Domain not allowed
        else if (errorDetail.toLowerCase().includes('domain') && 
                 errorDetail.toLowerCase().includes('not allowed')) {
          const domainMatch = errorDetail.match(/['"]([^'"]+)['"]/)
          const domain = domainMatch ? domainMatch[1] : 'this domain'
          signupError.value = `Domain '${domain}' is not allowed. Please contact your administrator to add your company domain.`
        }
        // Free email provider blocked
        else if (errorDetail.toLowerCase().includes('company email') ||
                 errorDetail.toLowerCase().includes('personal email') ||
                 errorDetail.toLowerCase().includes('free email')) {
          signupError.value = 'Company email address required. Personal email addresses (Gmail, Yahoo, etc.) are not allowed.'
        }
        // Password validation failed
        else if (errorDetail.toLowerCase().includes('password') ||
                 errorDetail.toLowerCase().includes('72 bytes')) {
          signupError.value = errorDetail || 'Password does not meet requirements. Please check all requirements.'
        }
        // Generic 400 error
        else {
          signupError.value = errorDetail || 'Sign up failed. Please check your information and try again.'
        }
      }
      // Handle 422 validation errors
      else if (res.status === 422) {
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            signupError.value = errorData.detail.map((err: any) => err.msg || err.message || err).join('. ')
          } else if (typeof errorData.detail === 'string') {
            signupError.value = errorData.detail
          } else if (errorData.detail.password) {
            signupError.value = Array.isArray(errorData.detail.password) 
              ? errorData.detail.password.join('. ')
              : errorData.detail.password
          } else {
            signupError.value = 'Password does not meet requirements'
          }
        } else {
          signupError.value = errorDetail || 'Password does not meet requirements. Please check all requirements.'
        }
      }
      // Handle 500 server errors
      else if (res.status === 500) {
        signupError.value = 'An error occurred during signup. Please try again.'
      }
      // Handle other errors
      else {
        signupError.value = errorDetail || 'Sign up failed. Please try again.'
      }
      signupLoading.value = false
      return
    }

    // Success - account created, OTP sent
    const data = await res.json()
    
    // Close signup modal
    showSignUp.value = false
    
    // Store email and user_id for verification page
    if (data.email) {
      sessionStorage.setItem('signup_email', data.email)
    }
    if (data.user_id) {
      sessionStorage.setItem('signup_user_id', String(data.user_id))
    }
    
    // Reset form
    signupName.value = ''
    signupEmail.value = ''
    signupPassword.value = ''
    signupConfirmPassword.value = ''
    signupRole.value = 'engineer'
    passwordValidation.value = null
    showPasswordRequirements.value = false
    signupError.value = ''
    signupSuccess.value = false
    
    // Redirect to OTP verification page
    router.push(`/verify-email?email=${encodeURIComponent(data.email || signupEmail.value.trim())}`)
  } catch (e: any) {
    signupError.value = e.message || 'Sign up failed. Please try again.'
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

<style scoped>
/* Fade transition for password requirements and error messages */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Custom scrollbar for modal */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style>